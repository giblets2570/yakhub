/**
* appControllers Module
*
* Description
*/

app.controller('resultsCtrl', ['$scope','$state','Alert','Call','$sce','$location','$filter',function($scope,$state,Alert,Call,$sce,$location,$filter){
	// $scope.time_filter = 'All time';
	$scope.now = (new Date().valueOf());
	$scope.hour = 3600000;
	$scope.day = $scope.hour * 24;
	$scope.week = $scope.day * 7;
	$scope.month = $scope.day * 30;
	$scope.time_filters = {
		'All time' : 0,
		'This week' : $scope.week,
		'This month' : $scope.month
	}
	// Number of entries shown per page
	$scope.pageEntries = 5;
	// Initialise the number of pages
	$scope.noOfPages= 1;
	// Filter object. This has all the data that we want to filter the
	// leads by. Page gives the page of the results we are looking at.
	// Stars filters the data based on the number of stars the lead has.
	// Agent is the agent that produced the lead. Time low/high is the
	// time range for the calls in minutes. Date is the dat range in
	// which the call was made.
	$scope.filter = {
	  save:true,
	  page: 0,
	  stars:[true,true,true,true],
		outcome:'',
		agent: '',
		time: 'All_time'
	};
	// Function that getsthe calls from the server and sets
	// all the call created dates to Date objects.
	$scope.getCalls = function(){
		Call.get({campaign_id:$scope.campaign._id,sorted:true},'').then(function(data){
			$scope.calls = data;
			console.log(data);
			for (var i = $scope.calls.length - 1; i >= 0; i--)
				$scope.calls[i].created = new Date($scope.calls[i].created);
			$scope.applyFilter($scope.filter);
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
		if(value > $scope.noOfPages-1){return;}
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
	// This function downloads the leads based on the current filter options
	$scope.download = function(){
		// If there is a filter for the page, then we want to remove it before
		// we download the leads, as it will cause like 5 leads to be downloaded
		var oldPage;
		if($scope.filter.page){
			oldPage = $scope.filter.page;
			$scope.filter.page = null;
			$scope.applyFilter($scope.filter);
		}
		var result = 'number\tcompany\tname\trole\toutcome\tagent\trecording_url\tnotes\trating\tanswer 1\tanswer 2\tanswer 3\tanswer 4\tanswer 5\tanswer 6\n';
		for (var i = 0; i < $scope.filtered.length; i++) {
			result += "'"+$scope.filtered[i].lead_info.number+'\t'+
			$scope.filtered[i].lead_info.company+'\t'+
			$scope.filtered[i].lead_info.person.name+'\t'+
			$scope.filtered[i].lead_info.person.role+'\t'+
			$scope.filtered[i].outcome+'\t'+
			$scope.filtered[i].agent_name+'\t'+
			$scope.filtered[i].recording_url+'\t'+
			$scope.filtered[i].notes+'\t'+
			$scope.filtered[i].rating+'\t';
			for (var j = 0; j < $scope.filtered[i].answers.length; j++) {
				result += $scope.filtered[i].answers[j].answer+'\t'
			};
			result += '\n';
		};
		if(oldPage){
			$scope.filter.page = oldPage;
			$scope.applyFilter($scope.filter);
		}
    	$window.open("data:text/csv;charset=utf-8," + encodeURIComponent(result));
    }
    // When the filter changes, we need to update the number of pages that we can access.
	// This function uses $filter to find the actual number of shown pages.
	$scope.applyFilter = function(newVal){
		$scope.filtered = $filter('filter')($scope.calls, newVal);
		if($scope.filtered){
			$scope.totalItems = $scope.filtered.length;
			$scope.noOfPages = Math.ceil($scope.totalItems / $scope.pageEntries);
		}
	}
	$scope.$watch('campaign',function(c){
		if(c && c._id){
			$scope.init();
		}
	})
	$scope.$watch('filter', function (newVal, oldVal) {
		$scope.applyFilter(newVal);
	}, true);
}])

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
		var now = (new Date()).valueOf();
		var week = 3600000*24*7;
		var month = 3600000*24*7*30;
		for (var i = 0; i < input.length; i++){
			// If stars is not defined, or the call has correct stars, this will pass through
			if(!params.stars[input[i].rating]){continue;}
			// If outcome is not defined, or the call has correct outcome, this will pass through
			if(params.outcome && !(params.outcome == input[i].outcome)){continue;}
			// If the date range is not defined, or the call is in the right range, this will pass through
			// if((params.date.start&&params.date.end) && !(input[i].created.valueOf() >= params.date.start.valueOf() && input[i].created.valueOf() <= params.date.end.valueOf())){continue;}
			// If time range is not defined, or the call has correct time range, this will pass through
			// var low = params.time.low;
			// var high = params.time.high;
			// if(high===''){high=1000000000}
			// if(low===''){low=0}
			// low = parseFloat(low);
			// high = parseFloat(high);
			// if(low>high || !(input[i].duration >= low*60 && input[i].duration <= high*60)){continue;}
			if(params.time!='All time'){
				if(input[i].created.valueOf()<now-month) continue;
				if(params.time=='This week'){
					if(input[i].created.valueOf()<now-week) continue;
				}
			}
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
        templateUrl: '/client/views/templates/audioPlayer.html',
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