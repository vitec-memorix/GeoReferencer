(function (angular) {
    'use strict';

    angular.module('Georeferencer.Geo').factory('LocationFound', LocationFound);

    /* @ngInject */
    function LocationFound(EventBuilder) {
        return EventBuilder.$new(
            'Location::find'
        );
    }
})(window.angular, window._);
