(function (angular, _) {
    'use strict';

    angular.module('Georeferencer.Geo').service('GeoReference', GeoReference);
    
    /* @ngInject */
    function GeoReference(
            $q, 
            $http, 
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
                        image.setStoreName(response.data.store);
                        GeoState.setImage(image);
                        work.resolve(response.data.store);
                    }, function(msg, code) {
                        work.reject(msg);
                    }
                );
            }
            return work.promise;
        }
    }
})(window.angular, window._);