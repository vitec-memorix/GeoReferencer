(function (angular, _) {
    'use strict';

    angular.module('Georeferencer.Geo').service('GeoMarker', GeoMarker);
    
    /* @ngInject */
    function GeoMarker($rootScope) {
        
        var markerBuilder = {
            $new: createMarker
        };

        return markerBuilder;

        function createMarker(options) {
            var Marker = function () {
                var self = this;
                
                /**
                 * @desc Unique identifier
                 * @type {String}
                 **/
                self.id = _.uniqueId('marker_');
                
                /**
                 * @desc Marker title
                 * @type {String}
                 **/
                self.title = '';
                
                /**
                 * @desc Coordinates in pixels
                 * @type {Decimal}
                 **/
                self.imageLat = null;
            
                   /**
                 * @desc Coordinates in pixels
                 * @type {Decimal}
                 **/
                self.imageLng = null;
                
                /**
                 * @desc Coordinates for geoserver
                 * @type {Decimal}
                 **/
                self.imageGeoLat = null;
                
                /**
                 * @desc Coordinates for geoserver
                 * @type {Decimal}
                 **/
                self.imageGeoLng = null;
                
                /**
                 * @desc Coordinates
                 * @type {Decimal}
                 **/
                self.geoLat = null;
                
                /**
                 * @desc Coordinates in pixels
                 * @type {Decimal}
                 **/
                self.geoLng = null;
                
                /**
                 * @desc css class
                 * @type {String}
                 **/
                self.css = 'default-marker'; 
                
                _.forEach(
                    options,
                    function (property, propertyName)  {
                        var setterName = 'set' + _.capitalize(propertyName);
                        if (_.isFunction(self[setterName])) {
                            self[setterName](property);
                        } else {
                            self[propertyName] = property;
                        }
                    }
                );
            };

            Marker.prototype = {
                'constructor': Marker
            };
            
            return new Marker(options);
        }
    }
})(window.angular, window._);