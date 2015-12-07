;(function (angular, _, $, L) {
    'use strict';

    angular.module('Georeferencer.Geo').controller('Geo.MapCtrl', MapCtrl);

    /* @ngInject */
    function MapCtrl (
            $scope, 
            $timeout,
            GeoState, 
            MarkerAdded, 
            MarkerRemoved, 
            MarkerSelected,
            leafletData,
            LocationSelected,
            leafletMarkersHelpers,
            GeoCoder
    ) {
        var vm = this;
        
        var mapLayers = {
            osm: {
                name: 'Open Street Map',
                url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                type: 'xyz'
            },
            googleTerrain: {
                name: 'Google Terrain',
                layerType: 'TERRAIN',
                type: 'google'
            },
            googleHybrid: {
                name: 'Google Hybrid',
                layerType: 'HYBRID',
                type: 'google'
            },
            googleRoadmap: {
                name: 'Google Streets',
                layerType: 'ROADMAP',
                type: 'google'
            }
        };
        
        vm.defaults = { 
            maxZoom: 18
        };
        
        vm.events = {
            map: {
                enable: ['dragend', 'zoomend', 'click', 'baselayerchange'],
                logic: 'emit'
            }
        };
        
        vm.layers = { 
            baselayers: {
                osm: mapLayers.osm,
                googleTerrain:  mapLayers.googleTerrain,
                googleHybrid: mapLayers.googleHybrid,
                googleRoadmap: mapLayers.googleRoadmap
            }
        };
        
        vm.activeMapLayerName = mapLayers.osm.name;
        
        vm.controls = {};
        
        vm.mapMarkers = [];

        activate();

        function activate() {
            vm.mapMarkers = GeoState.getMapMarkers();
            MarkerAdded.subscribe(refreshMarkers.bind(vm));
            MarkerRemoved.subscribe(refreshMarkers.bind(vm));
            MarkerSelected.subscribe(focusMarker.bind(vm));
            LocationSelected.subscribe(centerGeoMap.bind(vm));
            
            var image = GeoState.getImage();
            if (image.searchForPlace && image.place !== '') {
                GeoCoder.geocode(image.place, 1, true); // true force selection on first result
                image.searchForPlace = false;
                GeoState.setImage(image);
            }
            
            leafletData.getMap('geoMap').then(function (map) {
                var imageCenter = GeoState.getGeoMap();
                if (imageCenter.lat !== null) {
                    map.setView([imageCenter.lat, imageCenter.lng], imageCenter.zoom);
                } else {
                    // Center to Amsterdam
                    map.setView([52.3702157, 4.895167899999933], 8);
                }
                if (imageCenter.layer !== null) {
                    vm.activeMapLayerName = imageCenter.layer;
                }
                
                var layers = {
                    'Open Street Map': new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}),
                    'Google Terrain': new L.Google('TERRAIN', {}),
                    'Google Hybrid': new L.Google('HYBRID', {}),
                    'Google Streets': new L.Google('ROADMAP', {})
                };
                
                var miniMap = new L.Control.MiniMap(layers[vm.activeMapLayerName], { toggleDisplay: true }).addTo(map);
                miniMap._minimize();
		
                map.whenReady(function (e) {
                    $timeout(function() {
                        if (imageCenter.layer !== null) {
                            _.forEach(
                                mapLayers,
                                function (layer, key)  {
                                    if (layer.name !== imageCenter.layer) {
                                        delete vm.layers.baselayers[key];
                                        return;
                                    }
                                }
                            );
                            $timeout(function() {
                                _.forEach(
                                    mapLayers,
                                    function (layer, key)  {
                                        if (layer.name !== imageCenter.layer) {
                                            vm.layers.baselayers[key] = layer;
                                            return;
                                        }
                                    }
                                );
                            }, 100);
                        }
                        $timeout(function() {
                            $('.leaflet-control-layers-toggle').text(vm.activeMapLayerName);
                        }, 500);
                    }, 0);
                });
                
                map.on('baselayerchange', function (e) {
                    GeoState.setGeoMap({
                        lat: map.getCenter().lat, 
                        lng: map.getCenter().lng, 
                        zoom: map.getZoom(),
                        layer: e.name
                    });
                    
                    if (typeof(layers[e.name]) !== 'undefined') {
                        miniMap.changeLayer(layers[e.name]);
                    }
                    $('.leaflet-control-layers-toggle').text(e.name);
                });
            });
        }
        
        function refreshMarkers(_e, markers) {
            this.mapMarkers = GeoState.getMapMarkers();
        }
        
        function focusMarker(_e, marker) {
            leafletData.getMap('geoMap').then(function (map) {
                if (marker.geoLat !== null && marker.geoLng !== null) {
                    map.setView([marker.geoLat, marker.geoLng]);
                    $('.geo-map-wrapper .markers').removeClass('selected');
                    $('.geo-map-wrapper .' + marker.id).addClass('selected');
                }
            });
        }
        
        function centerGeoMap(_e, location) {
            if (typeof(location) === 'undefined') {
                return;
            }
            leafletData.getMap('geoMap').then(function (map) {
                var zoom = map.getMaxZoom() - 5;
                if (zoom < map.getZoom()) {
                    zoom = map.getZoom();
                }
                map.setView([location.lat, location.lng], zoom);
                
                var marker = leafletMarkersHelpers.createMarker({
                    focus: false,
                    draggable: false,
                    lat: location.lat,
                    lng: location.lng
                }).addTo(map);
            });
        }
        
        $scope.$on('leafletDirectiveMarker.click', function(event, e) {
            leafletData.getMap('geoMap').then(function (map) {
                GeoState.setCurrentMarkerId(e.model.id);
                MarkerSelected.trigger(GeoState.getMarkerById(e.model.id));
            });
        });
        
        $scope.$on('leafletDirectiveMarker.dragend', function(event, e) {
            leafletData.getMap('geoMap').then(function (map) {
                GeoState.setCurrentMarkerId(e.model.id);
                var marker = GeoState.getMarkerById(e.model.id);
                marker.geoLat = e.model.lat;
                marker.geoLng = e.model.lng;

                GeoState.updateGeoMarker(marker);
            });
        });
        
        $scope.$on('leafletDirectiveMap.click', function(event, e) {
            leafletData.getMap('geoMap').then(function (map) {
                if (!GeoState.checkPermissions('addMapMarker')) {
                    return;
                }
                var marker = GeoState.getMarkerById(GeoState.getCurrentMarkerId());
                marker.geoLat = e.leafletEvent.latlng.lat;
                marker.geoLng = e.leafletEvent.latlng.lng;

                GeoState.updateGeoMarker(marker);
            });
        });
        
        $scope.$on('leafletDirectiveMap.dragend', function(event, e) {
            leafletData.getMap('geoMap').then(function (map) {
                var data = GeoState.getGeoMap();
                GeoState.setGeoMap({
                    lat: map.getCenter().lat, 
                    lng: map.getCenter().lng, 
                    zoom: map.getZoom(),
                    layer: data.layer
                });
            });
        });
        
        $scope.$on('leafletDirectiveMap.zoomend', function(event, e) {
            leafletData.getMap('geoMap').then(function (map) {
                var data = GeoState.getGeoMap();
                GeoState.setGeoMap({
                    lat: map.getCenter().lat, 
                    lng: map.getCenter().lng, 
                    zoom: map.getZoom(),
                    layer: data.layer
                });
            });
        });
    }
})(window.angular, window._, window.jQuery, window.L);
