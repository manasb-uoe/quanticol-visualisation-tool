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
            var startTimePicker = $("#start-time-picker");
            var endTimePicker = $("#end-time-picker");

            startTimePicker.datetimepicker({locale: "en", format: "DD/MM/YYYY hh:mm", defaultDate: new Date("January 01, 2015 12:00")});
            endTimePicker.datetimepicker({locale: "en", format: "DD/MM/YYYY hh:mm", defaultDate: new Date()});

            startTimePicker.on("dp.change", function (e) {
                endTimePicker.data("DateTimePicker").minDate(e.date);
            });
            endTimePicker.on("dp.change", function (e) {
                startTimePicker.data("DateTimePicker").maxDate(e.date);
            });
        }
    });

    return new SelectTimeSpanView();
});