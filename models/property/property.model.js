'use strict';

var mongoose    = require('mongoose'),
    listingPage = require('./listingPage.schema');

module.exports = mongoose.model('ListingPage', listingPage);