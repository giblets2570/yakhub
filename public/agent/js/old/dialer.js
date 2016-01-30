// *
// * dialerApp Module
// *
// * Description the dialer module controls the dialing component of the app.

angular.module('dialerApp', ['navbarApp','ngSanitize','ngAnimate','mgcrea.ngStrap','chart.js'])

.controller('dialerCtrl', function($scope,$location,$modal,Campaign,Call,Lead,Agent){
	$scope.hour = 3600000;
	$scope.three_minutes = 180000;
	// The text that dsplays on the call button
	$scope.call_button_text = 'Setting up';
	// True if you can get the previous call data.
	$scope.showPrevious = false;
	// True if the current lead has been called
	$scope.called = false;

	$scope.now = (new Date()).valueOf();
	// Function to retreive the previous call data.
	$scope.previous = function(){
		if($scope.called) return;
		$scope.called = true;
		$scope.showPrevious = false;
		Call.previous().then(function(data){
			$scope.lead = data.lead_info;
			$scope.call = data;
		});
	}
	// Function that skips the current lead
	$scope.skip = function(){
		if($scope.called) return;
		Lead.skip().then(function(data){
			$scope.lead = data;
			$scope.initialize_call();
		})
	}
	// Initializes the custom number data.
	$scope.initialize_custom = function(){
		$scope.custom = {
			person: {
				name: '',
				role: ''
			},
			number: '',
			company: ''
		}
	}
	$scope.initialize_custom();
	// function that initialises the data for the current call.
	$scope.initialize_call = function(){
		$scope.called = false;
		$scope.call = {
			rating: 0,
			contact_info: {
				number: '',
				company: '',
				email: '',
				person: {
					name: '',
					role: ''
				},
			},
			answers:[],
			notes:'',
			send_follow_up: false,
			outcome: 'No answer'
		};
		for (var i = 0; i < $scope.campaign.questions.length; i++) {
			$scope.call.answers.push({
				'question':$scope.campaign.questions[i].question
			})
		};
	}
	// Function that changes the stats page
	$scope.changePage = function(page){
		$scope.page = page;
		$location.search('page',page);
	}
	// Turns the chosen page header blue
	$scope.getPageStyle = function(page){
		return $scope.page == page ? 'color:blue;': '';
	}
	// Gets the campaign data.
	$scope.getCampaign = function(c){
		Campaign.show({},'-available_slots -requested_slots -agents','mine').then(function(data){
			$scope.campaign = data;
			$scope.initialize_call();
			c();
		});
	};
	// Gets the next lead for the campaign.
	$scope.getNextLead = function(){
		Lead.next().then(function(data){
			$scope.lead = data;
			$scope.initialize_call();
		})
	};
	$scope.stats = {};
	$scope.stats.range = '86400000';
	$scope.stats.chart = {
		labels: ['Dials','Pickups','0 stars','1 star','2 stars','3 stars'],
		series: ['Call stats'],
		data: [[0,0,0,0,0,0]]
	}
	$scope.findAllocated = function(time){
		if(!time) time = $scope.stats.range;
		$scope.stats.allocated = 0;
		$scope.stats.left = 0;
		var time_left = 0;
		for (var i = $scope.campaign.allocated_slots.length - 1; i >= 0; i--) {
			if($scope.campaign.allocated_slots[i].agent.toString() != $scope.agent._id.toString() || $scope.campaign.allocated_slots[i].time <= $scope.now - time) continue
			$scope.stats.allocated++;
			if($scope.campaign.allocated_slots[i].time.valueOf() < $scope.now.valueOf() && $scope.campaign.allocated_slots[i].time.valueOf()+$scope.hour > $scope.now)
				time_left += ($scope.campaign.allocated_slots[i].time.valueOf()+$scope.hour - $scope.now)
			else if($scope.campaign.allocated_slots[i].time.valueOf() > $scope.now.valueOf())
				time_left += $scope.hour
		};
		$scope.stats.left = time_left / $scope.hour;
	}
	$scope.getCalls = function(c){
		Call.get({campaign: true, sorted: true},'created duration rating outcome').then(function(data){
			$scope.calls = data;
			for (var i = $scope.calls.length - 1; i >= 0; i--)
				$scope.calls[i].created = new Date($scope.calls[i].created);
			c();
		})
	}
	$scope.getCallStats = function(time){
		if(!time) time = $scope.stats.range;
		$scope.stats.chart.data = [[0,0,0,0,0,0]];
		$scope.number_of_calls = 0;
		var total_time = 0;
		for (var i = 1; i <= $scope.calls.length; i++) {
			if($scope.calls[i-1].created.valueOf() < $scope.now - time) continue;
			$scope.stats.chart.data[0][0]++;
			if($scope.calls[i-1].outcome != 'No answer') $scope.stats.chart.data[0][1]++;
			$scope.stats.chart.data[0][2 + $scope.calls[i-1].rating]++;
			$scope.number_of_calls++;
			if(!$scope.calls[i])
				total_time += $scope.calls[i-1].duration*1000+$scope.three_minutes
			else if($scope.calls[i-1].created.valueOf()+$scope.calls[i-1].duration*1000+$scope.three_minutes>$scope.calls[i].created.valueOf())
				total_time += ($scope.calls[i].created.valueOf() - $scope.calls[i-1].created.valueOf())
			else
				total_time += $scope.calls[i-1].duration*1000+$scope.three_minutes
		}
		$scope.hours_complete = (total_time/(60000))/60;
	}
	$scope.callsPerHour = function(number_of_calls,hours_complete){
		return hours_complete == 0 ? 0 : number_of_calls/hours_complete;
	}
	$scope.changeRange = function(){
		var time = parseInt($scope.stats.range);
		$scope.findAllocated(time);
		$scope.getCallStats(time);
	}
	// Function that makes the phone call using twilio
	$scope.makeCall = function(){
		if(!$scope.lead||$scope.called||$scope.call_button_text!='Call') return;
		$scope.called = true;
		$scope.call_button_text = 'Connecting...';
		Twilio.Device.connect({
			lead: $scope.lead,
			agent: $scope.agent._id,
			campaign: $scope.campaign._id
		});
	}
	// Submits the call data and gets the next number.
	$scope.submitThenNextNumber = function(){
		if(!$scope.called) return;
		if($scope.call.outcome=='Call later' && !$scope.made_call_back){
			return;
		}
		Call.addCallData($scope.call).then(function(data){
			var call = data.call;
			$scope.calls.push({
				created: new Date(call.created),
				duration: call.duration,
				_id: call._id,
				rating: call.rating,
				outcome: call.outcome
			});
			$scope.getNextLead();
			$scope.getCallStats();
			$scope.showPrevious = true;
			$scope.made_call_back = false;
		})
	};
	$scope.call_back = {
		person: {}
	}
	$scope.call_back_checker = JSON.stringify({
		person: {}
	});
	var callBackModal = $modal({scope: $scope, templateUrl: '../../../agent/views/templates/call-back-modal.html', show: false});
	$scope.showCallBackModal = function() {
		$scope.call_back = {
			person: {}
		}
		callBackModal.$promise.then(callBackModal.show);
	};
	$scope.changeOutcome = function(){
		console.log($scope.call.outcome);
		if($scope.call.outcome == 'Call later')
			$scope.showCallBackModal();
	}
	$scope.makeCallback = function(){
		Lead.makeCallBack($scope.call_back).then(function(data){
			console.log(data);
			$scope.made_call_back = true;
		})
	}
	// Function that creates the custom number to call and makes it the current lead
	// for the agent. Need to do phone number regex.
	$scope.useCustomNumber = function(){
		if($scope.called) return;
		if($scope.custom.number.substring(0,4) != "0044")
			$scope.custom.number = "0044"+$scope.custom.number.substring(1,15)
		Lead.custom($scope.custom).then(function(data){
			$scope.lead = data;
			$scope.initialize_custom();
			$scope.initialize_call();
		});
	}
	// Hangs up the twilio stuff
	$scope.hangUp = function() {
		Twilio.Device.disconnectAll();
    }
    // Function that is called when page loaded.
	$scope.init = function(){
		$scope.page = "info";
		var params = $location.search();
		if(params.page)
			$scope.page = params.page;
		$scope.getAgentData(function(){
			$scope.getCampaign(function(){
				$scope.setupTwilio();
				$scope.getNextLead();
				$scope.findAllocated();
			});
			$scope.getCalls(function(){
				$scope.getCallStats();
			});
		});
	};
	// Get's the agent data for the current agent.
	$scope.getAgentData = function(c){
		Agent.me().then(function(data){
			$scope.agent = data;
			c();
		})
	}
	// Set's up the twilio informaiton for the agent. If the agent is not scheduled
	// to call at this time on this campaign, the server returns a 406 error.
	$scope.setupTwilio = function(){
		Agent.twilio({campaign: $scope.campaign._id}).then(function(data){
			$scope.call_button_text = 'Loading...';
			if(data.token){
				Twilio.Device.setup(data.token);
			}else{
				$scope.call_button_text = 'Error';
				alert(data.message);
			}
		},function(error){
			$scope.call_button_text = 'Error';
			alert('Error, are you scheduled for this time?');
		})
	}
	// Returns the correct star class based on the rating and value of star.
	$scope.star = function(rating, value){
		return ((rating >= value) ? 'glyphicon glyphicon-star' : 'glyphicon glyphicon-star-empty');
	}
	// Function that does the star rating.
	$scope.rateCall = function(num){
		$scope.call.rating = num;
	}
	//Twilio javascript
    Twilio.Device.ready(function (device) {
        $scope.call_button_text = 'Call';
        $scope.$apply();
    });

    Twilio.Device.error(function (error) {
    	$scope.call_button_text = error;
        $scope.$apply();
    });

    Twilio.Device.connect(function (conn) {
    	$scope.call_button_text = 'Connected';
        $scope.$apply();
    });

    Twilio.Device.disconnect(function (conn) {
    	$scope.call_button_text = 'Call';
    });
});