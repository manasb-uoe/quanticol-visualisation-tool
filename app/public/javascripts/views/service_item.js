/**
 * Created by ManasB on 6/14/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "bootstrap",
    "swig",
    "text!../../templates/service_item.html"
], function($, _, Backbone, bootstrap, swig, serviceItemTemplate){
    "use strict";

    var ServiceItemView = Backbone.View.extend({
        initialize: function () {
            this.model.on("change:isSelected", this.render, this);
        },
        events: {
            "click .service": "toggleSelection",
            "contextmenu .service": "togglePopover"
        },
        render: function () {
            var compiledTemplate = swig.render(serviceItemTemplate, {locals: this.model.toJSON()});
            this.$el.html(compiledTemplate);

            return this;
        },
        toggleSelection: function() {
            this.model.set("isSelected", !this.model.get("isSelected"));
        },
        togglePopover: function (event) {
            event.preventDefault();
            this.$el.find(".service").popover({
                html: true,
                content: "<strong>Description: </strong>" + this.model.get("description"),
                placement: "top"
            }).popover("toggle");
        }
    });

    return ServiceItemView;
});