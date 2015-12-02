(function (angular) {
    'use strict';

    angular.module('Georeferencer.Geo').factory('MarkerSelected', MarkerSelected);

    /* @ngInject */
    function MarkerSelected(EventBuilder) {
        return EventBuilder.$new(
            'Marker::select'
        );
    }
})(window.angular, window._);
