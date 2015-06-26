/**
 * Created by ManasB on 6/15/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone"
], function($, _, Backbone){
    "use strict";

    var VehicleModel = Backbone.Model.extend({
        urlRoot: "/api/vehicles",
        defaults: {
            isMatchingSearchTerm: true
        }
    });

    return VehicleModel;
});