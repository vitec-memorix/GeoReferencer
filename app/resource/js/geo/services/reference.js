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
                $http({
                    method: 'POST',
                    url: CONFIG.api.url + '/preview',
                    data: {'referencePoints': markers, 'image': image.url, 'storeName': storeName}
                }).then(
                    function(response) {
                        if ((typeof(response.data.store) !== 'undefined') && (response.data.store === storeName)) {
                            image.setStoreName(response.data.store);
                            GeoState.setImage(image);
                            work.resolve(response.data.store);
                        } else {
                            checkResult(storeName, image, work);
                        }
                    }, function(msg, code) {
                        work.reject(msg);
                    }
                );
            }
            return work.promise;
        }
        
        function checkResult(storeName, image, work) {
            $http({
                method: 'GET',
                url: CONFIG.api.url + '/get/' + storeName,
            }).then(
                function(res) {
                    if ((typeof(res.data) !== 'undefined') 
                        && (typeof(res.data.store) !== 'undefined') 
                        && (res.data.store === storeName)
                    ) {
                        image.setStoreName(res.data.store);
                        GeoState.setImage(image);
                        work.resolve(res.data.store);
                    } else {
                        $timeout(checkResult(storeName, image, work), 5000);
                    }
                }, function(msg, code) {
                    work.reject(msg);
                }
            );
        }
    }
})(window.angular, window._);