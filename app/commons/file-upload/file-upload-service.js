//
// (function () {
//     'use strict';
//     var axios =  require("axios");
//     var appInfo = window.app.details;
//
//     angular
//         .module('mainApp.commons.fileUpload')
//         .factory('fileUploadService', fileUploadService);
//
//     function fileUploadService($q,$http) {
//         var service ={};
//
//         service.uploadFile = function(formData){
//             axios({
//                 method: 'POST',
//                 url: appInfo.CLOUDINARY_URL,
//                 headers:{
//                     'Content-Type':'application/x-www-form-urlencoded'
//                 },
//                 data: formData
//             }).then(function (result) {
//                 console.log("uploaded");
//             }).catch(function (error) {
//
//             });
//         };
//         return service;
//     }
//
// });
