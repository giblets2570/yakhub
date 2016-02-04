/**
* appControllers Module
*
* Description
*/

app.controller('campaignsCtrl', ['$scope','$state','Campaign','Alert','Lead',function($scope,$state,Campaign,Alert,Lead){
	$scope.getNumLeads = function(campaign){
		Lead.count(campaign._id).then(function(data){
			campaign.num_leads = data.num_leads;
		})
	}
	$scope.getCampaigns = function(){
		Campaign.get().then(function(data){
			$scope.campaigns = data;
			for (var i = $scope.campaigns.length - 1; i >= 0; i--) {
				$scope.getNumLeads($scope.campaigns[i]);
			};
		});
	}
	$scope.now = (new Date()).valueOf();
	$scope.day = 1000*60*60*24;
	$scope.getCampaigns();
	$scope.go = function(campaign_id){
		$state.go('home.dialer',{campaign_id: campaign_id})
	}
	$scope.numDays = function(campaign){
		var end = (new Date(campaign.end_date)).valueOf();
		return Math.max(0,Math.floor((end-$scope.now)/$scope.day));
	}
}])