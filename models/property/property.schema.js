var mongoose = require('mongoose');

module.exports = mongoose.Schema({
    content:     String,
    contentHash: String
});