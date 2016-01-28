/**
* appControllers Module
*
* Description
*/

app.controller('dashboardCtrl', ['$scope','$state','$stateParams','Client','Campaign',function($scope,$state,$stateParams,Client,Campaign){
	$scope.current_campaign = $stateParams.campaign_id;
	$scope.getCampaigns = function(){
		Campaign.get().then(function(data){
			$scope.campaigns = data;
		})
	}
	$scope.getCampaign = function(){
		Campaign.show({},'',$scope.current_campaign).then(function(data){
			$scope.campaign = data;
		})
	}
	$scope.getCampaigns();
	$scope.getCampaign();
	$scope.chosenTab = function(tab){
		return tab == $scope.current_tab ? 'chosen' : '';
	}
	$scope.changeTab = function(tab){
		$scope.current_tab = tab;
		$state.go('home.dashboard.'+tab,{campaign_id: $stateParams.campaign_id})
	}
	$scope.changeCampaign = function(newCampaign){
		$state.go($state.current.name,{campaign_id: newCampaign});
	}
}])