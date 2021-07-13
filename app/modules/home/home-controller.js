/*
 Created by Johnpaul Chukwu @ $
*/

var appUtil = require('../appUtil');
var appEndpoints = window.app.endpoints;
var appDetails = window.app.details;

(function () {
  'use strict';

  angular
    .module('mainApp.modules.home')
    .controller('HomeController', HomeController)
    .factory('HomeService', HomeService);

  HomeController.$inject = ['$scope', '$rootScope', 'AuthenticationService', 'logger', 'exception', 'HomeService','OccupantComplaintService','ArtisanTaskService'];

  function HomeController($scope,$rootScope,uthenticationService, logger,exception, HomeService,OccupantComplaintService,ArtisanTaskService) {

    $scope.isFacilityManager = $rootScope.globals.curentUser;

    $scope.isLoadingArtisanCount = false;
    $scope.isLoadingOccupantCount = false;
    $scope.isLoadingAssetCount = false;

    $scope.artisanCount = 0;
    $scope.assetCount = 0;
    $scope.completedTasksForFM = 0;
    $scope.occupantCount = 0;

    $scope.artisanCountLoadFailed = false;
    $scope.occupantCountLoadFailed = false;
    $scope.assetCountLoadFailed = false;

    $scope.noDashboardView = false;
    $scope.facilityManagerDashboard = false;
    $scope.artisanDashboard = false;
    $scope.occupantDashboard = false;

    //paginate data
    //table related var
    $scope.tableState = null;
    $scope.isLoading = false;
    $scope.pageSize = 10;
    $scope.loadFailed = false;
    $scope.colspan = 10;

    //search related var
    $scope.searchTerm = null;
    $scope.isEmptyRecord = false;

    //artisan scores
    $scope.completedTasksForAR = 0;
    $scope.pendingTasksForAR = 0;
    $scope.pendingReviewTasksForAR = 0;
    $scope.isLoadingRow1ForArtisanDashboard = false;
    $scope.tasks = {};
    $scope.taskInfo = {};
    $scope.status_action = '';
    $scope.task = {};
    $scope.noTasks = true;
    $scope.taskMoreDetails = {};

    //oc (occupant) scores
    $scope.isLoadingRow1ForCustomerDashboard = false;
    $scope.isLoadingRow2ForCustomerDashboard = false;
    $scope.treatedComplaintsForOc = 0;
    $scope.pendingComplaintsForOc = 0;
    $scope.complaints = {};
    $scope.complaintInfo = {};
    $scope.status_action = '';
    $scope.complaint = {};
    $scope.noComplaints = true;

    $scope.initController = function() {

      if(!$rootScope.globals || !$rootScope.globals.curentUser){
        $scope.noDashboardView = true;
        $scope.facilityManagerDashboard = false;
        $scope.artisanDashboard = false;
        $scope.occupantDashboard = false;
      }else{
        $scope.facilityManagerDashboard = $rootScope.globals.curentUser.type === appDetails.USER_TYPES.FACILITY_MANAGER;
        $scope.artisanDashboard = $rootScope.globals.curentUser.type === appDetails.USER_TYPES.ARTISAN;
        $scope.occupantDashboard = $rootScope.globals.curentUser.type === appDetails.USER_TYPES.OCCUPANT;
      }

      if($scope.facilityManagerDashboard){
        $scope.isLoadingArtisanCount = true;
        $scope.getArtisanCount();
      }

      if($scope.artisanDashboard){
        $scope.isLoadingRow1ForArtisanDashboard = true;
        $scope.getTotalCompletedForArtisan();

      }

      if($scope.occupantDashboard){
        $scope.isLoadingRow1ForCustomerDashboard = true;
        $scope.getTotalTreatedComplaintsForOccupant();
      }
    };

    //table paginate queries
    $scope.doPaginate = function (tableState, loadData) {
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
      loadData(start, number);
    };

    function doCheck(items, noItem, start, number) {
      if (items.totalCount === 0) {
        noItem = true;
      } else {
        //if there are Complaints
        noItem = false;
        $scope.tableState.pagination.numberOfPages = items.pageCount;
        items = normalizeData(items.data, start, number);
      }
      return {items, noItem}
    }

    function normalizeData(list_of_data, pageNumber, pageSize) {
      var data_id = (pageSize * pageNumber) - (pageSize - 1);
      angular.forEach(list_of_data, function (data) {
        data.serial_no = data_id;
        data_id++;

        //
        if (data.assetInfo.length !== 0) {
          data.propertyInfo = data.assetInfo[0];
        } else if (data.buildingInfo.length !== 0) {
          data.propertyInfo = data.buildingInfo[0];
        } else if (data.roomInfo.length !== 0) {
          data.propertyInfo = data.roomInfo[0];
        }
      });
      return list_of_data;
    }

    $scope.match_status_code = function (status) {
      switch (status) {
        case appDetails.TASK_STATUS.LOGGED_SUCCESS:
          return {"style" : {"background-color": "#b2b7af","color":"#fff"}};
        case appDetails.TASK_STATUS.RECEIVED_BY_MANAGER:
          return {"style" : {"background-color": "#7d3f00","color":"#fff"}};
        case appDetails.TASK_STATUS.ASSIGNED_TO_ARTISAN:
          return {"style" : {"background-color": "#9b5002","color":"#fff"}};
        case appDetails.TASK_STATUS.RECEIVED_BY_ARTISAN:
          return {"style" : {"background-color": "#9b5002","color":"#fff"}};
        case appDetails.TASK_STATUS.TASK_IN_PROGRESS:
          return {"style" : {"background-color": "#d5c901", "color":"#fff"}};
        case appDetails.TASK_STATUS.TASK_COMPLETE_PENDING_REVIEW:
          return {"style" : {"background-color": "#0e478d", "color":"#fff"}};
        case appDetails.TASK_STATUS.COMPLETED:
          return {"style" : {"background-color": "#2ab368", "color":"#fff"}};
        case appDetails.TASK_STATUS.CLOSED:
          return {"style" : {"background-color": "#e74c3c", "color":"#fff"}};
      }
    };

    //fma dashboard queries
    $scope.getArtisanCount = function(){

      console.log("calling 1");

      HomeService.getUserTypeCount(appDetails.USER_TYPES.ARTISAN)
        .then(function (response) {
          var status = response.status;
          var result = response.data;

          if (status >= 200 && status <= 300) {
            if(!result.data || result.data.length <=0){
              $scope.artisanCount = 0;
            }else{
              $scope.artisanCount = result.data[0].userCount;
            }

          }else{
            $scope.artisanCount = 0;
          }

          $scope.getOccupantCount();
        });
    };

    $scope.getOccupantCount = function(){

      console.log("calling 2");

      HomeService.getUserTypeCount(appDetails.USER_TYPES.OCCUPANT)
        .then(function (response) {
          var status = response.status;
          var result = response.data;

          if (status >= 200 && status <= 300) {
            if(!result.data || result.data.length <=0){
              $scope.occupantCount = 0;
            }else{
              $scope.occupantCount = result.data[0].userCount;
            }
          }else{
            $scope.occupantCount = 0;
          }

          $scope.getAssetCount();
        });
    };

    $scope.getAssetCount = function(){

      console.log("calling 3");

      HomeService.getAssetCount()
        .then(function (response) {
          var status = response.status;
          var result = response.data;

          if (status >= 200 && status <= 300) {
            if(!result.data || result.data.length <=0){
              $scope.assetCount = 0;
            }else{
              $scope.assetCount = result.data[0].itemCount;
            }
          }else{
            $scope.assetCount = 0;
          }
          $scope.getTotalCompletedForFacilityManager();
        });

    };

    $scope.getTotalCompletedForFacilityManager = function(){

      console.log("calling 4");

      let queryParams = "?status="+appDetails.TASK_STATUS.COMPLETED+"&facilityManagerId="+$rootScope.globals.curentUser.id;

      HomeService.getTasksCount(queryParams)
        .then(function (response) {
          var status = response.status;
          var result = response.data;

          if (status >= 200 && status <= 300) {

            if(!result.data || result.data.length <=0){
              $scope.completedTasksForFM = 0;
            }else{
              $scope.completedTasksForFM = result.data[0].taskCount;
            }
          }else{
            $scope.completedTasksForFM = 0;
          }

          $scope.$apply(function () {
            $scope.isLoadingArtisanCount = false;
          });
        });

    };

    //artisan dashboard queries
    $scope.getTotalCompletedForArtisan = function(){

      console.log("calling 1");

      let queryParams = "?status="+appDetails.TASK_STATUS.COMPLETED+"&artisanId="+$rootScope.globals.curentUser.id;

      HomeService.getTasksCount(queryParams)
        .then(function (response) {
          var status = response.status;
          var result = response.data;

          if (status >= 200 && status <= 300) {
            if(!result.data || result.data.length === 0){
              console.log("no data for total complete");
            } else{
              $scope.completedTasksForAR = result.data[0].taskCount;
            }
          }else{
            $scope.$scope.completedTasksForAR = 0;
          }
          $scope.getTotalPendingForArtisan();
        });

    };

    $scope.getTotalPendingForArtisan = function(){

      console.log("calling 2");

      let queryParams = "?statusIn="+appDetails.TASK_STATUS.ASSIGNED_TO_ARTISAN+","+appDetails.TASK_STATUS.RECEIVED_BY_ARTISAN+","+appDetails.TASK_STATUS.TASK_IN_PROGRESS+"&artisanId="+$rootScope.globals.curentUser.id;

      HomeService.getTasksCount(queryParams)
        .then(function (response) {
          var status = response.status;
          var result = response.data;

          if (status >= 200 && status <= 300) {
            if(result.data.length === 0){
              console.log("no data for pending complete");
            } else{
              $scope.pendingTasksForAR = result.data[0].taskCount;
            }

          }else{
            $scope.$scope.pendingTasksForAR = 0;
          }
          $scope.getTotalPendingReviewForArtisan();
        });

    };

    $scope.getTotalPendingReviewForArtisan = function(){

      console.log("calling 3");

      let queryParams = "?status="+appDetails.TASK_STATUS.TASK_COMPLETE_PENDING_REVIEW+"&occupantId="+$rootScope.globals.curentUser.id;

      HomeService.getTasksCount(queryParams)
        .then(function (response) {
          var status = response.status;
          var result = response.data;

          if (status >= 200 && status <= 300) {
            if(result.data.length === 0){
              console.log("no data for pending review");
            } else{
              $scope.pendingReviewTasksForAR = result.data[0].taskCount;
            }
          }else{
            $scope.$scope.pendingReviewTasksForAR = 0;
          }

          $scope.$apply(function () {
            $scope.isLoadingRow1ForArtisanDashboard = false;
          });
        });

    };

    $scope.doPaginateTasks = function(tableState){

      $scope.doPaginate(tableState,loadTasks)
    };

    function loadTasks(start, number) {
      $scope.isLoading = true;
      let facilityManagerId = $rootScope.globals.curentUser.onBoardedBy;
      ArtisanTaskService.getTasks(start, number, facilityManagerId)
        .then(function (result) {
          $scope.taskInfo = exception.handleGetRequestResponse(result, $scope.tasks);
          $scope.isLoading = false;
          if ($scope.taskInfo !== null) {
            //then no errors
            $scope.loadFailed = false;
            var tmp_info = doCheck($scope.taskInfo.data, $scope.noTasks, start, number);
            $scope.noTasks = tmp_info.noItem;
            $scope.tasks = tmp_info.items;
          } else {
            $scope.loadFailed = true;
          }
          $scope.$apply();

        })
    }

    //oc dashboard queries
    $scope.getTotalTreatedComplaintsForOccupant = function(){

      console.log("calling 1");

      let queryParams = "?status="+appDetails.TASK_STATUS.COMPLETED+"&occupantId="+$rootScope.globals.curentUser.id;

      HomeService.getTasksCount(queryParams)
        .then(function (response) {
          var status = response.status;
          var result = response.data;

          if (status >= 200 && status <= 300) {
            if(result.data.length === 0){
              console.log("no data for pending complete");
            } else{
              $scope.treatedComplaintsForOc = result.data[0].taskCount;
            }

          }else{
            $scope.$scope.treatedComplaintsForOc = 0;
          }
          $scope.getTotalPendingComplaintsForOccupant();
        });

    };

    $scope.getTotalPendingComplaintsForOccupant = function(){

      console.log("calling 2");

      let queryParams = "?statusIn="+appDetails.TASK_STATUS.LOGGED_SUCCESS+","+appDetails.TASK_STATUS.RECEIVED_BY_MANAGER+","
        +appDetails.TASK_STATUS.ASSIGNED_TO_ARTISAN+","+appDetails.TASK_STATUS.RECEIVED_BY_ARTISAN+","
        +appDetails.TASK_STATUS.TASK_IN_PROGRESS+","+appDetails.TASK_STATUS.TASK_COMPLETE_PENDING_REVIEW+"&occupantId="+$rootScope.globals.curentUser.id;

      HomeService.getTasksCount(queryParams)
        .then(function (response) {
          var status = response.status;
          var result = response.data;

          if (status >= 200 && status <= 300) {
            if(result.data.length === 0){
              console.log("no data for pending complete");
              $scope.pendingComplaintsForOc = 0;
            } else{
              $scope.pendingComplaintsForOc = result.data[0].taskCount;
            }

          }else{
            $scope.$scope.pendingComplaintsForOc = 0;
          }
          $scope.$apply(function () {
            $scope.isLoadingRow1ForCustomerDashboard = false;
          });
        });

    };

    $scope.doPaginateComplaints = function(tableState){

      $scope.doPaginate(tableState,loadComplaints)
    };

    function loadComplaints (start, number) {
      $scope.isLoading = true;
      let facilityManagerId = $rootScope.globals.curentUser.onBoardedBy;
      OccupantComplaintService.getComplaints(start, number,facilityManagerId)
        .then(function (result) {
          $scope.complaintInfo = exception.handleGetRequestResponse(result, $scope.complaints);
          $scope.isLoading = false;
          if ($scope.complaintInfo !== null) {
            //then no errors
            $scope.loadFailed = false;
            var tmp_info = doCheck($scope.complaintInfo.data, $scope.noComplaints, start, number);
            $scope.noComplaints = tmp_info.noItem;
            $scope.complaints = tmp_info.items;
          } else {
            $scope.loadFailed = true;
          }
          $scope.$apply();

        })
    };


  }


  function HomeService(requestHandler) {
    var service = {};

    service.getUserTypeCount = function (userType) {
      let url = appEndpoints.ANALYTICS.userTypeCount+"?userType="+userType;

      return requestHandler.get(url);
    };

    service.getAssetCount = function () {
      let url = appEndpoints.ANALYTICS.assetsCount;
      return requestHandler.get(url);
    };

    service.getTasksCount = function (queryParams) {
      let url = appEndpoints.ANALYTICS.tasksCount+queryParams;
      return requestHandler.get(url);
    };

    service.updateTaskStatus = function(taskId, body){
      var url = appEndpoints.FACILITY_MANAGER_ENDPOINTS.updateTaskStatus + '/'+taskId;
      return requestHandler.put(url, body);
    };

    service.assignTaskToArtisan = function(taskId, body){
      var url = appEndpoints.FACILITY_MANAGER_ENDPOINTS.assignTaskToArtisan + '/'+taskId;
      return requestHandler.put(url, body);
    };

    return service;
  }


})();
