'use strict';

var gameDefaults =  {'hole':2,'front':2, 'back':2,'holes':18,'par':3,'playerHandicap':0};



angular.module("golfApp", ['golfControllers', 'golfServices', 'golfFilters','ngMaterial'])
.value('defaults',gameDefaults)
.constant("gameDefaults",gameDefaults)
.config(function($mdThemingProvider) {

        
      });
