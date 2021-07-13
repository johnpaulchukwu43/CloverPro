(function () {
  'use strict';
  angular
    .module('mainApp.modules', [
      'mainApp.modules.home',
      'mainApp.modules.login',
      'mainApp.modules.admin',
      'mainApp.modules.complaints',
      'mainApp.modules.user.management',
      'mainApp.modules.user',
      'mainApp.modules.tasks',
      'mainApp.modules.properties',
    ]).filter('camelCase', function () {
    var camelCaseFilter = function (input) {
      var words = input.split(' ');
      for (var i = 0, len = words.length; i < len; i++)
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
      return words.join(' ');
    };
    return camelCaseFilter;
  });
})();
