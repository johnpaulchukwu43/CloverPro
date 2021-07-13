(function () {
  'use strict';

  angular.module('mainApp.core.exception')
    .factory('exception', exception);

  /* @ngInject */
  function exception(logger) {

    function isString(x) {
      return Object.prototype.toString.call(x) === '[object String]';
    }

    function isArray(x) {
      return Array.isArray(x);
    }

    var service = {
      catcher: catcher,
      handleGetRequestResponse: handleGetRequestResponse,
      handleChangeRequestResponse: handleChangeRequestResponse
    };
    return service;

    function catcher(response, dataBody) {
      var status = response.status;
      var data = response.data;

      if (status >= 200 && status <= 300) {
        let message;
        if(data.messages && isArray(data.messages)){
          data.messages.forEach(function(item){
            if(message) {
              message += "- "+item+".\n"
            }else{
              message ="- "+item+".\n"
            }
          });
        }else if(data.message){
          message = data.message
        }
        else {
          message = "Operation completed successfully.";
        }
        logger.success(message);
        dataBody = {};
      } else if (status >= 400 && status <= 500) {
        if (status === 403) {
          logger.info("Session Expired : Re-login to continue")
        }else{

          let message;
          if(data.messages && isArray(data.messages)){
            data.messages.forEach(function(item){
              if(message) {
                message += "- "+item+".\n"
              }else{
                message ="- "+item+".\n"
              }
            });
          }else if(data.message){
            message = data.message
          }
          else {
            message = "Invalid input entered. Check again.";
          }


          logger.error(message, "[BadRequestException]:");
        }
      } else if (status >= 500 && status < 600) {
        let message;
        if(data.messages && isArray(data.messages)){
          data.messages.forEach(function(item){
            if(message) {
              message += "- "+item+".\n"
            }else{
              message ="- "+item+".\n"
            }
          });
        }else if(data.message){
          message = data.message
        }
        else {
          message = "Invalid input entered. Check again.";
        }
        logger.error(message, "[ServerException]:");
      } else {
        logger.error(data.message, "[Unknown State]:");
      }
      return dataBody;
    }

    function handleGetRequestResponse(response, dataBody) {
      var status = response.status;
      var data = response.data;
      if (status >= 200 && status <= 300) {
        dataBody = data;
      } else if (status >= 400 && status < 500) {
        if (status === 403) {
          logger.info("Session Expired : Re-login to continue")
        }
        logger.error(data.message, "[BadRequestException]:");
        dataBody = null;
      } else if (status >= 500 && status < 600) {
        logger.error(data.message, "[ServerException]:");
        dataBody = null;
      } else {
        logger.error(data.message, "[Unknown State]:");
        dataBody = null;
      }
      return dataBody;
    }

    function handleChangeRequestResponse(response) {
      var updated = false;
      var status = response.status;
      if (status >= 200 && status <= 300) {
        logger.success(response.data.message);
        updated = true;
      } else if (status >= 400 && status <= 500) {
        if (status === 403) {
          logger.info("Session Expired : Re-login to continue")
          return;
        }
        logger.error(data.message, "[BadRequestException]:");
      } else if (status >= 500 && status < 600) {
        logger.error(data.message, "[ServerException]:");
      } else {
        logger.error(data.message, "[Unknown State]:");
      }
      return updated;
    }

  }
})();
