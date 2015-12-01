(function (angular) {
    'use strict';

    angular.module('Georeferencer.Geo').factory('MarkerRemoved', MarkerRemoved);

    /* @ngInject */
    function MarkerRemoved(EventBuilder) {
        return EventBuilder.$new(
            'Marker::remove'
        );
    }
})(window.angular, window._);
