(function (angular, _) {
    'use strict';

    angular.module('Georeferencer.Geo')
        .directive('georeferencerFinish', Finish);

    /* @ngInject */
    function Finish() {
        var directive = {
            restrict: 'E',
            replace: true,
            scope: {},
            controller: 'Geo.FinishCtrl',
            controllerAs: 'finish',
            bindToController: true,
            templateUrl: 'geo/views/directives/finish.html'
        };

        return directive;
    }
})(window.angular, window._);
