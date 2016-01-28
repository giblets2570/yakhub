'use strict';
/**
* agentApp Module
*
* Description
* This module is for a campaign's agents. Here, we can rate, comment on, add and remove agents
* to a campaign.
*/
angular.module('agentApp', ['navbarApp','ngAnimate', 'ngSanitize','mgcrea.ngStrap'])

.controller('agentCtrl', function($scope,$modal,Agent,Campaign){
	// Set up some constants
	$scope.hour = 3600000;
	$scope.now = (new Date()).valueOf();
	// Get's all agents from this campaign. {campaign: true} means we get all the agents on this campaign.
	// There is a callback function as a parameter
	$scope.getAgents = function(c){
		Agent.get({campaign:true},'name rating number_reviews campaigns').then(function(data){
			$scope.agents = data;
			c();
		});
	};
	// This function separates the agents into the agents that are actively on a campaign, and those
	// that were on the campaign previously
	$scope.separateAgents = function(){
		$scope.non_agents = [];
		for (var i = $scope.agents.length - 1; i >= 0; i--) {
			for (var j = $scope.agents[i].campaigns.length - 1; j >= 0; j--) {
				if($scope.agents[i].campaigns[j].campaign.toString() == $scope.campaign._id.toString()){
					if((new Date($scope.agents[i].campaigns[j].date_ended)).valueOf() < $scope.now){
						$scope.non_agents.push($scope.agents[i])
						$scope.agents.splice(i, 1);
						break;
					}
				}
			};
		};
	};
	// Function to get the current campaigns stats. Callback as one of the parameters.
	$scope.getCampaign = function(c){
		Campaign.show({},'available_slots allocated_slots requested_slots','mine').then(function(data){
			$scope.campaign = data;
			c();
		})
	};
	// Returns the correct star class based on the rating and which star it is.
	$scope.star = function(rating, value){
		return ((rating >= value) ? 'glyphicon glyphicon-star' : 'glyphicon glyphicon-star-empty');
	}
	// Used to rate the agents. Then ties it up with the backend.
	$scope.rateStars = function(agent,num){
		$scope.agent_reviews[agent.name].rating = num;
		Agent.rate({
			rating: $scope.agent_reviews[agent.name].rating
		},agent._id).then(function(data){
		})
	}
	// Function used to save the testimonial part of the rating.
	$scope.testimonial = {
		save: function(agent,text){
			$scope.agent_reviews[agent.name].text = text;
			Agent.rate({
				text: $scope.agent_reviews[agent.name].text
			},agent._id).then(function(data){
			})
		}
	}
	// Modal for the testmonial
	var testimodal = $modal({scope: $scope, templateUrl: '../../../client/views/templates/agent-testimonial-modal.html', show: false});
	// Function that shows the testimonial modal, with the agent as a parameter.
	$scope.showTestimodal = function(agent) {
		$scope.testimonial.agent = agent;
		$scope.testimonial.text = $scope.agent_reviews[agent.name].text;
		testimodal.$promise.then(testimodal.show);
	};
	// Removes an agent from a campaign. First asks whether the user is sure.
	$scope.removeAgent = function(agent){
		if(!confirm("Are you sure?")) return;
		var k = -1;
		for (var i = $scope.agents.length - 1; i >= 0; i--) {
			if($scope.agents[i]._id.toString() == agent._id){
				k = i;
				break;
			}
		}
		// If found the agent, then it is removed from the active agents and
		// put as a unactive agent
		if(k>-1){
			var agent = $scope.agents[k];
			agent.dates.end = new Date();
			$scope.non_agents.push(agent);
			$scope.agents.splice(k,1);
			Agent.active({
				campaign:$scope.campaign._id,
				active: false,
				date_ended: agent.dates.end
			},agent._id).then(function(data){
				console.log(data);
			})
		}
	}
	// Adds a previously unactive agent to the campaign.
	$scope.addAgent = function(agent){
		if(!confirm("Are you sure?")) return;
		var k = -1;
		for (var i = $scope.non_agents.length - 1; i >= 0; i--) {
			if($scope.non_agents[i]._id.toString() == agent._id){
				k = i;
				break;
			}
		}
		// If the agent is in the previously active category, then
		// the agent will be taken from the unactive and put in the
		// active agents.
		if(k>-1){
			var agent = $scope.non_agents[k];
			agent.dates.end = null;
			$scope.agents.push(agent);
			$scope.non_agents.splice(k,1);
			Agent.active({
				campaign:$scope.campaign._id,
				active: true
			},agent._id).then(function(data){
				console.log(data);
			})
		}
	}

	// Function that gets called once the page is ready.
	$scope.init = function(){
		$scope.getCampaign(function(){
			$scope.getAgents(function(){
				var now = (new Date()).valueOf();
				var agent_allocations = {};
				$scope.agent_reviews = {};
				var campaign_dates = {};
				// Loop that goes through each of the agents and formats the data for the page
				for (var i = $scope.agents.length - 1; i >= 0; i--) {
					agent_allocations[$scope.agents[i].name] = {
						allocated: 0,
						done: 0
					};
					for (var j = $scope.agents[i].campaigns.length - 1; j >= 0; j--) {
						if($scope.agents[i].campaigns[j].campaign.toString() == $scope.campaign._id.toString()){
							campaign_dates[$scope.agents[i].name] = {
								start: new Date($scope.agents[i].campaigns[j].date_started)
							}
							if($scope.agents[i].campaigns[j].date_ended)
								campaign_dates[$scope.agents[i].name].date_ended = new Date($scope.agents[i].campaigns[j].date_ended);
							$scope.agent_reviews[$scope.agents[i].name] = $scope.agents[i].campaigns[j].review;
						}
					};
					campaign_dates[$scope.agents[i].name]
					if(!$scope.agent_reviews[$scope.agents[i].name])
						$scope.agent_reviews[$scope.agents[i].name] = {rating: 0, text: ''}
				};
				// Loop that determines which allocated slots are done
				for (var i = $scope.campaign.allocated_slots.length - 1; i >= 0; i--) {
					agent_allocations[$scope.campaign.allocated_slots[i].agent_name].allocated++;
					if($scope.campaign.allocated_slots[i].time.valueOf()+$scope.hour <= $scope.now)
						agent_allocations[$scope.campaign.allocated_slots[i].agent_name].done++;
				};
				// Formatting again
				for (var i = $scope.agents.length - 1; i >= 0; i--) {
					$scope.agents[i].allocations = agent_allocations[$scope.agents[i].name];
					$scope.agents[i].dates = campaign_dates[$scope.agents[i].name];
				};
				$scope.separateAgents();
			});
		});
	}
})