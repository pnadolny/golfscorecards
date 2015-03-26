'use strict';

var defaults =  {'hole':2,'front':2, 'back':2};



angular.module("golfApp", ['golfControllers', 'golfServices', 'golfFilters','ngMaterial'])
.value('defaults',defaults)
.config(function($mdThemingProvider) {

        
      });
