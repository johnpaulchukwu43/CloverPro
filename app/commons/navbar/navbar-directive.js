(function() {
    'use strict';

    angular
        .module('mainApp.commons')
        .directive('appNavBar', appNavBar);

    /* @ngInject */
    function appNavBar ($state, constant,AuthenticationService) {
        var directive = {
            bindToController: true,
            controller: TopNavController,
            controllerAs: 'vm',
            restrict: 'EA',
            scope: {},
            templateUrl: 'commons/navbar/navbar.html'
        };

        /* @ngInject */
        function TopNavController() {
            var vm = this;

            vm.appName = constant.APP_NAME;
            vm.showOptions = false;
            vm.isAuth = isAuth;
            vm.logout = logout;
            vm.isCurrent = isCurrent;
            vm.toggleMenuOptions = toggleMenuOptions;

            init();
            function init(){
                getUserInfo();
            }

            function isAuth () {
                return AuthenticationService.isLoggedIn();
            }

            function logout () {
                return AuthenticationService.logout();
            }

            function isCurrent(route) {
                // return $state.is(route) ? 'active' : '';
            }

            function getUserInfo(){
                vm.userinfo = AuthenticationService.getUser();
                console.log(AuthenticationService.getUser());
            }

            function toggleMenuOptions(){
               vm.showOptions = !vm.showOptions;
            }
        }



        return directive;
    }
})();
