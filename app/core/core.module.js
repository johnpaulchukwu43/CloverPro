(function () {
    'use strict';

    angular
        .module('mainApp.core', [
            'mainApp.core.exception',
            'mainApp.core.logger',
            'mainApp.core.handler',
            'mainApp.core.auth',

        ]);
})();
