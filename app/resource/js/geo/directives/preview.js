(function (angular, _) {
    'use strict';

    angular.module('Georeferencer.Geo')
        .directive('georeferencerPreview', Preview);

    /* @ngInject */
    function Preview() {
        var directive = {
            restrict: 'E',
            replace: true,
            scope: {},
            controller: 'Geo.PreviewCtrl',
            controllerAs: 'preview',
            bindToController: true,
            templateUrl: 'geo/views/directives/preview.html'
        };

        return directive;
    }
})(window.angular, window._);
