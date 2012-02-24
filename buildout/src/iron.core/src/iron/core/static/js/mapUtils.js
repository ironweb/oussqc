/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

function init () {
    mapObject.map = new OpenLayers.Map('map');

    var gmap = new OpenLayers.Layer.Google("Google Streets",  {numZoomLevels: 20}); 
    var ghyb = new OpenLayers.Layer.Google("Google Hybrid", {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20});
    var gsat = new OpenLayers.Layer.Google("Google Satellite", {type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 22});
    var style = {
            fillColor: '#000',
            fillOpacity: 0.1,
            strokeWidth: 0
    };

    mapObject.layers.geolocateLayer = new OpenLayers.Layer.Vector('vector');
    mapObject.layers.eventLayer = new OpenLayers.Layer.Markers("Markers");

    mapObject.layers.kmlArrondLayer = new OpenLayers.Layer.Vector("KML", {
            strategies: [new OpenLayers.Strategy.Fixed()],
            protocol: new OpenLayers.Protocol.HTTP({
                    url: "http://s1.www.sylvain.l3i.ca/rouges-lm/ARROND.KML",
                    format: new OpenLayers.Format.ArrondKML({
                            extractStyles: true, 
                            extractAttributes: true,
                            maxDepth: 2
                    })
            })
    })

    mapObject.layers.kmlQuartLayer = new OpenLayers.Layer.Vector("KML", {
            strategies: [new OpenLayers.Strategy.Fixed()],
            protocol: new OpenLayers.Protocol.HTTP({
                    url: "http://s1.www.sylvain.l3i.ca/rouges-lm/QUARTIER.KML",
                    format: new OpenLayers.Format.QuartKML({
                            extractStyles: true, 
                            extractAttributes: true,
                            maxDepth: 2
                    })
            })
    })

    mapObject.layers.kmlArrondLayer.events.register("loadend", mapObject.layers.kmlQuartLayer, function (e) {
        if (qsParm["type"]=="arrond") findPoly(qsParm["type"], qsParm["field"],  null, null);
    });

    mapObject.layers.kmlQuartLayer.events.register("loadend", mapObject.layers.kmlQuartLayer, function (e) {
        if (qsParm["type"]=="quart") findPoly(qsParm["type"], qsParm["field"],  null, null);
    });

    mapObject.map.addLayers([gmap, ghyb, gsat, mapObject.layers.kmlArrondLayer, mapObject.layers.kmlQuartLayer, mapObject.layers.geolocateLayer, mapObject.layers.eventLayer]);

    mapObject.map.setCenter(
            new OpenLayers.LonLat( -71.22985, 46.8038196).transform(
                    new OpenLayers.Projection("EPSG:4326"),
                    mapObject.map.getProjectionObject()
            ), 11
    );

//    var pulsate = function(feature) {
//            var point = feature.geometry.getCentroid(),
//                    bounds = feature.geometry.getBounds(),
//                    radius = Math.abs((bounds.right - bounds.left)/2),
//                    count = 0,
//                    grow = 'up';
//
//            var resize = function(){
//                    if (count>16) {
//                            clearInterval(window.resizeInterval);
//                    }
//                    var interval = radius * 0.03;
//                    var ratio = interval/radius;
//                    switch(count) {
//                            case 4:
//                            case 12:
//                                    grow = 'down'; break;
//                            case 8:
//                                    grow = 'up'; break;
//                    }
//                    if (grow!=='up') {
//                            ratio = - Math.abs(ratio);
//                    }
//                    feature.geometry.resize(1+ratio, point);
//                    mapObject.layers.geolocateLayer.drawFeature(feature);
//                    count++;
//            };
//            window.resizeInterval = window.setInterval(resize, 50, point, radius);
//    };

    geolocateObject = new OpenLayers.Control.Geolocate({
            bind: false,
            geolocationOptions: {
                    enableHighAccuracy: false,
                    maximumAge: 0,
                    timeout: 7000
            }
    });
    
    mapObject.map.addControl(geolocateObject);
    var firstGeolocation = true;

    geolocateObject.events.register("locationupdated",geolocateObject,function(e) {
            mapObject.layers.geolocateLayer.removeAllFeatures();
            var circle = new OpenLayers.Feature.Vector(
                OpenLayers.Geometry.Polygon.createRegularPolygon(
                    new OpenLayers.Geometry.Point(e.point.x, e.point.y),
                    e.position.coords.accuracy*2,
                    40,
                    0
                ),
                {},
                style
            );
                
            var markerGeolocate = new OpenLayers.Feature.Vector(e.point);

            markerGeolocate.id ="location";

            markerGeolocate.style = {
                externalGraphic: "img/geolocate_dot.png",
                graphicOpacity: 1.0,
                graphicWith: 38/2,
                graphicHeight: 39/2
            }
                
            mapObject.layers.geolocateLayer.addFeatures([
                markerGeolocate, circle
            ]);
            
//            if (firstGeolocation) {
//                mapObject.map.zoomToExtent(markerGeolocate.layer.getDataExtent());
//                pulsate(circle);
//                firstGeolocation = false;
//                this.bind = true;
//            }

            //mapObject.map.addLayer(mapObject.layers.geolocateLayer);
    });
    geolocateObject.events.register("locationfailed",this,function() {
            OpenLayers.Console.log('Location detection failed');
    });
    
    loadResult();
    
    mapObject.layers.geolocateLayer.removeAllFeatures();
    geolocateObject.watch = false;
    firstGeolocation = true;
    geolocateObject.deactivate();
    if (qsParm["geocode"]) geolocateObject.activate();
}

