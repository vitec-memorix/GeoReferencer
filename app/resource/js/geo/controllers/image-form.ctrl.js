;(function (angular, _, $) {
    'use strict';

    angular.module('Georeferencer.Geo').controller('Geo.ImageFormCtrl', ImageFormCtrl);

    /* @ngInject */
    function ImageFormCtrl(
            gettext, 
            GeoState, 
            GeoMarker, 
            MarkerSelected, 
            leafletData
    ) {
        var vm = this;

        vm.marker = {};
        
        vm.updateMarker = updateMarker;
        
        activate();
        
        function activate() {
            vm.marker = GeoState.getMarkerById(GeoState.getCurrentMarkerId());
        }

        function updateMarker(marker) {
            marker.geoLat = parseFloat(marker.geoLat);
            marker.geoLng = parseFloat(marker.geoLng);
            GeoState.updateGeoMarker(marker);
            leafletData.getMap('imageMap').then(function (map) {
                map.closePopup();
            });
        }
    }
})(window.angular, window._, window.jQuery);
