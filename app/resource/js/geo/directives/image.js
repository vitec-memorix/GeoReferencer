(function (angular, _) {
    'use strict';

    angular.module('Georeferencer.Geo')
        .directive('georeferencerImage', GeoImage);

    /* @ngInject */
    function GeoImage() {
        var directive = {
            restrict: 'E',
            replace: true,
            scope: {},
            controller: 'Geo.ImageCtrl',
            controllerAs: 'image',
            bindToController: true,
            templateUrl: 'geo/views/directives/image.html'
        };

        return directive;
    }
})(window.angular, window._);