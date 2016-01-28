/**
* profileApp Module
*
* Description
* This is the module for the agent profile page. Here is where the client can see the agent and their pervious
* work, and then invite them to join their campaign.
*/
angular.module('agentProfileApp', ['navbarApp','ngSanitize','ngAnimate','mgcrea.ngStrap'])

.controller('agentProfileCtrl', function($scope,$location,$window,Campaign,Agent){
	// This function gets the agent data based on which agent's name
	// is in the url. This way, we can share urls.
	$scope.getAgentData = function(){
		var params = $location.path().split('/');
		var agent_url_name = params[params.length-1];
		Agent.url_agent(agent_url_name).then(function(data){
			$scope.agent = data;
			console.log($scope.agent.campaigns);
			for (var i = $scope.agent.campaigns.length - 1; i >= 0; i--) {
				if($scope.agent.campaigns[i].date_started)
					$scope.agent.campaigns[i].date_started = new Date($scope.agent.campaigns[i].date_started)
				if($scope.agent.campaigns[i].date_ended)
					$scope.agent.campaigns[i].date_ended = new Date($scope.agent.campaigns[i].date_ended)
			}
			$scope.getCampaigns();
		})
	}
	// This function assigns the current agent to one of your campaigns.
	// This means that the agent can now request time from the campaign.
	$scope.assignCampaign = function(campaign){
		for (var i = $scope.agent.campaigns.length - 1; i >= 0; i--) {
			if($scope.agent.campaigns[i].campaign == campaign._id){
				alert("Already part of this campaign");
				return
			}
		};
		// Update the agent on the client side, then push the changes to the server.
		$scope.agent.campaigns.push({
			campaign: campaign._id,
			campaign_name: campaign.name,
			client: campaign.client,
			client_name: campaign.client_name,
			date_started: new Date()
		})
		Agent.update({
			campaigns: $scope.agent.campaigns
		},$scope.agent._id).then(function(data){
		});
		// Updates the campaign on the client side, then pushes to the server.
		campaign.agents.push({
			agent: $scope.agent._id,
    		agent_name: $scope.agent.name,
    		cost_per_hour: $scope.agent.price
		});
		Campaign.update({
			agents: campaign.agents
		}, campaign._id).then(function(data){
		})
	}
	// Get's all the campaign's for the client user.
	$scope.getCampaigns = function(){
		Campaign.get({}, 'name url_name allocated_slots agents client_name client').then(function(data){
			$scope.campaigns = data;
			$scope.getCampaignStats();
		})
	};
	// Finds the availability of the agent
	$scope.findAvailability = function(agent){
		if(!agent || !agent.available) return 0;
		var array = agent.availabilities;
		var total = 0;
		if(!array) return total;
		for (var i = array.length - 1; i >= 0; i--)
			total += array[i]
		return total;
	}
	// Arranges the campaign data to determine the hours that the agent has done on each campaign.
	$scope.getCampaignStats = function(){
		$scope.allocations = {}
		$scope.total = 0;
		for (var i = $scope.campaigns.length - 1; i >= 0; i--) {
			var c = $scope.campaigns[i];
			$scope.allocations[c._id] = 0;
			for (var j = c.allocated_slots.length - 1; j >= 0; j--){
				if(c.allocated_slots[j].agent.toString() != $scope.agent._id.toString())
					continue;
				$scope.allocations[c._id]++;
			}
		}
		console.log($scope.allocations);
	}
	$scope.hoursWorked = function(input){
		return input ? input : '0';
	}
	// Gets the correct class of stars for the rating.
	$scope.star = function(rating, value){
		if(!rating) return '';
		return (rating >= value) ? 'glyphicon glyphicon-star' :  'glyphicon glyphicon-star-empty';
	}
	// Function that returns the range of dates that the agent
	// has worked on a campaign.
	$scope.getRange = function(campaign){
		if(!campaign) return '';
		var result = campaign.date_started.getDate() + '/' + (campaign.date_started.getMonth()+1) +'/' +campaign.date_started.getFullYear()
		if(campaign.date_ended)
			result+=' - ' + campaign.date_ended.getDate() + '/' + (campaign.date_ended.getMonth()+1) +'/' +campaign.date_ended.getFullYear()
	}
	// Function to navigate to the messages tab and starts a conversation with these agent.
	$scope.sendMessage = function(){
		$window.location.href = '/c/c/messages?agent='+$scope.agent._id
	}
	$scope.formatDate = function(date){
		if(!date) return "";
		date = new Date(date);
		return date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear();
	}
	$scope.getAgentData();
});