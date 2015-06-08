/**
 * Created by ManasB on 6/8/2015.
 */

var mongoose = require("mongoose");

var vehicleLocationSchema = new mongoose.Schema({
    vehicle_id: {type: String, index: true},
    last_gps_fix: Date,
    location: {type: [Number], index: '2d'},
    service_name: {type: String, index: true},
    destination: String
});

module.exports = mongoose.model('VehicleLocation', vehicleLocationSchema);