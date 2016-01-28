/**
* analyticsApp Module
*
* Description
*/
angular.module('analyticsApp', ['navbarApp','ngAnimate', 'ngSanitize','mgcrea.ngStrap','chart.js'])

.controller('analyticsCtrl', function($scope,$location,$filter,Agent,Call,Campaign){
	$scope.now = (new Date()).valueOf();
	$scope.hour = 3600000;
	$scope.three_minutes = $scope.hour / 20;
	$scope.day = $scope.hour*24;
	$scope.filter = {
		agent: '',
		date: null
	};
	$scope.getAgents = function(){
		Agent.get({campaign:true},'').then(function(data){
			$scope.agents = data;
		})
	};
	$scope.getCalls = function(){
		Call.get({sorted:true,campaign:true},'agent_name duration rating created').then(function(data){
			$scope.calls = data;
			for (var i = $scope.calls.length - 1; i >= 0; i--)
				$scope.calls[i].created = (new Date($scope.calls[i].created)).valueOf();
			$scope.getCallData();
			$scope.getStatsData();
			$scope.getHoursComplete();
		})
	};
	$scope.getStarCalls = function(num){
		return $filter('filter')($scope.calls,num,$scope.filter.agent);
	}
	$scope.getCampaignStats = function(){
		Campaign.show({},'available_slots allocated_slots requested_slots','mine').then(function(data){
			$scope.campaign = data;
			for (var i = $scope.campaign.available_slots.length - 1; i >= 0; i--) {
				$scope.campaign.available_slots[i].time = (new Date($scope.campaign.available_slots[i].time)).valueOf();
			};
			for (var i = $scope.campaign.allocated_slots.length - 1; i >= 0; i--) {
				console.log("Allocated: ", $scope.campaign.allocated_slots[i].time);
				$scope.campaign.allocated_slots[i].time = (new Date($scope.campaign.allocated_slots[i].time)).valueOf();
			};
			for (var i = $scope.campaign.requested_slots.length - 1; i >= 0; i--) {
				$scope.campaign.requested_slots[i].time = (new Date($scope.campaign.requested_slots[i].time)).valueOf();
			};
			$scope.getCompleteHours();
			$scope.getHoursLeft();
		});
	}
	$scope.init = function(){
		var params = $location.search();
		if(params.agent)
			$scope.filter.agent = params.agent;
		if(params.date)
			$scope.filter.date = new Date(parseInt(params.date));
		else
			$scope.filter.date = new Date($scope.now - $scope.now%$scope.day);
		$scope.getAgents();
		$scope.getCampaignStats();
		$scope.getCalls();
	}
	$scope.changeAgent = function(){
		!$scope.filter.agent ? $location.search("agent",null) : $location.search("agent",$scope.filter.agent)
	}
	$scope.changeDate = function(){
		$scope.filter.date ? $location.search('date', $scope.filter.date.valueOf()) : $location.search('date',null)
	}
	$scope.getCompleteHours = function(){
		$scope.allocated = {
			done: 0,
			left: 0
		}
		for (var i = $scope.campaign.allocated_slots.length - 1; i >= 0; i--) {
			if($scope.filter.agent && $scope.campaign.allocated_slots[i].agent_name != $scope.filter.agent) continue
			$scope.campaign.allocated_slots[i].time < $scope.now ? $scope.allocated.done++ : $scope.allocated.left++;
		}
	}
	$scope.getHoursComplete = function(){
		$scope.number_of_calls = 0;
		// var total_time = 0;
		var total_time = {};
		for (var i = 1; i <= $scope.calls.length; i++) {
			if($scope.filter.agent && $scope.calls[i-1].agent_name != $scope.filter.agent) continue
			$scope.number_of_calls++;
			if(!total_time[$scope.calls[i-1].agent_name]) total_time[$scope.calls[i-1].agent_name] = 0
			if(!$scope.calls[i])
				total_time[$scope.calls[i-1].agent_name] += $scope.calls[i-1].duration*1000+$scope.three_minutes
			else if($scope.calls[i-1].created.valueOf()+$scope.calls[i-1].duration*1000+$scope.three_minutes>$scope.calls[i].created.valueOf())
				total_time[$scope.calls[i-1].agent_name] += ($scope.calls[i].created.valueOf() - $scope.calls[i-1].created.valueOf())
			else
				total_time[$scope.calls[i-1].agent_name] += $scope.calls[i-1].duration*1000+$scope.three_minutes
		}
		var hours_complete = 0;
		for (var key in total_time) {
			if (total_time.hasOwnProperty(key)) {
				hours_complete += total_time[key]
			}
		}
		$scope.hours_complete = hours_complete/$scope.hour;
	}
	$scope.getHoursLeft = function(){
		var time_left = 0;
		for (var i = $scope.campaign.allocated_slots.length - 1; i >= 0; i--) {
			if($scope.filter.agent && $scope.campaign.allocated_slots[i].agent_name != $scope.filter.agent) continue
			if($scope.campaign.allocated_slots[i].time.valueOf() < $scope.now.valueOf() && $scope.campaign.allocated_slots[i].time.valueOf()+$scope.hour > $scope.now)
				time_left += ($scope.campaign.allocated_slots[i].time.valueOf()+$scope.hour - $scope.now)
			else if($scope.campaign.allocated_slots[i].time.valueOf() > $scope.now.valueOf())
				time_left += $scope.hour
		}
		console.log(time_left)
		$scope.hours_left = time_left/$scope.hour;
	}
	$scope.getCallsPerHour = function(num_calls, num_hours_done){
		return num_hours_done ? num_calls / num_hours_done : 0;
	}
	$scope.call_chart = {
		labels: ['12pm','1am','2am','3am','4am','5am','6am','7am','8am','9am','10am','11am',
			'0pm','1pm','2pm','3pm','4pm','5pm','6pm','7pm','8pm','9pm','10pm','11pm'],
		series: ['Call times'],
		data: [new Array(24)]
	}
	$scope.stats_chart = {
		labels: ['Dials','Pickups','0 stars','1 star','2 stars','3 stars'],
		series: ['Call stats'],
		data: [new Array(6)]
	}
	$scope.getCallData = function(){
		for (var i = 0; i < 24; i++) {
			$scope.call_chart.data[0][i] = 0;
		};
		for (var i = $scope.calls.length - 1; i >= 0; i--) {
			if(parseInt($scope.filter.date/$scope.day) != parseInt($scope.calls[i].created/$scope.day)) continue;
			if($scope.filter.agent && $scope.calls[i].agent_name != $scope.filter.agent) continue;
			var hours = $scope.calls[i].created % $scope.day;
			$scope.call_chart.data[0][parseInt(hours/($scope.hour))] += 1;
		};
	}
	$scope.getStatsData = function(){
		for (var i = 0; i < 6; i++) {
			$scope.stats_chart.data[0][i] = 0;
		};
		for (var i = $scope.calls.length - 1; i >= 0; i--) {
			if(parseInt($scope.filter.date/$scope.day) != parseInt($scope.calls[i].created/$scope.day)) continue;
			if($scope.filter.agent && $scope.calls[i].agent_name != $scope.filter.agent) continue;
			$scope.stats_chart.data[0][0]++;
			if($scope.calls[i].outcome != 'No answer' && $scope.calls[i].outcome != 'Number didn\'t work' && $scope.calls[i].outcome != 'Automated response')
				$scope.stats_chart.data[0][1]++;
			$scope.stats_chart.data[0][2+$scope.calls[i].rating]++;
		};
	}
  	$scope.onCallsClick = function (points, evt) {
    	console.log(points, evt);
  	};
	$scope.$watch('filter',function (newVal, oldVal) {
		if(!$scope.calls) return
		$scope.getCallData();
		$scope.getHoursLeft();
		$scope.getCompleteHours();
		$scope.getStatsData();
		$scope.getHoursComplete();
	}, true);
})

.filter('filter',function(){
	return function(input, num_stars, agent){
		if(!input)return input;
		var result = [];
		for (var i = 0; i < input.length; i++) {
			if(input[i].rating == num_stars){
				if(!agent || input[i].agent_name == agent)
					result.push(input[i]);
			}
		};
		return result;
	}
});