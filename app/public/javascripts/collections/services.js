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
        url: "/api/services",
        getSelectedNames: function () {
            var selectedNames = [];
            var selected = this.filter(function (service) {
                return service.get("isSelected");
            });

            for (var i=0; i<selected.length; i++) {
                selectedNames.push(selected[i].get("name"));
            }

            return selectedNames;
        }
    });

    return new ServiceCollection();
});