(function() {
    'use strict';

    angular
        .module('mainApp.commons')
        .directive('appSideNav', appSideNav);

    /* @ngInject */
    function appSideNav ($state, constant) {
        var directive = {
            bindToController: true,
            controller: SideNavController,
            controllerAs: 'vm',
            restrict: 'EA',
            scope: {},
            templateUrl: 'commons/sidenav/side-nav.html'
        };

        /* @ngInject */
        function SideNavController() {
            var vm = this;
            vm.appName = constant.APP_NAME;
            vm.isAuth = isAuth;
            vm.logout = logout;
            vm.isCurrent = isCurrent;
            vm.roles = window.app.roles;
            vm.authorities = window.app.authorities;

        }

        function isAuth () {
            // return authService.isAuth();
        }

        function logout () {
            // return authService.logout();
        }

        function isCurrent(route) {
            // return $state.is(route) ? 'active' : '';
        }

        return directive;
    }
})();
