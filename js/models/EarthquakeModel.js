define([
    'jquery',
    'underscore',
    'backbone',
], function( $, _, Backbone ) {
    var EarthquakeModel = Backbone.Model.extend({
        defaults: {
            id: '',    //Unique identifier for a specific version of a product.
            title: '', // The title of the feed.
            geo: {lat:0,lng:0},
            depth: 0, //Depth of the event in kilometers.
            mag: '',   // The magnitude for the event.
            place: '',  //Textual description of named geographic region near to the event.
            alert: '', //“green”, “yellow”, “orange”, “red”. The alert level from the PAGER earthquake impact scale.
            detail:'',
            dmin: '', //Horizontal distance from the epicenter to the nearest station (in degrees). 1 degree is approximately 111.2 kilometers. In general, the smaller this number, the more reliable is the calculated depth of the earthquake.
            gap: '',  //The largest azimuthal gap between azimuthally adjacent stations (in degrees). In general, the smaller this number, the more reliable is the calculated horizontal position of the earthquake.
            timestamp: 0, //Time when the event occurred. Times are reported in milliseconds since the epoch ( 1970-01-01T00:00:00.000Z), and do not include leap seconds. In certain output formats, the date is formatted for readability.
            dateTime: '',
            type: '', // Type of seismic event.
            tz:   0, //Timezone offset from UTC in minutes at the event epicenter.

        },
        initialize: function () {
        }
    });

    return EarthquakeModel;
});
