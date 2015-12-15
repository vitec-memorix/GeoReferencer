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
            if (confirm(gettextCatalog.getString('Are you sure? All your content will be removed!'))) {
                $window.location.href = '/';
            }
        }
        
        function download(event) {
            var image = GeoState.getImage();
            var url = CONFIG.api.url + '/file/' + image.getStoreName() + '/' + vm.downloadFormat;
            if (image.imageName !== '') {
                url = url + '?fileName=' + image.imageName;
            }
            $window.location.href = url;
        }
    }
})(window.angular, window._, window.jQuery, window.L);