(function (angular, _) {
    'use strict';

    angular.module('Georeferencer.Geo').service('GeoReference', GeoReference);
    
    /* @ngInject */
    function GeoReference(
            $q, 
            $http, 
            $timeout, 
            gettextCatalog, 
            GeoState, 
            CONFIG
    ) {
        var self = this;
        
        self.queuePreview = queuePreview;
        
        function queuePreview() {
            var work = $q.defer();
            var markers = GeoState.getGeoserverMarkers();
            var image = GeoState.getImage();
            var storeName = GeoState.generateStoreName();
            if (markers.length < 3) {
                work.reject(gettextCatalog.getString('You need atleast three reference points.'));
            } else if (storeName === image.getStoreName()) {
                work.resolve(image.getStoreName());
            } else {
                requestPreview(storeName, work);
            }
            return work.promise;
        }
        
        function requestPreview(storeName, work) {
            var markers = GeoState.getGeoserverMarkers();
            var image = GeoState.getImage();
            var geoserverMarkers = [];
            var imageUrl = image.url;
            
            if ((image.previewImage !== '') && (image.previewWidth !== 0) && (image.previewHeight !== 0)) {
                imageUrl = image.previewImage;
                
                var widthCoef = image.previewWidth / image.width;
                var heightCoef = image.previewHeight / image.height;
                
                _.forEach(
                    markers,
                    function (marker)  {
                        geoserverMarkers.push({
                            tileCoordinatesX: marker.tileCoordinatesX * widthCoef,
                            tileCoordinatesY: marker.tileCoordinatesY * heightCoef,
                            geoCoordinatesX: marker.geoCoordinatesX,
                            geoCoordinatesY: marker.geoCoordinatesY
                        });
                    }
                );
            } else {
                geoserverMarkers = markers;
            }
            
            $http({
                method: 'POST',
                url: CONFIG.api.url + '/preview',
                data: {'referencePoints': geoserverMarkers, 'image': imageUrl, 'storeName': storeName}
            }).then(
                function(response) {
                    if ((typeof(response.data) !== 'undefined') && 
                        (typeof(response.data.store) !== 'undefined') && 
                        (response.data.store === storeName)
                    ) {
                        image.setStoreName(response.data.store);
                        GeoState.setImage(image);
                        work.resolve(response.data.store);
                    } else {
                        checkResult(storeName, work);
                    }
                }, function(msg, code) {
                    work.reject(msg);
                }
            );
        }
        
        function checkResult(storeName, work) {
            var image = GeoState.getImage();
            
            $http({
                method: 'GET',
                url: CONFIG.api.url + '/get/' + storeName,
            }).then(
                function(res) {
                    if ((typeof(res.data) !== 'undefined') && 
                        (typeof(res.data.store) !== 'undefined') && 
                        (res.data.store === storeName)
                    ) {
                        image.setStoreName(res.data.store);
                        GeoState.setImage(image);
                        work.resolve(res.data.store);
                    } else {
                        $timeout(function () {
                            checkResult(storeName, work);
                        }, 5000);
                    }
                }, function(msg, code) {
                    work.reject(msg);
                }
            );
        }
    }
})(window.angular, window._);