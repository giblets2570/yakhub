/**
* scheduleApp Module
*
* Description
*/
angular.module('scheduleApp', ['navbarApp','ngAnimate', 'ngSanitize','mgcrea.ngStrap'])

.controller('scheduleCtrl', function($scope,$location,$filter,$modal,Agent,Campaign,Client){
	// Unix started on a Thursday
	$scope.now = (new Date()).valueOf();
	$scope.hour = 3600000;
	$scope.day = $scope.hour*24;
	$scope.week = $scope.day*7;
	$scope.dateWeek = new Array(7);
	$scope.days=['Mon','Tues','Wed','Thurs','Fri','Sat','Sun'];
	$scope.months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	$scope.snapshot={
		range:'86400000',
		available: 0,
		allocated: 0,
		complete:0
	};
	$scope.filter={
		agent:'',
		date: {
			start: null
		}
	}
	$scope.needsNotifications = function(){
		$scope.notifications = false
		Client.me({},'notifications').then(function(data){
			for (var i = data.notifications.length - 1; i >= 0; i--) {
				if(!data.notifications[i].seen_all){
					$scope.notifications = true;
				}
			};
		})
	}
	$scope.needsNotifications();
	$scope.modal = {
		editOne: function(time,slots){
			var broken_up = {allocations: [],available: slots.length};
			for (var i = 0; i < slots.length; i++) {
				if(slots[i]!="Unallocated")
					broken_up.allocations.push(slots[i])
			}
			$scope.modal.edit = broken_up;
			$scope.modal.edit.time = time;
			$scope.showScheduleEditModal();
		},
		deallocateOne: function(time, name){
			if(time < $scope.now){
				console.log("This hour is already over");
				return;
			}
			for (var i = 0; i < $scope.campaign.allocated_slots.length; i++) {
				if($scope.campaign.allocated_slots[i].time != time.valueOf()) continue;
				if($scope.campaign.allocated_slots[i].agent_name != name) continue;
				$scope.campaign.allocated_slots.splice(i,1);
			};
			Campaign.update({
				allocated_slots: $scope.campaign.allocated_slots
			},'mine').then(function(data){
				for (var i = 0; i < $scope.modal.edit.allocations.length; i++) {
					if($scope.modal.edit.allocations[i]==name)
						$scope.modal.edit.allocations.splice(i,1);
				};
				$scope.getShownSlots();
			})
		},
		deleteOne: function(time){
			if(time < $scope.now){
				console.log("This hour is already over");
				return;
			}
			if(!confirm("Are you sure?")) return;
			for (var i = 0; i < $scope.campaign.available_slots.length; i++) {
				if($scope.campaign.available_slots[i].time != time.valueOf()) continue;
				$scope.campaign.available_slots.splice(i,1);
			};
			for (var i = 0; i < $scope.campaign.allocated_slots.length; i++) {
				if($scope.campaign.allocated_slots[i].time != time.valueOf()) continue;
				$scope.campaign.allocated_slots.splice(i,1);
			};
			Campaign.update({
				allocated_slots: $scope.campaign.allocated_slots,
				available_slots: $scope.campaign.available_slots
			},'mine').then(function(data){
				$scope.getShownSlots();
			})
		},
		saveEdit: function(time, num){
			// The number of allowed agents cannot be less than 1
			if(num < 1){
				console.log('Number cannot be less than 1');
				return;
			}
			console.log(num)
			var number_allocated = 0;
			for (var i = 0; i < $scope.campaign.allocated_slots.length; i++) {
				if($scope.campaign.allocated_slots[i].time != time.valueOf()) continue;
				number_allocated+=1;
			};
			// If the number of allocated agents in this slot is greater than then
			// new value for number of agents, then you cannot make this change
			// without deallocating agents first.
			if(number_allocated>num){
				console.log('Deallocate agents from this timeslot first');
				return;
			}
			for (var i = 0; i < $scope.campaign.available_slots.length; i++) {
				if($scope.campaign.available_slots[i].time != time.valueOf()) continue;
				$scope.campaign.available_slots[i].num_agents = num;
			};
			Campaign.update({
				available_slots: $scope.campaign.available_slots
			},'mine').then(function(data){
				$scope.modal.edit.available=num;
				$scope.getShownSlots();
			});
		},
		addSlot: function(){
			$scope.showAddSlotModal();
		},
		saveAddSlot: function(time){
			var num_agents = parseInt($scope.modal.addNumAgents);
			var start_time = parseInt($scope.modal.addStart);
			var num_hours = parseInt($scope.modal.addNumHours);
			if(isNaN(num_agents) || num_agents<=0) return;
			if(isNaN(num_hours) || num_hours<=0) return;
			time = time.valueOf()
			var today = time - time%$scope.day;
			var start = (new Date(today+start_time*$scope.hour)).valueOf()
			var result = [];
			for (var i = 0; i < num_hours; i++) {
				result.push(start+$scope.hour*i);
			};
			for (var i = 0; i < result.length; i++) {
				var already = false;
				// If the time is in the past, you cannt make this timeslot available
				if(result[i]<=$scope.now){
					// already = true;
				// If the timeslot already exists, then you cant add again.
				}else{
					for (var j = $scope.campaign.available_slots.length - 1; j >= 0; j--) {
						if($scope.campaign.available_slots[j].time==result[i]){
							already = true;
							break;
						}
					};
				}
				if(!already){
					$scope.campaign.available_slots.push({
						num_agents: num_agents,
						time: result[i]
					})
				}
			};
			Campaign.update({
				available_slots: $scope.campaign.available_slots
			},'mine').then(function(data){
				console.log(data);
				$scope.getShownSlots();
			});
		},
		deallocateAll: function(time){
			time = time.valueOf()
			var today = time - time%$scope.day;
			if(!confirm("Are you sure?")) return;
			for (var i = $scope.campaign.allocated_slots.length-1; i >= 0; i--) {
				if(!($scope.campaign.allocated_slots[i].time >= today && $scope.campaign.allocated_slots[i].time < today+$scope.day)) continue;
				// If the current timeslot underway, then we cannot deallocate it.
				if($scope.campaign.allocated_slots[i].time < $scope.now) continue;
				$scope.campaign.allocated_slots.splice(i,1);
			};
			Campaign.update({
				allocated_slots: $scope.campaign.allocated_slots
			},'mine').then(function(data){
				$scope.getShownSlots();
			});
		},
		deleteAll: function(time){
			time = time.valueOf()
			var today = time - time%$scope.day;
			if(!confirm("Are you sure?")) return;
			for (var i = $scope.campaign.available_slots.length-1; i >= 0; i--) {
				if(!($scope.campaign.available_slots[i].time >= today && $scope.campaign.available_slots[i].time < today+$scope.day)) continue;
				// If the current timeslot underway, then we cannot deallocate it.
				if($scope.campaign.available_slots[i].time < $scope.now) continue;
				$scope.campaign.available_slots.splice(i,1);
			};
			for (var i = $scope.campaign.allocated_slots.length-1; i >= 0; i--) {
				if(!($scope.campaign.allocated_slots[i].time >= today && $scope.campaign.allocated_slots[i].time < today+$scope.day)) continue;
				// If the current timeslot underway, then we cannot delete it.
				if($scope.campaign.allocated_slots[i].time < $scope.now) continue;
				$scope.campaign.allocated_slots.splice(i,1);
			};
			Campaign.update({
				allocated_slots: $scope.campaign.allocated_slots,
				available_slots: $scope.campaign.available_slots
			},'mine').then(function(data){
				$scope.getShownSlots();
			});
		}
	}
	var scheduleModal = $modal({scope: $scope, templateUrl: '../../../client/views/templates/schedule-popover.html', show: false});
	$scope.showScheduleModal = function(index) {
		$scope.modal.index = index;
		$scope.getModalSlots(index);
		scheduleModal.$promise.then(scheduleModal.show);
	};
	var scheduleEditModal = $modal({scope: $scope, templateUrl: '../../../client/views/templates/schedule-edit-popover.html', show: false});
	$scope.showScheduleEditModal = function() {
		scheduleEditModal.$promise.then(scheduleEditModal.show);
	};
	var addSlotModal = $modal({scope: $scope, templateUrl: '../../../client/views/templates/schedule-add-slot-popover.html', show: false});
	$scope.showAddSlotModal = function() {
		addSlotModal.$promise.then(addSlotModal.show);
	};
	$scope.getAgents = function(){
		Agent.get().then(function(data){
			$scope.agents = data;
		});
	};
	$scope.init = function(){
		var params = $location.search();
		if(params.agent)
			$scope.filter.agent = params.agent;
		if(params.start)
			$scope.filter.date.start = new Date(parseInt(params.start))
		else{
			var today = $scope.now - $scope.now % $scope.day;
			today -= (parseInt(($scope.now%$scope.week)/$scope.day)+3)%7*$scope.day;
			$scope.filter.date.start = new Date(today);
		}
		$scope.getDateWeek($scope.filter.date.start);
		$scope.getAgents();
		$scope.getCampaignStats();
	}
	$scope.getCampaignStats = function(){
		Campaign.show({},'available_slots allocated_slots requested_slots','mine').then(function(data){
			$scope.snapshot.available = 0;
			$scope.campaign = data;
			for (var i = $scope.campaign.available_slots.length - 1; i >= 0; i--) {
				$scope.campaign.available_slots[i].time = (new Date($scope.campaign.available_slots[i].time)).valueOf();
				$scope.snapshot.available += $scope.campaign.available_slots[i].num_agents;
			};
			for (var i = $scope.campaign.allocated_slots.length - 1; i >= 0; i--) {
				$scope.campaign.allocated_slots[i].time = (new Date($scope.campaign.allocated_slots[i].time)).valueOf();
			};
			for (var i = $scope.campaign.requested_slots.length - 1; i >= 0; i--) {
				$scope.campaign.requested_slots[i].time = (new Date($scope.campaign.requested_slots[i].time)).valueOf();
			};
			$scope.setRange();
			$scope.getShownSlots();
		});
	};
	$scope.getDateWeek = function(start){
		var result = [start];
		for (var i = 1; i < 7; i++) {
			result.push(new Date(start.valueOf()+$scope.day*i))
		};
		$scope.dateWeek = result;
	}
	$scope.getAmount = function(a){
		result = 0;
		for (var i = 0; i < a.length; i++) {
			result += a[i].number;
		};
		return result;
	}
	$scope.getTotal = function(input,meridian){
		var allocated = 0;
		var unallocated = 0;
		if(!input) return allocated;
		if(!meridian || meridian=='AM'){
			for (var key in input.AM) {
			  if (input.AM.hasOwnProperty(key)) {
			    if(key == 'Unallocated') unallocated+=$scope.getAmount(input.AM[key]);
			  	else allocated+=$scope.getAmount(input.AM[key]);
			  }
			}
		}
		if(!meridian || meridian=='PM'){
			for (var key in input.PM) {
			  if (input.PM.hasOwnProperty(key)) {
			  	if(key == 'Unallocated') unallocated+=$scope.getAmount(input.PM[key]);
			  	else allocated+=$scope.getAmount(input.PM[key]);
			  }
			}
		}
		var output = allocated + " hours";
		if(unallocated > 0)
			output += " + " + unallocated + " Unallocated hours";
		return output;
	};
	$scope.getNames = function(names){
		var num = 0;
		var result = "";
		for (var i = 0; i < names.length; i++) {
			if(names[i]=="Unallocated"){
				num++;
				continue;
			}
			result += names[i]+', '
		};
		if(num>0)
			result += "Unallocated x"+num.toString()
		return result;
	}
	$scope.getModalSlots = function(index){
		var slots = {};
		for(var k in $scope.shownSlots[index]){
			if($scope.shownSlots[index].hasOwnProperty(k)){
				for(var z in $scope.shownSlots[index][k]){
					if($scope.shownSlots[index][k].hasOwnProperty(z)){
						for (var l = $scope.shownSlots[index][k][z].length - 1; l >= 0; l--) {
							if(!slots[$scope.shownSlots[index][k][z][l].time.valueOf()]) slots[$scope.shownSlots[index][k][z][l].time.valueOf()] = [];
							for (var y = 0; y < $scope.shownSlots[index][k][z][l].number; y++) {
								slots[$scope.shownSlots[index][k][z][l].time.valueOf()].push(z);
							};
						};
					}
				}
			}
		}
		var result = {
			AM:[],
			PM:[]
		};
		for(var key in slots){
			if(slots.hasOwnProperty(key)){
				var time = new Date(parseInt(key))
				if(time.valueOf()%$scope.day < 13*$scope.hour)
					result.AM.push({time: new Date(parseInt(key)),allocated: slots[key]})
				else
					result.PM.push({time: new Date(parseInt(key)),allocated: slots[key]})
			}
		}
		$scope.modalSlots = result;
	}
	$scope.getShownSlots = function(){
		var result = new Array(7);
		for (var i = 0; i < 7; i++) {
			result[i] = {
				PM: {},
				AM: {}
			}
		};
		// Get's the allocated slots
		for (var i = $scope.campaign.allocated_slots.length - 1; i >= 0; i--) {
			if($scope.filter.agent && $scope.filter.agent != $scope.campaign.allocated_slots[i].agent_name)
				continue
			if(!($scope.campaign.allocated_slots[i].time >= $scope.filter.date.start.valueOf() && $scope.campaign.allocated_slots[i].time < $scope.filter.date.start.valueOf()+$scope.week))
				continue
			var day = ((new Date($scope.campaign.allocated_slots[i].time)).getDay()+6)%7;
			if($scope.campaign.allocated_slots[i].time%$scope.day < 13*$scope.hour){
				if(result[day].AM[$scope.campaign.allocated_slots[i].agent_name])
					result[day].AM[$scope.campaign.allocated_slots[i].agent_name].push({time: new Date($scope.campaign.allocated_slots[i].time), number: 1})
				else
					result[day].AM[$scope.campaign.allocated_slots[i].agent_name]=[{time: new Date($scope.campaign.allocated_slots[i].time), number: 1}]
			}else{
				if(result[day].PM[$scope.campaign.allocated_slots[i].agent_name])
					result[day].PM[$scope.campaign.allocated_slots[i].agent_name].push({time: new Date($scope.campaign.allocated_slots[i].time), number: 1})
				else
					result[day].PM[$scope.campaign.allocated_slots[i].agent_name]=[{time: new Date($scope.campaign.allocated_slots[i].time), number: 1}]
			}
		};
		// Get's the available slots
		if(!$scope.filter.agent){
			for (var i = $scope.campaign.available_slots.length - 1; i >= 0; i--) {
			if(!($scope.campaign.available_slots[i].time >= $scope.filter.date.start.valueOf() && $scope.campaign.available_slots[i].time < $scope.filter.date.start.valueOf()+$scope.week))
				continue
			var day = ((new Date($scope.campaign.available_slots[i].time)).getDay()+6)%7;
			if($scope.campaign.available_slots[i].time%$scope.day < 13*$scope.hour){
				var j = $scope.campaign.available_slots[i].num_agents;
				for (var key in result[day].AM) {
					if(key=="Unallocated")continue;
				  if (result[day].AM.hasOwnProperty(key)) {
				    for (var k = result[day].AM[key].length - 1; k >= 0; k--) {
				    	if(result[day].AM[key][k].time.valueOf()==$scope.campaign.available_slots[i].time) j--
				    };
				  }
				}
				if(j > 0) {
					if(!result[day].AM['Unallocated'])result[day].AM['Unallocated']=[]
					result[day].AM['Unallocated'].push({time: new Date($scope.campaign.available_slots[i].time), number: j});
				}
			}else{
				var j = $scope.campaign.available_slots[i].num_agents;
				for (var key in result[day].PM) {
					if(key=="Unallocated")continue;
				  if (result[day].PM.hasOwnProperty(key)) {
				    for (var k = result[day].PM[key].length - 1; k >= 0; k--) {
				    	if(result[day].PM[key][k].time.valueOf()==$scope.campaign.available_slots[i].time) j--
				    };
				  }
				}
				if(j > 0) {
					if(!result[day].PM['Unallocated'])result[day].PM['Unallocated']=[]
					result[day].PM['Unallocated'].push({time: new Date($scope.campaign.available_slots[i].time), number: j});
				}
			}
		};
		}
		$scope.shownSlots = result;
		if($scope.modal.index)
			$scope.getModalSlots($scope.modal.index);
	}
	$scope.changeAgent = function(){
		!$scope.filter.agent ? $location.search("agent",null) : $location.search("agent",$scope.filter.agent)
		$scope.getShownSlots();
	}
	$scope.setRange =function(){
		var time = parseInt($scope.snapshot.range);
		$scope.snapshot.allocated = 0;
		$scope.snapshot.complete = 0;
		$scope.snapshot.available = 0;
		for (var i = $scope.campaign.available_slots.length - 1; i >= 0; i--) {
			if($scope.campaign.available_slots[i].time > $scope.now - time){
				$scope.snapshot.available += $scope.campaign.available_slots[i].num_agents;
			}
		};
		for (var i = $scope.campaign.allocated_slots.length - 1; i >= 0; i--) {
			if($scope.campaign.allocated_slots[i].time > $scope.now - time){
				$scope.snapshot.allocated++;
				if($scope.campaign.allocated_slots[i].time+$scope.hour-1 < $scope.now) $scope.snapshot.complete++;
			}
		};
	}
	$scope.changeDate = function(dir){
		$scope.filter.date.start = new Date($scope.filter.date.start.valueOf() + dir*$scope.week);
		$scope.getDateWeek($scope.filter.date.start);
		$scope.getShownSlots();
		$location.search("start",$scope.filter.date.start.valueOf())
	}
});