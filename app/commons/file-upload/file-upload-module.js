(function () {
    'use strict';
    var axios =  require("axios");
    var appInfo = window.app.details;
    angular
        .module('mainApp.commons.fileUpload', ['mainApp.core']).factory('fileUploadService', fileUploadService);

    function fileUploadService($q,$http) {
        var service ={};

        service.uploadFile = function(formData){
            if(axios.defaults.headers.common['Authorization']){
                delete axios.defaults.headers.common['Authorization'];
            }
            return axios({
                method: 'POST',
                url: appInfo.CLOUDINARY_URL,
                headers:{
                    'Content-Type':'application/x-www-form-urlencoded'
                },
                data: formData
            });
        };
        return service;
    }
})();
