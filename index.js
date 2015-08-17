'use strict';

var db           = require('./db')(),
    ListingPage  = require('./models/listingPage/listingPage.model'),
    cheerio      = require('cheerio'),
    request      = require('request'),
    sha1         = require('sha1'),
    Q            = require('q'),
    juice        = require('juice2'),
    mailer       = require('./mailer')(),
    logger       = require('./logger')(),
    urlRelocator = require('./urlRelocator')(),
    env          = require('./env')(),
    CronJob      = require('cron').CronJob;

db.connect()
    .then(setUpDb)
    .then(startCheckingIntervals);


function startCheckingIntervals() {

    checkListingUpdates();

    if (!env.isDebugging()) {

        new CronJob('*/15 * * * *', checkListingUpdates, null, true, 'Europe/London');
    }
}

function setUpDb() {

    var defer = Q.defer().resolve();

    if (env.isSeeding()) {
        return db.reset().then(db.seed);
    }

    return defer;
}


function checkListingUpdates() {

    logger.log('Checking for new listings...');

    ListingPage.find()
        .then(scrapeProperties);
}

function scrapeProperties(pages) {

    for (var i = 0; i < pages.length; i++) {

        var propertyPage = pages[i];

        (function(propertyPage) {

            request(propertyPage.url, function(error, response, body) {

                if (!error) {

                    processPageMarkup(propertyPage.url, body)
                        .then(function(processedHtml) {

                            var properties = extractProperties(propertyPage, processedHtml);

                            checkForNewListings(propertyPage, properties);
                        });
                }
            });

        })(propertyPage);
    }
}

function checkForNewListings(propertyPage, properties) {

    var newListings = getNewListings(propertyPage, properties);

    if (newListings.length > 0) {
        saveNewListings(propertyPage, newListings);
        notifyNewListings(propertyPage, newListings);
    }
}

function notifyNewListings(propertyPage, newListings) {

    if (!env.isSeeding()) {

        mailer.sendProperties(propertyPage.agentName, newListings);
    }
}

function saveNewListings(propertyPage, newListings) {

    logger.log('Saving new properties to database...');

    propertyPage.properties = propertyPage.properties.concat(newListings);

    return propertyPage.save();
}

function getNewListings(propertyPage, propertyList) {

    var newListings = [];

    for (var i = 0; i < propertyList.length; i++) {

        var propertyMarkup = propertyList[i];

        if (isNewProperty(propertyPage, propertyMarkup)) {

            var contentHash = getMarkupContentHash(propertyMarkup);

            newListings.push({
                content: propertyMarkup,
                contentHash: contentHash
            });
        }
    }

    return newListings;
}

function getMarkupContentHash(propertyMarkup) {

    var propertyText           = cheerio(propertyMarkup).text(),
        strippedWhitespaceText = propertyText.replace(/ /g,'');

    return sha1(strippedWhitespaceText);
}

function isNewProperty(propertyPage, propertyMarkup) {

    var knownProperties = propertyPage.properties,
        markupHash      = getMarkupContentHash(propertyMarkup);

    for (var i = 0; i < knownProperties.length; i++) {

        var property = knownProperties[i];

        if (property.contentHash === markupHash) {
            return false;
        }
    }

    return true;
}

function processPageMarkup(pageUrl, pageMarkup) {

    var defer = Q.defer();

    var urlRelocatedMarkup = urlRelocator.relativeToAbsolute(pageUrl, pageMarkup);

    juice.juiceContent(urlRelocatedMarkup, { url: pageUrl }, function(err, html) {

        defer.resolve(html);
    });

    return defer.promise;
}

function extractProperties(pageMeta, pageMarkup) {

    var $ = cheerio.load(pageMarkup, {
        ignoreWhitespace: true,
        decodeEntities: true
    });

    var propertyMarkups = [];

    $(pageMeta.entryLocator).each(function(i, elem) {
        propertyMarkups.push($(elem).html());
    });

    return propertyMarkups;
}