/**
* appControllers Module
*
* Description
*/

app.controller('briefCtrl', ['$scope','$state','Agent','Alert','$stateParams','$location','Campaign','Lead','Call','Message',function($scope,$state,Agent,Alert,$stateParams,$location,Campaign,Lead,Call,Message){
	$scope.campaign_id = $stateParams.campaign_id;
	$scope.hour = 3600000;
	$scope.three_minutes = 180000;
	$scope.last_earning = 0;
	$scope.show_contact_info = false;
	$scope.day_mapper = {
		'mon':'Monday',
		'tues':'Tuesday',
		'wed':'Wednesday',
		'thurs':'Thursday',
		'fri':'Friday',
		'sat':'Saturday',
		'sun':'Sunday'
	}
	var pusher = new Pusher('9d60e889329cae081239', {
      encrypted: true
    });
	var channel = pusher.subscribe('updates_channel');
	$scope.now = (new Date()).valueOf();
	// Function that changes the stats page
	$scope.changePage = function(page){
		$scope.page = page;
		$location.search('page',page);
	}
	// Turns the chosen page header blue
	$scope.getPageStyle = function(page){
		return $scope.page == page ? 'color:black; font-weight: bold;': 'color:black; font-weight: normal;';
	}
	// Gets the campaign data.
	$scope.getCampaign = function(c){
		Campaign.show({},'-available_slots -requested_slots -agents',$scope.campaign_id).then(function(data){
			$scope.campaign = data;
			console.log($scope.campaign)
			c();
		});
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
    // Function that is called when page loaded.
	$scope.init = function(){
		$scope.page = "info";
		var params = $location.search();
		if(params.page)
			$scope.page = params.page;
		$scope.getAgentData(function(){
			$scope.getCampaign(function(){
				$scope.getMessages();
				channel.bind($scope.campaign_id, function(data) {
					data.message.time = new Date(data.message.time);
					$scope.messages.push(data.message);
					$scope.changePage('updates');
					$scope.$apply();
			      	alert("New update from the campaign owner:", data.message.text);
			    });
			});
		});
	};
	// Get's the agent data for the current agent and campaign.
	$scope.getAgentData = function(c){
		Agent.me({calls: true, campaign_id: $scope.campaign_id}).then(function(data){
			$scope.agent = data.agent;
			$scope.earned = data.earned;
			$scope.last_earning = data.last_earning;
			c();
		})
	}
	$scope.getMessages = function(){
		Message.get({campaign_id: $scope.campaign._id}).then(function(data){
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
	$scope.getDays = function(){
		var result = '';
		if(!$scope.campaign) return "";
		for(var key in $scope.campaign.days){
			if($scope.campaign.days[key]){
				if(!result){
					result+=$scope.day_mapper[key]
				}else{
					result=$scope.day_mapper[key]+", "+result
				}
			}
		}
		return result;
	}
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
		if(!input) return "Not given";
		return input.getDate() + "/" + (input.getMonth()+ 1) + "/" + input.getFullYear()
	}
});