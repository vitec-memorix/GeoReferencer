;(function (angular, _, $, L) {
    'use strict';

    angular.module('Georeferencer.Geo').controller('Geo.PreviewCtrl', PreviewCtrl);

    /* @ngInject */
    function PreviewCtrl (
            $state,
            $scope, 
            $timeout,
            gettextCatalog,
            leafletData,
            GeoState,
            CONFIG
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
        
        vm.wms = null;
        
        vm.slider = {
            floor: 0,
            ceil: 100,
            value: 40
        };
        
        vm.closePreview = closePreview;
        
        $scope.$watch(
            function () {
                return vm.slider;
            },
            function (c, p) {
                if (vm.wms !== null) {
                    vm.wms.setOpacity(vm.slider.value / 100);
                }
            },
            true
        );

        activate();

        function activate() {
            var image = GeoState.getImage();
            if (image === null) {
                $state.go('root', {'msg': gettextCatalog.getString('No image found.')});
                return;
            }
            
            vm.mapMarkers = GeoState.getMapMarkers();
            
            leafletData.getMap('previewMap').then(function (map) {
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
                
                vm.wms = L.tileLayer.wms(CONFIG.geoserver.url, {
                    layers: 'Georeferencer:' + image.getStoreName(),
                    format: 'image/png',
                    crs: L.CRS.EPSG4326,
                    transparent: true,
                    version: '1.1.1'
                });
                vm.wms.setOpacity(vm.slider.value / 100);
                vm.wms.addTo(map);
//                controls.addOverlay(vm.wms, 'Old Map');

                var layers = {
                    'Open Street Map': new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}),
                    'Google Terrain': new L.Google('TERRAIN', {}),
                    'Google Hybrid': new L.Google('HYBRID', {}),
                    'Google Streets': new L.Google('ROADMAP', {}),
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
                    if (typeof(layers[e.name]) !== 'undefined') {
                        miniMap.changeLayer(layers[e.name]);
                    }
                    $('.leaflet-control-layers-toggle').text(e.name);
                });
            });
        }
        
        function closePreview() {
            $state.go('root');
        }
    }
})(window.angular, window._, window.jQuery, window.L);