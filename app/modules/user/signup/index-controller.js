(function(){
    var appInfo = window.app.details;
    angular.module('mainApp.modules.user.signup')
        .controller('UserSignUpController', UserSignUpController);

  UserSignUpController.$inject = ['$scope','AuthenticationService', 'logger','UserManagementInvitationsService','exception', 'logger'];

    function UserSignUpController($scope, AuthenticationService,logger, UserManagementInvitationsService, exception) {

        $scope.userDetails = {};
        $scope.isLoading = false;
        $scope.isError = false;
        $scope.errorMessage = null;
        $scope.loadFailed = false;
        $scope.showSignUpForm = false;

        $scope.invitationReference = {};
        $scope.validInvitation = null;

        $scope.getInvitationRequest = function(){

          UserManagementInvitationsService.getRequest($scope.invitationReference.value)
            .then(function (result) {
              $scope.validInvitation = exception.handleGetRequestResponse(result,$scope.validInvitation);
              if($scope.validInvitation!== null){
                //then no errors
                $scope.$apply(function () {
                  $scope.isLoading = false;
                  $scope.loadFailed = false;
                  $scope.showSignUpForm = true;
                  $scope.userDetails = $scope.validInvitation.data;
                })
              }else{
                $scope.loadFailed = true;
              }
            })

        };

        $scope.signUpHandler = function () {

          $scope.isLoading = true;
          $scope.userDetails.status = appInfo.USER_STATUS.ACTIVE;
          $scope.userDetails.onBoardRequestId = $scope.userDetails._id;
          $scope.userDetails.onBoardedBy = $scope.userDetails.facilityManagerId;
          $scope.userDetails.email = $scope.userDetails.recipientEmail;

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
