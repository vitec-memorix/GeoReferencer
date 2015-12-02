(function (angular, _) {
    'use strict';

    angular.module('Georeferencer.Boot')
        .directive('georeferencer', Georeferencer);

    /* @ngInject */
    function Georeferencer() {
        var directive = {
            restrict: 'E',
            replace: true,
            scope: {},
            controller: 'Boot.GeoCtrl',
            controllerAs: 'geo',
            bindToController: true,
            templateUrl: 'boot/views/directives/georeferencer.html'
        };

        return directive;
    }
})(window.angular, window._);
