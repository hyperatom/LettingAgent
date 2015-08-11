'use strict';

var mongoose          = require('mongoose'),
    ListingPage       = require('./models/listingPage/listingPage.model'),
    listingPageSeeds  = require('./seeds/listingpages.seed.js'),
    Q                 = require('q');

module.exports = function() {

    function connect() {

        var defer = Q.defer();

        mongoose.connect('mongodb://agent:lettingagent@ds055772.mongolab.com:55772/letting-agent');

        var db = mongoose.connection;

        db.on('error',  defer.reject);
        db.once('open', defer.resolve);

        return defer.promise;
    }

    function seed() {

        var defer = Q.defer();

        ListingPage.collection.insert(listingPageSeeds, defer.resolve);

        return defer.promise;
    }

    function reset() {

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