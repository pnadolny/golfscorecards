'use strict';

var golfAppControllers = angular.module('golfControllers', []);

var ModalPlayerInstanceCtrl = function($scope, $modalInstance, player) {
    $scope.originalName = player.name;
	$scope.player = player;

  
  
  $scope.ok = function() {
    $modalInstance.close($scope.player);
  };
  $scope.cancel = function() {
	$scope.player.name = $scope.originalName;
	
    $modalInstance.dismiss('cancel');
  };
};

golfAppControllers.controller('GolfController', ['$scope', '$modal', '$log', 'Storage','defaults',
  function($scope, $modal, $log, Storage,defaults) {

    var DEFAULT_BET = defaults.hole;
    var DEFAULT_FRONT_BET = defaults.front;
    var DEFAULT_BACK_BET = defaults.back;
    var DEFAULT_PAR = 3;
    var DEFAULT_PLAYER_HANDICAP = 0;
    var HOLES = 18;

    $scope.currentHole = 0;
    $scope.currentPlayer = 0;
    $scope.currentPlayerHole = 0;


    $scope.data = {
      frontBet: DEFAULT_FRONT_BET,
      backBet: DEFAULT_BACK_BET,
      bet: DEFAULT_BET,
      course: [],
      players: []
    };

	
    for (var x = 0; x < HOLES; x++) {
      $scope.data.course.push({
        par: DEFAULT_PAR,
        handicap:x+1
      });
	  
	  

    }

    $scope.getPlayerName = function(currentPlayer) {

      if (angular.isUndefined($scope.data.players[currentPlayer - 1])) {
        return 0;
      }


      return $scope.data.players[currentPlayer - 1].name;
    }


    $scope.editPlayer = function() {

      var modalInstance = $modal.open({
        templateUrl: 'player.html',
        controller: ModalPlayerInstanceCtrl,
        resolve: {
          player: function() {
            return $scope.data.players[$scope.currentPlayer - 1];
          }
        }
      });
      modalInstance.result.then(function(player) {
        $log.info('Modal dismissed with: ' + angular.toJson(player));
      }, function() {
        $log.info('Modal dismissed');
      });

    }

    $scope.getWinnings = function(playerIndex) {
      if (angular.isUndefined(playerIndex)) {
        return 0;

      }
      if (angular.isUndefined($scope.wins)) {
        return 0;
      }
      if ($scope.wins.length == 0) {
        return 0;

      }
      $log.log(JSON.stringify(playerIndex));
      var frontWins = $scope.sumWins(playerIndex - 1, 0, 9);
      var backWins = $scope.sumWins(playerIndex - 1, 9, 18);

      $log.log("Front wins " + JSON.stringify(frontWins))
      $log.log("Back wins " + JSON.stringify(backWins))

      var total = (frontWins * $scope.data.bet) + (backWins * $scope.data.bet);

      // Who won the front?
      var winningPlayerFront = -1;
      var min = Number.MAX_VALUE;

      var set = [];
      for (var p = 0; p < $scope.data.players.length; p++) {
        var score = $scope.sumNet(p, 0, 9);
        set.push(score);
        if (score < min) {
          winningPlayerFront = p;
        }
        min = score;
      }
      $log.log("winning player front " + JSON.stringify(winningPlayerFront));
      $log.log("set..front. " + JSON.stringify(set));
      toUnique(set);
      if (set.length != 1 && winningPlayerFront === (playerIndex - 1)) {
        $log.log("Adding " + $scope.data.frontBet + "to " + winningPlayerFront);
        total = total + $scope.data.frontBet;
      }

      set = [];
      // Who won the back?
      var winningPlayerBack = -1;
      var min = Number.MAX_VALUE;
      for (var p = 0; p < $scope.data.players.length; p++) {
        var score = $scope.sumNet(p, 9, HOLES);
        set.push(score);
        if (score < min) {
          winningPlayerBack = p;
        }
        min = score;
      }
      toUnique(set);
      if (set.length != 1 && winningPlayerBack === playerIndex - 1) {
        total = total + $scope.data.backBet;
      }
      return total;

    }

    function toUnique(a, b, c) { //array,placeholder,placeholder
      b = a.length;
      while (c = --b)
        while (c--) a[b] !== a[c] || a.splice(c, 1)
    }

    $scope.resetHandicap = function(playerIndex) {
      $scope.data.players[playerIndex - 1].handicap = 0;

    }
    $scope.resetHoleHandicap = function(holeIndex) {
      $scope.data.course[holeIndex].handicap = 0;

    }
    $scope.resetHolePar = function(holeIndex) {
      $scope.data.course[holeIndex].par = 0;
    }




    $scope.loadSampleData = function() {

      $scope.data = $scope.sampleData;


      $scope.currentHole = 0;
      $scope.currentPlayer = 1;
      $scope.currentPlayerHole = 0;

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
    
	$scope.sumPar = function(index, offset, count) {
      
	    var total = 0;
      for (var s = offset; s < $scope.data.course.length && s < count; s++) {
        total = total + $scope.data.course[s].par;
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
        scoredRound.players[playerIndex].handicap = scoredRound.players[playerIndex].handicap - lowestHandicap;
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
      if ($scope.currentHole === HOLES - 1) {
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



  }
]);