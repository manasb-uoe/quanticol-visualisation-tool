/**
 * Created by ManasB on 6/13/2015.
 */

require.config({
    paths: {
        backbone: "./libs/backbone-min",
        underscore: "./libs/underscore-min",
        jquery: "./libs/jquery-2.1.4.min",
        swig: "./libs/swig.min",
        text: "./libs/text",
        gmaps: "./libs/gmaps_api_wrapper",
        bootstrap: "./libs/bootstrap.min"
    },
    shim: {
        backbone: {
            deps: ["underscore", "jquery"],
            exports: "Backbone"
        },
        bootstrap: {
            deps: ["jquery"]
        }
    }
});


/**
 * App entry point
 */

require([
    "router"
], function (App) {
    App.init();
});

