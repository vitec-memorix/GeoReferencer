;(function (angular, _, $) {
    'use strict';

    angular.module('Georeferencer.Geo').controller('Geo.CoreCtrl', CoreCtrl);

    /* @ngInject */
    function CoreCtrl (
            $state,
            $scope, 
            $window,
            $stateParams,
            toastr,
            gettextCatalog, 
            GeoState, 
            MarkerAdded, 
            MarkerRemoved, 
            MarkerSelected, 
            leafletData, 
            LocationFound, 
            LocationSelected, 
            GeoCoder,
            GeoReference,
            HistoricalSearch
    ) {
        var vm = this;
        
        var buttons = {
            'new': {
                'show': true,
                'title': gettextCatalog.getString('Start over'),
                'css': function () { 
                    return 'new-button'; 
                },
                'dispatch': function () {
                    if (confirm(gettextCatalog.getString('Are you sure? All your content will be removed!'))) {
                        $window.location.href = '/';
                    }
                }
            },
            'new_reference_point': {
                'show': true,
                'title': gettextCatalog.getString('New reference point'),
                'css': function () {
                    if (GeoState.checkPermissions('addImageMarker') || GeoState.checkPermissions('addMapMarker')) {
                        return 'new-point-button active'; 
                    }
                    return 'new-point-button'; 
                },
                'dispatch': function () {
                    if (!GeoState.checkPermissions('addImageMarker') && !GeoState.checkPermissions('addMapMarker')) {
                        GeoState.setPermissions('addImageMarker');
                    }
                }
            },
            'list': {
                'show': true,
                'title': gettextCatalog.getString('List'),
                'css': function () { 
                    return vm.showList ? 'list-button active' : 'list-button'; 
                },
                'dispatch': function () {
                    if (!vm.showList && (GeoState.getMarkers().length < 1)) {
                        toastr.info(gettextCatalog.getString('Please add reference points first.'));
                    } else {
                        vm.showList = !vm.showList;
                    }
                }
            },
            'finish': {
                'show': true,
                'title': gettextCatalog.getString('Finish'),
                'css': function () { 
                    return 'finish-button'; 
                },
                'dispatch': function () {
                    $('.finish-button').addClass('loading');
                    GeoReference.queuePreview().then(
                        function (response) {
                            $('.finish-button').removeClass('loading');
                            $state.go('finish');
                        }, function (response) {
                            $('.finish-button').removeClass('loading');
                            var error = response;
                            if (typeof(response.message) !== 'undefined') {
                                error = response.message;
                            }
                            toastr.warning(error);
                        }
                    );
                }
            },
            'preview': {
                'show': true,
                'title': gettextCatalog.getString('Preview'),
                'css': function () { 
                    return 'preview-button middle'; 
                },
                'dispatch': function () {
                    $('.preview-button').addClass('loading');
                    GeoReference.queuePreview().then(
                        function (response) {
                            $('.preview-button').removeClass('loading');
                            $state.go('preview');
                        }, function (response) {
                            $('.preview-button').removeClass('loading');
                            var error = response;
                            if (typeof(response.message) !== 'undefined') {
                                error = response.message;
                            }
                            toastr.warning(error);
                        }
                    );
                }
            }
        };
        
        vm.showList = false;
        
        vm.menu = [];
        
        vm.markers = [];
        
        vm.locations = [];
        
        vm.search = {'query' : '', 'historic': false};
        
        vm.clearSearch = clearSearch;
        
        vm.removeMarker = removeMarker;
        
        vm.selectMarker = selectMarker;
        
        vm.selectLocation = selectLocation;
        
        vm.searchLocation = searchLocation;
        
        activate();
        
        function activate() {
            vm.markers = GeoState.getMarkers();
            MarkerAdded.subscribe(refreshMarkers.bind(vm));
            MarkerRemoved.subscribe(refreshMarkers.bind(vm));
            MarkerSelected.subscribe(focusMarker.bind(vm));
            LocationFound.subscribe(showLocations.bind(vm));
            
            var config = GeoState.getConfig();
            if ((typeof(config.buttons) !== 'undefined')) {
                buttons = _.merge(buttons, config.buttons);
            }
            _.forEach(
                buttons,
                function (button, key)  {
                    if (button.show) {
                        vm.menu.push(button);
                    }
                }
            );
            
            if ($stateParams.msg !== null) {
                toastr.warning($stateParams.msg);
            }
            
            var image = GeoState.getImage();
            vm.search.query = image.place;
        }
        
        function refreshMarkers(_e, markers) {
            this.markers = GeoState.getMarkers();
        }
        
        function showLocations(_e, locations) {
            this.locations = locations;
            if (locations.length < 1) {
                toastr.info(gettextCatalog.getString('No results found.'));
            }
            $scope.$applyAsync();
        }
        
        function removeMarker(marker) {
            GeoState.removeMarker(marker);
        }
        
        function focusMarker(_e, marker) {
            $('.lat-lng-list .marker_row').removeClass('selected');
            $('.lat-lng-list #' + marker.id + '_row').addClass('selected');
        }
        
        function selectMarker(marker) {
            MarkerSelected.trigger(marker);
        }
        
        function clearSearch() {
            vm.locations = [];
        }
        
        function selectLocation(location) {
            LocationSelected.trigger(location);
            vm.locations = [];
        }
        
        function searchLocation(event) {
            if (vm.search.historic) {
                HistoricalSearch.search(vm.search.query);
            } else {
                GeoCoder.geocode(vm.search.query);
            }
        }
    }
})(window.angular, window._, window.jQuery);
