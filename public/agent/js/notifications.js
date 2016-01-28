/**
* notificationsApp Module
*
* Description the notifications module, that controls the notifications page.
*/
angular.module('notificationsApp', ['navbarApp'])

.controller('notificationsCtrl', function($scope,$window,$location,Campaign,Agent){
	// Some variables refering to time, to make things easier.
	$scope.now = (new Date()).valueOf();
	$scope.hour = 3600000;
	$scope.day = $scope.hour*24;
	// Arrays of days and months
	$scope.days=['Mon','Tues','Wed','Thurs','Fri','Sat','Sun'];
	$scope.months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	// Gets the data for the current agent.
	$scope.getAgent = function(c){
		Agent.me({},'name').then(function(data){
			$scope.agent = data;
			(c||angular.noop)();
		})
	}
	// Returns the class red-dot if the notification has not been seen before.
	$scope.seenBefore = function(slot) {
		if(!$scope.last_check) return '';
		return (slot.created.valueOf() > $scope.last_check.valueOf() ? 'red-dot' : '')
	};
	// Updates the backend to say that the agent has seen the notifications.
	$scope.updateNotification = function(c){
		Agent.update({
			notifications:{
				seen_all: true,
				last_check: new Date()
			}
		}, $scope.agent._id).then(function(data){
			$scope.last_check = new Date(data.last_check);
			(c||angular.noop)();
		})
	}
	// Formats the date into the way I want. Maybe could be implemented using a filter.
	$scope.formatDate = function(date){
		var date = new Date(parseInt(date));
		return ($scope.days[(date.getDay()+6)%7] + " " + $scope.months[date.getMonth()] + " " + date.getDate() + ", at " + date.getHours() +":00")
	}
	// Navigates to the request timeslot page.
	$scope.seeRequests = function(campaign){
		var params = $location.path().split('/');
		var path = params[0];
		for (var i = 1; i < params.length-1; i++) {
			path = path + '/' + params[i];
		};
		path = path + '/schedule/request?campaign='+encodeURIComponent(campaign.name);
		$window.location.href = path;
	}
	$scope.campaignPage = function(campaign){
		$window.location.href='/campaigns/'+campaign.url_name;
	}
	// Function that retrieves the campaigns data from the server, and then formats it.
	$scope.getCampaigns = function(c){
		Campaign.get({},'allocated_slots requested_slots name client_name url_name').then(function(data){
			$scope.campaigns = data;
			for (var j = $scope.campaigns.length - 1; j >= 0; j--) {

				// Format for the requested timeslots. The reason for formatting is because we want
				// to separate the notifications into separate days.
				$scope.campaigns[j].requested = {}
				for (var i = $scope.campaigns[j].requested_slots.length - 1; i >= 0; i--){
					if($scope.campaigns[j].requested_slots[i].agent.toString() != $scope.agent._id.toString()){
						$scope.campaigns[j].requested_slots.splice(i,1);
						continue;
					}
					$scope.campaigns[j].requested_slots[i].time = new Date($scope.campaigns[j].requested_slots[i].time);
					if($scope.campaigns[j].requested_slots[i].time.valueOf() < $scope.now) continue;
					$scope.campaigns[j].requested_slots[i].created = new Date($scope.campaigns[j].requested_slots[i].created);
					var day = $scope.campaigns[j].requested_slots[i].time.valueOf() - $scope.campaigns[j].requested_slots[i].time.valueOf() % $scope.day;
					if(!$scope.campaigns[j].requested[day]) $scope.campaigns[j].requested[day] = []
					$scope.campaigns[j].requested[day].push({time: $scope.campaigns[j].requested_slots[i].time, created: $scope.campaigns[j].requested_slots[i].created, status: $scope.campaigns[j].requested_slots[i].status});
				}
			}
			(c||angular.noop)();
		})
	};
	$scope.anyNotifications = function(notifications){
		return JSON.stringify(notifications)==JSON.stringify({}) ? false : true;
	}
	// Gets the day title for each day of notifications.
	$scope.getDay = function(value){
		var date = new Date(parseInt(value));
		var result = $scope.days[(date.getDay()+6)%7] + " " + $scope.months[date.getMonth()] + " " + date.getDate();
		return result;
	}
	// Function that is run when the page loads.
	$scope.init = function(){
		$scope.getAgent(function(){
			$scope.getCampaigns(function(){
				$scope.updateNotification();
			});
		})
	};
});