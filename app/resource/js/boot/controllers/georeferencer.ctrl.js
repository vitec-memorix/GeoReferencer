;(function (angular, _, $) {
    'use strict';

    angular.module('Georeferencer.Boot').controller('Boot.GeoCtrl', GeoCtrl);

    /* @ngInject */
    function GeoCtrl ($state) {
        var vm = this;
        
        vm.getMode = getMode;
        
        function getMode() {
            return $state.current.params.mode;
        }
    }
})(window.angular, window._, window.jQuery);
