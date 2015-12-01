(function (angular) {
    'use strict';

    angular.module('Georeferencer.Geo').factory('LocationSelected', LocationSelected);

    /* @ngInject */
    function LocationSelected(EventBuilder) {
        return EventBuilder.$new(
            'Location::select'
        );
    }
})(window.angular, window._);
