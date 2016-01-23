define([
    'jquery',
    'underscore',
    'backbone',
    'text!template/EarthquackInfoBox.html',
    'text!template/EarthquackInfoItem.html',
    'text!template/EarthquackInfoMarkerTable.html',

    'lib/dhtmlxslider'
], function( $, _, Backbone, EarthquackInfoBox, EarthquackInfoItem, EarthquackInfoMarkerTable) {
    var EarthquackInfoView = Backbone.View.extend({
        el: 'body',
        template: _.template( EarthquackInfoBox ),
        templateItem: _.template( EarthquackInfoItem ),
        templateMarker: _.template( EarthquackInfoMarkerTable ),
        events: {
            'click .earthquakeInfo .bar .btn': 'toggleEarthquakeInfoInfo',
            'click .earthquakeInfo .earthquakeItem': 'clickEarthquakeItem'
        },
        initialize: function(data) {
            var that = this;
            this.nowTimestamp = new Date().getTime() ;
            this.beforeHours = 24;
            this.mag = 5;
            this.animateObject = [];
            this.$el.append( this.template());


            $(window).resize(function(){
                var height = $(window).height() - that.$el.find(".infoBox .filter").outerHeight() - that.$el.find(".infoBox .copyright").outerHeight();
                that.$el.find(".infoBox .content").height(height);
            }).trigger("resize");


            this.map = data.map;
            this.collection = data.collection;
            this.listenTo(this.collection, 'addCollection', this.show);

            this.earthquakeBoxContent = that.$el.find(".infoBox .content");

            this.initializeFilter();

            this.eventAnimate();
        },
        initializeFilter: function(){
            var that = this;
            this.slider_beforeHour = this.$el.find(".slideBox .beforeHour");

            this.slider_beforeHour.bind("change",function(){
                var val = $(this).val();
                val = 24 - parseFloat(val) ;
                that.beforeHours = val;
                $(this).parents(".slideBox").find(".text").text(val);
                that.show();
            });

            this.slider_beforeHour.val(this.beforeHours-24).trigger("change");

            this.slider_mag = this.$el.find(".slideBox .mag");
            this.slider_mag.bind("change",function(){
                var val = $(this).val();
                that.mag = parseFloat(val);
                $(this).parents(".slideBox").find(".text").text(val);
                that.show();
            });
            this.slider_mag.val(this.mag).trigger("change");

        },
        filterTimer : null,
        show: function(){
            var that =this;
            clearTimeout(that.filterTimer);

            that.filterTimer = setTimeout(function(){
                that.earthquakeBoxContent.html("loading...");
                var results = that.collection.filter(function(m) {
                    var timeFlage = m.get('timestamp') > that.nowTimestamp - that.beforeHours*3600000;
                    return (m.get('mag')>=that.mag  && timeFlage );
                });
                that.setEarthquakeIntoMap(results);
            },500);
        },
        eventAnimate: function(){
            var that = this;
            var waitTime = 100;
            if (_.keys(that.animateObject).length >0) {
                waitTime = 5/_.keys(that.animateObject).length *1000;
            }

            if (waitTime> 100){
                waitTime = 100;
            }
            var time = new Date().getTime() ;
            for (var i in that.animateObject){

                if (that.animateObject[i].circle.getRadius() > that.animateObject[i].maxCircleSize){
                    that.animateObject[i].circle.setRadius(100);
                } else {
                    that.animateObject[i].circle.setRadius(that.animateObject[i].circle.getRadius()+that.animateObject[i].rangeCircleSize);
                }
                if (that.animateObject[i].enabled) {
                    that.animateObject[i].circle.setOptions({fillOpacity:0.35, strokeOpacity:0.8});
                } else {
                    var fillOpacity = that.animateObject[i].circle.get("fillOpacity") - 0.01;
                    var strokeOpacity = that.animateObject[i].circle.get("strokeOpacity") - 0.05;
                    that.animateObject[i].circle.setOptions({fillOpacity:fillOpacity, strokeOpacity:strokeOpacity});

                    if (fillOpacity<=0 || strokeOpacity<=0) {
                        that.animateObject[i].circle.setMap(null);
                        that.animateObject[i].marker.setMap(null);
                        delete that.animateObject[i];
                    }
                }
            }

            setTimeout(function(){
                that.eventAnimate();
            },waitTime);
        },
        setEarthquakeIntoMap: function(results){
            var that = this;
            var idArray = [];
            if (results.length > 0) {
                that.earthquakeBoxContent.html("");
                for (var i in results) {
                    var result = results[i];
                    var JSONData = result.toJSON();
                    var id = result.get("id");
                    idArray.push(id);
                    if ( typeof(this.animateObject[id])== "undefined" ){
                        var earthquakeCircle = that.setGoogleMapCicleObject(result);
                        var earthquakeMarker = that.setGoogleMapMarkerObject(result);
                        var maxCircleSize = 5000*Math.pow(2,result.get("mag"))*result.get("mag");
                        this.animateObject[id] = { enabled: true,
                                                    circle: earthquakeCircle,
                                                    marker: earthquakeMarker,
                                                    maxCircleSize: maxCircleSize,
                                                    rangeCircleSize:  maxCircleSize/50,
                                                    infowindow: null
                                                };
                    } else {
                        this.animateObject[id].enabled = true;
                    }
                    var html = $(that.templateItem(JSONData))
                    that.earthquakeBoxContent.prepend(html);
                    html.fadeIn();
                }
            } else {
                that.earthquakeBoxContent.html("<div class='noData'>No Content...</div>");
            }

            for (var key in this.animateObject){

                if(_.indexOf(idArray,key)==-1){
                    that.removeAnimateObject(key);
                }
            }
        },
        removeAnimateObject: function(key){
            this.animateObject[key].enabled = false;
        },
        setGoogleMapCicleObject: function(result){
            var that = this;

            var geo = result.get("geo");
            var earthquakeCircle = new google.maps.Circle({
              strokeColor: '#FF0000',
              strokeOpacity: 0.8,
              strokeWeight: 1,
              fillColor: '#FF0000',
              fillOpacity: 0.35,
              map: that.map,
              center: geo,
              radius: 100,
              id: result.get("id")
            });

            return earthquakeCircle;
        },
        setGoogleMapMarkerObject: function(result){

            var that = this;
            var geo = result.get("geo");
            var marker = new google.maps.Marker({
                position: geo,
                map: that.map,
                title: result.get("title"),
                icon: "images/exclamation.png",
                id: result.get("id")
            });

            marker.addListener('click', function() {
                that.map.setCenter(this.getPosition());
                that.closeAllInfoWindow();

                EarthquackItem = that.collection.get(this.id);
                var html = that.templateMarker(EarthquackItem.toJSON());


                that.animateObject[this.id].infowindow = new google.maps.InfoWindow({
                    content: html
                });
                that.animateObject[this.id].infowindow.open(that.map, this);

                that.$el.find(".earthquakeItem[data-id='"+this.id+"']").addClass("focus");
                that.focusEarthquakeItem(this.id);
            });


            return marker;
        },
        toggleEarthquakeInfoInfo: function(e){
            var target = $(e.currentTarget).parents(".earthquakeInfo");
            switch(target.attr( "toggle" )){
                case "1":
                    target.attr( {"toggle" :"0"});
                    break;
                case "0":
                default:
                    target.attr( {"toggle" :"1"});
                    break;
            }
        },
        clickEarthquakeItem: function(e){
            var id = $(e.currentTarget).data("id");
            this.map.setZoom(3);

            new google.maps.event.trigger(this.animateObject[id].marker,"click");
        },
        focusEarthquakeItem: function(id){
            this.$el.find(".earthquakeItem").removeClass("focus");
            this.$el.find(".earthquakeItem[data-id='"+id+"']").addClass("focus");
            var top =  this.$el.find(".infoBox .content").offset().top - this.$el.find(".earthquakeItem.focus").offset().top;

            this.$el.find(".infoBox .content").scrollTop(this.$el.find(".infoBox .content").scrollTop()-top);
        },
        closeAllInfoWindow : function(){
            var that = this;
            for (var i in that.animateObject) {
                if (that.animateObject[i].infowindow != null) {
                    that.animateObject[i].infowindow.close();
                    that.animateObject[i].infowindow = null;
                }
            }
        }
    });
    return EarthquackInfoView;
});
