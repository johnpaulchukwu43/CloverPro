/* global _:false */
/* global moment:false */
/* global toastr:false */
const toastr = require("toastr");
const moment = require("moment");
(function() {
    'use strict';

    angular
        .module('mainApp.core')
        .constant('toastr', toastr)
        .constant('moment', moment)
        .constant('constant', {
            APP_NAME: 'Project',
            API_HOST: 'http://localhost:9000'
        });

})();
