/**
* appControllers Module
*
* Description
*/

app.controller('campaignsCtrl', ['$scope','$state','Campaign','Alert','Agent',function($scope,$state,Campaign,Alert,Agent){
	$scope.getAgents = function(){
		Agent.get({},'name').then(function(data){
			console.log(data);
			$scope.agents = data;
		})
	}
	$scope.getAgents();
	$scope.old_fees = {};
	$scope.getCampaigns = function(){
		Campaign.get().then(function(data){
			$scope.campaigns = data;
		})
	}
	$scope.editFee = function(campaign){
		campaign.editing_fee=!campaign.editing_fee;
		$scope.old_fees[campaign._id] = campaign.fee;
	}
	$scope.cancelFee = function(campaign){
		campaign.editing_fee=!campaign.editing_fee;
		campaign.fee = $scope.old_fees[campaign._id];
	}
	$scope.saveFee = function(campaign){
		campaign.editing_fee=!campaign.editing_fee;
		Campaign.update({fee: campaign.fee},campaign._id);
	}
	$scope.getCampaigns();
	$scope.getMinsCalled = function(agent){
		return agent.loaded ? agent.mins_dialed: "Not loaded";
	}
	$scope.getDials = function(agent){
		return agent.loaded ? agent.total_dials: "Not loaded";
	}
	$scope.getLastDial = function(agent){
		return agent.loaded ? agent.last_dial.toTimeString().substring(0,5)+", "+agent.last_dial.toDateString() : "Not loaded";
	}
	$scope.addAgent = function(agent,campaign){
		campaign.agents.push({
			agent: agent._id,
			agent_name: agent.name,
			active: true
		});
		Campaign.update({agents: campaign.agents},campaign._id);
	}
	$scope.loadCampaign = function(campaign){
		for (var i = campaign.agents.length - 1; i >= 0; i--) {
			$scope.loadAgent(campaign.agents[i],campaign);
		};
	}
	$scope.loadAgent = function(agent,campaign){
		Agent.show({stats: true, campaign_id: campaign._id},'',agent.agent).then(function(data){
			agent.loaded = true;
			agent.mins_dialed = Math.floor(data.total_duration/60);
			agent.total_dials = data.total_dials;
			agent.last_dial = new Date(data.last_dial);
		});
	}
	$scope.removeAgent = function($index,campaign){
		campaign.agents.splice($index,1);
		Campaign.update({agents: campaign.agents},campaign._id);
	}
	$scope.added = function(campaign,agent){
		for (var i = campaign.agents.length - 1; i >= 0; i--) {
			if(campaign.agents[i].agent.toString() == agent._id.toString())
				return true;
		};
		return false;
	}
	$scope.chooseCampaign = function(campaign){
		$scope.current_campaign = campaign;
	}
}]);