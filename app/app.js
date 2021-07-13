(function () {
  'use strict';

  var appInfo = window.app.details;

  console.log("window appinfo guy here: " + JSON.stringify(window.app.details));

// Declare app level module which depends on views, and core components
  angular.module('mainApp', [
    'ui.router',
    'ngRoute',
    'ngStorage',
    'ngCookies',
    'angular-jwt',
    'mainApp.modules',
    'mainApp.commons',
    'mainApp.core'
  ]).config(config)
    .run(run);
  //config
  config.$inject = ['$routeProvider', '$locationProvider'];

  function config($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix('!');

    $routeProvider
    //manager urls
      .when('/', {
        templateUrl: 'modules/home/home-index.html',
        controller: 'HomeController',
        controllerAs: 'vm',
        title: 'Dashboard'
      })
      .when('/manager/sign-up', {
        templateUrl: 'modules/admin/signup/index.html',
        controller: 'AdminSignUpController',
        title: 'Sign Up'
      })
      .when('/manager/user-management/invitations', {
        templateUrl: 'modules/user-management/invitations/index.html',
        controller: 'UserManagementInvitationsController',
        controllerAs: 'vm',
        title: 'User Invitations'
      })
      .when('/manager/user-management/artisans', {
        templateUrl: 'modules/user-management/artisans/manage.html',
        controller: 'ArtisanUserController',
        controllerAs: 'vm',
        title: 'Artisan Management'
      })
      .when('/manager/user-management/occupants', {
        templateUrl: 'modules/user-management/occupants/manage.html',
        controller: 'OccupantUserController',
        controllerAs: 'vm',
        title: 'Occupant Management'
      })
      .when('/manager/tasks/manage', {
        templateUrl: 'modules/tasks/facility-manager/manage.html',
        controller: 'TaskController',
        controllerAs: 'vm',
        title: 'Manage Tasks'
      })
      .when('/manager/tasks/create', {
        templateUrl: 'modules/tasks/facility-manager/create.html',
        controller: 'TaskController',
        controllerAs: 'vm',
        title: 'Create Tasks'
      })
      .when('/manager/complaints/manage', {
        templateUrl: 'modules/complaints/facility-manager/view.html',
        controller: 'TaskComplaintController',
        controllerAs: 'vm',
        title: 'Manage Complaints'
      })
      .when('/manager/properties/buildings/manage', {
        templateUrl: 'modules/properties/building-index.html',
        controller: 'PropertyController',
        controllerAs: 'vm',
        title: 'Manage Buildings'
      })
      //occupants
      .when('/occupant/complaints/create', {
        templateUrl: 'modules/complaints/occupants/create.html',
        controller: 'OccupantComplaintsController',
        controllerAs: 'vm',
        title: 'Occupant Complaints'
      })
      .when('/occupant/complaints/view', {
        templateUrl: 'modules/complaints/occupants/view.html',
        controller: 'OccupantComplaintsController',
        controllerAs: 'vm',
        title: 'View Complaints'
      })
      //artisans
      .when('/artisan/tasks/manage', {
        templateUrl: 'modules/tasks/artisan/manage.html',
        controller: 'ArtisanTaskController',
        controllerAs: 'vm',
        title: 'Artisan Dashboard'
      })
      //auth
      .when('/user/sign-up', {
        templateUrl: 'modules/user/signup/index.html',
        controller: 'UserSignUpController',
        title: 'UserSignUp'
      })
      .when('/login', {
        templateUrl: 'modules/login/index.html',
        controller: 'LoginController',
        title: 'Login'
      })
      .otherwise({redirectTo: '/login'});


  }

  run.$inject = ['$rootScope', '$cookies', '$http', '$location', 'AuthenticationService'];

  function run($rootScope, $cookies, $http, $location, AuthenticationService) {
    // keep user logged in after page refresh
    $rootScope.globals = $cookies.getObject('globals') || {};
    if ($rootScope.globals.currentUser) {
      $http.defaults.headers.common['Authorization'] = 'Bearer ' + $rootScope.globals.currentUser.token;
    }


    // redirect to login page if not logged in and trying to access a restricted page
    console.log($location.path());
    $rootScope.$on('$locationChangeStart', function (event, next, current) {
      /* redirect to login page if not logged in and trying to access a restricted page
          and if already logged in head to home page
      */
      if($location.path() === '/login' || $location.path() === '/manager/sign-up' || $location.path() === '/user/sign-up'){
           if(AuthenticationService.isLoggedIn()){
               $location.path('/');
           }else{
               return;
           }
       }else{
           var loggedIn = $cookies.getObject('globals');
           if (!loggedIn) {
               $location.path('/login');
           }
       }

    //   if ($location.path() === '/login' && AuthenticationService.isLoggedIn()) {
    //     console.log("here1");
    //     $location.path('/');
    //   }
    //   else if ((!AuthenticationService.isLoggedIn()) && $location.path() !== '/login' && $location.path() !== '/manager/sign-up' && $location.path() !== '/user/sign-up') {
    //     $location.path('/login');
    //     console.log("HERE 2");
    //   }else if((!AuthenticationService.isLoggedIn()) && $location.path() === '/'){
    //     $location.path('/login');
    //   }
    //   else {
    //     let userTypeLoggedIn = AuthenticationService.getUserTypeLoggedIn();
    //     restrictRoutesBasedOnUser(userTypeLoggedIn, $location.path(), $location)
    //   }
    });

    function redirectToBasedOnUserType(userTypeLoggedIn) {
      switch (userTypeLoggedIn) {

        case appInfo.USER_TYPES.FACILITY_MANAGER:
          $location.path('/manager');
          break;

        case appInfo.USER_TYPES.ARTISAN:
          $location.path('/artisans');
          break;

        case appInfo.USER_TYPES.OCCUPANT:
          $location.path('/occupant');
          break;
      }
    }

    function restrictRoutesBasedOnUser(userType, currentPath, $location) {

      var isPermitted = false;

      let userTypeForPathFound = knownRoutes[currentPath];

      if (userTypeForPathFound && userTypeForPathFound === userType) isPermitted = true;

      if (!isPermitted) return $location.path('/');
    }

    var knownRoutes = {
      '/manager/user-management/invitations': appInfo.USER_TYPES.FACILITY_MANAGER,
      '/manager/user-management/artisans': appInfo.USER_TYPES.FACILITY_MANAGER,
      '/manager/user-management/occupants': appInfo.USER_TYPES.FACILITY_MANAGER,
      '/manager/tasks/manage': appInfo.USER_TYPES.FACILITY_MANAGER,
      '/manager/tasks/create': appInfo.USER_TYPES.FACILITY_MANAGER,
      '/manager/complaints/manage': appInfo.USER_TYPES.FACILITY_MANAGER,
      '/manager/properties/buildings/manage': appInfo.USER_TYPES.FACILITY_MANAGER,
      '/occupant/complaints/create': appInfo.USER_TYPES.OCCUPANT,
      '/occupant/complaints/view': appInfo.USER_TYPES.OCCUPANT,
      '/artisan/tasks/manage': appInfo.USER_TYPES.OCCUPANT

    };

  }


})();
