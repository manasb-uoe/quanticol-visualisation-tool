/**
 * Created by ManasB on 6/14/2015.
 */

var express = require('express');
var router = express.Router();
var Service = require("../models/service");
var async = require("async");
var https = require("https");
var multer = require('multer')({dest: './uploads/'});
var fs = require('fs');

var VehicleLocation = require("../models/vehicle_location");
var VehicleToServices = require("../models/vehicle_to_services");


router.get("/services", function (req, res, next) {
    Service
        .find({}, function (err, services) {
            if (err) return next(err);

            res.json(services);
        });
});

router.get("/vehicles/:filter", function (req, res, next) {
    var filter = req.params.filter;
    var selectedServices = req.query["service"] || [];
    var selectedVehicles = req.query["vehicle"] || [];
    var startTime = req.query["startTime"] ? req.query["startTime"] : 0;
    var endTime = req.query["endTime"] ? req.query["endTime"] : ((new Date()).getTime() / 1000).toFixed(0);

    var filtersEnum = {
        UNIQUE: "unique",
        ALL: "all",
        LIVE: "live"
    };

    switch (filter) {
        case filtersEnum.UNIQUE:
            VehicleLocation
                .where("service_name").in(selectedServices)
                .distinct("vehicle_id")
                .exec(function (err, vehicleIDs) {
                    if (err) return next(err);

                    // now that we have the distinct vehicle ids, we will find one vehicle for each of these ids
                    // along with all the services they belong to
                    var uniqueVehicles = [];
                    async.each(
                        vehicleIDs,
                        function (vehicleID, cb) {
                            VehicleToServices.findOne({vehicle_id: vehicleID}, "services", function (err, vehicleToServices) {
                                var uniqueVehicle = {vehicle_id: vehicleID, services: vehicleToServices.services};
                                uniqueVehicles.push(uniqueVehicle);

                                cb();
                            });
                        },
                        function () {
                            res.json(uniqueVehicles);
                        }
                    );
                });
            break;

        case filtersEnum.ALL:
            VehicleLocation
                .where("service_name").in(selectedServices)
                .where("vehicle_id").in(selectedVehicles)
                .where("last_gps_fix").gte(startTime).lte(endTime)
                .select("vehicle_id service_name destination location last_gps_fix")
                .exec(function (err, vehicles) {
                    if (err) return next(err);

                    res.json(vehicles);
                });
            break;

        case filtersEnum.LIVE:
            var options = {
                host: "tfe-opendata.com",
                path: "/api/v1/vehicle_locations",
                headers: {Authorization: "Token " + "0c627af5849e23b0b030bc7352550884"}
            };

            https.get(options, function (httpResponse) {
                var output = "";

                httpResponse.on("data", function (chunk) {
                    output += chunk;
                });

                httpResponse.on("end", function () {
                    var jsonOutput = JSON.parse(output);

                    var filteredVehicles = [];

                    jsonOutput.vehicles.forEach(function (vehicleLocationJson) {
                        // filter according to selected service names and vehicles
                        if (selectedServices.indexOf(vehicleLocationJson.service_name) > -1
                            && selectedVehicles.indexOf(vehicleLocationJson.vehicle_id) > -1) {

                            // combine lat and lng into a single array, making it consistent with the vehicle
                            // model stored in the database
                            vehicleLocationJson.location = [vehicleLocationJson.longitude, vehicleLocationJson.latitude];
                            delete vehicleLocationJson.latitude;
                            delete vehicleLocationJson.longitude;

                            delete vehicleLocationJson.heading;
                            delete vehicleLocationJson.speed;
                            delete vehicleLocationJson.journey_id;
                            delete vehicleLocationJson.vehicle_type;

                            filteredVehicles.push(vehicleLocationJson);
                        }
                    });

                    res.json(filteredVehicles);
                });
            }).on("error", function (err) {
                console.log(err.statusCode);
                console.log("--------timed out-----------");
            });
            break;

        default:
            var allowedFilters = [];
            Object.keys(filtersEnum).forEach(function (key) {
                allowedFilters.push(filtersEnum[key]);
            });

            return next(new Error("Filter can only be: " + allowedFilters));
            break;
    }
});

router.post("/vehicles/simulated", multer.single('simulated_data_file'), function (req, res) {
    if (!req.file) return res.json({status: 500, error: "No file uploaded to the server"});

    fs.readFile(req.file.path, function (err, data) {
        if (err) return res.json({status: 500, error: err.message});


        /**
         * Parse text file into a JSON object with each vehicle id being  mapped to a list of lists of
         * timestamps and route completion percentages
         */

        try {
            var array = data.toString().split("\n");
            var json = {};

            array.forEach(function (line, pos) {
                array[pos] = line.split("\t");

                var vehicleId = array[pos][0];

                if (vehicleId.indexOf("FleetNumber") == -1) {
                    if (!json[vehicleId]) {
                        json[vehicleId] = [];
                    }

                    array[pos].splice(0, 1);

                    array[pos][1] = array[pos][1].substring(0, array[pos][1].indexOf("\r"));

                    json[vehicleId].push(array[pos]);
                }
            });
        } catch (err) {
            return res.json({status: 500, error: "There was a problem parsing the uploaded file"});
        }


        /**
         * Predict geographical positions corresponding to route completion percentages
         */

        var vehicleIDs = Object.keys(json);

        var simulatedVehicles = [];

        async.eachSeries(
            vehicleIDs,
            function (vehicleID, cb) {
                VehicleLocation.findOne({vehicle_id: vehicleID, service_name: {$ne: null}}, function (err, vehicle) {
                    if (err) return res.json({status: 500, error: err.message});

                    if (vehicle == null) return res.json({status: 500, error: "No vehicle found with vehicle_id: " + vehicleID});

                    Service.findOne({name: vehicle.service_name}, "name routes", function (err, service) {
                        if (service == null) return res.json({status: 500, error: "No service found with name: " + vehicle.service_name});

                        var inboundRoute = undefined;
                        var outboundRoute = undefined;

                        service.routes.forEach(function (route) {
                            if (route.direction == "inbound") {
                                inboundRoute = route;
                            } else if (route.direction == "outbound") {
                                outboundRoute = route;
                            }
                        });

                        json[vehicleID].forEach(function (simulatedData) {
                            var route = undefined;

                            if (simulatedData[1] < 0.5) {
                                route = outboundRoute;

                                simulatedData[1] = simulatedData[1] / 0.5;
                            } else {
                                route = inboundRoute;

                                simulatedData[1] = (simulatedData[1] - 0.5) / 0.5;
                            }

                            var position = Math.round(simulatedData[1] * (route.points.length-1));
                            
                            simulatedVehicles.push({
                                vehicle_id: vehicleID,
                                service_name: service.name,
                                destination: route.destination,
                                location: [route.points[position].longitude, route.points[position].latitude],
                                last_gps_fix: parseInt(simulatedData[0]),
                                completionPercentage: simulatedData[1] * 100
                            });
                        });

                        cb();
                    });
                });
            },
            function () {
                // now that we're done with the file, delete it
                fs.unlink(req.file.path, function (err) {
                    if (err) return res.json({status: 500, error: err.message});

                    return res.json({status: 200, vehicles: simulatedVehicles});
                });
            }
        );
    });
});


module.exports = router;