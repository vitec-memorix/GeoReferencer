(function (angular, _) {
    'use strict';

    angular.module('Georeferencer.Geo')
        .directive('georeferencerCore', Core);

    /* @ngInject */
    function Core() {
        var directive = {
            restrict: 'E',
            replace: true,
            scope: {},
            controller: 'Geo.CoreCtrl',
            controllerAs: 'main',
            bindToController: true,
            templateUrl: 'geo/views/directives/core.html'
        };

        return directive;
    }
})(window.angular, window._);
