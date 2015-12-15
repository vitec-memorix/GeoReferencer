;(function (angular, _, $, L) {
    'use strict';

    angular.module('Georeferencer.Geo').controller('Geo.ImageCtrl', ImageCtrl);

    /* @ngInject */
    function ImageCtrl(
            $compile,
            $rootScope, 
            $scope,
            gettext,
            GeoState, 
            GeoMarker, 
            GeoImage,
            MarkerAdded, 
            MarkerRemoved, 
            MarkerSelected, 
            leafletData, 
            leafletBoundsHelpers
    ) {
        var vm = this;

        vm.defaults = { 
            crs: 'Simple',
            zoom: -2,
            minZoom: -4,
            maxZoom: 1
        };
        
        vm.events = {
            map: {
                enable: ['dragend', 'zoomend', 'click', 'popupopen'],
                logic: 'emit'
            }
        };
        
        vm.layers = { 
            baselayers: {}
        };
        
        vm.image = null;
        
        vm.imageMarkers = [];

        activate();

        function activate() {
            MarkerAdded.subscribe(refreshMarkers.bind(vm));
            MarkerRemoved.subscribe(refreshMarkers.bind(vm));
            MarkerSelected.subscribe(focusMarker.bind(vm));
            
            leafletData.getMap('imageMap').then(function (map) {
                vm.image = GeoState.getImage();
                var sourceImage = new Image();
                sourceImage.src = vm.image.url;
                sourceImage.onload = function () {
                    if (vm.image.url !== '') {
                        vm.image.width = sourceImage.width;
                        vm.image.height = sourceImage.height;
                        GeoState.setImage(vm.image);
                    }
                    
                    vm.layers.baselayers['default'] ={
                        name: vm.image.title,
                        type: 'imageOverlay',
                        url: vm.image.url,
                        bounds: [[0, sourceImage.width], [sourceImage.height, 0]],
                        layerParams: {
                            attribution: vm.image.description,
                            showOnSelector: false
                        }
                    };
                    
                    map.setMaxBounds([[0, sourceImage.width], [sourceImage.height, 0]]);
                    
                    var minimapLayer = new L.imageOverlay(
                        vm.image.url, 
                        [[0, sourceImage.width], [sourceImage.height, 0]], 
                        {
                            zoom: vm.defaults.zoom,
                            minZoom: vm.defaults.minZoom,
                            maxZoom: vm.defaults.maxZoom
                        }
                    );
                    var miniMap = new L.Control.MiniMap(minimapLayer, { toggleDisplay: true }).addTo(map);
                    miniMap._minimize();
                    
                    var imageMapCenter = GeoState.getImageMap();
                    if (imageMapCenter.lat !== null) {
                        map.setView([imageMapCenter.lat, imageMapCenter.lng], imageMapCenter.zoom);
                    } else {
                        map.setView([sourceImage.height/2, sourceImage.width/2], vm.defaults.zoom);
                        GeoState.setImageMap({
                            lat: sourceImage.height/2, 
                            lng: sourceImage.width/2, 
                            zoom: vm.defaults.zoom
                        });
                    }
                    
                    vm.imageMarkers = GeoState.getImageMarkers();
                    $rootScope.$apply();
                };
            });
        }
        
        function focusMarker(_e, marker) {
            leafletData.getMap('imageMap').then(function (map) {
                if (marker.imageLat !== null && marker.imageLng !== null) {
                    map.setView([marker.imageLat, marker.imageLng]);
                    $('.geo-image-wrapper .markers').removeClass('selected');
                    $('.geo-image-wrapper .' + marker.id).addClass('selected');
                    L.popup()
                        .setLatLng([marker.imageLat, marker.imageLng])
                        .setContent('<georeferencer-image-form />')
                        .openOn(map);
                }
            });
        }
        
        function refreshMarkers(_e, markers) {
            this.imageMarkers = GeoState.getImageMarkers();
        }

        $scope.$on('leafletDirectiveMarker.dragend', function(event, e) {
            leafletData.getMap('imageMap').then(function (map) {
                GeoState.setCurrentMarkerId(e.model.id);
                var marker = GeoState.getMarkerById(e.model.id);
                marker.imageLat = e.model.lat;
                marker.imageLng = e.model.lng;

                GeoState.updateMarker(marker);
            });
        });
        
        $scope.$on('leafletDirectiveMarker.click', function(event, e) {
            leafletData.getMap('imageMap').then(function (map) {
                GeoState.setCurrentMarkerId(e.model.id);
                L.popup()
                    .setLatLng([e.model.lat, e.model.lng])
                    .setContent('<georeferencer-image-form />')
                    .openOn(map);
                MarkerSelected.trigger(GeoState.getMarkerById(e.model.id));
            });
        });
        
        $scope.$on('leafletDirectiveMap.popupopen', function(event, leafletEvent){
            leafletData.getMap('imageMap').then(function (map) {
// FIXME it is a dirty hack
                var newScope = $scope.$new();
                $compile(leafletEvent.leafletEvent.popup._contentNode)(newScope);
            });
        });
            
        $scope.$on('leafletDirectiveMap.click', function(event, e) {
            leafletData.getMap('imageMap').then(function (map) {
                if (!GeoState.checkPermissions('addImageMarker')) {
                    return;
                }
                GeoState.addMarker(GeoMarker.$new({
                    'imageLat': e.leafletEvent.latlng.lat, 
                    'imageLng': e.leafletEvent.latlng.lng
                }));
            });
        });
        
        $scope.$on('leafletDirectiveMap.dragend', function(event, e) {
            leafletData.getMap('imageMap').then(function (map) {
                GeoState.setImageMap({
                    lat: map.getCenter().lat, 
                    lng: map.getCenter().lng, 
                    zoom: map.getZoom()
                });
            });
        });
        
        $scope.$on('leafletDirectiveMap.zoomend', function(event, e) {
            leafletData.getMap('imageMap').then(function (map) {
                GeoState.setImageMap({
                    lat: map.getCenter().lat, 
                    lng: map.getCenter().lng, 
                    zoom: map.getZoom()
                });
            });
        });
    }
})(window.angular, window._, window.jQuery, window.L);
