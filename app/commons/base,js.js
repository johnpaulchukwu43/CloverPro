(function () {
    'use strict';

    angular
        .module('mainApp')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['AuthenticationService', '$rootScope'];
    function HomeController(AuthenticationService, $rootScope) {
        var vm = this;

        initController();

        function initController() {

        }

    }

})();
