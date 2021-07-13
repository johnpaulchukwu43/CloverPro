/*
 Created by Johnpaul Chukwu @ $
*/

var appUtil = require('../../appUtil');
var appEndpoints = window.app.endpoints;
var appDetails = window.app.details;


(function () {
  'use strict';

  angular
    .module('mainApp.modules.complaints')
    .controller('TaskComplaintController', TaskComplaintController)
    .factory('TaskComplaintService', TaskComplaintService);

  TaskComplaintController.$inject = ['$scope', '$rootScope', 'AuthenticationService', 'logger', 'exception', 'TaskComplaintService','ArtisanUserService'];

  function TaskComplaintController($scope, $rootScope, AuthenticationService, logger, exception, TaskComplaintService,ArtisanUserService) {

    $scope.initController = function () {};

    //table related var
    $scope.tableState = null;
    $scope.isLoading = false;
    $scope.pageSize = 10;
    $scope.loadFailed = false;
    $scope.colspan = 10;

    //search related var
    $scope.searchTerm = null;
    $scope.isEmptyRecord = false;

    $scope.tasks = {};
    $scope.taskInfo = {};
    $scope.status_action = '';
    $scope.task = {};
    $scope.noTasks = true;
    $scope.taskMoreDetails = {};

    $scope.currentStatus = {};

    $scope.showStatusOptions = false;
    $scope.showArtisanConfig = false;

    $scope.showCreateForm = false;

    $scope.maintainableType = {};

    $scope.createTaskInfo = {};

    $scope.showViewModal = false;

     $scope.TASK_STATUS = {
      LOGGED_SUCCESS: "logged successfully",
      RECEIVED_BY_MANAGER: "Received by Manager",
      ASSIGNED_TO_ARTISAN: "Assigned to Artisan",
      RECEIVED_BY_ARTISAN: "Received by Artisan",
      TASK_IN_PROGRESS: "work in progress",
      TASK_COMPLETE_PENDING_REVIEW: "work complete, pending review",
      COMPLETED: "work complete",
      CLOSED: "closed"
    };


    $scope.maintainableTypes = appDetails.MAINTENABLES_TYPE;

    $scope.artisans = [];
    $scope.noArtisans = false;
    $scope.artisanInfo = {};
    $scope.artisan ={};

    $scope.taskTypes = ['SIMPLE', 'PERIODIC'];

    $scope.isBuilding = false;
    $scope.isFloor = false;
    $scope.isRoom = false;
    $scope.isAsset = false;

    $scope.possibleStatuses = [];

    $scope.isArtisanLoading = false;

    $scope.taskStatusTransitionConfig = [
      {name: $scope.TASK_STATUS.LOGGED_SUCCESS, canTransitionTo: [$scope.TASK_STATUS.RECEIVED_BY_MANAGER, $scope.TASK_STATUS.ASSIGNED_TO_ARTISAN, $scope.TASK_STATUS.CLOSED]},
      {name: $scope.TASK_STATUS.RECEIVED_BY_MANAGER, canTransitionTo: [$scope.TASK_STATUS.ASSIGNED_TO_ARTISAN, $scope.TASK_STATUS.CLOSED]},
      {name: $scope.TASK_STATUS.ASSIGNED_TO_ARTISAN, canTransitionTo: [$scope.TASK_STATUS.CLOSED]},
      {name: $scope.TASK_STATUS.RECEIVED_BY_ARTISAN, canTransitionTo: [$scope.TASK_STATUS.CLOSED]},
      {name: $scope.TASK_STATUS.TASK_IN_PROGRESS, canTransitionTo: [$scope.TASK_STATUS.CLOSED]},
      {name: $scope.TASK_STATUS.TASK_COMPLETE_PENDING_REVIEW, canTransitionTo: [$scope.TASK_STATUS.CLOSED, $scope.TASK_STATUS.COMPLETED]},
      {name: $scope.TASK_STATUS.COMPLETED, canTransitionTo: []},
      {name: $scope.TASK_STATUS.CLOSED, canTransitionTo: []}
    ];

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
      $scope.loadTasks(start, number);
    };

    $scope.doCheck = function (tasks, noTasks, start, number) {
      if (tasks.totalCount === 0) {
        noTasks = true;
      } else {
        //if there are tasks
        noTasks = false;
        $scope.tableState.pagination.numberOfPages = tasks.pageCount;
        tasks = normalizeData(tasks.data, start, number);
      }
      return {
        tasks,
        noTasks
      }
    };

    $scope.loadTasks = function (start, number) {
      $scope.isLoading = true;
      TaskComplaintService.getTasks(start, number)
        .then(function (result) {
          $scope.taskInfo = exception.handleGetRequestResponse(result, $scope.tasks);
          $scope.isLoading = false;
          if ($scope.taskInfo !== null) {
            //then no errors
            $scope.loadFailed = false;
            var tmp_info = $scope.doCheck($scope.taskInfo.data, $scope.noTasks, start, number);
            $scope.noTasks = tmp_info.noTasks;
            $scope.tasks = tmp_info.tasks;
          } else {
            $scope.loadFailed = true;
          }
          $scope.$apply();

        })
    };

    $scope.viewTaskDetails = function (item) {
      $scope.showViewModal = true;
      $scope.task = item;
    };


    function normalizeData(list_of_data, pageNumber, pageSize) {
      var data_id = (pageSize * pageNumber) - (pageSize - 1);
      angular.forEach(list_of_data, function (data) {
        data.serial_no = data_id;
        data_id++;

        if(data.firstname && data.lastname){
          data.name = data.firstname +' '+ data.lastname;
        }

        //
        if (data.assetInfo && data.assetInfo.length !== 0) {
          data.propertyInfo = data.assetInfo[0];
        } else if (data.buildingInfo && data.buildingInfo.length !== 0) {
          data.propertyInfo = data.buildingInfo[0];
        } else if (data.roomInfo && data.roomInfo.length !== 0) {
          data.propertyInfo = data.roomInfo[0];
        }
      });
      return list_of_data;
    }


    $scope.changeStatus = function(currentStatus){
      $scope.showStatusOptions = true;
      $scope.showArtisanConfig = $scope.currentStatus.value === $scope.TASK_STATUS.ASSIGNED_TO_ARTISAN;

      $scope.taskStatusTransitionConfig.forEach(function (config) {
        if(config.name === currentStatus){
          $scope.possibleStatuses = config.canTransitionTo;
        }
      });
    };

    $scope.cancelStatusUpdate = function(){
      $scope.showStatusOptions = false;
      $scope.showArtisanConfig = false;
    };

    $scope.saveStatusUpdate = function(task){

      if(!$scope.currentStatus.value){
        logger.info("There are currently no transition options for status:"+task.status);
        return;
      }

      $scope.showViewModal = false;

      if($scope.currentStatus.value === $scope.TASK_STATUS.ASSIGNED_TO_ARTISAN){
        let artisanNameValue = document.getElementById("artisanName_value").value;

        if(!artisanNameValue){
          logger.error("Artisan name is required");
          return;
        }

        let artisanId = null;

        $scope.artisans.forEach(function (artisan) {
          if(artisan.name === artisanNameValue) artisanId = artisan._id;
        });

        let body = {artisanId, facilityManagerId: $rootScope.globals.curentUser.id};

        TaskComplaintService.assignTaskToArtisan(task._id,body)
          .then(function (result) {
            if(exception.catcher(result)){
              $scope.doPaginate($scope.tableState);
            }
          })

      }else{
        let body = {oldStatus: task.status, newStatus: $scope.currentStatus.value};
        TaskComplaintService.updateTaskStatus(task._id,body)
          .then(function (result) {
            if(exception.catcher(result)){
              $scope.doPaginate($scope.tableState);
            }
          })

      }
      $scope.showStatusOptions = false;
    };

    $scope.checkValueOfCurrentStatus = function () {
      $scope.showArtisanConfig = $scope.currentStatus.value === $scope.TASK_STATUS.ASSIGNED_TO_ARTISAN;

      if ($scope.currentStatus.value === $scope.TASK_STATUS.ASSIGNED_TO_ARTISAN) {
        $scope.loadArtisans(1, 60);
      }
    };

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

    $scope.loadArtisans = function (start, number) {
      $scope.isArtisanLoading = true;
      ArtisanUserService.getArtisans(start, number)
        .then(function (result) {
          $scope.artisanInfo = exception.handleGetRequestResponse(result, $scope.artisans);
          $scope.isLoading = false;
          if ($scope.artisanInfo !== null) {
            //then no errors
            $scope.loadFailed = false;

            if ($scope.artisanInfo.data.total === 0) {
              $scope.noArtisans = true;
              logger.error("No registered Artisan found. Please onboard one.");
            } else {
              //if there are artisans
              $scope.noArtisans = false;
              $scope.tableState.pagination.numberOfPages = $scope.artisanInfo.data.pages;
              $scope.artisans = normalizeData($scope.artisanInfo.data.docs, start, number);
            }
            $scope.isArtisanLoading = false;
          } else {
            $scope.loadFailed = true;
            console.log(JSON.stringify(result));
            logger.error("Unable to fetch Artisans. Please refresh page and try again");
          }

          $scope.$apply();

        });
    };

  }


  function TaskComplaintService(requestHandler) {
    var service = {};

    service.getTasks = function (pageNum, pageSize) {
      var url = appUtil.modifyProductUrl(appEndpoints.FACILITY_MANAGER_ENDPOINTS.tasks, pageSize, pageNum, 'createdAt', 'DESC', false);

      url = url+"&taskRequestedBy="+appDetails.TASK_REQUESTED_BY.CLIENT;

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
