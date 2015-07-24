/**
 * Created by ManasB on 6/13/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "swig",
    "text!../../templates/documentation.html"
], function($, _, Backbone, swig, docTemplate) {
    "use strict";

    var DocView = Backbone.View.extend({
        el: "#content",
        initialize: function() {
            this.tabs = [];
        },
        render: function () {
            var compiledTemplate = swig.render(docTemplate);
            this.$el.html(compiledTemplate);

            var self = this;
            var children = $("#doc-sidebar").children();
            children.each(function (tabPos) {
                self.tabs.push($(children[tabPos]));
            });

            // highlight contents tab depending on the current scroll position
            $(window).scroll(function () {
                self.tabs.forEach(function (tab) {
                    if ($(window).scrollTop() > $(tab.attr("data-target")).offset().top - 80) {
                        tab.addClass("active");
                        tab.siblings().removeClass("active");
                    }
                });
            });
        },
        events: {
            "click .sidebar-item": "selectSidebarItem"
        },
        selectSidebarItem: function (event) {
            $("html, body").animate({
                scrollTop: $($(event.target).attr("data-target")).offset().top - 70
            }, 200);
        }
    });

    return new DocView();
});