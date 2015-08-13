'use strict';

var argv = require('yargs').argv;

module.exports = function() {

    function log(message) {

        console.log(message);
    }

    function debug(message) {

        if (argv.debug) {
            console.log(message);
        }
    }

    return {
        log:   log,
        debug: debug
    };
};