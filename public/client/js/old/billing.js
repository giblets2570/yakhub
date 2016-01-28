/**
* billingApp Module
*
* Description
*/
angular.module('billingApp', ['navbarApp'])

.controller('billingCtrl', function($scope,$location,Call,Agent){
	$scope.now = (new Date()).valueOf();
	$scope.hour = 3600000;
	$scope.three_minutes = $scope.hour / 20;
	$scope.day = $scope.hour*24;
	$scope.week = $scope.day*7;
	$scope.dateWeek = new Array(7);
	$scope.days=['Mon','Tues','Wed','Thurs','Fri','Sat','Sun'];
	$scope.months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	$scope.filter={
		date: {
			start: null
		}
	}
	$scope.prices = {};
	$scope.getPrice = function(agent_name, agent){
		$scope.prices[agent_name] = 0;
		Agent.show({},'price',agent).then(function(data){
			$scope.prices[agent_name] = data.price;
		})
	}
	$scope.getCalls = function(){
		Call.get({sorted:true,campaign:true},'agent_name agent duration created').then(function(data){
			$scope.calls = data;
			for (var i = $scope.calls.length - 1; i >= 0; i--)
				$scope.calls[i].created = (new Date($scope.calls[i].created)).valueOf();
			$scope.getHoursComplete();
		})
	};
	$scope.getHoursComplete = function(){
		$scope.number_of_calls = 0;
		// var total_time = 0;
		var total_time = {};
		for (var i = 1; i <= $scope.calls.length; i++) {
			if($scope.prices[$scope.calls[i-1].agent_name] == undefined) $scope.getPrice($scope.calls[i-1].agent_name,$scope.calls[i-1].agent);
			if($scope.calls[i-1].created<$scope.dateWeek[0].valueOf() || $scope.calls[i-1].created>=$scope.dateWeek[6].valueOf() + $scope.day) continue;
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
				total_time[key] = total_time[key]/$scope.hour;
				hours_complete += total_time[key];
			}
		}
		$scope.total_time = total_time;
		$scope.hours_complete = hours_complete;
		console.log($scope.total_time, $scope.hours_complete);
	}
	$scope.totalCost = function(){
		var result = 0;
		for (var key in $scope.total_time) {
			if ($scope.total_time.hasOwnProperty(key)) {
				result += $scope.prices[key]*$scope.total_time[key];
			}
		}
		return result;
	}
	$scope.getDateWeek = function(start){
		var result = [start];
		for (var i = 1; i < 7; i++) {
			result.push(new Date(start.valueOf()+$scope.day*i))
		};
		$scope.dateWeek = result;
	}
	$scope.changeDate = function(dir){
		$scope.filter.date.start = new Date($scope.filter.date.start.valueOf() + dir*$scope.week);
		$scope.getDateWeek($scope.filter.date.start);
		$scope.getHoursComplete();
		// $scope.getShownSlots();
		$location.search("start",$scope.filter.date.start.valueOf())
	}
	$scope.init = function(){
		var params = $location.search();
		if(params.start)
			$scope.filter.date.start = new Date(parseInt(params.start))
		else{
			var today = $scope.now - $scope.now % $scope.day;
			today -= (parseInt(($scope.now%$scope.week)/$scope.day)+3)%7*$scope.day;
			$scope.filter.date.start = new Date(today);
		}
		$scope.getDateWeek($scope.filter.date.start);
		$scope.getCalls();
	}
});