(function () {

    angular.module('mainApp.core.auth')
        .directive('roles', ['AuthenticationService', function(AuthenticationService) {
            return {
                restrict: 'A',
                scope: {
                    roles: '='
                },

                link: function (scope, elem, attrs) {
                    scope.$watch(AuthenticationService.isLoggedIn, function() {
                        if (AuthenticationService.userHasRole(scope.roles)) {
                            elem.show();
                        } else {
                            elem.hide();
                        }
                    });
                }
            }
        }]);

})();
