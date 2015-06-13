/**
 * Created by ManasB on 6/13/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "swig",
    "text!../../templates/navigation_bar.html"
], function($, _, Backbone, swig, navTemplate) {
    "use strict";

    var NavView = Backbone.View.extend({
        el: "#navigation-bar",
        initialize: function() {
            this.tabs = [
                {name: "Tool", icon: "glyphicon-wrench", url: "#/tool"},
                {name: "Documentation", icon: "glyphicon-question-sign", url: "#/doc"}
            ];

            this.on("route", this.selectTab);
        },
        events: {

        },
        render: function () {
            var context = {tabs: this.tabs};
            var compiledTemplate = swig.render(navTemplate, {locals: context});
            this.$el.html(compiledTemplate);
        },
        selectTab: function(hash) {
            var activeTab = this.$el.find("a[href='" + hash + "']").parent();
            activeTab.addClass("active");
            activeTab.siblings().removeClass("active");
        }
    });

    return new NavView();
});