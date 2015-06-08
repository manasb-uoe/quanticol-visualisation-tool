/**
 * Created by ManasB on 6/8/2015.
 */

var mongoose = require("mongoose");

var serviceSchema = new mongoose.Schema({
    name: {type: String, index: {unique: true}},
    description: String,
    service_type: String,
    routes: [Mixed]
});

module.exports = mongoose.model('Service', serviceSchema);
