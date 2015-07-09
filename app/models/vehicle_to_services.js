/**
 * Created by ManasB on 7/9/2015.
 */


var mongoose = require("mongoose");

var vehicleToServicesSchema = new mongoose.Schema({
    vehicle_id: {type: String, index: true},
    services: [String]
});

module.exports = mongoose.model("VehicleToServices", vehicleToServicesSchema);