(function () {
  'use strict';

  angular.module('mainApp.commons')
    .directive('autocomplete', function () {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
          var availableTags = [
            "ActionScript",
            "AppleScript",
            "Asp",
            "BASIC",
            "C",
            "C++",
            "Clojure",
            "COBOL",
            "ColdFusion",
            "Erlang",
            "Fortran",
            "Groovy",
            "Haskell",
            "Java",
            "JavaScript",
            "Lisp",
            "Perl",
            "PHP",
            "Python",
            "Ruby",
            "Scala",
            "Scheme"
          ];
          element.autocomplete({
            source: availableTags,
            select: function (event, ui) {
              console.log(ui);
              ngModelCtrl.$setViewValue(ui.item);
              scope.$apply();
            }
          });


        }
      }
    });


})();
