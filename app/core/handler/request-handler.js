const axios = require("axios");
var endpoint = window.app.endpoints;

(function () {
  'use strict';

  angular
    .module('mainApp.core.handler')
    .factory('requestHandler', requestHandler);

  function requestHandler($q, $http, exception, constant, $rootScope) {
    var apiRoot = endpoint.API_URL;
    var service = {
      apiRoot: apiRoot,
      endpoints: endpoint,
      get: get,
      post: post,
      put: put,
      patch: patch,
      delete: del
    };

    var axiosInstance = axios.create({
      validateStatus: function (status) {
        return status >= 200 && status <= 503;
      },
    });

    // axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + $rootScope.globals.curentUser.token;

    return service;

    function get(endpoint, config) {

      let headers = {
        'Content-Type': 'application/json'
      };

      var url = apiRoot + endpoint;

      if (config && config.makeCallWithoutToken) {
        headers.Authorization = null
      }else{
        headers.Authorization = 'Bearer ' + $rootScope.globals.curentUser.token
      }

      return axiosInstance({
        method: 'GET',
        url: url,
        headers
      })
    }

    function post(endpoint, data, config) {

      let headers = {
        'Content-Type': 'application/json'
      };

      var url = apiRoot + endpoint;

      if (config && config.makeCallWithoutToken) {
        headers.Authorization = null
      }else{
        headers.Authorization = 'Bearer ' + $rootScope.globals.curentUser.token
      }

      return axiosInstance({
        method: 'POST',
        url: url,
        headers,
        data: data
      })
    }

    function put(endpoint, data) {
      console.log($rootScope.globals.curentUser.token);
      var url = apiRoot + endpoint;
      return axiosInstance({
        method: 'PUT',
        url: url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + $rootScope.globals.curentUser.token

        },
        data: data
      })
    }

    function patch(endpoint, data) {
      return $http.patch(apiRoot + endpoint, data)
        .then(function (result) {
          return $q.when(result.data);
        })
        .catch(function (message) {
          exception.catcher('Failed patch data')(message);
          return $q.reject(message.data);
        });
    }

    function del(endpoint) {
      var url = apiRoot + endpoint;
      return axiosInstance({
        method: 'DELETE',
        url: url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + $rootScope.globals.curentUser.token

        }
      })
    }

  }
})();


