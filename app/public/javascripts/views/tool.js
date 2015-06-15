/**
 * Created by ManasB on 6/13/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "swig",
    "collections/services",
    "views/select_services_modal",
    "views/select_vehicles_modal",
    "views/control_panel",
    "text!../../templates/tool.html"
], function($, _, Backbone, swig, serviceCollection, selectServicesModalView, selectVehiclesModalView, controlPanelView, toolTemplate) {
    "use strict";

    var ToolView = Backbone.View.extend({
        el: "#content",
        render: function () {
            var compiledTemplate = swig.render(toolTemplate);
            this.$el.html(compiledTemplate);

            // render all sub views
            selectServicesModalView.render();
            selectVehiclesModalView.render();
            controlPanelView.render();
        }
    });

    return new ToolView();
});