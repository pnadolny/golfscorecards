'use strict';
// Source from
// https://github.com/SimplyDo/projector/blob/gh-pages/js/services.js

var servicesModule = angular.module('golfServices', []);


servicesModule.factory('Storage', function() {
	

	var newServiceInstance = {};
    //factory function body that constructs newServiceInstance
    
    newServiceInstance.loadObject = function(key) {

        // variable to hold date found in local storage
        var data = [];

        // retrieve json data from local storage for key
        var json_object = localStorage[key];

        // if data was found in local storage convert to object
        if (json_object) {
          data = JSON.parse(json_object);
        }
        return data;
    };

    newServiceInstance.clear = function() {

      localStorage.clear();
      
    };


    newServiceInstance.supported = function() {

      return 'localStorage' in window && window['localStorage'] !== null;
      
    };

    
    
    newServiceInstance.saveObject = function(objectToSave,key) {

        // Save object to local storage under key
        localStorage[key] = JSON.stringify(objectToSave);

    };
    
    return newServiceInstance;

	
});
