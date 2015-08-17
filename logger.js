'use strict';

var argv = require('yargs').argv;

module.exports = function() {

    function log(message) {

        console.log(getCurrentDateTime() + ':', message);
    }

    function debug(message) {

        if (argv.debug) {
            console.log(message);
        }
    }

    function getCurrentDateTime() {

        return new Date().toISOString().
            replace(/T/, ' ').
            replace(/\..+/, '');
    }

    return {
        log:   log,
        debug: debug
    };
};