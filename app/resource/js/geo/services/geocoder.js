(function (angular, _, google) {
    'use strict';

    angular.module('Georeferencer.Geo').service('GeoCoder', GeoCoder);

    /* @ngInject */
    function GeoCoder(LocationFound, LocationSelected) {
        var self = this;
        
        /**
         * @desc Limit returned results
         */
        self.limit = 10;
        /**
         * @desc Google geocoder
         **/
        self.geoCoder = new google.maps.Geocoder();
        
        /**
         * @desc Get coordinates by given location name
         * @type {Function}
         */
        self.geocode = geocode;
        
        function geocode(query, limit, forceSelect) {
            if (query.length < 1) {
                LocationFound.trigger([]);
                return;
            }
            if (typeof(limit) === 'undefined') {
                limit = self.limit;
            }
            self.geoCoder.geocode({'address': query}, function(results, status) {
                var locations = [];
                if (status === google.maps.GeocoderStatus.OK && results.length) {
                    _.forEach(
                        results,
                        function (result) {
                            if (typeof result.geometry.location.lat !== 'undefined' &&
                                typeof result.geometry.location.lng !== 'undefined' &&
                                locations.length < limit
                            ) {
                                locations.push({
                                    'title': result.formatted_address, 
                                    'lat': result.geometry.location.lat(), 
                                    'lng': result.geometry.location.lng()
                                });
                            }
                        }
                    );
                } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                    setTimeout(function() {
                        self.geocode(query);
                    }, 1000);
                }
                if (forceSelect) {
                    LocationSelected.trigger(locations[0]);
                } else {
                    LocationFound.trigger(locations);
                }
            });
        }
    }
})(window.angular, window._, window.google);