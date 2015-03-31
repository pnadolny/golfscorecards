;(function() {
'use strict';
// Source from
// https://github.com/SimplyDo/projector/blob/gh-pages/js/services.js

var servicesModule = angular.module('golfServices', []);


servicesModule.factory('courseService', function($q) {


	  var sampleData = {
      "frontBet": 2,
      "backBet": 2,
      "bet": 2,
      "course": [{
        "par": 4,
        "handicap": 4,
      }, {
        "par": 4,

        "handicap": 8,
      }, {
        "par": 4,

        "handicap": 14,
      }, {
        "par": 4,

        "handicap": 16,
      }, {
        "par": 4,

        "handicap": 2,
      }, {
        "par": 4,

        "handicap": 6,
      }, {
        "par": 4,

        "handicap": 18,
      }, {
        "par": 4,

        "handicap": 12,
      }, {
        "par": 4,

        "handicap": 10,
      }, {
        "par": 4,

        "handicap": 5
      }, {
        "par": 4,

        "handicap": 3
      }, {
        "par": 4,

        "handicap": 7
      }, {
        "par": 4,

        "handicap": 11
      }, {
        "par": 4,

        "handicap": 9
      }, {
        "par": 4,

        "handicap": 1
      }, {
        "par": 4,

        "handicap": 15
      }, {
        "par": 4,

        "handicap": 13
      }, {
        "par": 4,

        "handicap": 17
      }],
      "players": [{
        "name": "Paul",
        "handicap": 7,
        "scores": [{
          "grossScore": 4
        }, {
          "grossScore": 5
        }, {
          "grossScore": 10
        }, {
          "grossScore": 6
        }, {
          "grossScore": 9
        }, {
          "grossScore": 5
        }, {
          "grossScore": 6
        }, {
          "grossScore": 4
        }, {
          "grossScore": 6
        }, {
          "grossScore": 5
        }, {
          "grossScore": 6
        }, {
          "grossScore": 5
        }, {
          "grossScore": 5
        }, {
          "grossScore": 6
        }, {
          "grossScore": 5
        }, {
          "grossScore": 3
        }, {
          "grossScore": 3
        }, {
          "grossScore": 8
        }],
      }, {
        "name": "Andy",
        "handicap": 17,
        "scores": [{
          "grossScore": 5
        }, {
          "grossScore": 4
        }, {
          "grossScore": 6
        }, {
          "grossScore": 3
        }, {
          "grossScore": 6
        }, {
          "grossScore": 3
        }, {
          "grossScore": 4
        }, {
          "grossScore": 4
        }, {
          "grossScore": 4
        }, {
          "grossScore": 6
        }, {
          "grossScore": 4
        }, {
          "grossScore": 4
        }, {
          "grossScore": 4
        }, {
          "grossScore": 5
        }, {
          "grossScore": 5
        }, {
          "grossScore": 4
        }, {
          "grossScore": 3
        }, {
          "grossScore": 6
        }],

      }]
    }


	
	
	
	// Promise-based API
    return {
      loadCourse : function() {
        // Simulate async nature of real remote calls
        return $q.when(sampleData);
      }
    };
	
	

});






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
})();