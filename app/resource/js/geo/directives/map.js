(function (angular, _) {
    'use strict';

    angular.module('Georeferencer.Geo')
        .directive('georeferencerMap', Map);

    /* @ngInject */
    function Map() {
        var directive = {
            restrict: 'E',
            replace: true,
            scope: {},
            controller: 'Geo.MapCtrl',
            controllerAs: 'map',
            bindToController: true,
            templateUrl: 'geo/views/directives/map.html'
        };

        return directive;
    }
})(window.angular, window._);
