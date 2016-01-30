/**
* dashboardApp Module
*
* Description: this is the app for the dashboard. The goal for this module is to control
# the dashboard. The main features are the leads table, and the filter for the leads.
*/
angular.module('dashboardApp', ['navbarApp','ngAnimate', 'ngSanitize','mgcrea.ngStrap'])

.controller('dashboardCtrl',function($scope,$sce,$location,$filter,Call,Agent){
	// Number of entries shown per page
	$scope.pageEntries = 5;
	// Initialise the number of pages
	$scope.noOfPages = 1;
	// Filter object. This has all the data that we want to filter the
	// leads by. Page gives the page of the results we are looking at.
	// Stars filters the data based on the number of stars the lead has.
	// Agent is the agent that produced the lead. Time low/high is the
	// time range for the calls in minutes. Date is the dat range in
	// which the call was made.
	$scope.filter = {
	  save: true,
	  page: 0,
	  stars:[true,true,true,true],
		outcome:'',
		agent: '',
		time:{
			low: '',
			high: ''
		},
		date:{
			start: null,
			end: null
		}
	};
	// Function that getsthe calls from the server and sets
	// all the call created dates to Date objects.
	$scope.getCalls = function(){
		Call.get({campaign:true},'').then(function(data){
			$scope.calls = data;
			for (var i = $scope.calls.length - 1; i >= 0; i--)
				$scope.calls[i].created = new Date($scope.calls[i].created);
			$scope.loadNoPages($scope.filter);
			console.log($scope.calls);
		})
	};
	// Function that is called once the page loads. Will automatically set the
	// filter parameters if there is data in the search query string.
	$scope.init = function(){
		var params = $location.search();
		if(params.page)
			$scope.filter.page = params.page-1;
		if(params.outcome)
			$scope.filter.outcome = params.outcome;
		if(params.time_low)
			$scope.filter.time.low = params.time_low;
		if(params.time_high)
			$scope.filter.time.high = params.time_high;
		if(params.stars){
			for (var i = params.stars.length - 1; i >= 0; i--) {
				if(params.stars[i] == 'false')
					params.stars[i] = false
			};
			$scope.filter.stars = params.stars;
		}
		if(params.start)
			$scope.filter.date.start = new Date(parseInt(params.start))
		if(params.end)
			$scope.filter.date.end = new Date(parseInt(params.end))
		$scope.getCalls();
	}
	$scope.callEdits = {}
	$scope.toggleEdit = function(call){
		console.log($scope.callEdits);
		call.edit = !call.edit;
		$scope.callEdits[call._id] = JSON.parse(JSON.stringify(call));
	}
	$scope.save = function(call){
		Call.update(call).then(function(data){
			call.edit = !call.edit;
		})
	}
	$scope.cancel = function(call){
		console.log($scope.callEdits);
		call.notes = $scope.callEdits[call._id].notes
		call.answers = $scope.callEdits[call._id].answers
		call.edit = !call.edit;
	}
	// When the outcome is changed, we update the url query string
	$scope.changeOutcome = function(){
		!$scope.filter.outcome ? $location.search("outcome",null) : $location.search("outcome",$scope.filter.outcome);
	}
	// When the star is changed, we update the url query string
	$scope.changeStar = function(star){
		$scope.filter.stars[star] = !$scope.filter.stars[star]
		var oneFalse = false
		for (var i = $scope.filter.stars.length - 1; i >= 0; i--) {
			if(!$scope.filter.stars[i])
				oneFalse = true
		};
		oneFalse ? $location.search('stars',$scope.filter.stars) : $location.search('stars',null)
	}
	// When the time is changed, we update the url query string
	$scope.changeTime = function(type){
		$scope.filter.time[type] ? $location.search(type, $scope.filter.time[type]) : $location.search(type,null)
	}
	// When the date is changed, we update the url query string
	$scope.changeDate = function(type){
		$scope.filter.date[type] ? $location.search(type, $scope.filter.date[type].valueOf()) : $location.search(type,null)
	}
	// When the page is changed, we update the url query string
	$scope.changePage = function(value){
		if(value < 0){return;}
		if(value > $scope.noOfPages - 1){return;}
		$scope.filter.page = value;
		$location.search("page",$scope.filter.page+1);
	}
	// Required in order to play HTML5 audio on the page
	$scope.getTrustedUrl = function(url){
		return $sce.trustAsResourceUrl(url);
	}
	// Helper function that gets an array of numbers, for the pages.
	$scope.getNumber = function(num) {
	    var result = []
	    for (var i = 0; i < num; i++)
	    	result.push(i)
	    return result
	}
	// Returns the class of the star icon. If rating is less that value, return
	// an empty star, and vice versa.
	$scope.star = function(rating, value){
		return ((rating >= value) ? 'glyphicon glyphicon-star' :  'glyphicon glyphicon-star-empty');
	}
	$scope.loadNoPages = function(newVal){
		$scope.filtered = $filter('filter')($scope.calls, newVal);
		if($scope.filtered){
			$scope.totalItems = $scope.filtered.length;
			$scope.noOfPages = Math.ceil($scope.totalItems / $scope.pageEntries);
		}
	}
	// When the filter changes, we need to update the number of pages that we can access.
	// This function uses $filter to find the actual number of shown pages.
	$scope.$watch('filter', function (newVal, oldVal) {
		$scope.loadNoPages(newVal);
	}, true);
})
// Filter that returns the correct format for minutes.
.filter('minuteFormat',function(){
	return function(input){
		return (input.toString().length > 1 ? input : "0"+input);
	}
})
// Filter that will filter the calls so that they fit the filter parameters that we want.
.filter('filter', function(){
	return function(input, params){
		if(!input) return input;
		result=[];
		for (var i = 0; i < input.length; i++){
			// If stars is not defined, or the call has correct stars, this will pass through
			if(!params.stars[input[i].rating]){continue;}
			// If outcome is not defined, or the call has correct outcome, this will pass through
			if(params.outcome && !(params.outcome == input[i].outcome)){continue;}
			// If the date range is not defined, or the call is in the right range, this will pass through
			if((params.date.start&&params.date.end) && !(input[i].created.valueOf() >= params.date.start.valueOf() && input[i].created.valueOf() <= params.date.end.valueOf())){continue;}
			// If time range is not defined, or the call has correct time range, this will pass through
			var low = params.time.low;
			var high = params.time.high;
			if(high===''){high=1000000000}
			if(low===''){low=0}
			low = parseFloat(low);
			high = parseFloat(high);
			if(low>high || !(input[i].duration >= low*60 && input[i].duration <= high*60)){continue;}
			result.push(input[i]);
		}
		return result;
	}
})

