(function (angular, _) {
    'use strict';

    angular.module('Georeferencer.Geo').service('GeoImage', GeoImage);
    
    /* @ngInject */
    function GeoImage($rootScope) {
        
        var imageBuilder = {
            $new: createImage
        };

        return imageBuilder;

        function createImage(options) {
            var GeoImage = function () {
                var self = this;
                
                /**
                 * @desc image url
                 * @type {String}
                 **/
                self.url = '';
                
                /**
                 * @desc image width in pixels
                 * @type {Decimal}
                 **/
                self.width = 0;
                
                /**
                 * @desc image height in pixels
                 * @type {Decimal}
                 **/
                self.height = 0;
                
                /**
                 * @desc image original name
                 * @type {String}
                 **/
                self.imageName = '';
                
                /**
                 * @desc geoserver store name
                 * @type {String}
                 **/
                self.storeName = '';
                
                /**
                 * @desc title
                 * @type {String}
                 **/
                self.title = '';
                
                /**
                 * @desc description
                 * @type {String}
                 **/
                self.description = '';
                
                /**
                 * @desc place
                 * @type {String}
                 **/
                self.place = '';
                
                /**
                 * @desc do initial search
                 * @type {Boolean}
                 **/
                self.searchForPlace = true;
                
                /**
                 * @desc Returns store name
                 */
                self.getStoreName = getStoreName;
                
                /**
                 * @desc Sets store name
                 */
                self.setStoreName = setStoreName;
                
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
        
                function getStoreName() {
                    return self.storeName;
                }
                
                function setStoreName(store) {
                    self.storeName = store;
                }
            };

            GeoImage.prototype = {
                'constructor': GeoImage
            };
            
            return new GeoImage(options);
        }
    }
})(window.angular, window._);