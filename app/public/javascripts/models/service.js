/**
 * Created by ManasB on 6/14/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone"
], function($, _, Backbone){
    "use strict";

    var ServiceModel = Backbone.Model.extend({
        urlRoot: "/api/services"
    });

    return ServiceModel;
});