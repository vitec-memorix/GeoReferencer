(function (angular, _) {
    'use strict';

    angular.module('Georeferencer.Geo')
        .directive('georeferencerImageForm', GeoImageForm);

    /* @ngInject */
    function GeoImageForm() {
        var directive = {
            restrict: 'E',
            replace: true,
            scope: {},
            controller: 'Geo.ImageFormCtrl',
            controllerAs: 'imageForm',
            bindToController: true,
            templateUrl: 'geo/views/directives/image-form.html'
        };

        return directive;
    }
})(window.angular, window._);