;(function (angular, L) {
    'use strict';

    angular.module(
        'Georeferencer.Boot',
        [
            'ui.router',
            'gettext',
            'nemLogging',
            'leaflet-directive',
            'angular-md5',
            'rzModule',
            'toastr',
            'ngDialog',
            
            'Georeferencer.Partials',

            'Georeferencer.Geo'
        ]
    )
    .config(routeConfig)
    .config(debugConfig)
    .config(toastrConf);

    /* @ngInject */
    function routeConfig($locationProvider, $urlRouterProvider, $stateProvider) {
        $urlRouterProvider.when('', '/');

        $stateProvider
            .state(
                'root',
                {
                    url: '/',
                    reloadOnSearch: false,
                    params: {
                        'mode': 'default',
                        'msg': null
                    },
                    views: {
                        'georeferencer@': {
                            templateUrl: 'boot/views/layout.html'
                        }
                    }
                }
            )
            .state(
                'preview',
                {
                    url: '/preview',
                    reloadOnSearch: false,
                    params: {
                        'mode': 'preview'
                    },
                    views: {
                        'georeferencer@': {
                            templateUrl: 'boot/views/layout.html'
                        }
                    }
                }
            )
            .state(
                'finish',
                {
                    url: '/finish',
                    reloadOnSearch: false,
                    params: {
                        'mode': 'finish'
                    },
                    views: {
                        'georeferencer@': {
                            templateUrl: 'boot/views/layout.html'
                        }
                    }
                }
            )
            .state('not-found', {
                url: '/not-found',
                templateUrl: 'boot/views/not-found.html'
            });

        $urlRouterProvider.otherwise('/not-found');
        $locationProvider.html5Mode(true);
    }

    angular.module('Georeferencer.Boot').run(
        stateEvents
    );

    /* @ngInject */
    function debugConfig($compileProvider) {
        $compileProvider.debugInfoEnabled(true);
    }

    /* @ngInject */
    function stateEvents(gettextCatalog) {
        gettextCatalog.setCurrentLanguage('nl');
    }
    
    /* @ngInject */
    function toastrConf(toastrConfig) {
        angular.extend(toastrConfig, {
            positionClass: 'toast-top-center',
            autoDismiss: true,
            maxOpened: 1,
            closeButton: true
        });
    }
})(window.angular, window.L);
