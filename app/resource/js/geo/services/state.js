(function (angular) {
    'use strict';

    angular.module('Georeferencer.Geo').service('GeoState', GeoState);

    /* @ngInject */
    function GeoState(MarkerAdded, MarkerRemoved, md5) {
        var self = this;
        
        /**
         * @desc Old image
         **/
        self.image = null;
        
        /**
         * @desc Config
         **/
        self.config = {};
        
        /**
         * @desc If true, clicking on the image, marker will be added
         **/
        self.markerPermissionState = null;
        
        /**
         * @desc Hold the is of current marker
         **/
        self.currentMarkerId = null;
        
        /**
         * @desc Hold a list of all current geo markers
         **/
        self.markers = [];
        
        /**
         * @desc Hold settings for image map
         **/
        self.imageMap = {lat: null, lng: null, zoom: null};
        
        /**
         * @desc Hold settings for geo map
         **/
        self.geoMap = {lat: null, lng: null, zoom: null};

        /**
         * @desc Set old image.
         * @{Function}
         **/
        self.setImage = setImage;
        
        /**
         * @desc Set old image.
         * @{Function}
         **/
        self.getImage = getImage;
        
        /**
         * @desc Check permissions to add marker on image and map.
         * @{Function}
         **/
        self.checkPermissions = checkPermissions;
        
        /**
         * @desc Check permissions to add marker on image and map.
         * @{Function}
         **/
        self.setPermissions = setPermissions;
        
        /**
         * @desc Add a marker to the list.
         * @{Function}
         **/
        self.addMarker = addMarker;
        
        /**
         * @desc Update marker.
         * @{Function}
         **/
        self.updateMarker = updateMarker;
        
        /**
         * @desc Update geo marker.
         * @{Function}
         **/
        self.updateGeoMarker = updateGeoMarker;

        /**
         * @desc Remove a marker
         * @type {Function}
         **/
        self.removeMarker = removeMarker;

        /**
         * @desc Get a marker from the list by ID.
         * @type {Function}
         **/
        self.getMarkerById = getMarkerById;
        
        /**
         * @desc Get all markers
         * @type {Function}
         **/
        self.getMarkers = getMarkers;
        
        /**
         * @desc Set markers
         * @type {Function}
         **/
        self.setMarkers = setMarkers;
        
        /**
         * @desc Get all markers for image view
         * @type {Function}
         **/
        self.getImageMarkers = getImageMarkers;
        
        /**
         * @desc Get all markers for map view
         * @type {Function}
         **/
        self.getMapMarkers = getMapMarkers;
        
        /**
         * @desc Get all markers for geoserver
         * @type {Function}
         **/
        self.getGeoserverMarkers = getGeoserverMarkers;
        
        /**
         * @desc Set current marker id
         * @type {Function}
         */
        self.setCurrentMarkerId = setCurrentMarkerId;
        
        /**
         * @desc Get current marker id
         * @type {Function}
         */
        self.getCurrentMarkerId = getCurrentMarkerId;
        
        /**
         * @desc Generates store name
         */
        self.generateStoreName = generateStoreName;

        /**
         * @desc Sets lat, lng and zoom level for image map
         */
        self.setImageMap = setImageMap;

         /**
         * @desc Returns lat, lng and zoom level for image map
         */
        self.getImageMap = getImageMap;

        /**
         * @desc Sets lat, lng and zoom level for geo map
         */
        self.setGeoMap = setGeoMap;

         /**
         * @desc Returns lat, lng and zoom level for geo map
         */
        self.getGeoMap = getGeoMap;

        /**
         * @desc Sets configs
         */
        self.setConfig = setConfig;

         /**
         * @desc Returns config
         */
        self.getConfig = getConfig;
        
        function getImage() {
            return self.image;
        }
        
        function setImage(image) {
            self.image = image;
        }
        
        function checkPermissions(value) {
            return self.markerPermissionState === value;
        }
        
        function setPermissions (permission) {
            self.markerPermissionState = permission;
        }
        
        function setCurrentMarkerId (markerId) {
            self.currentMarkerId = markerId;
        }
        
        function getCurrentMarkerId () {
            return self.currentMarkerId;
        }
        
        function addMarker(marker) {
            self.currentMarkerId = marker.id;
            self.markers.push(marker);
            self.markerPermissionState = 'addMapMarker';
            MarkerAdded.trigger(self.markers);
        }
        
        function updateMarker(marker) {
            _.forEach(
                self.markers,
                function (m)  {
                    if (m.id !== marker.id) {
                        return;
                    }
                    m = marker;
                }
            );
            MarkerAdded.trigger(self.markers);
        }
        
        function updateGeoMarker(marker) {
            _.forEach(
                self.markers,
                function (m)  {
                    if (m.id !== marker.id) {
                        return;
                    }
                    m = marker;
                }
            );
            MarkerAdded.trigger(self.markers);
            self.markerPermissionState = null;
        }
        
        function removeMarker(marker) {
            self.markers = _.filter(
                self.markers,
                function (m) {
                    return m.id !== marker.id;
                }
            );
    
            // Clear current marker permission state on remove
            if (self.currentMarkerId === marker.id) {
                self.markerPermissionState = null;
            }
            MarkerRemoved.trigger(self.markers, marker);
        }
        
        function getMarkerById(markerId) {
            return _.find(self.markers, function (m) { return m.id === markerId;});
        }
        
        function getMarkers() {
            return self.markers;
        }
        
        function setMarkers(markers) {
            self.markers = markers;
        }
        
        function getImageMarkers() {
            var imageMarkers = {};
            _.forEach(
                self.markers,
                function (marker)  {
                    imageMarkers[marker.id] = {
                        id: marker.id,
                        lat: marker.imageLat,
                        lng: marker.imageLng,
                        focus: true,
                        draggable: true,
                        icon: {
                            type: 'div',
                            iconSize: [16, 16],
                            popupAnchor:  [8, 8],
                            className: 'markers ' + marker.id
                        }
                    };
                }
            );
            return imageMarkers;
        }
        
        function getMapMarkers() {
            var mapMarkers = {};
            _.forEach(
                _.filter(
                    self.markers,
                    function (m) {
                        return m.geoLat !== null && m.geoLng !== null;
                    }
                ),
                function (marker)  {
                    mapMarkers[marker.id] = {
                        id: marker.id,
                        lat: marker.geoLat,
                        lng: marker.geoLng,
                        focus: false,
                        draggable: true,
                        icon: {
                            type: 'div',
                            iconSize: [16, 16],
                            popupAnchor:  [8, 8],
                            className: 'markers ' + marker.id
                        }
                    };
                }
            );
            return mapMarkers;
        }
        
        function getGeoserverMarkers() {
            var geoserverMarkers = [];
            _.forEach(
                _.filter(
                    self.markers,
                    function (m) {
                        return m.geoLat !== null && m.geoLng !== null && m.imageLat !== null && m.imageLat !== null;
                    }
                ),
                function (marker)  {
                    geoserverMarkers.push({
                        tileCoordinatesX: marker.imageLng,
                        tileCoordinatesY: self.image.height - marker.imageLat,
                        geoCoordinatesX: marker.geoLng,
                        geoCoordinatesY: marker.geoLat,
                    });
                }
            );
            return geoserverMarkers;
        }
        
        function generateStoreName() {
            var hash = self.image.url + self.image.width + self.image.height;
            _.forEach(
                self.getGeoserverMarkers(),
                function (marker)  {
                    hash = hash +
                        marker.tileCoordinatesX +
                        marker.tileCoordinatesY +
                        marker.geoCoordinatesX +
                        marker.geoCoordinatesY;
                }
            );
            return md5.createHash(hash);
        }
        
        function getImageMap() {
            return self.imageMap;
        }
        
        function setImageMap(map) {
            self.imageMap = map;
        }
        
        function getGeoMap() {
            return self.geoMap;
        }
        
        function setGeoMap(map) {
            self.geoMap = map;
        }
        
        function getConfig() {
            return self.config;
        }
        
        function setConfig(config) {
            self.config = config;
        }
    }
})(window.angular, window._);