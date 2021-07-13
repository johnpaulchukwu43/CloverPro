/*
 Created by Johnpaul Chukwu @ $
*/

var appUtil = require('../appUtil');
var appEndpoints = window.app.endpoints;
var appDetails = window.app.details;

(function () {
  'use strict';

  angular
    .module('mainApp.modules.properties')
    .controller('PropertyController', PropertyController)
    .factory('PropertyService', PropertyService);

  PropertyController.$inject = ['$scope', '$rootScope', 'AuthenticationService', 'logger', 'exception', 'PropertyService'];

  function PropertyController($scope,$rootScope,AuthenticationService, logger,exception,PropertyService) {

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

    $scope.isBuildingView = true;
    $scope.isFloorView = false;
    $scope.isRoomView = false;
    $scope.isAssetView = false;

    //buildings
    $scope.buildings = {};
    $scope.building = {};
    $scope.noBuildings = false;

    //floors
    $scope.floors = {};
    $scope.floor = {};
    $scope.noFloors = false;

    //rooms
    $scope.rooms = {};
    $scope.room = {};
    $scope.noRooms = false;

    //rooms
    $scope.assets = {};
    $scope.asset = {};
    $scope.noAssets = false;

    $scope.titleOfView = appDetails.MAINTENABLES_TYPE[2];

    $scope.maintainableStatus = appDetails.MAINTAINABLE_STATUS;

    $scope.currentPropertyType = {};

    $scope.propertyInfo = {};

    $scope.assetPropertyType = appDetails.MAINTENABLES_TYPE[3];
    $scope.assetCategories = appDetails.ASSET_CATEGORY;


    $scope.switchViews = function(isBuilding,isFloor,isRoom,isAsset){
      $scope.isBuildingView = isBuilding;
      $scope.isFloorView = isFloor;
      $scope.isRoomView = isRoom;
      $scope.isAssetView = isAsset;

      if($scope.isBuildingView) $scope.titleOfView = appDetails.MAINTENABLES_TYPE[2];
      if($scope.isFloorView) $scope.titleOfView = appDetails.MAINTENABLES_TYPE[0];
      if($scope.isRoomView) $scope.titleOfView = appDetails.MAINTENABLES_TYPE[1];
      if($scope.isAssetView) $scope.titleOfView = appDetails.MAINTENABLES_TYPE[3];
    };

    $scope.goToBuildings = function(){
      $scope.switchViews(true,false,false,false);
    };

    $scope.loadBuildings = function(){

      $scope.isLoading = true;

      PropertyService.getBuildings($rootScope.globals.curentUser.id)
        .then(function (response) {
          let result = exception.handleGetRequestResponse(response, $scope.buildings);
          if(result == null) {
            $scope.loadFailed = true;
          }else{
            $scope.buildings = result.data;
            $scope.noBuildings = $scope.buildings.length === 0
          }
          $scope.isLoading = false;
          $scope.$apply();
        })
    };

    $scope.viewFloors = function (building) {
      $scope.building = building;
      $scope.switchViews(false,true,false,false);
    };

    $scope.goToFloors = function(){
      $scope.switchViews(false,true,false,false);
    };

    $scope.loadFloors = function () {
      $scope.isLoading = true;
      PropertyService.getFloors($scope.building._id)
        .then(function (response) {
           let result = exception.handleGetRequestResponse(response, $scope.floors);
           if(result == null) {
             $scope.loadFailed = true;
           }else{
             $scope.floors = result.data;
             $scope.noFloors = $scope.floors.length === 0
           }
          $scope.isLoading = false;
          $scope.$apply();
        })
    };


    $scope.viewRooms = function (floor) {
      $scope.floor = floor;
      $scope.switchViews(false,false,true,false);
    };


    $scope.goToRooms = function(){
      $scope.switchViews(false,false,true,false);
    };

    $scope.loadRooms = function () {
      $scope.isLoading = true;
      PropertyService.getRooms($scope.floor._id)
        .then(function (response) {
          let result = exception.handleGetRequestResponse(response, $scope.rooms);
          if(result == null) {
            $scope.loadFailed = true;
          }else{
            $scope.rooms = result.data;
            $scope.noRooms = $scope.rooms.length === 0
          }
          $scope.isLoading = false;
          $scope.$apply();
        })
    };


    $scope.viewAssets = function (room) {
      $scope.room = room;
      $scope.switchViews(false,false,false,true);
    };

    $scope.loadAssets = function () {
      $scope.isLoading = true;
      PropertyService.getAssets($scope.room._id)
        .then(function (response) {
          let result = exception.handleGetRequestResponse(response, $scope.assets);
          if(result == null) {
            $scope.loadFailed = true;
          }else{
            $scope.assets = result.data;
            $scope.noAssets = $scope.assets.length === 0
          }
          $scope.isLoading = false;
          $scope.$apply();
        })
    };

    //create property

   $scope.addToBuilding =function () {
     $scope.showCreateForm = true;
     $scope.currentPropertyType =  appDetails.MAINTENABLES_TYPE[2];
   };

    $scope.addToFloor =function () {
      $scope.showCreateForm = true;
      $scope.currentPropertyType =  appDetails.MAINTENABLES_TYPE[0];
    };

    $scope.addToRoom =function () {
      $scope.showCreateForm = true;
      $scope.currentPropertyType =  appDetails.MAINTENABLES_TYPE[1];
    };

    $scope.addToAsset =function () {
      $scope.showCreateForm = true;
      $scope.currentPropertyType =  appDetails.MAINTENABLES_TYPE[3];

    };

   $scope.createProperty = function (CreatePropertyForm) {
     if(CreatePropertyForm.$valid){
       $scope.isLoading = true;

       switch ($scope.currentPropertyType) {
         case appDetails.MAINTENABLES_TYPE[2]:
           //building
           $scope.createBuilding();
           break;
         case appDetails.MAINTENABLES_TYPE[0]:
           $scope.createFloor();
           break;
         case appDetails.MAINTENABLES_TYPE[1]:
           $scope.createRoom();
           break;
         case appDetails.MAINTENABLES_TYPE[3]:
           $scope.createAsset();
           break;

         default:
           logger.error(`Error. Unable to create property. Pls reload page and retry.`)
           break;
       }
     }else {
       logger.error("Enter information for required fields");
     }

   };

    $scope.createBuilding = function () {
      PropertyService.createBuilding($scope.propertyInfo)
        .then(function (result) {
          $scope.propertyInfo = exception.catcher(result,$scope.propertyInfo);
          $scope.$apply(function () {
            //clear all prev interaction with fields
            $scope.isLoading = false;
            $scope.showCreateForm = false;
          });
          $scope.loadBuildings();
        });
    };

    $scope.createFloor = function () {
      $scope.propertyInfo.buildingId = $scope.building._id;
      PropertyService.createFloor($scope.propertyInfo)
        .then(function (result) {
          $scope.propertyInfo = exception.catcher(result,$scope.propertyInfo);
          $scope.$apply(function () {
            //clear all prev interaction with fields
            $scope.isLoading = false;
            $scope.showCreateForm = false;
          });
          $scope.loadFloors();
        });
    };

    $scope.createRoom = function () {
      $scope.propertyInfo.floorId = $scope.floor._id;
      PropertyService.createRoom($scope.propertyInfo)
        .then(function (result) {
          $scope.propertyInfo = exception.catcher(result,$scope.propertyInfo);
          $scope.$apply(function () {
            //clear all prev interaction with fields
            $scope.isLoading = false;
            $scope.showCreateForm = false;
          });
          $scope.loadRooms();
        });
    };

    $scope.createAsset = function () {
      $scope.propertyInfo.roomId = $scope.room._id;
      PropertyService.createAsset($scope.propertyInfo)
        .then(function (result) {
          $scope.propertyInfo = exception.catcher(result,$scope.propertyInfo);
          $scope.$apply(function () {
            //clear all prev interaction with fields
            $scope.isLoading = false;
            $scope.showCreateForm = false;
          });
          $scope.loadAssets();
        });
    };

    $scope.match_status_code = function (code) {
      switch (code) {
        case 'ACTIVE':
          return {
            "style": {
              "background-color": "#2ecc71",

            }
          };
        case 'INACTIVE':
          return {
            "style": {
              "background-color": "#e74c3c",

            }
          };

      }
    };
  }


  function PropertyService(requestHandler) {
    var service = {};

    service.getBuildings = function (facilityManagerId) {
      let url = appEndpoints.FACILITY_MANAGER_ENDPOINTS.buildings+"?facilityManagerId="+facilityManagerId;

      return requestHandler.get(url);
    };

    service.getFloors = function (buildingId) {
      let url = appEndpoints.FACILITY_MANAGER_ENDPOINTS.floors+"?buildingId="+buildingId;
      return requestHandler.get(url);
    };

    service.getRooms = function (floorId) {
      let url = appEndpoints.FACILITY_MANAGER_ENDPOINTS.rooms+"?floorId="+floorId;
      return requestHandler.get(url);
    };

    service.getAssets = function (roomId) {
      let url = appEndpoints.FACILITY_MANAGER_ENDPOINTS.assets+"?roomId="+roomId;
      return requestHandler.get(url);
    };





    service.createBuilding = function(body){
      var url = appEndpoints.FACILITY_MANAGER_ENDPOINTS.buildings;
      return requestHandler.post(url, body);
    };

    service.createFloor = function(body){
      var url = appEndpoints.FACILITY_MANAGER_ENDPOINTS.floors;
      return requestHandler.post(url, body);
    };

    service.createRoom = function(body){
      var url = appEndpoints.FACILITY_MANAGER_ENDPOINTS.rooms;
      return requestHandler.post(url, body);
    };

    service.createAsset = function(body){
      var url = appEndpoints.FACILITY_MANAGER_ENDPOINTS.assets;
      return requestHandler.post(url, body);
    };

    service.assignTaskToArtisan = function(taskId, body){
      var url = appEndpoints.FACILITY_MANAGER_ENDPOINTS.assignTaskToArtisan + '/'+taskId;
      return requestHandler.put(url, body);
    };

    return service;
  }


})();
