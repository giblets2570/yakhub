/**
* requestApp Module
*
* Description
*/
angular.module('requestApp', ['navbarApp'])

.controller('requestCtrl', function($scope,$location,Agent,Campaign){
	// Time related constants
	$scope.now = (new Date()).valueOf();
	$scope.hour = 3600000;
	$scope.day = $scope.hour*24;
	$scope.week = $scope.day*7;
	// Array that will contain the date object for the shown week
	$scope.dateWeek = new Array(7);
	// Arrays of days and months strings
	$scope.days=['Mon','Tues','Wed','Thurs','Fri','Sat','Sun'];
	$scope.months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	// Filter
	$scope.filter={
		date: {
			start: null
		}
	};
	// This gets the data data for the current agent that is on the system.
	$scope.getAgentData = function(){
		Agent.me().then(function(data){
			console.log(data);
			$scope.agent = data;
			$scope.getCampaigns();
		})
	};
	// This gets the campaigns for this agent, and then calls the init function
	$scope.getCampaigns = function(){
		Campaign.get({}, 'name client_name available_slots requested_slots').then(function(data){
			$scope.campaigns = data;
			$scope.init();
		})
	};
	// Sums up the numbers in an array
	$scope.getAmount = function(a){
		result = 0;
		for (var i = 0; i < a.length; i++) {
			result += a[i].number;
		};
		return result;
	}
	// This gets the total hours for a day, counting both the
	// evets that happen in AM and PM
	$scope.getTotal = function(input,meridian){
		var result = 0;
		if(!input) return result;
		if(!meridian || meridian=='AM'){
			for (var key in input.AM) {
			  if (input.AM.hasOwnProperty(key)) {
			    result+=$scope.getAmount(input.AM[key]);
			  }
			}
		}
		if(!meridian || meridian=='PM'){
			for (var key in input.PM) {
			  if (input.PM.hasOwnProperty(key)) {
			    result+=$scope.getAmount(input.PM[key]);
			  }
			}
		}
		return result;
	};
	// This function poplutates the date week array, which is the array
	// of date objects, showing the week that the agent is currently looking
	// at. Start is the first day in this week.
	$scope.getDateWeek = function(start){
		var result = [start];
		for (var i = 1; i < 7; i++) {
			result.push(new Date(start.valueOf()+$scope.day*i))
		};
		$scope.dateWeek = result;
	}
	// Function that changes the week that the agent is looking at. It finds the
	// first day of the week, finds the date week, then finds the shown slots for
	// this week. It then puts this variable in the shareable url.
	$scope.changeDate = function(dir){
		$scope.filter.date.start = new Date($scope.filter.date.start.valueOf() + dir*$scope.week);
		$scope.getDateWeek($scope.filter.date.start);
		$scope.getShownSlots();
		$location.search("start",$scope.filter.date.start.valueOf())
	}
	// Function that changes the current campaign the agent is looking at. This is
	// the name of the campaign. It then puts the campaign's name in the url.
	$scope.changeCampaign = function(campaign_name){
		$scope.current_campaign = campaign_name;
		for (var i = $scope.campaigns.length - 1; i >= 0; i--) {
			if($scope.campaigns[i].name == $scope.current_campaign){
				$scope.campaign = $scope.campaigns[i]
				break;
			}
		};
		$location.search('campaign',campaign_name);
		$scope.getShownSlots();
	}
	// Init function that reads the url and sets any parameters that are in it.
	// It then calls the get shown slots function.
	$scope.init = function(){
		var params = $location.search();
		if($scope.campaigns.length > 0)
			params.campaign ? $scope.current_campaign = params.campaign : $scope.current_campaign = $scope.campaigns[0].name
		for (var i = $scope.campaigns.length - 1; i >= 0; i--) {
			if($scope.campaigns[i].name == $scope.current_campaign){
				$scope.campaign = $scope.campaigns[i]
				break;
			}
		};
		if(params.start)
			$scope.filter.date.start = new Date(parseInt(params.start))
		else{
			var today = $scope.now - $scope.now % $scope.day;
			today -= (parseInt(($scope.now%$scope.week)/$scope.day)+3)%7*$scope.day;
			$scope.filter.date.start = new Date(today);
		}
		$scope.getDateWeek($scope.filter.date.start);
		$scope.getShownSlots();
	}
	// This is the function that requests a timeslot for an agent. It will
	// then call the get shown timelots function to update the view.
	$scope.requestTime = function(time){
		// If slot is in the past, you cannot request it
		// if(time < $scope.now) return;
		$scope.campaign.requested_slots.push({
			agent: $scope.agent._id,
			agent_name: $scope.agent.name,
			time: new Date(time),
			created: new Date()
		})
		Campaign.update({
			requested_slots: $scope.campaign.requested_slots
		},$scope.campaign._id).then(function(data){
			console.log(data);
		})
		$scope.getShownSlots();
	}
	// Function that gets the slots that are shown in a given week.
	$scope.getShownSlots = function(){
		if(!$scope.campaign) return;
		var result = new Array(7);
		// This is the structure for the shown slots, broke into AM and PM.
		// Times is the times at which events happen, and html is the html
		// we want to show for each event i.e. for requested slots and
		// available slots this is different.
		for (var i = 0; i < 7; i++) {
			result[i] = {
				PM: {
					times: [],
					html: ''
				},
				AM: {
					times: [],
					html: ''
				}
			}
		};
		// Array that keeps track of the times this agent has requested.
		var requested = [];
		for (var i = 0 ; i < $scope.campaign.requested_slots.length; i++) {
			// If the requested slot isn't for this agent, or not in this week, skip it.
			if(!($scope.agent.name == $scope.campaign.requested_slots[i].agent_name)) continue;
			if(!($scope.campaign.requested_slots[i].time.valueOf() >= $scope.filter.date.start.valueOf() && $scope.campaign.requested_slots[i].time.valueOf() < $scope.filter.date.start.valueOf()+$scope.week))
				continue
			var time = $scope.campaign.requested_slots[i].time;
			var day = (time.getDay()+6)%7;
			requested.push(time.valueOf());
			// If the tiime is before 1pm, it's in the AM
			if(time.valueOf()%$scope.day < 13*$scope.hour){
				if(result[day].AM.times.indexOf(time) < 0){
					result[day].AM.times.push(time);
					// The requested html is given a red colour
					result[day].AM.html += '<span style="color: red">Requested: '+time.getHours()+':00</span><br/>';
				}
			}else{
				if(result[day].PM.times.indexOf(time) < 0){
					result[day].PM.times.push(time);
					result[day].PM.html += '<span style="color: red">Requested: '+time.getHours()+':00</span><br/>';
				}
			}
		};
		// now we poplulate the available times fora campaign.
		for (var i = 0 ; i < $scope.campaign.available_slots.length; i++) {
			console.log($scope.campaign.available_slots[i].time);
			if(!($scope.campaign.available_slots[i].time.valueOf() >= $scope.filter.date.start.valueOf() && $scope.campaign.available_slots[i].time.valueOf() < $scope.filter.date.start.valueOf()+$scope.week))
				continue
			var time = $scope.campaign.available_slots[i].time;
			// If the agent has already requested this time, then we don't
			// want to show it as available.
			if(requested.indexOf(time.valueOf()) > -1)
				continue
			console.log($scope.campaign.available_slots[i])
			var day = (time.getDay()+6)%7;
			if(time.valueOf()%$scope.day < 13*$scope.hour){
				if(result[day].AM.times.indexOf(time) < 0){
					result[day].AM.times.push(time);
					// The available timeslots can be clicked.
					result[day].AM.html += '<a href="" ng-click="requestTime('+ time.valueOf() +')">Available: '+time.getHours()+':00</a><br/>';
				}
			}else{
				if(result[day].PM.times.indexOf(time) < 0){
					result[day].PM.times.push(time);
					result[day].PM.html += '<a href="" ng-click="requestTime('+ time.valueOf() +')">Available: '+time.getHours()+':00</a><br/>';
				}
			}
		};
		console.log(result);
		$scope.shownSlots = result;
	}
	$scope.getAgentData();
})
// Need this directive so we can ng-bind the ng-click element to the html
.directive('compile', function ($compile) {
  return function(scope, element, attrs) {
    scope.$watch(
      function(scope) {
        // watch the 'compile' expression for changes
        return scope.$eval(attrs.compile);
      },
      function(value) {
        // when the 'compile' expression changes
        // assign it into the current DOM
        element.html(value);

        // compile the new DOM and link it to the current
        // scope.
        // NOTE: we only compile .childNodes so that
        // we don't get into infinite loop compiling ourselves
        $compile(element.contents())(scope);
      }
    );
  };
});