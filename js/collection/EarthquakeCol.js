define([
    'underscore',
    'backbone',
    'models/EarthquakeModel'
], function( _, Backbone, EarthquakeModel ) {

    var EarthquakeCol = Backbone.Collection.extend({
        model: EarthquakeModel
    });

    return EarthquakeCol;
});
