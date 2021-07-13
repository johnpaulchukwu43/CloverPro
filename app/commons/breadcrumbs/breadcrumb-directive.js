(function() {
    'use strict';

    angular
        .module('mainApp.commons')
        .directive('appCurrentState', appCurrentState);

    /* @ngInject */
    function appCurrentState ($state, constant) {
        var directive = {
            bindToController: true,
            controller: appCurrentStateController,
            controllerAs: 'vm',
            restrict: 'EA',
            scope: {
                'current': '='
            },
            templateUrl: 'commons/breadcrumbs/breadcrumb.html'
        };

        /* @ngInject */
        function appCurrentStateController() {
            var vm = this;
            vm.appName = constant.APP_NAME;
            vm.isCurrent = isCurrent;
        }


        function isCurrent(route) {
            // return $state.is(route) ? 'active' : '';
        }

        return directive;
    }
})();
