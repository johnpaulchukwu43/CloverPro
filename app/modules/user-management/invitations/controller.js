/*
 Created by Johnpaul Chukwu @ $
*/

(function () {
  'use strict';
  var appInfo = window.app.endpoints;

  angular
    .module('mainApp.modules.user.management.invitations')
    .controller('UserManagementInvitationsController', UserManagementInvitationsController)
    .factory('UserManagementInvitationsService', UserManagementInvitationsService);

  UserManagementInvitationsController.$inject = ['$scope', '$rootScope', 'UserManagementInvitationsService', 'logger', 'exception'];

  function UserManagementInvitationsController($scope, $rootScope, UserManagementInvitationsService, logger, exception) {
    var vm = this;

    initController();

    function initController() {
      vm.title = 'Dashboard'
    }

    $scope.userTypes = ['Occupant', 'Artisan'];

    $scope.userInvitationInfo = {};

    $scope.isLoading = false;


    $scope.sendInvites = function (UserInvitationForm) {

      if (UserInvitationForm.$valid) {
        $scope.isLoading = true;

        UserManagementInvitationsService.sendRequest($scope.userInvitationInfo)
          .then(function (result) {
            $scope.userInvitationInfo = exception.catcher(result);
            $scope.$apply(function () {
              //$scope.resetFields($scope.fashion_info);
              //clear all prev interaction with fields
              $scope.isLoading = false;
              $scope.userInvitationInfo = {}
            })
          })
          .catch(err => {
            console.log(JSON.stringify(err));
            $scope.isLoading = false;
          });
      }
      else {
        logger.error("Enter information for required fields");
      }


    }
  }

  function UserManagementInvitationsService($rootScope, requestHandler) {
    var service = {};

    service.sendRequest = function (data) {
      var url = appInfo.FACILITY_MANAGER_ENDPOINTS.onboard;
      return requestHandler.post(url, data);
    };

    service.getRequest = function (reference) {
      var url = appInfo.FACILITY_MANAGER_ENDPOINTS.onboard+'/'+reference;
      return requestHandler.get(url, {makeCallWithoutToken: true});
    };


    return service;
  }

})();
