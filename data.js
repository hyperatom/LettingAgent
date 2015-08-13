'use strict';

var env = require('./env')();

module.exports = function() {

    function getSeed(collectionName) {

        var envName = env.getEnvironmentName();

        return require('./seeds/' + envName + '/' + collectionName + '.seed');
    }

    return {
        getSeed: getSeed
    };
};