/**
* scheduleApp Module
*
* Description this is the modeul that controls the scheduling part of the agent side.
*/
angular.module('scheduleApp', ['navbarApp'])

.controller('scheduleCtrl', function($scope,$location,$window,Campaign,Agent,Call){
	// The current campaign the agent is scheduling for.
	$scope.current_campaign = '';
	// Constants refereing to time
	$scope.now = (new Date()).valueOf();
	$scope.hour = 3600000;
	$scope.three_minutes = $scope.hour/20;
	$scope.day = $scope.hour*24;
	$scope.week = $scope.day*7;
	// Array that will hold the week of dates the user is currently looking at
	$scope.dateWeek = new Array(7);
	// Array of strings for the weeks and months
	$scope.days=['Mon','Tues','Wed','Thurs','Fri','Sat','Sun'];
	$scope.months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	// Object for what get shown in the data boxes. This will be filled in when
	// the data is retrieved from the server.
	$scope.snapshot={
		range:'86400000',
		available: 0,
		allocated: 0,
		complete:0
	};
	$scope.availabilitiesColour = function(){
		return $scope.agent_available=='true' ? 'color: black' : 'color: grey';
	}
	// The range that we are looking back in the schedule
	$scope.range = '86400000';
	// Filter object
	$scope.filter={
		agent:'',
		date: {
			start: null
		}
	};
	// Function that sets the range of time that we want to view the snapshot for
	$scope.setRange =function(){
		var time = parseInt($scope.range);
		if($scope.calls) $scope.getHoursComplete();
	}
	// Function that navigates the user to the requests page.
	$scope.seeRequests = function(){
		var params = $location.path().split('/');
		console.log(params);
		var path = params[0];
		for (var i = 1; i < params.length; i++) {
			path = path + '/' + params[i];
		};
		path = path + '/request';
		$window.location.href = path;
	}
	// Toggles the availability edit option.
	$scope.editAvailability = function(){
		$scope.avail_edit = !$scope.avail_edit;
	}
	// Saves the updates to the availabilitie, and updates the backend.
	$scope.updateAvailabilities = function(){
		$scope.avail_edit = !$scope.avail_edit;
		for (var i = $scope.agent.availabilities.length - 1; i >= 0; i--) {
			if($scope.agent.availabilities[i]<0)$scope.agent.availabilities[i] = 0;
			if($scope.agent.availabilities[i]>24)$scope.agent.availabilities[i] = 24;
		};
		Agent.update({
			availabilities: $scope.agent.availabilities
		},$scope.agent._id).then(function(data){
			console.log(data);
		});
	}
	$scope.updateAvailable = function(){
		var available;
		$scope.agent_available == 'true' ? available = true : available = false;
		Agent.update({
			available: available
		},$scope.agent._id).then(function(data){
			console.log(data);
		});
	}
	// Get's the agent data for the current agent.
	$scope.getAgentData = function(){
		Agent.me().then(function(data){
			console.log(data);
			$scope.agent = data;
			$scope.agent.available ? $scope.agent_available = 'true' : $scope.agent_available = 'false';
			$scope.getCampaigns();
		})
	}
	// Get's all the campaigns that the current agent is on.
	$scope.getCampaigns = function(){
		Campaign.get({}, 'name url_name allocated_slots agents client_name').then(function(data){
			$scope.campaigns = data;
			$scope.init();
		})
	};
	// Get's all the calls that the current agent has done.
	$scope.getCalls = function(){
		Call.get({sorted:true}, 'created campaign_name duration rating outcome').then(function(data){
			$scope.calls = data;
			for (var i = $scope.calls.length - 1; i >= 0; i--)
				$scope.calls[i].created = new Date($scope.calls[i].created);
			console.log($scope.calls)
			$scope.getHoursComplete();
		})
	};
	$scope.getHoursComplete = function(){
		$scope.number_of_calls = 0;
		var range = parseInt($scope.range);
		var total_time = 0;
		for (var i = 1; i <= $scope.calls.length; i++) {
			if($scope.calls[i-1].created.valueOf() < $scope.now - range) continue;
			if($scope.current_campaign && !($scope.calls[i-1].campaign_name == $scope.current_campaign)) continue
			$scope.number_of_calls++;
			if(!$scope.calls[i])
				total_time += $scope.calls[i-1].duration*1000+$scope.three_minutes
			else if($scope.calls[i-1].created.valueOf()+$scope.calls[i-1].duration*1000+$scope.three_minutes>$scope.calls[i].created.valueOf())
				total_time += ($scope.calls[i].created.valueOf() - $scope.calls[i-1].created.valueOf())
			else
				total_time += $scope.calls[i-1].duration*1000+$scope.three_minutes
		}
		$scope.hours_complete = total_time/$scope.hour;
	}
	$scope.getHoursLeft = function(){
		var time_left = 0;
		for (var i = $scope.campaigns.length - 1; i >= 0; i--) {
			if($scope.current_campaign && !($scope.campaigns[i].name == $scope.current_campaign)) continue;
			for (var j = $scope.campaigns[i].allocated_slots.length - 1; j >= 0; j--) {
				if($scope.campaigns[i].allocated_slots[j].agent.toString() != $scope.agent._id.toString()) continue;
				if($scope.campaigns[i].allocated_slots[j].time.valueOf() < $scope.now.valueOf() && $scope.campaigns[i].allocated_slots[j].time.valueOf()+$scope.hour > $scope.now)
					time_left += ($scope.campaigns[i].allocated_slots[j].time.valueOf()+$scope.hour - $scope.now)
				else if($scope.campaigns[i].allocated_slots[j].time.valueOf() > $scope.now.valueOf())
					time_left += $scope.hour
			};
		};
		$scope.hours_left = time_left/$scope.hour;
	}
	// Formats what the hours look like in the calender.
	$scope.formatHours = function(a){
		a.sort(function(a,b){
		  return new Date(a.time) - new Date(b.time);
		});
		var result = '';
		for (var i = 0; i < a.length; i++) {
			i < a.length-1 ? result += a[i].time.getHours()+':00, ' : result += a[i].time.getHours()+':00'
		};
		return result;
	}
	// Returns a sum of the numbers in an array.
	$scope.getAmount = function(a){
		result = 0;
		for (var i = 0; i < a.length; i++) {
			result += a[i].number;
		};
		return result;
	}
	// Gets the total hours for a day.
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
	// Organises the stats for a campaign.
	$scope.getCampaignStats = function(){
		$scope.slots = []
		for (var i = $scope.campaigns.length - 1; i >= 0; i--) {
			var c = $scope.campaigns[i];
			for (var j = c.allocated_slots.length - 1; j >= 0; j--){
				if(c.allocated_slots[j].agent.toString() != $scope.agent._id.toString())
					continue
				$scope.slots.push({
					time: (new Date(c.allocated_slots[j].time)).valueOf(),
					campaign: c._id,
					campaign_name: c.name,
					client_name: c.client_name
				})
			}
		}
		$scope.setRange();
		$scope.getShownSlots();
	};
	// Populates the dateweek array with the dates for the viewed week.
	$scope.getDateWeek = function(start){
		var result = [start];
		for (var i = 1; i < 7; i++) {
			result.push(new Date(start.valueOf()+$scope.day*i))
		};
		$scope.dateWeek = result;
	}
	// Changes the current date range that the user is looking at.
	$scope.changeDate = function(dir){
		$scope.filter.date.start = new Date($scope.filter.date.start.valueOf() + dir*$scope.week);
		$scope.getDateWeek($scope.filter.date.start);
		$scope.getShownSlots();
		$location.search("start",$scope.filter.date.start.valueOf())
	}
	// Changes the campaign that the agent is looking at. It then puts
	// the campaign in the url.
	$scope.changeCampaign = function(campaign_name){
		$scope.current_campaign = campaign_name;
		campaign_name == '' ? $location.search('campaign',null) : $location.search('campaign',campaign_name);
		$scope.getShownSlots();
		if($scope.calls) $scope.getHoursComplete();
	}
	// Function that is called when the page is loaded. It takes the parameters
	// from the url.
	$scope.init = function(){
		var params = $location.search();
		if(params.campaign)
			$scope.current_campaign = params.campaign;
		if(params.start)
			$scope.filter.date.start = new Date(parseInt(params.start))
		else{
			var today = $scope.now - $scope.now % $scope.day;
			today -= (parseInt(($scope.now%$scope.week)/$scope.day)+3)%7*$scope.day;
			$scope.filter.date.start = new Date(today);
		}
		$scope.getDateWeek($scope.filter.date.start);
		$scope.getCampaignStats();
		$scope.getCalls();
		$scope.getHoursLeft();
	}
	// Function that gets the slots that are shown in the
	// calendar. These are the events over the week.
	$scope.getShownSlots = function(){
		var result = new Array(7);
		// Structure of the dateweek object.
		for (var i = 0; i < 7; i++) {
			result[i] = {
				PM: {},
				AM: {}
			}
		};
		// Get's the allocated slots
		for (var i = $scope.slots.length - 1; i >= 0; i--) {
			// If the slot is not in this week, or the slots is for a different campaign, skip it
			if($scope.current_campaign && !($scope.current_campaign == $scope.slots[i].campaign_name)) continue;
			if(!($scope.slots[i].time >= $scope.filter.date.start.valueOf() && $scope.slots[i].time < $scope.filter.date.start.valueOf()+$scope.week))
				continue
			var day = ((new Date($scope.slots[i].time)).getDay()+6)%7;
			// If the slots is before 1pm, then it's in the AM :P
			if($scope.slots[i].time%$scope.day < 13*$scope.hour){
				// The name that is shown on the UI is the clients name plus the campaigns name.
				if(result[day].AM[$scope.slots[i].client_name + " - " + $scope.slots[i].campaign_name])
					result[day].AM[$scope.slots[i].client_name + " - " + $scope.slots[i].campaign_name].push({time: new Date($scope.slots[i].time), number: 1})
				else
					result[day].AM[$scope.slots[i].client_name + " - " + $scope.slots[i].campaign_name]=[{time: new Date($scope.slots[i].time), number: 1}]
			}else{
				if(result[day].PM[$scope.slots[i].client_name + " - " + $scope.slots[i].campaign_name])
					result[day].PM[$scope.slots[i].client_name + " - " + $scope.slots[i].campaign_name].push({time: new Date($scope.slots[i].time), number: 1})
				else
					result[day].PM[$scope.slots[i].client_name + " - " + $scope.slots[i].campaign_name]=[{time: new Date($scope.slots[i].time), number: 1}]
			}
		}
		$scope.shownSlots = result;
	}
	$scope.getAgentData();
})