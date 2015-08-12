'use strict';

var db          = require('./db')(),
    ListingPage = require('./models/listingPage/listingPage.model'),
    cheerio     = require('cheerio'),
    request     = require('request'),
    sha1        = require('sha1'),
    Q           = require('q'),
    mailer      = require('./mailer')(),
    CronJob     = require('cron').CronJob,
    argv        = require('yargs').argv;



db.connect()
    .then(setUpDb)
    .then(startCheckingIntervals);

function startCheckingIntervals() {

    new CronJob('*/15 * * * *', checkListingUpdates, null, true, 'Europe/London');
}

function isSeeding() {

    return argv.seed ? true : false;
}

function setUpDb() {

    var defer = Q.defer().resolve();

    if (isSeeding()) {
        return db.reset().then(db.seed);
    }

    return defer;
}


function checkListingUpdates() {

    ListingPage.find()
        .then(scrapeProperties);
}

function scrapeProperties(pages) {

    for (var i = 0; i < pages.length; i++) {

        var propertyPage = pages[i];

        (function(propertyPage) {

            request(propertyPage.url, function(error, response, body) {

                if (!error) {

                    var properties  = extractProperties(propertyPage, body),
                        newListings = getNewListings(propertyPage, properties);

                    if (newListings.length > 0) {
                        saveNewListings(propertyPage, newListings);
                        notifyNewListings(propertyPage, newListings);
                    }
                }
            });

        })(propertyPage);
    }
}

function notifyNewListings(propertyPage, newListings) {

    if (!isSeeding()) {
        mailer.sendProperties(propertyPage.agentName, newListings);
    }
}

function saveNewListings(propertyPage, newListings) {

    propertyPage.properties = newListings;

    return propertyPage.save();
}

function getNewListings(propertyPage, propertyList) {

    var newListings = [];

    for (var i = 0; i < propertyList.length; i++) {

        var propertyMarkup = propertyList[i];

        if (isNewProperty(propertyPage, propertyMarkup)) {

            newListings.push({
                content: propertyMarkup,
                contentHash: sha1(propertyMarkup)
            });
        }
    }

    return newListings;
}

function isNewProperty(propertyPage, propertyMarkup) {

    var knownProperties = propertyPage.properties,
        markupHash      = sha1(propertyMarkup);

    for (var i = 0; i < knownProperties.length; i++) {

        var property = knownProperties[i];

        if (property.contentHash === markupHash) {
            return false;
        }
    }

    return true;
}

function extractProperties(pageMeta, pageMarkup) {

    var $ = cheerio.load(pageMarkup, {
        normalizeWhitespace: false,
        xmlMode: false,
        decodeEntities: true
    });

    var propertyMarkups = [];

    $(pageMeta.entryLocator).each(function(i, elem) {
        propertyMarkups.push($(elem).html());
    });

    return propertyMarkups;
}