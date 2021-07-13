const toastr = require("toastr");
(function () {
    'use strict';

    var core = angular.module('mainApp.core');

    core.config(toastrConfig);

    /* @ngInject */
    function toastrConfig() {
        toastr.options.timeOut = 4000;
        toastr.options.positionClass = 'toast-bottom-right';
    }

    var config = {
        appTitle: 'CloverPro',
        appErrorPrefix: '[CloverPro Error] ',
        appRoles:{
            SUPER_ADMIN:"super-admin",
            PROVIDER_ADMIN:"provider-admin"
        }
    };

    core.value('config', config);

    core.config(configure);

    /* @ngInject */
    function configure($logProvider, routerHelperProvider, exceptionHandlerProvider) {
        $logProvider.debugEnabled(true);
        exceptionHandlerProvider.configure(config.appErrorPrefix);
    }

})();
