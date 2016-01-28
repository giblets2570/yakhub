/**
* notificationsApp Module
*
* Description
*/
angular.module('notificationsApp', ['navbarApp'])

.controller('notificationsCtrl', function($scope,$window,Campaign,Client,Agent){
	$scope.now = (new Date()).valueOf();
	$scope.hour = 3600000;
	$scope.day = $scope.hour*24;
	$scope.days=['Mon','Tues','Wed','Thurs','Fri','Sat','Sun'];
	$scope.months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	$scope.getCampaign = function(c){
		Campaign.show({notified: true},'requested_slots allocated_slots applications','mine').then(function(data){
			$scope.campaign = data;
			console.log($scope.campaign)
			for (var i = $scope.campaign.requested_slots.length - 1; i >= 0; i--){
				$scope.campaign.requested_slots[i].time = new Date($scope.campaign.requested_slots[i].time);
				$scope.campaign.requested_slots[i].created = new Date($scope.campaign.requested_slots[i].created);
			}
			for (var i = $scope.campaign.allocated_slots.length - 1; i >= 0; i--){
				$scope.campaign.allocated_slots[i].time = new Date($scope.campaign.allocated_slots[i].time);
				$scope.campaign.allocated_slots[i].created = new Date($scope.campaign.allocated_slots[i].created);
			}
			(c || angular.noop)();
		})
	};
	$scope.seenBefore = function(slot) {
		if(!$scope.last_check) return '';
		return (slot.created.valueOf() > $scope.last_check.valueOf() ? 'red-dot' : '')
	};
	$scope.agentProfile = function(agent_name){
		Agent.show({agent_name: agent_name},'url_name','name').then(function(data){
			console.log(data);
			$window.location.href = 'agents/' + data.url_name;
		})
	}
	$scope.markApplication = function(application,index){
		for (var i = $scope.campaign.applications.length - 1; i >= 0; i--) {
			if($scope.campaign.applications[i].agent_name == application.agent_name){
				$scope.campaign.applications[i].seen = true;
				break;
			}
		};
		Campaign.update({
			applications: $scope.campaign.applications
		},$scope.campaign._id).then(function(data){
			$scope.applications.splice(index,1);
		})
	}
	$scope.updateNotification = function(c){
		Client.update({
			notifications:true,
			campaign: $scope.campaign._id
		},'me').then(function(data){
			console.log(data);
			$scope.last_check = new Date(data.last_check);
			(c||angular.noop)();
		});
	};
	$scope.anyNotifications = function(){
		if(!$scope.applications || $scope.applications.length>0) return true;
		console.log($scope.applications);
		return JSON.stringify($scope.notifications)==JSON.stringify({}) ? false : true;
	}
	$scope.getDay = function(value){
		var date = new Date(parseInt(value));
		var result = $scope.days[date.getDay()] + " " + $scope.months[date.getMonth()] + " " + date.getDate();
		return result;
	};
	$scope.arrangeNotifications = function(c){
		$scope.notifications = {};
		$scope.applications = [];
		for (var i = $scope.campaign.requested_slots.length - 1; i >= 0; i--) {
			var slot = $scope.campaign.requested_slots[i];
			// if(slot.time.valueOf() < $scope.now) continue;
			var day = slot.time.valueOf() - slot.time.valueOf() % $scope.day;
			if(!$scope.notifications[slot.agent_name])
				$scope.notifications[slot.agent_name] = {};
			if(!$scope.notifications[slot.agent_name][day])
				$scope.notifications[slot.agent_name][day] = [];
			if(slot.status && !(slot.status == ""))
				$scope.notifications[slot.agent_name][day].push({time: slot.time, created: slot.created, status: slot.status});
			else
				$scope.notifications[slot.agent_name][day].push({time: slot.time, created: slot.created});
		};
		for (var i = $scope.campaign.applications.length - 1; i >= 0; i--) {
			var application = $scope.campaign.applications[i];
			if(application.seen == false)
				$scope.applications.push(application);
		};
		(c||angular.noop)();
	};
	$scope.approveAll = function(agent_name){
		var k = [];
		for (var i = $scope.campaign.requested_slots.length - 1; i >= 0; i--) {
			if($scope.campaign.requested_slots[i].time.valueOf() < $scope.now) continue;
			if(!($scope.campaign.requested_slots[i].agent_name==agent_name)) continue;
			$scope.campaign.requested_slots[i].status = 'Approved';
			k.push(i);
		};
		$scope.arrangeNotifications();
		var changed = false, found;
		for (var i = k.length - 1; i >= 0; i--) {
			Campaign.request($scope.campaign._id,$scope.campaign.requested_slots[k[i]]._id,'approve',$scope.campaign.requested_slots[k[i]].agent);
			found = false;
			for (var l = $scope.campaign.allocated_slots.length - 1; l >= 0; l--) {
				if($scope.campaign.allocated_slots[l].agent.toString() == $scope.campaign.requested_slots[k[i]].agent.toString()
					&& $scope.campaign.allocated_slots[l].time.valueOf() == $scope.campaign.requested_slots[k[i]].time.valueOf()) {
					found = true;
					break;
				}
			};
			if(!found){
				changed = true;
				$scope.campaign.allocated_slots.push({
					agent: $scope.campaign.requested_slots[k[i]].agent,
					agent_name: $scope.campaign.requested_slots[k[i]].agent_name,
					time: $scope.campaign.requested_slots[k[i]].time,
					created: new Date()
				});
			}
		};
		if(changed){
			Campaign.update({
				allocated_slots: $scope.campaign.allocated_slots
			},$scope.campaign._id).then(function(data){
				$scope.campaign.allocated_slots = data.allocated_slots;
			});
		}
	}
	$scope.approve = function(agent_name,time){
		var k;
		for (var i = $scope.campaign.requested_slots.length - 1; i >= 0; i--) {
			if(!($scope.campaign.requested_slots[i].agent_name==agent_name)) continue;
			if(!($scope.campaign.requested_slots[i].time.valueOf()==time.valueOf())) continue;
			$scope.campaign.requested_slots[i].status = 'Approved';
			k = i;
			break;
		};
		$scope.arrangeNotifications();
		Campaign.request($scope.campaign._id,$scope.campaign.requested_slots[k]._id,'approve',$scope.campaign.requested_slots[k].agent);
		var found = false;
		for (var l = $scope.campaign.allocated_slots.length - 1; l >= 0; l--) {
			if($scope.campaign.allocated_slots[l].agent.toString() == $scope.campaign.requested_slots[k].agent.toString()
				&& $scope.campaign.allocated_slots[l].time.valueOf() == $scope.campaign.requested_slots[k].time.valueOf()) {
				found = true;
				break;
			}
		};
		if(!found){
			$scope.campaign.allocated_slots.push({
				agent: $scope.campaign.requested_slots[k].agent,
				agent_name: $scope.campaign.requested_slots[k].agent_name,
				time: $scope.campaign.requested_slots[k].time,
				created: new Date()
			});
			Campaign.update({
				allocated_slots: $scope.campaign.allocated_slots
			},$scope.campaign._id).then(function(data){
				$scope.campaign.allocated_slots = data.allocated_slots;
			})
		}
	}
	$scope.undo = function(agent_name,time){
		var k;
		for (var i = $scope.campaign.requested_slots.length - 1; i >= 0; i--) {
			if(!($scope.campaign.requested_slots[i].agent_name==agent_name)) continue;
			if(!($scope.campaign.requested_slots[i].time.valueOf()==time.valueOf())) continue;
			$scope.campaign.requested_slots[i].status = '';
			k = i;
			break;
		};
		$scope.arrangeNotifications();
		Campaign.request($scope.campaign._id,$scope.campaign.requested_slots[k]._id,'undo',$scope.campaign.requested_slots[k].agent);
		for (var i = $scope.campaign.allocated_slots.length - 1; i >= 0; i--) {
			if(!($scope.campaign.allocated_slots[i].time.valueOf() == $scope.campaign.requested_slots[k].time.valueOf()))
				continue;
			if(!($scope.campaign.allocated_slots[i].agent.toString() == $scope.campaign.requested_slots[k].agent.toString()))
				continue;
			$scope.campaign.allocated_slots.splice(i,1);
			break;
		};
		Campaign.update({allocated_slots: $scope.campaign.allocated_slots},$scope.campaign._id).then(function(data){
			$scope.campaign.allocated_slots = data.allocated_slots;
		})
	}
	$scope.declineAll = function(agent_name){
		var k = [];
		for (var i = $scope.campaign.requested_slots.length - 1; i >= 0; i--) {
			if($scope.campaign.requested_slots[i].time.valueOf() < $scope.now) continue;
			if(!($scope.campaign.requested_slots[i].agent_name==agent_name)) continue;
			$scope.campaign.requested_slots[i].status = 'Declined';
			k.push(i);
		};
		$scope.arrangeNotifications();
		var changed = false, found, index
		for (var i = k.length - 1; i >= 0; i--) {
			Campaign.request($scope.campaign._id,$scope.campaign.requested_slots[k[i]]._id,'decline',$scope.campaign.requested_slots[k[i]].agent);
			found = false;
			index = -1;
			for (var l = $scope.campaign.allocated_slots.length - 1; l >= 0; l--) {
				if($scope.campaign.allocated_slots[l].agent.toString() == $scope.campaign.requested_slots[k[i]].agent.toString()
					&& $scope.campaign.allocated_slots[l].time.valueOf() == $scope.campaign.requested_slots[k[i]].time.valueOf()) {
					found = true;
					index = l
					break;
				}
			};
			if(found){
				changed = true;
				$scope.campaign.allocated_slots.splice(index,1);
			}
		};
		if(changed){
			Campaign.update({
				allocated_slots: $scope.campaign.allocated_slots
			},$scope.campaign._id).then(function(data){
				$scope.campaign.allocated_slots = data.allocated_slots;
			});
		}
	}
	$scope.decline = function(agent_name, time){
		var k;
		for (var i = $scope.campaign.requested_slots.length - 1; i >= 0; i--) {
			if(!($scope.campaign.requested_slots[i].agent_name==agent_name)) continue;
			if(!($scope.campaign.requested_slots[i].time.valueOf()==time.valueOf())) continue;
			$scope.campaign.requested_slots[i].status = 'Declined';
			k = i;
			break;
		};
		$scope.arrangeNotifications();
		Campaign.request($scope.campaign._id,$scope.campaign.requested_slots[k]._id,'decline',$scope.campaign.requested_slots[k].agent);
	}
	$scope.init = function(){
		$scope.getCampaign(function(){
			$scope.arrangeNotifications(function(){
				$scope.updateNotification();
			});
		})
	};
})