function findPoly(type, field, x,y) {
    var kmlLayerToSearch = (type=="arrond") ? mapObject.layers.kmlArrondLayer : mapObject.layers.kmlQuartLayer;

    for (i=0;i<=kmlLayerToSearch.features.length-1;i++)
    {
        if (kmlLayerToSearch.features[i].data.NOM.value == field) {
            var style = $.extend(true, {}, OpenLayers.Feature.Vector.style['default']);
            style.pointRadius = 15;
            style.label = kmlLayerToSearch.features[i].data.NOM.value;
            style.fillColor = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
            style.strokeColor = "#000";

            kmlLayerToSearch.features[i].style=style;
            kmlLayerToSearch.redraw();

            mapObject.map.zoomToExtent(kmlLayerToSearch.features[i].geometry.getBounds(), true);
        }
    }
}

function qs() {
        var query = window.location.search.substring(1);
        var parms = query.split('&');
        for (var i=0; i<parms.length; i++) {
        var pos = parms[i].indexOf('=');
        if (pos > 0) {
            var key = parms[i].substring(0,pos);
            var val = parms[i].substring(pos+1);
            qsParm[key] = (val == "false") ? false : (val == "true") ? true : val;
        }
    }
}

function loadResult() {
//    $.getJSON('evenements.json', function(data) {
//        var items = [];
//        
//        $.each(data, function(key, val) {
//            console.debug(key + " : " + val);
//            var size = new OpenLayers.Size(54/2,74/2);
//            var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
//            var icon;
//            if (val.model == "core.evenement") icon=new OpenLayers.Icon('img/event_marker.png',size,offset);
//
//            marker = new OpenLayers.Marker(new OpenLayers.LonLat(val.fields.LONGITUDE,val.fields.LATITUDE).transform(
//                    new OpenLayers.Projection("EPSG:4326"), mapObject.map.getProjectionObject()), icon);
//                    
//            marker.events.register('click', marker, function(evt) { alert(this.icon.url); OpenLayers.Event.stop(evt); });
//            
//            mapObject.layers.eventLayer.events.register('click', mapObject.layers.eventLayer, function(evt) {
//                alert("Description, Routing");
//            });
//            
//            mapObject.layers.eventLayer.addMarker(marker);
//        });
//    });
}

//function unload() {
//    mapObject.layers.kmlArronLayer.removeAllFeatures();
//    mapObject.layers.kmlQuartLayer.removeAllFeatures();
//    mapObject.layers.geolocateLayer.removeAllFeatures();
//    mapObject.layers.eventLayer.removeAllFeatures();
//}