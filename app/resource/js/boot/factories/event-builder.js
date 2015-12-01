(function (angular) {
    'use strict';

    angular.module('Georeferencer.Boot').service('EventBuilder', EventBuilder);
    
    /* @ngInject */
    function EventBuilder($rootScope) {
        var eventBuilder = {
            $new: createEvent
        };

        return eventBuilder;

        function createEvent(eventName) {
            var GeoreferencerEvent = function () {
                var self = this;
                
                /**
                 * @desc Name of the event that we are going to
                 * broadcast/listen to.
                 * @type {String}
                 **/
                self.name = eventName;
                
                /**
                 * @desc A list of subscribers key => fn
                 * @type {Object}
                 **/
                self.subscribers = {};
                
                /**
                 * @type {Function}
                 **/
                self.trigger = triggerEvent;

                /**
                 * @type {Function}
                 **/
                self.subscribe = subscribeEvent;

                /**
                 * @type {Function}
                 **/
                self.ubsubscribe = unsubscribeEvent;
                
                /**
                 * @desc Triger an event on the rootscope.
                 * @param {Object} Additional parameters for the event emition.
                 **/
                function triggerEvent(params) {
                    return $rootScope.$broadcast(self.name, params);
                }
                
                /**
                 * @desc Add a cb to the listener queue for an event.
                 * @param {Function}
                 * @return {String} - Identifier that can be used to unsubscribe
                 **/
                function subscribeEvent(cb) {
                    var cbIdentifier = new Date().getTime().toString() + '-' + Math.random().toString().substr(2);
                    self.subscribers[cbIdentifier] = $rootScope.$on(self.name, cb);
                    return cbIdentifier;
                }
                
                /**
                 * @desc Call the unsubscribe closure if such one
                 * exists and remove from the subscribers list.
                 * @param {String}
                 **/
                function unsubscribeEvent(cbIdentifier) {
                    if (!_.isUndefined(self.subscribers[cbIdentifier]) && 
                        _.isFunction(self.subscribers[cbIdentifier])) {
                        self.subscribers[cbIdentifier]();
                    }
                    self.subscribers = _.omit(self.subscribers, cbIdentifier);
                }
            };

            GeoreferencerEvent.prototype = {
                'constructor': GeoreferencerEvent
            };
            
            return new GeoreferencerEvent(eventName);
        }
    }
})(window.angular, window._);