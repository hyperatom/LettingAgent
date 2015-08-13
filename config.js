'use strict';

var env = require('./env')();

module.exports = function() {

    function getConfig(configName) {

        var envName = env.getEnvironmentName();

        return require('./config/' + envName)[configName];
    }

    return {
        getConfig: getConfig
    };
};