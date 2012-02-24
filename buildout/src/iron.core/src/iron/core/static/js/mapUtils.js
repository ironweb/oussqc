/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

function init () {
    mapObject.map = new OpenLayers.Map({div : 'openlayersMap', controls: [
            new OpenLayers.Control.Attribution(),
            new OpenLayers.Control.TouchNavigation({
                dragPanOptions: {
                    enableKinetic: true
                }
            }),
            new OpenLayers.Control.ZoomPanel()
        ]});

    var gmap = new OpenLayers.Layer.Google("Google Streets",  {numZoomLevels: 20}); 
    var ghyb = new OpenLayers.Layer.Google("Google Hybrid", {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20});
    var gsat = new OpenLayers.Layer.Google("Google Satellite", {type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 22});
    var style = {
            fillColor: '#000',
            fillOpacity: 0.1,
            strokeWidth: 0
    };

    mapObject.layers.geolocateLayer = new Korem.Layer.Vector("KVector");

    mapObject.layers.eventLayer = new Korem.Layer.Vector("KVector");
    mapObject.layers.eventLayer.clearClickHandlers();
    mapObject.layers.eventLayer.addFeatureClickHandler(null, function (evt) {
        evt.feature.popup.show();
    });

    mapObject.layers.kmlArrondLayer = new OpenLayers.Layer.Vector("KML", {
            strategies: [new OpenLayers.Strategy.Fixed()],
            protocol: new OpenLayers.Protocol.HTTP({
                    url: "/ARROND.KML",
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
                    url: "/QUARTIERS.KML",
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
                  
            var markerGeolocate = new Korem.Feature.VMarker(e.point.x, e.point.y, {
                icon: {
                    url: "/static/img/geolocate_dot.png",
                    width: 23,
                    height: 24
                },
                popup: null
            });
                
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
    
    directionsService = new google.maps.DirectionsService();
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
	arrJSONParam = $.parseJSON(localStorage.searchParam);
	
	for (i=0;i<arrJSONParam.length-1;i++) {
		if (arrJSONParam[i].name=="arrondissement" && arrJSONParam[i].value!="") {
			qsParm["type"] = "arrond";
			qsParm["field"] = arrJSONParam[i].value;
		}
		if (arrJSONParam[i].name=="quartier" && arrJSONParam[i].value!="" && arrJSONParam[i].value!="#") {
			qsParm["type"] = "quart";
			qsParm["field"] = arrJSONParam[i].value;
		}
		if (arrJSONParam[i].name=="distance" && arrJSONParam[i].value>0) {
			qsParm["geocode"] = true;
			qsParm["distance"] = arrJSONParam[i].value;
		}
		if (arrJSONParam[i].name=="categorie" && arrJSONParam[i].value!="") {
			qsParm["category"] = arrJSONParam[i].name;
		}
	}
}

function loadResult() {
    arrJSONParam = $.parseJSON(localStorage.searchResult);
        for (i=0;i<arrJSONParam.length-1;i++) {
                var lonlat = new OpenLayers.LonLat(arrJSONParam[i].LONGITUDE,arrJSONParam[i].LATITUDE).transform(new OpenLayers.Projection("EPSG:4326"), mapObject.map.getProjectionObject());
				
				popup = new OpenLayers.Popup("chicken",
                   new OpenLayers.LonLat(arrJSONParam[i].LONGITUDE,arrJSONParam[i].LATITUDE).transform(new OpenLayers.Projection("EPSG:4326"), mapObject.map.getProjectionObject()),
                   new OpenLayers.Size(200,150),
                   "Titre <br> Description <br> <div style='position:absolute;bottom:10px;'><a>Directions</a> | <a>Details</a></div>",
                   true,
                   function(){this.hide();}
               );
				
				mapObject.map.addPopup(popup);
				
				$(popup.div).css("top", $(popup.div).position().top-220);
                $(popup.div).css("left", $(popup.div).position().left-115);
				
                var markerEvents = new Korem.Feature.VMarker(lonlat.lon, lonlat.lat, {
                    icon: {
                        url: "/static/img/event_marker.png",
                        width: 38,
                        height: 52
                    },
                    popup: popup
                });
				
				popup.hide();
                
                mapObject.layers.eventLayer.addFeatures([
                    markerEvents
                ]);
        }
}

var directionsDisplay;
var directionsService;

function testDirection() {
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(mapObject.map.baseLayer.mapObject);
    
    var start = "Quebec, QC";
    var end = "Montreal, QC";
    var request = {
        origin:start,
        destination:end,
        travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function(result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(result);
        }
    });
}

//function unload() {
//    mapObject.layers.kmlArronLayer.removeAllFeatures();
//    mapObject.layers.kmlQuartLayer.removeAllFeatures();
//    mapObject.layers.geolocateLayer.removeAllFeatures();
//    mapObject.layers.eventLayer.removeAllFeatures();
//}