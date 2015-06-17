/**
 * Created by ManasB on 6/13/2015.
 */

require.config({
    paths: {
        backbone: "./libs/backbone-min",
        underscore: "./libs/underscore-min",
        jquery: "./libs/jquery-2.1.4.min",
        swig: "./libs/swig.min",
        bootstrap: "./libs/bootstrap.min",
        moment: "./libs/moment-with-locales.min",
        datetimepicker: "./libs/bootstrap-datetimepicker.min",

        /* Plugins */
        text: "./libs/text",
        async: "./libs/async"
    },
    shim: {
        backbone: {
            deps: ["underscore", "jquery"],
            exports: "Backbone"
        },
        bootstrap: {
            deps: ["jquery"]
        },
        datetimepicker: {
            deps: ["jquery", "moment"]
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

