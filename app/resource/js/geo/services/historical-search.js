(function (angular, _) {
    'use strict';

    angular.module('Georeferencer.Geo').service('HistoricalSearch', HistoricalSearch);

    /* @ngInject */
    function HistoricalSearch($http, LocationFound, CONFIG) {
        var self = this;
        
        /**
         * @desc Limit returned results
         */
        self.limit = 10;
        
        /**
         * @desc Get coordinates by given location name
         * @type {Function}
         */
        self.search = search;
        
        function search(query, limit) {
            if (query.length < 1) {
                LocationFound.trigger([]);
                return;
            }
            if (typeof(limit) !== 'undefined') {
                self.limit = limit;
            }
            $http.get(CONFIG.api.url + '/search/historical/' + query).then(successCallback, errorCallback);
        }
        
        function successCallback(response) {
            var locations = [];
            if (response.data.features.length > 0) {
                _.forEach(
                    response.data.features,
                    function (feature) {
                        if (locations.length >= self.limit) {
                            return;
                        }
                        _.forEach(
                            feature.properties.pits,
                            function (pit) {
                                if ((pit.geometryIndex > -1) && (pit.dataset === 'geonames') && 
                                    (locations.length < self.limit)
                                ) {
                                    locations.push({
                                        'title': pit.name,
                                        'lat': feature.geometry.geometries[pit.geometryIndex].coordinates[1], 
                                        'lng': feature.geometry.geometries[pit.geometryIndex].coordinates[0]
                                    });
                                }
                            }
                        );
                    }
                );
            }
            LocationFound.trigger(locations);
        }
        
        function errorCallback(response) {
        }
    }
})(window.angular, window._);
