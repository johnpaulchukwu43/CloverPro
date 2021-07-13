(function() {
    'use strict';

    var appInfo = window.app.details;
    angular
        .module('mainApp.commons.fileUpload')
        .directive('fileUpload', fileUpload);

    /* @ngInject */
    function fileUpload ($state,fileUploadService,logger) {
        var directive = {
            bindToController: true,
            controller: FileUploadController,
            controllerAs: 'vm',
            restrict: 'EA',
            scope: {},
            templateUrl: 'commons/file-upload/upload.html'
        };


            function FileUploadController($rootScope,$scope) {
                var img_files;
                $(document).ready(function() {
                    if($rootScope.is_fashion || $rootScope.is_raw_materials || $rootScope.is_manufacturing || $rootScope.is_beauty|| $rootScope.is_electronics || $rootScope.isOccupantView || $rootScope.isArtisanTaskUploadView){
                        $('input[type=file]').on('change', prepareUpload);
                    }
                });
                $rootScope.img_url = "";
                var vm = this;
                vm.is_img_uploading = false;
                $rootScope.is_img_uploaded = false;
                $rootScope.is_img_selected = false;
                vm.uploadImage = uploadImage;

                function uploadImage(){
                    var formData = new FormData();
                    formData.append('file', img_files);
                    formData.append('upload_preset', appInfo.CLOUDINARY_UPLOAD_PRESET);
                    vm.is_img_uploading = true;

                    fileUploadService.uploadFile(formData).then(function (result) {
                        logger.success("Image uploaded success");
                        $rootScope.img_url = result.data.secure_url;

                        //remind the dom to update ;)
                        $scope.$apply(function(){
                            vm.img_url = $rootScope.img_url;
                            $rootScope.is_img_uploaded = true;
                            vm.is_img_uploading = false;

                        });
                    }).catch(function (error) {
                        logger.error("Couldn't Upload image, Try Again","",error);
                        $scope.$apply(function () {
                            $rootScope.is_img_selected = false;
                            $rootScope.is_img_uploaded = false;
                            vm.is_img_uploading = false;
                            vm.file_name = img_files.name;
                        })
                    });
                }

                function prepareUpload(event) {
                    //if the image is selected show the name
                    img_files =  event.target.files[0];
                    $scope.$apply(function () {
                        $rootScope.is_img_selected = true;
                        vm.file_name = img_files.name;
                    })
                }

            }


        return directive;
    }
})();
