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
        fetch: function (options) {
            var self = this;

            $.get(
                "/api/services",
                function (response) {
                    if (response.status == 200) {
                        self.reset(response.services, {silent: !(options.reset)});;

                        if (options.success) options.success();
                    } else {
                        self.trigger("error", response.error);
                    }
                }
            );
        },
        // fetches start time and end time of available data based on the services selected by the user
        fetchTimespan: function () {
            var self = this;
            $.get(
                "/api/timespan",
                {service: self.getAllSelectedNames()},
                function (response) {
                    if (response.status == 200) {
                        self.trigger("timespan.fetched", response.timespan);
                    } else {
                        self.trigger("error", response.error);
                    }
                }
            );
        },
        getAllSelectedNames: function () {
            var selectedNames = [];
            var selected = this.filter(function (service) {
                return service.get("isSelected");
            });

            for (var i=0; i<selected.length; i++) {
                selectedNames.push(selected[i].get("name"));
            }

            return selectedNames;
        },
        getSelectedSearchResultsCount: function () {
            var count = this.countBy(function (service) {
                return service.get("isSelected") && service.get("isMatchingSearchTerm");
            }).true;

            return count || 0;
        },
        getByName: function(name) {
            var requiredService = this.filter(function (service) {
                return service.get("name") == name;
            });

            if (requiredService.length == 0) throw new Error("No service found with name: " + name);

            return requiredService[0];
        },
        search: function (term) {
            term = term.trim().toLowerCase();

            this.each(function (service) {
                if (term.length == 0) {
                    service.set("isMatchingSearchTerm", true);
                } else {
                    if (service.get("service_type").toLowerCase().indexOf(term) == 0
                        || service.get("name").toLowerCase().indexOf(term) == 0
                        || service.get("description").toLowerCase().indexOf(term) > -1) {
                        service.set("isMatchingSearchTerm", true);
                    } else {
                        service.set("isMatchingSearchTerm", false);
                    }
                }
            });

            this.trigger("reset");
        },
        getSearchResultsCount: function () {
            var count = this.countBy(function (service) {
                return service.get("isMatchingSearchTerm");
            }).true;

            return count || 0;
        }
    });

    return new ServiceCollection();
});