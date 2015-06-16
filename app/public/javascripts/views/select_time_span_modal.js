/**
 * Created by ManasB on 6/16/2015.
 */

define([
    "jquery",
    "underscore",
    "backbone",
    "datetimepicker",
    "swig",
    "text!../../templates/select_time_span_modal.html"
], function($, _, Backbone, datetimepicker, swig, selectTimeSpanModalTemplate) {
    "use strict";

    var SelectTimeSpanView = Backbone.View.extend({
        el: "#select-time-span-modal-container",
        events: {

        },
        render: function () {
            var compiledTempalte = swig.render(selectTimeSpanModalTemplate);
            this.$el.html(compiledTempalte);

            this.delegateEvents(this.events);

            this.initDateTimePickers();
        },
        initDateTimePickers: function() {
            var self = this;

            this.startTimePicker = $("#start-time-picker");
            this.endTimePicker = $("#end-time-picker");

            this.startTimePicker.datetimepicker({locale: "en", format: "DD/MM/YYYY hh:mm", defaultDate: new Date("January 01, 2015 12:00")});
            this.endTimePicker.datetimepicker({locale: "en", format: "DD/MM/YYYY hh:mm", defaultDate: new Date()});

            this.startTimePicker.on("dp.change", function (e) {
                self.endTimePicker.data("DateTimePicker").minDate(e.date);
            });
            this.endTimePicker.on("dp.change", function (e) {
                self.startTimePicker.data("DateTimePicker").maxDate(e.date);
            });

            // trigger date change event so that control panel can update the displayed time span
            this.startTimePicker.on("dp.change", function () {
                self.trigger("modal.time.span.changed");
            });
            this.endTimePicker.on("dp.change", function () {
                self.trigger("modal.time.span.changed");
            });

        },
        getSelectedTimeSpan: function () {
            return {
                startTime: this.startTimePicker.data("DateTimePicker").date(),
                endTime: this.endTimePicker.data("DateTimePicker").date()
            }
        },
        reset: function () {
            this.startTimePicker.data("DateTimePicker").date(this.startTimePicker.data("DateTimePicker").defaultDate());
            this.endTimePicker.data("DateTimePicker").date(this.endTimePicker.data("DateTimePicker").defaultDate());
        }
    });

    return new SelectTimeSpanView();
});