.directive('audioPlayer',function($interval) {
    return {
        restrict:'E',
        scope: {
            source: '='
        },
        templateUrl: 'client/views/templates/audioPlayer.html',
        link: function($scope, element, attrs){
        	// console.log($scope);
        	$scope.$watch('ctime', function(value){
        		if($scope.ctime == $scope.duration) $scope.playing = false;
        	})
        },
        controller: function($scope){
            if(typeof $scope.source == "string"){
              console.log("init audio");
              $scope.audio = new Audio();
              $scope.audio.src = $scope.source;
              $scope.vol = 0.6;
              $scope.audio.volume = 0.6;
            }
            $scope.playing = false;
            $scope.play = function(){
                $scope.audio.play();
                $scope.playing = true;
            };
            $scope.pause = function(){
                $scope.audio.pause();
                $scope.playing = false;
            };
            $interval(function(){
                $scope.ctime = $scope.audio.currentTime.toFixed(1);
            },100);
            $scope.$watch('audio.duration', function(newval){
                $scope.duration = $scope.audio.duration.toFixed(1);
            });
            $scope.changetime = function(t){
                $scope.audio.currentTime = $scope.ctime;
            };
            $scope.changevol = function(t){
                $scope.audio.volume = $scope.vol;
            };
            $scope.ntot = function(secs) {
				var hr  = Math.floor(secs / 3600);
				var min = Math.floor((secs - (hr * 3600))/60);
				var sec = Math.floor(secs - (hr * 3600) -  (min * 60));
				if (min < 10){ 
				min = "0" + min; 
				}
				if (sec < 10){ 
				sec  = "0" + sec;
				}
				return min + ':' + sec;
            }
        }
    };
});
;