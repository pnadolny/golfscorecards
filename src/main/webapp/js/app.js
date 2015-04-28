'use strict';

var gameDefaults =  {'hole':2,'front':2, 'back':2,'holes':18,'par':3,'playerHandicap':0};

angular
  .module("golfApp", ['golfControllers', 'golfServices', 'golfFilters','ngMaterial','ngRoute'])
  .constant("gameDefaults",gameDefaults)
  .config(function($mdThemingProvider) {})
  .config(function($routeProvider) {
    $routeProvider
     .when('/course', {
     templateUrl: 'templates/course.html'
    })
    .when('/bets', {
    templateUrl: 'templates/bets.html'
    })
    .when('/scorecard', {
    templateUrl: 'templates/scorecard.html'
    })
    .when('/players', {
    templateUrl: 'templates/players.html'
    })

 });
