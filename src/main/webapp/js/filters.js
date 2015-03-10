var golfAppFilters = angular.module('golfFilters', []);

golfAppFilters.filter('offset', function() {
  return function(input, start) {
    start = +start; //parse to int
    
    return input.slice(start);
  }
});