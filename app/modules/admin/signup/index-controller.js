(function(){
    var appInfo = window.app.details;
    angular.module('mainApp.modules.admin.signup')
        .controller('AdminSignUpController', AdminSignUpController);

  AdminSignUpController.$inject = ['$scope','AuthenticationService', 'logger'];

    function AdminSignUpController($scope, AuthenticationService, logger) {

        $scope.userDetails = {};
        $scope.isLoading = false;
        $scope.isError = false;
        $scope.errorMessage = null;

        $scope.signUpHandler = function () {

          $scope.isLoading = true;

          $scope.userDetails.status = appInfo.USER_STATUS.ACTIVE;
          $scope.userDetails.userType = appInfo.USER_TYPES.FACILITY_MANAGER;

          AuthenticationService.adminSignUpAction($scope.userDetails)
            .then(function (result) {
              console.log("here in success"+JSON.stringify(result));
              $scope.isLoading = false;
              $scope.isError = false;
              $scope.errorMessage = null;
              $scope.userDetails = {};
              logger.success("Sign up complete, proceed to login page");
            },
            function (result) {

              logger.error("Sign up failed. Please review errors.");

              if(!result || result === null || !result.data) {
                $scope.errorMessage = "Error communicating with server. Please try again later";
              }else{
                $scope.errorMessage = result.data.message;
              }
              $scope.isLoading = false;
              $scope.isError = true;

              console.log("failed:"+JSON.stringify(result));
            })


        }
    }


})();
