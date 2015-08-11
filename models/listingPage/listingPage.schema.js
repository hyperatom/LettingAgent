var mongoose = require('mongoose'),
    Property = require('../property/property.schema');

module.exports = mongoose.Schema({
    agentName:    String,
    url:          String,
    entryLocator: String,
    properties:  [Property]
});