(function () {
  angular.module('mainApp.modules.login')
    .controller('LoginController', LoginController);

  LoginController.$inject = ['$scope', 'AuthenticationService'];

  function LoginController($scope, AuthenticationService) {

    $scope.userDetails = {};
    $scope.isLoading = false;
    $scope.isError = false;
    $scope.errorMessage = null;
    $scope.loginHandler = function () {
      $scope.isLoading = true;
      AuthenticationService.loginAction($scope.userDetails.email, $scope.userDetails.password).then(
        function (result) {
          $scope.userDetails = {};
          $scope.isLoading = false;
          $scope.isError = false;
          $scope.errorMessage = null;
        },
        function (result) {
          if (!result || result === null || !result.data) {
            $scope.errorMessage = "Error communicating with server. Please try again later";
          } else {
            $scope.errorMessage = result.data.message;
          }
          $scope.isLoading = false;
          $scope.isError = true;
          console.log("failed:" + JSON.stringify(result));
        })
    };
  }


})();
