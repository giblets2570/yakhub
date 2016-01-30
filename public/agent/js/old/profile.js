/**
* profileApp Module
*
* Description
* The module for the profile of the agent.
*/
angular.module('profileApp', ['navbarApp','ngSanitize','ngAnimate','mgcrea.ngStrap'])

.controller('profileCtrl', function($scope,$location,$modal,Campaign,Agent){
	var helpModal = $modal({scope: $scope, templateUrl: '../../../agent/views/templates/profile-help-modal.html', show: false});
	$scope.showHelpModal = function() {
		helpModal.$promise.then(helpModal.show);
	};
	// Get's the agent data for the agent that is currently being viewed, not the user agent.
	$scope.getAgentData = function(){
		var params = $location.path().split('/');
		var agent_url_name = params[params.length-1];
		Agent.url_agent(agent_url_name).then(function(data){
			$scope.agent = data;
			for (var i = $scope.agent.campaigns.length - 1; i >= 0; i--) {
				if($scope.agent.campaigns[i].date_started)
					$scope.agent.campaigns[i].date_started = new Date($scope.agent.campaigns[i].date_started)
				if($scope.agent.campaigns[i].date_ended)
					$scope.agent.campaigns[i].date_ended = new Date($scope.agent.campaigns[i].date_ended)
			}
			if(!$scope.agent.location && !$scope.agent.about_me && $scope.agent.skills.length==0){$scope.showHelpModal();}
			$scope.getCampaigns();
		})
	}
	$scope.addSkill = function(){
		$scope.adding_skill = !$scope.adding_skill;
	}
	$scope.saveSkill = function(newSkill){
		$scope.adding_skill = !$scope.adding_skill;
		$scope.agent.skills.push(newSkill);
		Agent.update({
			skills: $scope.agent.skills
		},$scope.agent._id).then(function(data){
		});
	}
	$scope.removeSkill = function(index){
		$scope.agent.skills.splice(index,1);
		Agent.update({
			skills: $scope.agent.skills
		},$scope.agent._id).then(function(data){
		});
	}
	// Get's the campaign data for the given agent. At the moment this is wrong, I will have to fix it.
	$scope.getCampaigns = function(){
		Campaign.get({}, 'name url_name allocated_slots agents client_name').then(function(data){
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
	// Get's the stats for the agent for a particular campaign.
	// The main stat is the number of allocations that the
	// user has.
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
	}
	// Returns the corrent class for a star based on rating and the individual star value.
	$scope.star = function(rating, value){
		if(rating == undefined || rating == null) return '';
		return ((rating >= value) ? 'glyphicon glyphicon-star' :  'glyphicon glyphicon-star-empty');
	}
	// Get's the range of dates that the agent has been on a campaign.
	$scope.getRange = function(campaign){
		if(!campaign) return '';
		var result = campaign.date_started.getDate() + '/' + (campaign.date_started.getMonth()+1) +'/' +campaign.date_started.getFullYear()
		if(campaign.date_ended)
			result+=' - ' + campaign.date_ended.getDate() + '/' + (campaign.date_ended.getMonth()+1) +'/' +campaign.date_ended.getFullYear()
	}
	///////////////////////
	//	These functions are all is the current agent is the same as viewed agent.
	///////////////////////
	// Toggles the job description edit.
	$scope.editJob = function(campaign){
		campaign.edit_job = !campaign.edit_job;
	}
	// Saves the edits that were made to the job description.
	$scope.saveJob = function(campaign){
		campaign.edit_job = !campaign.edit_job;
		Agent.update({
			campaigns: $scope.agent.campaigns
		},$scope.agent._id).then(function(data){
		})
	}
	// Toggles the editing for the location of the agent.
	$scope.editLocation = function(){
		$scope.edit_location = !$scope.edit_location;
	}
	// Saves the location.
	$scope.saveLocation = function(){
		$scope.edit_location = !$scope.edit_location;
		Agent.update({
			location: $scope.agent.location
		},$scope.agent._id).then(function(data){
		})
	}
	// Toggles the edit price for the agent.
	$scope.editPrice = function(){
		$scope.edit_price = !$scope.edit_price;
	}
	// Saves the edited price.
	$scope.savePrice = function(){
		$scope.edit_price = !$scope.edit_price;
		Agent.update({
			price: $scope.agent.price
		},$scope.agent._id).then(function(data){
		})
	}
	$scope.hoursWorked = function(input){
		return input ? input : '0';
	}
	// Toggles the editing for the about me sections.
	$scope.editAboutMe = function(){
		$scope.edit_about_me = !$scope.edit_about_me;
	}
	// Saves the about me updates.
	$scope.saveAboutMe = function(){
		$scope.edit_about_me = !$scope.edit_about_me;
		Agent.update({
			about_me: $scope.agent.about_me
		},$scope.agent._id).then(function(data){
		})
	}
	$scope.formatDate = function(date){
		if(!date) return '';
		date = new Date(date);
		return date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear();
	}
	$scope.getAgentData();
});