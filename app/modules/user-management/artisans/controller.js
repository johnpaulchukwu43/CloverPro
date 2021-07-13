/*
 Created by Johnpaul Chukwu @ $
*/

var appUtil = require('../../appUtil');
var appEndpoints = window.app.endpoints;
var appDetails = window.app.details;


(function () {
  'use strict';

  angular
    .module('mainApp.modules.user.management')
    .controller('ArtisanUserController', ArtisanUserController)
    .factory('ArtisanUserService', ArtisanUserService);

  ArtisanUserController.$inject = ['$scope', '$rootScope', 'AuthenticationService', 'logger', 'exception', 'ArtisanUserService'];

  function ArtisanUserController($scope, $rootScope, AuthenticationService, logger, exception, ArtisanUserService) {
    var vm = this;

    initController();

    function initController() {
      vm.title = 'Tasks'
    }

    //table related var
    $scope.tableState = null;
    $scope.isLoading = false;
    $scope.pageSize = 10;
    $scope.loadFailed = false;
    $scope.colspan = 10;

    //search related var
    $scope.searchTerm = null;
    $scope.isEmptyRecord = false;

    $scope.users = {};
    $scope.userInfo = {};
    $scope.status_action = '';
    $scope.user = {};
    $scope.noUser = true;

    $scope.showViewModal = false;

    $scope.doPaginate = function (tableState) {
      if (!tableState) {
        return;
      }
      $scope.tableState = tableState;
      var pagination = tableState.pagination;
      var start = pagination.start || 0;
      start = Math.ceil((start + 1) / $scope.pageSize);
      var number = pagination.number || $scope.pageSize;
      $scope.isLoading = true;
      $scope.loadFailed = false;
      $scope.loadUsers(start, number);
    };

    $scope.doCheck = function (usersInfo, noUsers, start, number) {
      if (usersInfo.total === 0) {
        noUsers = true;
      } else {
        //if there are users
        noUsers = false;
        $scope.tableState.pagination.numberOfPages = usersInfo.pages;
        usersInfo = normalizeData(usersInfo.docs, start, number);
      }
      return {
        usersInfo,
        noUsers
      }
    };

    $scope.loadUsers = function (start, number) {
      $scope.isLoading = true;
      ArtisanUserService.getArtisans(start, number)
        .then(function (result) {
          $scope.userInfo = exception.handleGetRequestResponse(result, $scope.users);
          $scope.isLoading = false;
          if ($scope.userInfo !== null) {
            //then no errors
            $scope.loadFailed = false;
            var tmp_info = $scope.doCheck($scope.userInfo.data, $scope.noUsers, start, number);
            $scope.noUsers = tmp_info.noUsers;
            $scope.users = tmp_info.usersInfo;
          } else {
            $scope.loadFailed = true;
          }
          $scope.$apply();

        })
    };

    function normalizeData(list_of_data, pageNumber, pageSize) {
      var data_id = (pageSize * pageNumber) - (pageSize - 1);
      angular.forEach(list_of_data, function (data) {
        data.serial_no = data_id;
        data_id++;
      });
      return list_of_data;
    }

    $scope.match_status_code = function (code) {
      switch (code) {
        case 'ACTIVE':
          var val = {
            "style": {
              "background-color": "#2ecc71",

            }
          };
          return val;
        case 'INACTIVE':
          var val = {
            "style": {
              "background-color": "#e74c3c",

            }
          };
          return val;

      }
    };

  }


  function ArtisanUserService(requestHandler) {
    var service = {};

    service.getArtisans = function (pageNum, pageSize) {
      var url = appUtil.modifyProductUrl(appEndpoints.FACILITY_MANAGER_ENDPOINTS.users, pageSize, pageNum, 'createdAt', 'DESC', false)+"&userType="+appDetails.USER_TYPES.ARTISAN;
      return requestHandler.get(url);

    };

    return service;
  }

})();
