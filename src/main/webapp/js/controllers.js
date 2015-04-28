;(function() {

'use strict';
var golfAppControllers = angular.module('golfControllers', []);
golfAppControllers.controller('GolfController', function($scope, $log, Storage, courseService, $mdDialog, gameDefaults,$mdSidenav) {

    $scope.currentHole = 0;
    $scope.currentPlayer = 0;
    $scope.currentPlayerHole = 0;
    $scope.data = {
        frontBet: gameDefaults.front,
        backBet: gameDefaults.back,
        bet: gameDefaults.hole,
        course: [],
        players: []
    };
    for (var x = 0; x < gameDefaults.holes; x++) {
        $scope.data.course.push({
            par: gameDefaults.par,
            handicap: x + 1
        });
    }

    $scope.toggleSidenav = function(menuId) {
            $mdSidenav("left").toggle().then(function(){
    			       $log.debug("toggle is done");
             });
        };


    $scope.getPlayerName = function(currentPlayer) {
		return $scope.data.players[currentPlayer - 1] && $scope.data.players[currentPlayer - 1].name;
		//return $scope.data.players[currentPlayer - 1] ? $scope.data.players[currentPlayer - 1].name : 0;
	}

    $scope.getWinnings = function(playerIndex,flag) {
        if (angular.isUndefined(playerIndex)) {
            return 0;
        }
        if (angular.isUndefined($scope.wins)) {
            return 0;
        }
        if ($scope.wins.length == 0) {
            return 0;
        }
        var frontWins = $scope.sumWins(playerIndex - 1, 0, 9);
        var backWins = $scope.sumWins(playerIndex - 1, 9, 18);
        var total = (frontWins * $scope.data.bet) + (backWins * $scope.data.bet);
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
        toUnique(set);
        if (set.length != 1 && winningPlayerFront === (playerIndex - 1)) {
            total = total + $scope.data.frontBet;
        }
        set = [];
        var winningPlayerBack = -1;
        var min = Number.MAX_VALUE;
        for (var p = 0; p < $scope.data.players.length; p++) {
            var score = $scope.sumNet(p, 9, gameDefaults.holes);
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


		if (!flag) {
			for (var i = 0; i < $scope.data.players.length; i++) {
				if (i+1==playerIndex) {
					continue;
				}
				total = total - $scope.getWinnings(i+1,true);
			}
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
    $scope.loadSampleCourse = function() {
        courseService.loadCourse().then(function(sampleCourse) {
            $scope.data = sampleCourse;
            $scope.currentHole = 0;
            $scope.currentPlayer = 1;
            $scope.currentPlayerHole = 0;
        });
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

    var scoreRound = function() {
        var scoredRound = angular.copy($scope.data);
        var course = scoredRound.course;
        for (var x = 0; x < course.length; x++) {
            course[x].hole = x;
        }
        course.sort(function(a, b) {
            return a.handicap - b.handicap;
        });

        var lowestHandicap =scoredRound.players.reduce(function(lowestHandicap,player) {
			return Math.min(lowestHandicap,player.handicap);
		},Number.MAX_VALUE);


        for (var playerIndex = 0; playerIndex < scoredRound.players.length; playerIndex++) {
            scoredRound.players[playerIndex].handicap = scoredRound.players[playerIndex].handicap - lowestHandicap;
        }
        for (var playerIndex = 0; playerIndex < scoredRound.players.length; playerIndex++) {
            var playerHandicap = scoredRound.players[playerIndex].handicap;
            var set = [];
            var iterations = Math.ceil(playerHandicap / gameDefaults.holes);
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
        scoreRound();
        updateWins();
    }, true);

	var updateWins = function() {
        $scope.wins = [];
        for (var playerIndex = 0; playerIndex < $scope.scoredRound.players.length; playerIndex++) {

            var win = [];
            holes: for (var holeIndex = 0; holeIndex < $scope.scoredRound.course.length; holeIndex++) {

				// If only one element in the the set, its a tie, called a push in match play.
                var set = new Set();
                for (var pp = 0; pp < $scope.scoredRound.players.length; pp++) {
                    set.add($scope.scoredRound.players[pp].scores[holeIndex].grossScore);
               }
                if (set.size == 1) {
                    win.push(-1);
                    continue holes;
                }


				 // Whats the min score on this hole? Winner gets a 1.
                var lowestScore = $scope.scoredRound.players.reduce(function(lowestScore,currentValue) {
					return Math.min(lowestScore, currentValue.scores[holeIndex].grossScore );
				},Number.MAX_VALUE);



                // Is this player the min?
                if (lowestScore == $scope.scoredRound.players[playerIndex].scores[holeIndex].grossScore) {
                    win.push(1);
                } else {
                    win.push(-1);
                }
            }
            $scope.wins.push(win);
        }
    }
    $scope.deletePlayer = function(ev, index) {
        var confirm = $mdDialog.confirm().title('Would you like to delete a player?').ok('Do it!').cancel('Cancel').targetEvent(ev);
        $mdDialog.show(confirm).then(function() {
            $scope.data.players.splice(index - 1);
            $scope.currentPlayer = $scope.currentPlayer - 1;
        }, function() {});
    }
    $scope.decHole = function() {
        $scope.currentHole = $scope.currentHole - 1;
    }
    $scope.decCurrentPlayer = function() {
        $scope.currentPlayer = $scope.currentPlayer - 1;
    }
    $scope.decPlayerHole = function() {
        $scope.currentPlayerHole = $scope.currentPlayerHole - 1;
    }
    $scope.bumpPlayerHole = function() {
        $scope.currentPlayerHole = $scope.currentPlayerHole + 1;
    }
    $scope.bumpHole = function() {
        if ($scope.currentHole === gameDefaults.holes - 1) {
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
            var nextPlayer = $scope.currentPlayer + 1;
            var p = {
                handicap: gameDefaults.playerHandicap,
                scores: [],
                name: "Player " + nextPlayer
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
    $scope.editPlayer = function(ev) {
        $mdDialog.show({
            controller: PlayerController,
            templateUrl: 'player.html',
            targetEvent: ev,
            locals: {
                currentPlayer: $scope.currentPlayer,
                player: $scope.data.players[$scope.currentPlayer - 1]
            }
        }).then(function(answer) {}, function() {});
    }
});

function PlayerController($scope, $mdDialog, $log, currentPlayer, player) {
    $log.info("Current Player " + currentPlayer);
    $scope.currentPlayer = currentPlayer;
    $scope.player = player;
    $scope.hide = function() {
        $mdDialog.hide();
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.answer = function(answer) {
        $mdDialog.hide(answer);
    };
}
})();
