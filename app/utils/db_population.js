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

                    // delete unused fields
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
                function (err) {
                    if (err) throw err;

                    console.log("DONE\n");
                    cbA();
                }
            )
        });
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
    switch (arg) {
        case "all":
            async.series([
                function (cb) {
                    populateStops("/api/v1/stops", cb);
                }, function() {
                    console.log("END OF DB POPULATION SCRIPT");
                    process.exit(0);
                }
            ]);
            break;
        case "live":
            console.log(arg);
            break;
        default:
            throw new Error("Only command line arguments allowed are: 'all' or 'live'.");
    }
});

