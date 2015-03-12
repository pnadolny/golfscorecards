'use strict';

var golfAppControllers = angular.module('golfControllers', []);


golfAppControllers.controller('GolfController', ['$scope', '$log', 'Storage',
  function($scope, $log, Storage) {

    var DEFAULT_BET = 2;
	var DEFAULT_FRONT_BET = 2;
	var DEFAULT_BACK_BET = 2;
	var DEFAULT_PAR = 3;
	
    var DEFAULT_PLAYER_HANDICAP = 0;
    var HOLES = 18;
    $scope.data = {
		frontBet: DEFAULT_FRONT_BET,
		backBet: DEFAULT_BACK_BET,
		bet: DEFAULT_BET,

      course: [],
      players: []
    };
    $scope.currentHole = 0;
    $scope.currentPlayer = 0;

    for (var x = 0; x < HOLES; x++) {
      $scope.data.course.push({
		par: DEFAULT_PAR,
        handicap: 0
      });

    }
	
    $scope.resetHandicap = function(playerIndex) {
		$scope.data.players[playerIndex-1].handicap = 0;
		
	}
    $scope.loadSampleData = function() {
      $scope.data = $scope.sampleData;
      $scope.currentHole = 1;
      $scope.currentPlayer = 1;
    }
    $scope.sumGross = function(playerIndex, offset, count) {
      var total = 0;
      for (var s = offset; s < $scope.data.players[playerIndex].scores.length && s < count; s++) {
        total = total + $scope.data.players[playerIndex].scores[s].grossScore;
      }
      return total;
    }
    $scope.sumNet = function(playerIndex, offset, count) {
      var total = 0;
      for (var s = offset; s < $scope.scoredRound.players[playerIndex].scores.length && s < count; s++) {
        total = total + $scope.scoredRound.players[playerIndex].scores[s].grossScore;
      }
      return total;
    }
    $scope.sumWins = function(playerIndex, offset, count) {
      var total = 0;
      for (var s = offset; s < $scope.wins[playerIndex].length && s < count; s++) {
        var w = $scope.wins[playerIndex];

        if (w[s] === 1) {
          total = total + 1;
        }
      }
      return total;
    };
    $scope.scoreRound = function() {
      var scoredRound = angular.copy($scope.data);
      var course = scoredRound.course;
      for (var x = 0; x < course.length; x++) {
        course[x].hole = x;
      }
      course.sort(function(a, b) {
        return a.handicap - b.handicap;
      });
      

      var lowestHandicap = 1000;
      
      for (var playerIndex = 0; playerIndex < scoredRound.players.length; playerIndex++) {
        var playerHandicap = scoredRound.players[playerIndex].handicap;
        lowestHandicap = Math.min(lowestHandicap, playerHandicap);
      }
      for (var playerIndex = 0; playerIndex < scoredRound.players.length; playerIndex++) {
        scoredRound.players[playerIndex].handicap =  scoredRound.players[playerIndex].handicap - lowestHandicap;
      }
      
      
      for (var playerIndex = 0; playerIndex < scoredRound.players.length; playerIndex++) {
        var playerHandicap = scoredRound.players[playerIndex].handicap;
        var set = [];
        var iterations = Math.ceil(playerHandicap / HOLES);
        for (var i = 0; i < iterations; i++) {
          for (var x = 0; x < course.length; x++) {
            set.push(course[x].hole);
          }
        }
        while (playerHandicap < set.length) {
          set.pop();
        }
        for (var y = 0; y < set.length; y++) {
          var awardHole = set[y];
          var currentGrossScore = scoredRound.players[playerIndex].scores[awardHole].grossScore;
          if (currentGrossScore > 0) {
            currentGrossScore = currentGrossScore - 1;
            scoredRound.players[playerIndex].scores[awardHole].grossScore = currentGrossScore;
          }
        }
      }
      $scope.scoredRound = scoredRound;
    };

    $scope.$watch('data', function(newValue, oldValue) {
        $scope.scoreRound();
        $scope.updateWins();
      }, true

    );

    $scope.wins = [];

    $scope.updateWins = function() {
      $scope.wins = [];
      for (var p = 0; p < $scope.scoredRound.players.length; p++) {
        var win = [];
        for (var h = 0; h < $scope.scoredRound.course.length; h++) {
          var set = new Set();
          for (var pp = 0; pp < $scope.scoredRound.players.length; pp++) {
            set.add($scope.scoredRound.players[pp].scores[h].grossScore);
          }
          // Is this a push?
          if (set.size == 1) {
            win.push(-1);
            continue;
          }
          // Whats the min score on this hole
          var m = 1000;
          for (var pp = 0; pp < $scope.scoredRound.players.length; pp++) {
            m = Math.min(m, $scope.scoredRound.players[pp].scores[h].grossScore);
          }
          // Is this player the min?
          if (m == $scope.scoredRound.players[p].scores[h].grossScore) {
            win.push(1);
          } else {
            win.push(-1);
          }
        }
        $scope.wins.push(win);
      }
    }

    $scope.deletePlayer = function(index) {
      $scope.data.players.splice(index - 1);
      $scope.currentPlayer = $scope.currentPlayer - 1;
    }

    $scope.bumpHole = function() {
	  if ($scope.currentHole===HOLES-1) {
	  $scope.currentHole = 0;
	  return;
	  }
      if (angular.isUndefined($scope.data.course[$scope.currentHole])) {
        var hole = {
          handicap: 0
        };
        $scope.data.course.push(hole);
      }
      $scope.currentHole = $scope.currentHole + 1;
    }

    $scope.bumpPlayer = function() {
      $log.log(JSON.stringify($scope.data))
      if (angular.isUndefined($scope.data.players[$scope.currentPlayer])) {
        var p = {
          handicap: DEFAULT_PLAYER_HANDICAP,
          scores: []
        };
        for (var x = 0; x < $scope.data.course.length; x++) {
          p.scores.push({
            "grossScore": $scope.data.course[x].par
          });
        }
        $scope.data.players.push(p);
      }
      $scope.currentPlayer = $scope.currentPlayer + 1;
    }


    $scope.sampleData = {
      "frontBet": 2,
	  "backBet":2,
	  "bet":2,
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



  }
]);