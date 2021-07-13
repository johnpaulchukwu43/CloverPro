/*
 Created by Johnpaul Chukwu @ $
*/

var appUtil = require('../../appUtil');
var appEndpoints = window.app.endpoints;
var appDetails = window.app.details;


(function () {
  'use strict';

  angular
    .module('mainApp.modules.tasks')
    .controller('ArtisanTaskController', ArtisanTaskController)
    .factory('ArtisanTaskService', ArtisanTaskService);

  ArtisanTaskController.$inject = ['$scope', '$rootScope', 'AuthenticationService', 'logger', 'exception', 'ArtisanTaskService'];

  function ArtisanTaskController($scope, $rootScope, AuthenticationService, logger, exception, ArtisanTaskService) {
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

    $rootScope.isArtisanTaskUploadView = true;
    $scope.showViewModal = false;


    $scope.maintainableTypes = appDetails.MAINTENABLES_TYPE;

     $scope.artisan ={};

    $scope.artisans = [
      {_id:"60e9e6e4bea6fdc62ed07126", name: "Johnpaul Chukwu"},
      {_id:"60e9e6e4bea6fdc62ed07126", name: "Fred Amaka"},
      {_id:"60e9e6e4bea6fdc62ed07126", name: "Cynthia Jack"}
    ];

    $scope.buildings = [
      {_id:"60e9e777bea6fdc62ed07131", name: "Headquaters"},
      {_id:"60e9e777bea6fdc62ed07131", name: "Branch 1"},
      {_id:"60e9e777bea6fdc62ed07131", name: "Branch 2"}
    ];

    $scope.floor = [
      {_id:"60e9e89cbea6fdc62ed0713a", name: "Ground floor"},
      {_id:"60e9e89cbea6fdc62ed0713a", name: "Floor 1"},
      {_id:"60e9e89cbea6fdc62ed0713a", name: "Floor 2"}
    ];

    $scope.room = [
      {_id:"60e9e99cbea6fdc62ed07143", name: "Admin Room"},
      {_id:"60e9e99cbea6fdc62ed07143", name: "Customer Room"},
      {_id:"60e9e99cbea6fdc62ed07143", name: "Emergency Room"}
    ];

    $scope.assets = [
      {_id:"60e9e9e1bea6fdc62ed07147", name: "Chair 001"},
      {_id:"60e9e9e1bea6fdc62ed07147", name: "Fan 001"},
      {_id:"60e9e9e1bea6fdc62ed07147", name: "Door 003"}
    ];

    $scope.taskTypes = ['SIMPLE', 'PERIODIC'];

    $scope.isBuilding = false;
    $scope.isFloor = false;
    $scope.isRoom = false;
    $scope.isAsset = false;

    $scope.possibleStatuses = [];

    $scope.taskStatusTransitionConfig = [
      {name: $scope.TASK_STATUS.LOGGED_SUCCESS, canTransitionTo: []},
      {name: $scope.TASK_STATUS.RECEIVED_BY_MANAGER, canTransitionTo: []},
      {name: $scope.TASK_STATUS.ASSIGNED_TO_ARTISAN, canTransitionTo: [$scope.TASK_STATUS.RECEIVED_BY_ARTISAN, $scope.TASK_STATUS.TASK_IN_PROGRESS]},
      {name: $scope.TASK_STATUS.RECEIVED_BY_ARTISAN, canTransitionTo: [$scope.TASK_STATUS.TASK_IN_PROGRESS ]},
      {name: $scope.TASK_STATUS.TASK_IN_PROGRESS, canTransitionTo: [$scope.TASK_STATUS.TASK_COMPLETE_PENDING_REVIEW]},
      {name: $scope.TASK_STATUS.TASK_COMPLETE_PENDING_REVIEW, canTransitionTo: []},
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
      let facilityManagerId = $rootScope.globals.curentUser.onBoardedBy;
      ArtisanTaskService.getTasks(start, number, facilityManagerId)
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


    $scope.changeStatus = function(currentStatus){
      $scope.showStatusOptions = true;
      $scope.showArtisanConfig = $scope.currentStatus.value === $scope.TASK_STATUS.TASK_COMPLETE_PENDING_REVIEW;

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

      let body = {oldStatus: task.status, newStatus: $scope.currentStatus.value, facilityManagerId:$rootScope.globals.curentUser.onBoardedBy};

      if($scope.currentStatus.value === $scope.TASK_STATUS.TASK_COMPLETE_PENDING_REVIEW) {

        if (!$scope.isImageUploaded()) {
          logger.error("No image evidence provided. Please upload image.");
        }else{
          body.artisanImageUploadUrl = $rootScope.img_url;

          ArtisanTaskService.updateTaskStatus(task._id,body)
            .then(function (result) {
              if(exception.catcher(result)){
                $scope.doPaginate($scope.tableState);
              }
            });
        }

      }else{
        ArtisanTaskService.updateTaskStatus(task._id,body)
          .then(function (result) {
            if(exception.catcher(result)){
              $scope.doPaginate($scope.tableState);
            }
          });

      }

      $scope.showStatusOptions = false;
    };

    $scope.checkValueOfCurrentStatus = function () {
      $scope.showArtisanConfig = $scope.currentStatus.value === $scope.TASK_STATUS.TASK_COMPLETE_PENDING_REVIEW;
    };

    $scope.isImageUploaded = function(){
      if(!$rootScope.img_url){
        return false;
      }
      return true;
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

  }


  function ArtisanTaskService(requestHandler) {
    var service = {};

    service.getTasks = function (pageNum, pageSize, facilityManagerId) {
      var url = appUtil.modifyProductUrl(appEndpoints.ARTISAN_ENDPOINTS.tasks, pageSize, pageNum, 'createdAt', 'DESC', false);
      url = url +"&facilityManagerId="+facilityManagerId;
      return requestHandler.get(url);

    };

    service.updateTaskStatus = function(taskId, body){
      var url = appEndpoints.ARTISAN_ENDPOINTS.updateTaskStatus + '/'+taskId;
      return requestHandler.put(url, body);
    };


    return service;
  }

})();
