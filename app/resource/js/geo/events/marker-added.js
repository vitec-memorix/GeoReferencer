(function (angular) {
    'use strict';

    angular.module('Georeferencer.Geo').factory('MarkerAdded', MarkerAdded);

    /* @ngInject */
    function MarkerAdded(EventBuilder) {
        return EventBuilder.$new(
            'Marker::add'
        );
    }
})(window.angular, window._);
