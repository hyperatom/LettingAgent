'use strict';

var mongoose    = require('mongoose'),
    ListingPage = require('./models/listingPage/listingPage.model'),
    data        = require('./data')(),
    config      = require('./config')(),
    logger      = require('./logger')(),
    Q           = require('q');

module.exports = function() {

    function connect() {

        logger.debug('Connecting to database...');

        var defer = Q.defer();

        mongoose.connect(getConnectionString());

        var db = mongoose.connection;

        db.on('error',  defer.reject);
        db.once('open', defer.resolve);

        return defer.promise;
    }

    function getConnectionString() {

        var dbConfig = config.getConfig('db');

        return dbConfig.protocol + '://' + dbConfig.user + ':' + dbConfig.pass + '@' + dbConfig.host;
    }

    function seed() {

        logger.debug('Seeding database...');

        var defer       = Q.defer(),
            listingSeed = data.getSeed('listingpages');

        ListingPage.collection.insert(listingSeed, defer.resolve);

        return defer.promise;
    }

    function reset() {

        logger.debug('Resetting database...');

        var defer = Q.defer();

        mongoose.connection.db.dropCollection('listingpages', defer.resolve);

        return defer.promise;
    }

    return {
        connect: connect,
        reset:   reset,
        seed:    seed
    }
};