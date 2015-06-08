/**
 * Created by ManasB on 6/8/2015.
 */

var mongoose = require("mongoose");

var stopSchema = new mongoose.Schema({
    stop_id: {type: Number, index: {unique:true}},
    name: String,
    locality: String,
    direction: String,
    location : {type: [Number] /* [<longitude>, <latitude?] */, index: '2d'},
    service_type: String,
    destinations: [String],
    services: [String]
});

module.exports = mongoose.model("Stop", stopSchema);