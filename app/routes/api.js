/**
 * Created by ManasB on 6/14/2015.
 */

var express = require('express');
var router = express.Router();
var Service = require("../models/service");
var VehicleLocation = require("../models/vehicle_location");

router.get("/services", function (req, res, next) {
    Service
        .find({}, function (err, services) {
            if (err) return next(err);

            res.json(services);
        });
});

router.get("/vehicles", function (req, res, next) {
    var selectedServices = req.query["service"] || [];

    VehicleLocation
        .where("service_name")
        .in(selectedServices)
        .exec(function (err, vehicles) {
            if (err) return next(err);

            res.json(vehicles);
        });
});


module.exports = router;