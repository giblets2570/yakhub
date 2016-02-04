/**
* appControllers Module
*
* Description
*/

app.controller('dialerCtrl', ['$scope','$state','Agent','Alert','$stateParams','$location','Campaign','Lead','Call','Message',function($scope,$state,Agent,Alert,$stateParams,$location,Campaign,Lead,Call,Message){
	$scope.campaign_id = $stateParams.campaign_id;
	$scope.hour = 3600000;
	$scope.three_minutes = 180000;
	$scope.last_earning = 0;
	// The text that dsplays on the call button
	$scope.call_button_text = 'Setting up';
	// True if you can get the previous call data.
	$scope.showPrevious = false;
	// True if the current lead has been called
	$scope.called = false;
	var pusher = new Pusher('9d60e889329cae081239', {
      encrypted: true
    });
	var channel = pusher.subscribe('updates_channel');
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
		Campaign.show({},'-available_slots -requested_slots -agents',$scope.campaign_id).then(function(data){
			console.log(data);
			$scope.campaign = data;
			$scope.initialize_call();
			c();
		});
	};
	// Gets the next lead for the campaign.
	$scope.getNextLead = function(){
		Lead.next({campaign_id: $scope.campaign_id}).then(function(data){
			$scope.lead = data;
			$scope.initialize_call();
		})
	};
	$scope.getCalls = function(c){
		Call.get({campaign: true, sorted: true},'created duration rating outcome').then(function(data){
			$scope.calls = data;
			for (var i = $scope.calls.length - 1; i >= 0; i--)
				$scope.calls[i].created = new Date($scope.calls[i].created);
			c();
		})
	}
	$scope.callsPerHour = function(number_of_calls,hours_complete){
		return hours_complete == 0 ? 0 : number_of_calls/hours_complete;
	}
	$scope.changeRange = function(){
		var time = parseInt($scope.stats.range);
		// $scope.findAllocated(time);
		// $scope.getCallStats(time);
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
		console.log('Submitting number');
		if(!$scope.called) return;
		Call.addCallData($scope.call).then(function(data){
			var call = data.call;
			$scope.last_earning = call.duration*$scope.agent.pay/60;
			$scope.earned+=$scope.last_earning;
			$scope.getNextLead();
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
	$scope.changeOutcome = function(){
		console.log($scope.call.outcome);
		// if($scope.call.outcome == 'Call later')
		// 	$scope.showCallBackModal();
	}
	// Function that creates the custom number to call and makes it the current lead
	// for the agent. Need to do phone number regex.
	$scope.useCustomNumber = function(){
		if($scope.called) return;
		if($scope.custom.number.substring(0,4) != "0044")
			$scope.custom.number = "0044"+$scope.custom.number.substring(1,15)
		Lead.custom($scope.custom,{campaign_id: $scope.campaign_id}).then(function(data){
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
		Twilio.Device.disconnectAll();
		var params = $location.search();
		if(params.page)
			$scope.page = params.page;
		console.log(1);
		$scope.getAgentData(function(){
			console.log(2);
			$scope.getCampaign(function(){
				console.log(3);
				$scope.setupTwilio();
				$scope.getNextLead();
				$scope.getMessages();
				channel.bind($scope.campaign_id, function(data) {
					data.message.time = new Date(data.message.time);
					console.log($scope.messages, data.message);
					console.log('get message',data);
					$scope.messages.push(data.message);
					$scope.changePage('updates');
					$scope.$apply();
			      	alert("New update from the campaign owner:", data.message.text);
			    });
			});
			$scope.getCalls(function(){
				console.log(4);
			});
		});
	};
	// Get's the agent data for the current agent.
	$scope.getAgentData = function(c){
		Agent.me({calls: true}).then(function(data){
			$scope.agent = data.agent;
			$scope.earned = data.earned;
			$scope.last_earning = data.last_earning;
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
	$scope.getMessages = function(){
		Message.get({campaign_id: $scope.campaign._id}).then(function(data){
			console.log(data);
			$scope.messages = data.messages;
			for (var i = $scope.messages.length - 1; i >= 0; i--) {
				$scope.messages[i].time = new Date($scope.messages[i].time);
			};
		})
	}
	// Returns the correct star class based on the rating and value of star.
	$scope.star = function(rating, value){
		return ((rating >= value) ? 'glyphicon glyphicon-star' : 'glyphicon glyphicon-star-empty');
	}
	// Function that does the star rating.
	$scope.rateCall = function(num){
		$scope.call.rating==1 && num==1 ? $scope.call.rating = 0 : $scope.call.rating = num;
	}
	//Twilio javascript
    Twilio.Device.ready(function (device) {
    	console.log('ready');
        $scope.call_button_text = 'Call';
        $scope.$apply();
    });

    Twilio.Device.error(function (error) {
    	$scope.call_button_text = error;
        $scope.$apply();
    });

    Twilio.Device.connect(function (conn) {
    	$scope.call_button_text = 'Connected';
    	console.log("Connected");
        $scope.$apply();
    });

    Twilio.Device.disconnect(function (conn) {
    	console.log("Disconnected");
    	$scope.call_button_text = 'Call';
    });
    $scope.init();
}])

.filter('formatTime', function(){
	return function(input){
		if(!input) return "";
		return input.getHours() + ":" + input.getMinutes()
	}
})

.filter('formatDate', function(){
	return function(input){
		if(!input) return "";
		return input.getDate() + "/" + (input.getMonth()+ 1) + "/" + input.getFullYear()
	}
});