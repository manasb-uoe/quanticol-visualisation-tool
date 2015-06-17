/**
 * Created by ManasB on 6/17/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "text!../../templates/map_controls.html"
], function($, _, Backbone, mapControlsTemplate) {
    "use strict";

    var MapControlsView = Backbone.View.extend({
        initialize: function () {
            this.isVisible = false;
        },
        render: function () {
            this.$mapControls = $("#map-controls-container");
            this.$el.html(mapControlsTemplate);
            this.$mapControls.html(this.el);
        },
        show: function() {
            if (this.isVisible) return;

            this.$mapControls.animate({
                marginBottom: "0"
            }, 300);
            this.isVisible = true;
        },
        hide: function () {
            if (!this.isVisible) return;

            this.$mapControls.animate({
                marginBottom: "-200px"
            }, 300);
            this.isVisible = false;
        }
    });

    return new MapControlsView();
});