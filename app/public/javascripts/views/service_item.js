/**
 * Created by ManasB on 6/14/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "swig",
    "text!../../templates/service_item.html"
], function($, _, Backbone, swig, serviceItemTemplate){
    "use strict";

    var ServiceItemView = Backbone.View.extend({
        initialize: function () {

        },
        events: {
            "click .service": "toggleSelection"
        },
        render: function () {
            var compiledTemplate = swig.render(serviceItemTemplate, {locals: this.model.toJSON()});
            this.$el.html(compiledTemplate);

            return this;
        },
        toggleSelection: function() {
            this.model.set("isSelected", !this.model.get("isSelected"));
            this.render();
        }
    });

    return ServiceItemView;
});