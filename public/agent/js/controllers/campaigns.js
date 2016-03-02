/**
* appControllers Module
*
* Description
*/

app.controller('campaignsCtrl', ['$scope','$state','Campaign','Alert','Lead','Agent',function($scope,$state,Campaign,Alert,Lead,Agent){
	$scope.getNumLeads = function(campaign){
		Lead.count(campaign._id).then(function(data){
			campaign.num_leads = data.num_leads;
		})
	}
	$scope.getCampaigns = function(){
		Campaign.get().then(function(data){
			$scope.campaigns = data.campaigns;
			$scope.other_campaigns = data.other_campaigns;
			for (var i = $scope.campaigns.length - 1; i >= 0; i--) {
				$scope.getNumLeads($scope.campaigns[i]);
			};
		});
	}
	$scope.now = (new Date()).valueOf();
	$scope.day = 1000*60*60*24;
	$scope.getCampaigns();
	$scope.go_campaign = function(campaign_id){
		$state.go('home.dialer',{campaign_id: campaign_id})
	}
	$scope.go_other = function(campaign_id){
		$state.go('home.brief',{campaign_id: campaign_id})
	}
	$scope.numDays = function(campaign){
		var end = (new Date(campaign.end_date)).valueOf();
		return Math.max(0,Math.floor((end-$scope.now)/$scope.day));
	}
	$scope.getAgentData = function(c){
		Agent.me({calls: true, month: true}).then(function(data){
			$scope.earned = data.earned;
			if(c)
				c();
		})
	}
	$scope.getAgentPay = function(campaign){
		if(!$scope.user) return 0;
		for (var i = campaign.agents.length - 1; i >= 0; i--) {
			if(campaign.agents[i].agent.toString() == $scope.user._id.toString()){
				return campaign.agents[i].pay/100;
			};
		};
		return 0
	}
	$scope.getAgentData();
}])