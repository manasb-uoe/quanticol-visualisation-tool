/**
 * Created by ManasB on 6/15/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "bootstrap",
    "swig",
    "text!../../templates/vehicle_item.html"
], function($, _, Backbone, bootstrap, swig, vehicleItemTemplate){
    "use strict";

    var VehicleItemView = Backbone.View.extend({
        initialize: function () {
            this.model.on("change:isSelected", this.render, this);
        },
        events: {
            "click .vehicle": "toggleSelection"
        },
        render: function () {
            var compiledTemplate = swig.render(vehicleItemTemplate, {locals: this.model.toJSON()});
            this.$el.html(compiledTemplate);

            return this;
        },
        toggleSelection: function() {
            this.model.set("isSelected", !this.model.get("isSelected"));
        }
    });

    return VehicleItemView;
});