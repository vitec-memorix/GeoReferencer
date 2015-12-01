;(function (angular, _, $, L) {
    'use strict';

    angular.module('Georeferencer.Geo').controller('Geo.FinishCtrl', FinishCtrl);

    /* @ngInject */
    function FinishCtrl (
            $state,
            $scope, 
            $window,
            toastr,
            gettextCatalog,
            GeoState,
            GeoReference,
            CONFIG
    ) {
        var vm = this;
        
        vm.downloadFormat = null;
        
        vm.goBack = goBack;
        
        vm.doFinish = doFinish;
        
        vm.download = download;
        
        activate();

        function activate() {
            var image = GeoState.getImage();
            if (image === null) {
                $state.go('root', {'msg': gettextCatalog.getString('No image found.')});
                return;
            }
            if (!image.getStoreName()) {
                $state.go('root', {'msg': gettextCatalog.getString('No image found.')});
                return;
            }
        }
        
        function goBack() {
            $state.go('root');
        }
        
        function doFinish() {
            $window.location.href = '/';
        }
        
        function download(event) {
            var image = GeoState.getImage();
            $window.location.href = CONFIG.api.url + '/file/' + image.getStoreName() + '/' + vm.downloadFormat;
        }
    }
})(window.angular, window._, window.jQuery, window.L);