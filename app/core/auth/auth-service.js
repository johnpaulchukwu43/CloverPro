var axios = require("axios");

(function () {
  'use strict';
  var endpoints = window.app.endpoints;
  var appInfo = window.app.details;
  angular
    .module('mainApp.core.auth')
    .factory('AuthenticationService', AuthenticationService);

  AuthenticationService.$inject = ['$sessionStorage', '$rootScope', '$q', '$http', '$cookies', 'jwtHelper'];

  function AuthenticationService($sessionStorage, $rootScope, $q, $http, $cookies, jwtHelper) {

    /**
     *  User profile resource
     */

    var auth = {};

    var decodedToken;
    /**
     *  Saves the current user in the root scope
     *  Call this in the app run() method
     */
    auth.init = function () {
      if (auth.isLoggedIn()) {
        $rootScope.globals.currentUser = auth.currentUser();
        decodedToken = jwtHelper.decodeToken($rootScope.globals.currentUser);
      }
    };

    auth.loginAction = function (email, password) {
      var deferred = $q.defer();
      $http({
        method: 'POST',
        url: endpoints.API_URL + endpoints.AUTH_ENDPOINTS.login,
        data: {email, password}
      }).then(
        function (result) {
          // $sessionStorage.user = result.data.serviceProvider;
          // $sessionStorage.token = result.data.token;
          $rootScope.globals.curentUser = result.data.user;
          $rootScope.globals.curentUser.token = result.data.token;
          //set the headers
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + $rootScope.globals.curentUser.token;
          //save the token as a cookie
          var cookieExp = new Date();
          cookieExp.setDate(cookieExp.getDate() + 7);
          $cookies.putObject('globals', $rootScope.globals, {expires: cookieExp});
          //redirect to login home page
          deferred.resolve("login success");

          // var userType = $rootScope.globals.curentUser.type;
          //
          // switch (userType) {
          //   case appInfo.USER_TYPES.FACILITY_MANAGER:
          //     window.location.href = window.location.protocol + "//" + window.location.host + "/manager";
          //     break;
          //
          //   case appInfo.USER_TYPES.ARTISAN:
          //     window.location.href = window.location.protocol + "//" + window.location.host + "/artisans";
          //     break;
          //
          //   case appInfo.USER_TYPES.OCCUPANT:
          //     window.location.href = window.location.protocol + "//" + window.location.host + "/occupant";
          //     break;
          // }
          window.location.href = window.location.protocol + "//" + window.location.host + "/";
        },
        function (error) {
          deferred.reject(error);
        });

      return deferred.promise;

    };

    auth.adminLoginAction = function (username, password) {
      var deferred = $q.defer();
      $http({
        method: 'POST',
        url: endpoints.API_URL + endpoints.SUPER_ADMIN_ENDPOINTS.login,
        data: {
          username: username,
          password: password
        }
      }).then(
        function (result) {
          // $sessionStorage.user = result.data.serviceProvider;
          // $sessionStorage.token = result.data.token;
          $rootScope.globals.curentUser = result.data.admin;
          $rootScope.globals.curentUser.token = result.data.token;
          //set the headers
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + $rootScope.globals.curentUser.token;
          //save the token as a cookie
          var cookieExp = new Date();
          cookieExp.setDate(cookieExp.getDate() + 7);
          $cookies.putObject('globals', $rootScope.globals, {expires: cookieExp});
          //redirect to login home page
          deferred.resolve("login success");
          window.location.href = window.location.protocol + "//" + window.location.host + "/";
        },
        function (error) {
          deferred.reject(error);
        });

      return deferred.promise;

    };

    auth.adminSignUpAction = function (body) {
      var deferred = $q.defer();
      $http({
        method: 'POST',
        url: endpoints.API_URL +endpoints.AUTH_ENDPOINTS.signUp,
        data: body
      }).then(
        function (result) {
          deferred.resolve("login success");
        },
        function (error) {
          console.log("On error signup: "+JSON.stringify(error));
          deferred.reject(error);
        });

      return deferred.promise;

    };


    auth.logout = function () {
      $rootScope.globals = {};
      $cookies.remove('globals');
      delete $sessionStorage.user;
      $http.defaults.headers.common.Authorization['Authorization'] = 'Bearer';
      delete $rootScope.globals.curentUser;
    };


    auth.checkPermissionForView = function (view) {
      if (!view.requiresAuthentication) {
        return true;
      }

      return userHasRoleToView(view);
    };


    var userHasRoleToView = function (view) {
      if (!auth.isLoggedIn()) {
        return false;
      }

      if (!view.roles || !view.roles.length) {
        return true;
      }

      return auth.userHasRole(view.roles);
    };

    var getDecodedToken = function () {
      return jwtHelper.decodeToken($rootScope.globals.curentUser.token);
    };


    auth.userHasRole = function (roles) {


      const userRole = decodedToken ? decodedToken.role : getDecodedToken().role;
      if (!auth.isLoggedIn()) {
        return false;
      }

      var found = false;
      angular.forEach(roles, function (role, index) {
        if (userRole === role) {
          found = true;
          return;
        }
      });

      return found;
    };


    auth.userIsAuthorized = function (expectedAuthority) {
      const usersAuthorities = decodedToken ? decodedToken.authorities : getDecodedToken().authorities;
      if (!auth.isLoggedIn()) {
        return false;
      }
      var found = false;
      angular.forEach(usersAuthorities, function (usersAuthority) {
        if (usersAuthority === expectedAuthority) {
          found = true;
          return;
        }
      });
      return found;
    };


    auth.currentUser = function () {
      return $sessionStorage.user;
    };


    auth.isLoggedIn = function () {
      return $rootScope.globals.curentUser != null;
    };

    auth.getUserTypeLoggedIn = function(){

      if(! this.isLoggedIn()){
        return null;
      }

      return $rootScope.globals.curentUser.type;
    };

    auth.getUser = function () {
      if (auth.isLoggedIn()) {
        return decodedToken ? decodedToken : getDecodedToken();
      }
      return null;
    };

    auth.uploadFile = function (formData) {
      return axios({
        method: 'POST',
        url: appInfo.CLOUDINARY_URL,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: formData
      })
    };

    return auth;
  }

})();
