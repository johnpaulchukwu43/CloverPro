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
    .controller('TaskController', TaskController)
    .factory('TaskService', TaskService);

  TaskController.$inject = ['$scope', '$rootScope', 'AuthenticationService', 'logger', 'exception', 'TaskService', 'PropertyService', 'ArtisanUserService'];

  function TaskController($scope, $rootScope, AuthenticationService, logger, exception, TaskService, PropertyService, ArtisanUserService) {

    $scope.initController = function () {
      $scope.loadBuildings();
    };

    //table related var
    $scope.tableState = null;
    $scope.isLoading = false;
    $scope.pageSize = 10;
    $scope.loadFailed = false;
    $scope.colspan = 10;

    //search related var
    $scope.searchTerm = null;
    $scope.isEmptyRecord = false;

    $scope.artisans = [];
    $scope.noArtisans = false;
    $scope.artisanInfo = {};

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

    $scope.buildings = [];
    $scope.artisans = [];
    $scope.floors = [];
    $scope.rooms = [];
    $scope.assets = [];

    $scope.building = {};
    $scope.floor = {};
    $scope.room = {};
    $scope.asset = {};

    $scope.areBuildingsReady = false;
    $scope.areRoomsReady = false;
    $scope.areFloorsReady = false;
    $scope.areAssetsReady = false;

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

    $scope.artisan = {};

    $scope.taskTypes = ['SIMPLE', 'PERIODIC'];

    $scope.isBuilding = false;
    $scope.isFloor = false;
    $scope.isRoom = false;
    $scope.isAsset = false;


    $scope.isBuildingLoading = false;
    $scope.isFloorLoading = false;
    $scope.isRoomLoading = false;
    $scope.isAssetLoading = false;

    $scope.possibleStatuses = [];

    $scope.isArtisanLoading = false;

    $scope.taskStatusTransitionConfig = [
      {
        name: $scope.TASK_STATUS.LOGGED_SUCCESS,
        canTransitionTo: [$scope.TASK_STATUS.RECEIVED_BY_MANAGER, $scope.TASK_STATUS.ASSIGNED_TO_ARTISAN, $scope.TASK_STATUS.CLOSED]
      },
      {
        name: $scope.TASK_STATUS.RECEIVED_BY_MANAGER,
        canTransitionTo: [$scope.TASK_STATUS.ASSIGNED_TO_ARTISAN, $scope.TASK_STATUS.CLOSED]
      },
      {name: $scope.TASK_STATUS.ASSIGNED_TO_ARTISAN, canTransitionTo: [$scope.TASK_STATUS.CLOSED]},
      {name: $scope.TASK_STATUS.RECEIVED_BY_ARTISAN, canTransitionTo: [$scope.TASK_STATUS.CLOSED]},
      {name: $scope.TASK_STATUS.TASK_IN_PROGRESS, canTransitionTo: [$scope.TASK_STATUS.CLOSED]},
      {
        name: $scope.TASK_STATUS.TASK_COMPLETE_PENDING_REVIEW,
        canTransitionTo: [$scope.TASK_STATUS.CLOSED, $scope.TASK_STATUS.COMPLETED]
      },
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
      TaskService.getTasks(start, number)
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

    //change status
    $scope.changeStatus = function (currentStatus) {
      $scope.showStatusOptions = true;
      $scope.showArtisanConfig = $scope.currentStatus.value === $scope.TASK_STATUS.ASSIGNED_TO_ARTISAN;

      $scope.taskStatusTransitionConfig.forEach(function (config) {
        if (config.name === currentStatus) {
          $scope.possibleStatuses = config.canTransitionTo;
        }
      });
    };

    $scope.cancelStatusUpdate = function () {
      $scope.showStatusOptions = false;
      $scope.showArtisanConfig = false;
    };

    $scope.saveStatusUpdate = function (task) {

      if ($scope.currentStatus.value === $scope.TASK_STATUS.ASSIGNED_TO_ARTISAN) {
        let artisanNameValue = document.getElementById("artisanName_value").value;

        console.log("HERE:" + artisanNameValue);

        if (!artisanNameValue) {
          logger.error("Artisan name is required");
          return;
        }

        let artisanId = null;

        $scope.artisans.forEach(function (artisan) {
          if (artisan.name === artisanNameValue) artisanId = artisan._id;
        });

        let body = {artisanId, facilityManagerId: $rootScope.globals.curentUser.id};

        TaskService.assignTaskToArtisan(task._id, body)
          .then(function (result) {
            if (exception.catcher(result)) {
              $scope.doPaginate($scope.tableState);
            }
          })

      } else {
        let body = {oldStatus: task.status, newStatus: $scope.currentStatus.value};
        TaskService.updateTaskStatus(task._id, body)
          .then(function (result) {
            if (exception.catcher(result)) {
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

    $scope.loadArtisans = function (start, number) {
      $scope.isArtisanLoading = true;
      ArtisanUserService.getArtisans(start, number)
        .then(function (result) {
          $scope.artisanInfo = exception.handleGetRequestResponse(result, $scope.artisans);
          $scope.isLoading = false;
          if ($scope.artisanInfo !== null) {
            //then no errors
            $scope.loadFailed = false;
            var tmp_info = $scope.doCheck($scope.artisanInfo, $scope.noArtisans, start, number);
            $scope.noArtisans = tmp_info.noTasks;
            $scope.artisans = tmp_info.tasks;
            $scope.isArtisanLoading = false;
          } else {
            $scope.loadFailed = true;
            console.log(JSON.stringify(result));
            logger.error("Unable to fetch Artisans. Please refresh page and try again");
          }

          $scope.$apply();

        });
    };

    //create

    $scope.selectMaintainableType = function () {
      $scope.showCreateForm = true;

      if ($scope.maintainableType.value === $scope.maintainableTypes[0]) {
        $scope.isBuilding = false;
        $scope.isFloor = true;
        $scope.isRoom = false;
        $scope.isAsset = false;
      } else if ($scope.maintainableType.value === $scope.maintainableTypes[1]) {
        $scope.isBuilding = false;
        $scope.isFloor = false;
        $scope.isRoom = true;
        $scope.isAsset = false;
      } else if ($scope.maintainableType.value === $scope.maintainableTypes[2]) {
        $scope.isBuilding = true;
        $scope.isFloor = false;
        $scope.isRoom = false;
        $scope.isAsset = false;
      } else {
        $scope.isBuilding = false;
        $scope.isFloor = false;
        $scope.isRoom = false;
        $scope.isAsset = true;
      }
    };

    $scope.createTask = function (CreateTaskForm) {
      if (CreateTaskForm.$valid) {
        $scope.isLoading = true;

        $scope.createTaskInfo.taskRequestedBy = "REQUESTED_BY_MANAGER";
        $scope.createTaskInfo.maintainablesType = $scope.maintainableType.value;

        if ($scope.isBuilding && $scope.building._id) {
          $scope.createTaskInfo.maintainablesId = $scope.building._id;
        } else if ($scope.isFloor && $scope.floor._id) {
          $scope.createTaskInfo.maintainablesId = $scope.floor._id;
        } else if ($scope.isRoom && $scope.room._id) {
          $scope.createTaskInfo.maintainablesId = $scope.room._id;
        } else if ($scope.isAsset && $scope.asset._id) {
          $scope.createTaskInfo.maintainablesId = $scope.asset._id;
        } else {
          logger.error("Error. Unable to get property type. Pls refresh and try again.")
          return;
        }

        TaskService.createTask($scope.createTaskInfo)
          .then(function (result) {
            $scope.createTaskInfo = exception.catcher(result);
            $scope.$apply(function () {
              //$scope.resetFields($scope.fashion_info);
              //clear all prev interaction with fields
              $scope.isLoading = false;
              $scope.showCreateForm = false;
              $scope.resetFields();
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
    };

    $scope.resetFields = function () {
      $scope.isBuilding = false;
      $scope.isFloor = false;
      $scope.isRoom = false;
      $scope.isAsset = false;


      $scope.isBuildingLoading = false;
      $scope.isFloorLoading = false;
      $scope.isRoomLoading = false;
      $scope.isAssetLoading = false;

      $scope.buildings = [];
      $scope.floors = [];
      $scope.rooms = [];
      $scope.assets = [];

      $scope.building = {};
      $scope.floor = {};
      $scope.room = {};
      $scope.asset = {};

      $scope.areRoomsReady = false;
      $scope.areFloorsReady = false;
      $scope.areAssetsReady = false;
    };

    $scope.match_status_code = function (status) {

      console.log("got called for found !!"+status);
      switch (status) {
        case appDetails.TASK_STATUS.LOGGED_SUCCESS:
          return {"style": {"background-color": "#b2b7af", "color": "#fff"}};
        case appDetails.TASK_STATUS.RECEIVED_BY_MANAGER:
          return {"style": {"background-color": "#7d3f00", "color": "#fff"}};
        case appDetails.TASK_STATUS.ASSIGNED_TO_ARTISAN:
          console.log("color found !!");
          return {"style": {"background-color": "#9b5002", "color": "#fff"}};
        case appDetails.TASK_STATUS.RECEIVED_BY_ARTISAN:
          return {"style": {"background-color": "#9b5002", "color": "#fff"}};
        case appDetails.TASK_STATUS.TASK_IN_PROGRESS:
          return {"style": {"background-color": "#d5c901", "color": "#fff"}};
        case appDetails.TASK_STATUS.TASK_COMPLETE_PENDING_REVIEW:
          return {"style": {"background-color": "#0e478d", "color": "#fff"}};
        case appDetails.TASK_STATUS.COMPLETED:
          return {"style": {"background-color": "#2ab368", "color": "#fff"}};
        case appDetails.TASK_STATUS.CLOSED:
          return {"style": {"background-color": "#e74c3c", "color": "#fff"}};
      }
    };

    $scope.loadBuildings = function () {
      PropertyService.getBuildings($rootScope.globals.curentUser.id)
        .then(function (response) {
          let result = exception.handleGetRequestResponse(response, $scope.buildings);

          console.log(JSON.stringify(result));
          if (result == null) {
            $scope.loadFailed = true;
          } else {
            $scope.buildings = result.data;
            $scope.noBuildings = $scope.buildings.length === 0
          }
          $scope.areBuildingsReady = true;
          $scope.$apply();
        })
    };

    $scope.loadFloors = function () {
      $scope.isLoading = true;
      PropertyService.getFloors($scope.building._id)
        .then(function (response) {
          let result = exception.handleGetRequestResponse(response, $scope.floors);
          if (result == null) {
            $scope.loadFailed = true;
          } else {
            $scope.floors = result.data;
            $scope.noFloors = $scope.floors.length === 0
          }
          $scope.isLoading = false;
          $scope.$apply();
        })
    };

    $scope.loadRooms = function () {
      $scope.isLoading = true;
      PropertyService.getRooms($scope.floor._id)
        .then(function (response) {
          let result = exception.handleGetRequestResponse(response, $scope.rooms);
          if (result == null) {
            $scope.loadFailed = true;
          } else {
            $scope.rooms = result.data;
            $scope.noRooms = $scope.rooms.length === 0
          }
          $scope.isLoading = false;
          $scope.$apply();
        })
    };

    $scope.loadAssets = function () {
      $scope.isLoading = true;
      PropertyService.getAssets($scope.room._id)
        .then(function (response) {
          let result = exception.handleGetRequestResponse(response, $scope.assets);
          if (result == null) {
            $scope.loadFailed = true;
          } else {
            $scope.assets = result.data;
            $scope.noAssets = $scope.assets.length === 0
          }
          $scope.isLoading = false;
          $scope.$apply();
        })
    };

    $scope.togglePropertyLoadingProgress = function (isBuildingLoading, isFloorLoading, isRoomLoading, isAssetLoading) {
      $scope.isBuildingLoading = isBuildingLoading;
      $scope.isFloorLoading = isFloorLoading;
      $scope.isRoomLoading = isRoomLoading;
      $scope.isAssetLoading = isAssetLoading;
    };


    $scope.onBuildingSelectChange = function (CreateTaskForm) {
      $scope.buidlingInputField = CreateTaskForm.building;
      if (!$scope.isBuilding) {
        $scope.togglePropertyLoadingProgress(false, true, true, true);

        $scope.floor = {};
        $scope.floors = [];

        $scope.room = {};
        $scope.rooms = [];

        $scope.asset = {};
        $scope.assets = [];

        console.log(`fetching floor for ${$scope.building._id}`);

        PropertyService.getFloors($scope.building._id)
          .then(function (response) {
            let result = exception.handleGetRequestResponse(response, $scope.floors);
            if (result == null) {
              $scope.loadFailed = true;
            } else {
              $scope.floors = result.data;
              $scope.noFloors = $scope.floors.length === 0
            }

            $scope.areFloorsReady = true;
            $scope.togglePropertyLoadingProgress(false, false, false, false);
            $scope.$apply();
          })
      }
    };

    $scope.onFloorSelectChange = function () {

      if (!$scope.isFloor) {
        $scope.togglePropertyLoadingProgress(false, false, true, true);

        $scope.room = {};
        $scope.rooms = [];

        $scope.asset = {};
        $scope.assets = [];

        console.log(`fetching room for ${$scope.floor._id}`);

        PropertyService.getRooms($scope.floor._id)
          .then(function (response) {
            let result = exception.handleGetRequestResponse(response, $scope.rooms);
            if (result == null) {
              $scope.loadFailed = true;
            } else {
              $scope.rooms = result.data;
              $scope.noRooms = $scope.rooms.length === 0
            }
            $scope.areRoomsReady = true;
            $scope.togglePropertyLoadingProgress(false, false, false, false);
            $scope.$apply();
          })
      }
    };

    $scope.onRoomSelectChange = function () {

      if (!$scope.isRoom) {

        $scope.togglePropertyLoadingProgress(false, false, false, true);

        $scope.asset = {};
        $scope.assets = [];

        console.log(`fetching assets for ${$scope.room._id}`);

        PropertyService.getAssets($scope.room._id)
          .then(function (response) {
            let result = exception.handleGetRequestResponse(response, $scope.assets);
            if (result == null) {
              $scope.loadFailed = true;
            } else {
              $scope.assets = result.data;
              $scope.noAssets = $scope.assets.length === 0
            }
            $scope.togglePropertyLoadingProgress(false, false, false, false);
            $scope.$apply();
          })
      }
    };

    $scope.goBackToSelectMenu = function () {
      $scope.showCreateForm = false;
      $scope.resetFields();
    }

  }

  function TaskService(requestHandler) {
    var service = {};

    service.getTasks = function (pageNum, pageSize) {

      var url = appUtil.modifyProductUrl(appEndpoints.FACILITY_MANAGER_ENDPOINTS.tasks, pageSize, pageNum, 'createdAt', 'DESC', false);

      url = url + "&taskRequestedBy=" + appDetails.TASK_REQUESTED_BY.MANAGER;

      return requestHandler.get(url);
    };

    service.updateTaskStatus = function (taskId, body) {
      var url = appEndpoints.FACILITY_MANAGER_ENDPOINTS.updateTaskStatus + '/' + taskId;
      return requestHandler.put(url, body);
    };

    service.assignTaskToArtisan = function (taskId, body) {
      var url = appEndpoints.FACILITY_MANAGER_ENDPOINTS.assignTaskToArtisan + '/' + taskId;
      return requestHandler.put(url, body);
    };

    service.createTask = function (body) {
      var url = appEndpoints.FACILITY_MANAGER_ENDPOINTS.tasks;
      return requestHandler.post(url, body);
    };

    return service;
  }

})();
