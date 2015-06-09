/**
 * Created by ManasB on 6/8/2015.
 */

var https = require('https');
var mongoose = require('mongoose');
var async = require('async');
var dbConfig = require("./db_config");
var Stop = require("../models/stop");
var Service = require("../models/service");
var VehicleLocation = require("../models/vehicle_location");

/**
 * HTTPS GET request helper
 */

var options = {
    host: "tfe-opendata.com",
    path: "/",
    headers: {"Authorization": "Token " + "0c627af5849e23b0b030bc7352550884"}
};

function getJSON(path, onResult) {
    if (path) options.path = path;

    https.get(options, function (res) {
        var output = "";

        res.on("data", function (chunk) {
            output += chunk;
        });

        res.on("end", function () {
            var jsonOutput = JSON.parse(output);
            onResult(res.statusCode, jsonOutput);
        });
    });
}


/**
 * Populate db collections
 */

function populateStops(path, cbA) {
    console.log("Populating Stops...");

    Stop.remove(function (err) {
        if (err) throw err;

        getJSON(path, function (status, stopsJson) {
            async.each(
                stopsJson.stops,
                function (stopJson, cbB) {
                    stopJson.location = [stopJson.longitude, stopJson.latitude];

                    // delete unused items
                    delete stopJson.atco_code;
                    delete stopJson.identifier;
                    delete stopJson.orientation;
                    delete stopJson.locality;
                    delete stopJson.latitude;
                    delete stopJson.longitude;

                    var stop = new Stop(stopJson);
                    stop.save(function (err) {
                        if (err) throw err;

                        cbB();
                    });
                },
                function () {
                    console.log("DONE\n");
                    cbA();
                }
            )
        });
    });
}

function populateServices(path, cbA) {
    console.log("Populating Services...");

    Service.remove(function (err) {
        if (err) throw err;

        getJSON(path, function (status, servicesJson) {
            async.each(
                servicesJson.services,
                function (serviceJson, cbB) {
                    var service = new Service(serviceJson);
                    service.save(function (err) {
                        if (err) throw err;

                        cbB();
                    });
                },
                function () {
                    console.log("DONE\n");
                    cbA();
                }
            )
        });
    })
}

function populateVehicleLocations(path, cbA) {
    console.log("Populating Vehicle Locations...");

    getJSON(path, function (status, vehicleLocationsJson) {
        async.each(
            vehicleLocationsJson.vehicles,
            function (vehicleLocationJson, cbB) {
                vehicleLocationJson.location = [vehicleLocationJson.longitude, vehicleLocationJson.latitude];;

                // delete unused items
                delete vehicleLocationJson.latitude;
                delete vehicleLocationJson.longitude;

                var vehicleLocation = new VehicleLocation(vehicleLocationJson);
                vehicleLocation.save(function (err) {
                    if (err) throw err;

                    cbB();
                });
            },
            function () {
                console.log("DONE\n");
                cbA();
            }
        )
    });
}

/**
 * Handle command line arguments
 */

mongoose.connect(dbConfig.url_prod);
mongoose.connection.on("error", function (err) {
    throw err;
});
mongoose.connection.once("open", function () {
    var arg = process.argv[2];

    var finalCallback = function () {
        console.log("END OF DB POPULATION SCRIPT");
        process.exit(0);
    };

    switch (arg) {
        case "nonlive":
            async.series([
                function (cb) {
                    populateStops("/api/v1/stops", cb);
                },
                function (cb) {
                    populateServices("/api/v1/services", cb);
                },
                finalCallback
            ]);
            break;
        case "live":
            populateVehicleLocations("/api/v1/vehicle_locations", finalCallback);
            break;
        default:
            throw new Error("Only the following command line arguments are allowed: 'live' and 'nonlive'.");
    }
});

