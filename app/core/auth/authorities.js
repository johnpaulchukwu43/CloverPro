(function () {

    angular.module('mainApp.core.auth')
        .directive('authorized', ['AuthenticationService', function(AuthenticationService) {
            return {
                restrict: 'A',
                scope: {
                    authorized: '='
                },

                link: function (scope, elem, attrs) {
                    scope.$watch(AuthenticationService.isLoggedIn, function() {
                        if (AuthenticationService.userIsAuthorized(scope.authorized)) {

                            elem.show();
                        } else {
                            elem.hide();
                        }
                    });
                }
            }
        }]);

})();
