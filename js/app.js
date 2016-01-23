require.config({
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        }
    },
    paths: {
        jquery: "https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/jquery.min",
        underscore: "https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min",
        backbone: "https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.2.3/backbone-min",
        async: "https://cdnjs.cloudflare.com/ajax/libs/requirejs-async/0.1.1/async",
        text: "https://cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text.min"
    }
});
require([
    'jquery',
    'backbone',
    'view/EarthquackInfoView',
    'collection/EarthquakeCol',
    'models/EarthquakeModel'
    ],function($,Backbone,EarthquackInfoView,EarthquakeCol,EarthquakeModel) {

    var EarthquakeView = Backbone.View.extend({
        el: 'body',

        events: {

        },

        initialize: function(data) {
            this.map = data.map;
            this.nowTimestamp = new Date().getTime();
            this.earthquakeCol = new EarthquakeCol();
            //設定地圖中心
            this.getGeolocation();
            //取得地震資料
            this.getEarthquakeData();

            earthquackInfoView = new EarthquackInfoView({map:this.map,collection:this.earthquakeCol});

        },
        getEarthquakeData: function(){
            var that = this;
            var jqxhr = $.getJSON( "http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson", function(data) {
                var features = data.features;
                for( var i in features){
                    var feature = features[i];
                    var data = {
                            id: feature['id'],
                            title: feature['properties']['title'],
                            geo: {lat:feature['geometry']['coordinates']['1'],lng:feature['geometry']['coordinates']['0']},
                            depth: feature['geometry']['coordinates']['2'],
                            mag: feature['properties']['mag'],
                            place: feature['properties']['place'],
                            alert: feature['properties']['alert'],
                            detail: feature['properties']['detail'],
                            dmin: feature['properties']['dmin'],
                            gap: feature['properties']['gap'],
                            timestamp: feature['properties']['time'],
                            dateTime: that.timeConverter(feature['properties']['time']),
                            type: feature['properties']['type'],
                            tz:   feature['properties']['tz'],
                        }

                    var earthquakeModel = new EarthquakeModel(data);
                    that.earthquakeCol.add(earthquakeModel);
                }
                that.earthquakeCol.trigger('addCollection');
            });
        },
        getGeolocation: function(){
            var that = this;
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                  var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                  };
                  that.map.setCenter(pos);
                }, function() {
                  that.handleLocationError(true, infoWindow, map.getCenter());
                });
            } else {
                // Browser doesn't support Geolocation
                that.handleLocationError(false, infoWindow, map.getCenter());
            }
        },
        handleLocationError:function(browserHasGeolocation, infoWindow, pos) {
          infoWindow.setPosition(pos);
          infoWindow.setContent(browserHasGeolocation ?
                                'Error: The Geolocation service failed.' :
                                'Error: Your browser doesn\'t support geolocation.');
        },

        timeConverter : function (UNIX_timestamp) {
            var a = new Date(UNIX_timestamp );

            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var year = a.getFullYear();
            var month = ('0' + (a.getMonth()+1)).slice(-2);
            var date = ('0' + a.getDate()).slice(-2);
            var hour = ('0' + a.getHours()).slice(-2);
            var min = ('0' + a.getMinutes()).slice(-2);
            var sec = ('0' + a.getSeconds()).slice(-2);
            var time = year +"-"+month+"-"+date+" "+ hour + ':' + min + ':' + sec;
            return time;
        }
    });

    require(['https://maps.googleapis.com/maps/api/js?key=AIzaSyBHLlzI9HoOdkPwH130dykDN2DaLHdHY6k&callback=initMap'],function(){},function(err) {

    });

    window.initMap = function() {
        var map;

        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 25, lng: 121},
            zoom: 3,
            mapTypeId: google.maps.MapTypeId.SATELLITE,
            zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_CENTER
            }
        });

        new EarthquakeView({map:map});
    }

});







// require(['jquery','backbone','https://maps.googleapis.com/maps/api/js?key=AIzaSyBHLlzI9HoOdkPwH130dykDN2DaLHdHY6k&callback=initMap'],function($){

//     window.initMap = function() {
//         var map;

//         map = new google.maps.Map(document.getElementById('map'), {
//             center: {lat: 25, lng: 121},
//             zoom: 3,
//             mapTypeId: google.maps.MapTypeId.SATELLITE
//         });
//     }
//     var EarthquakeView = Backbone.View.extend({
//             el: '#map',
//             initialize: function() {

//             },
//             getGeolocation : function(){
//                 var that = this;
//                 if (navigator.geolocation) {
//                     navigator.geolocation.getCurrentPosition(function(position) {
//                       var pos = {
//                         lat: position.coords.latitude,
//                         lng: position.coords.longitude
//                       };
//                       map.setCenter(pos);
//                     }, function() {
//                       that.handleLocationError(true, infoWindow, map.getCenter());
//                     });
//                 } else {
//                     // Browser doesn't support Geolocation
//                     that.handleLocationError(false, infoWindow, map.getCenter());
//                 }
//             },
//             handleLocationError:function(browserHasGeolocation, infoWindow, pos) {
//               infoWindow.setPosition(pos);
//               infoWindow.setContent(browserHasGeolocation ?
//                                     'Error: The Geolocation service failed.' :
//                                     'Error: Your browser doesn\'t support geolocation.');
//             }
//         });

//     require();
// });




