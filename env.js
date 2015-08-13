'use strict';

var argv = require('yargs').argv;

module.exports = function() {

    function isSeeding() {

        return argv.seed ? true : false;
    }

    function isDebugging() {

        return argv.debug ? true : false;
    }

    return {
        isDebugging: isDebugging,
        isSeeding:   isSeeding
    };
};