(function() {
    'use strict';
    var toastr = require('toastr');

    angular
        .module('mainApp.core.logger')
        .factory('logger', logger);

    /* @ngInject */
    function logger($log) {
        var service = {
            showToasts: true,

            error   : error,
            info    : info,
            success : success,
            warning : warning,

            // straight to console; bypass toastr
            log     : $log.log
        };

        setOptions();

        return service;

        function setOptions (){
            toastr.options.positionClass = "toast-top-right";
            toastr.options.closeButton = true;
            toastr.options.showMethod = 'slideDown';
            toastr.options.newestOnTop = false;
            toastr.options.progressBar = true;
        };

        function error(message, optional,more) {
            toastr.error(message);
            $log.error('Error: '+optional+":"+message+more);
        }

        function info(message, optional,more) {
            toastr.info(message);
            $log.info('Info: ' +optional+":"+message+more);
        }

        function success(message, optional,more) {
            toastr.success(message);
            $log.info('Success: '+optional+":"+message+more);
        }

        function warning(message, optional,more) {
            toastr.warning(message);
            $log.warn('Warning: ' +optional+":"+message+more);
        }
    }
}());
