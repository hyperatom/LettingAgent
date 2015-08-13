'use strict';

var argv = require('yargs').argv;

module.exports = function() {

    function isSeeding() {

        return argv.seed ? true : false;
    }

    function isDebugging() {

        return argv.debug ? true : false;
    }

    function getEnvironmentName() {

        if (isDebugging()) {
            return 'debug';
        }

        return 'live';
    }

    return {
        getEnvironmentName: getEnvironmentName,
        isDebugging:        isDebugging,
        isSeeding:          isSeeding
    };
};