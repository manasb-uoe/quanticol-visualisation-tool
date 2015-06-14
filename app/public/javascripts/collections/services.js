/**
 * Created by ManasB on 6/14/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "models/service"
], function($, _, Backbone, ServiceModel){
    "use strict";

    var ServiceCollection = Backbone.Collection.extend({
        model: ServiceModel,
        url: "/api/services"
    });

    return new ServiceCollection();
});