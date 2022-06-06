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
    .controller('OccupantComplaintsController', OccupantComplaintsController)
    .factory('OccupantComplaintService',OccupantComplaintService);

  OccupantComplaintsController.$inject = ['$scope', '$rootScope', 'logger', 'exception','PropertyService', 'OccupantComplaintService'];

  function OccupantComplaintsController($scope, $rootScope, logger, exception, PropertyService,OccupantComplaintService) {

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

    $scope.complaints = {};
    $scope.complaintInfo = {};
    $scope.status_action = '';
    $scope.complaint = {};
    $scope.noComplaints = true;

    $scope.currentStatus = {};

    $scope.showStatusOptions = false;
    $scope.showArtisanConfig = false;

    $scope.showCreateForm = false;

    $scope.maintainableType = {};

    $scope.createComplaintInfo = {};

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

    $scope.occupant = {};

    $scope.occupant.name = $rootScope.globals.curentUser.name;

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

    $scope.artisan ={};

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

    $rootScope.isOccupantView = true;

    $scope.complaintToBeClosed = {};


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
      $scope.loadComplaints(start, number);
    };

    $scope.doCheck = function (complaints, noComplaints, start, number) {
      if (complaints.totalCount === 0) {
        noComplaints = true;
      } else {
        //if there are Complaints
        noComplaints = false;
        $scope.tableState.pagination.numberOfPages = complaints.pageCount;
        complaints = normalizeData(complaints.data, start, number);
      }
      return {
        complaints,
        noComplaints
      }
    };

    $scope.loadComplaints = function (start, number) {
      $scope.isLoading = true;
      let facilityManagerId = $rootScope.globals.curentUser.onBoardedBy;
      OccupantComplaintService.getComplaints(start, number,facilityManagerId)
        .then(function (result) {
          $scope.complaintInfo = exception.handleGetRequestResponse(result, $scope.complaints);
          $scope.isLoading = false;
          if ($scope.complaintInfo !== null) {
            //then no errors
            $scope.loadFailed = false;
            var tmp_info = $scope.doCheck($scope.complaintInfo.data, $scope.noComplaints, start, number);
            $scope.noComplaints = tmp_info.noComplaints;
            $scope.complaints = tmp_info.complaints;
          } else {
            $scope.loadFailed = true;
          }
          $scope.$apply();

        })
    };

    $scope.viewComplaintDetails = function (item) {
      $scope.complaint = item;
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

    $scope.cancelStatusUpdate = function(){
      $scope.showStatusOptions = false;
      $scope.showArtisanConfig = false;
    };

    $scope.initiateCloseComplaint = function(item){
      $scope.complaintToBeClosed = item;
    };

    $scope.closeComplaint = function(){

      $scope.isLoading = true;

      let requestBody = {
        oldStatus: $scope.complaintToBeClosed.status,
        newStatus: $scope.TASK_STATUS.CLOSED,
        facilityManagerId:  $rootScope.globals.curentUser.onBoardedBy
      };

      OccupantComplaintService.updateComplaintStatus($scope.complaintToBeClosed._id, requestBody)
        .then(function (result) {
          $scope.isLoading = false;
          if(exception.catcher(result)){
            $scope.doPaginate($scope.tableState);
            $scope.complaintToBeClosed = {};
          }
          $scope.$apply()
        });
    };

    //create related functions
    $scope.selectMaintainableType = function () {
      $scope.showCreateForm = true;

      if($scope.maintainableType.value === $scope.maintainableTypes[0]){
        $scope.isBuilding = false;
        $scope.isFloor = true;
        $scope.isRoom = false;
        $scope.isAsset = false;
      }else if($scope.maintainableType.value === $scope.maintainableTypes[1]){
        $scope.isBuilding = false;
        $scope.isFloor = false;
        $scope.isRoom = true;
        $scope.isAsset = false;
      }else if($scope.maintainableType.value === $scope.maintainableTypes[2]){
        $scope.isBuilding = true;
        $scope.isFloor = false;
        $scope.isRoom = false;
        $scope.isAsset = false;
      }else{
        $scope.isBuilding = false;
        $scope.isFloor = false;
        $scope.isRoom = false;
        $scope.isAsset = true;
      }
    };

    $scope.checkIfImageIsUploaded = function(){
      if(!$rootScope.img_url){
        logger.error("Image not selected yet");
        return false;
      }
      return true;
    };

    $scope.resetFields =function(dataBody){
      //if the body is null, remind angular to update the dom :)
      if(!dataBody.name){
        $rootScope.is_img_uploaded = false;
        $rootScope.is_img_selected = false;
      }
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


    $scope.logComplaint = function(CreateComplaintForm){
      if (CreateComplaintForm.$valid) {
        if($scope.checkIfImageIsUploaded()){
          $scope.isLoading = true;

          $scope.createComplaintInfo.taskRequestedBy = "REQUESTED_BY_CLIENT";
          $scope.createComplaintInfo.maintainablesType = $scope.maintainableType.value;
          $scope.createComplaintInfo.facilityManagerId = $rootScope.globals.curentUser.onBoardedBy;
          $scope.createComplaintInfo.occupantImageUploadUrl = $rootScope.img_url;

          if ($scope.isBuilding && $scope.building._id) {
            $scope.createComplaintInfo.maintainablesId = $scope.building._id;
          } else if ($scope.isFloor && $scope.floor._id) {
            $scope.createComplaintInfo.maintainablesId = $scope.floor._id;
          } else if ($scope.isRoom && $scope.room._id) {
            $scope.createComplaintInfo.maintainablesId = $scope.room._id;
          } else if ($scope.isAsset && $scope.asset._id) {
            $scope.createComplaintInfo.maintainablesId = $scope.asset._id;
          } else {
            logger.error("Error. Unable to get property type. Pls refresh and try again.");
            return;
          }

          OccupantComplaintService.createComplaint($scope.createComplaintInfo)
            .then(function (result) {
              $scope.createComplaintInfo = exception.catcher(result);
              $scope.$apply(function () {
                //$scope.resetFields($scope.fashion_info);
                //clear all prev interaction with fields
                $scope.isLoading = false;
                $scope.showCreateForm = false;
                $scope.resetFields($scope.createComplaintInfo);
              })
            })
            .catch(err => {
              console.log(JSON.stringify(err));
              $scope.isLoading = false;
            });
        }
      }
      else {
        logger.error("Enter information for required fields");
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

    $scope.loadBuildings = function () {

      PropertyService.getBuildings($rootScope.globals.curentUser.onBoardedBy)
        .then(function (response) {
          let result = exception.handleGetRequestResponse(response, $scope.buildings);
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


    $scope.onBuildingSelectChange = function () {
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
    }

    $scope.goBackToSelectMenu = function () {
      $scope.showCreateForm = false;
      $scope.resetFields();
    }

  }

  function OccupantComplaintService(requestHandler) {
    var service = {};

    service.getComplaints = function (pageNum, pageSize, facilityManagerId) {
      var url = appUtil.modifyProductUrl(appEndpoints.OCCUPANT_ENDPOINTS.complaints, pageSize, pageNum, 'createdAt', 'DESC', false);
      url = url +"&facilityManagerId="+facilityManagerId;
      return requestHandler.get(url);
    };

    service.updateComplaintStatus = function(taskId, body){
      var url = appEndpoints.OCCUPANT_ENDPOINTS.updateComplaintStatus + '/'+taskId;
      return requestHandler.put(url, body);
    };

    service.createComplaint = function (body) {
      var url = appEndpoints.OCCUPANT_ENDPOINTS.complaints;
      return requestHandler.post(url,body);
    };

    return service;
  }

})();
