/**
* appControllers Module
*
* Description
*/

app.controller('campaignsCtrl', ['$scope','$state','Campaign','Alert',function($scope,$state,Campaign,Alert){
	// $scope.getCampaigns = function(){
	// 	Campaign.get().then(function(data){
	// 		console.log(data);
	// 		$scope.campaigns = data;
	// 	})
	// }
	// $scope.getCampaigns();
	// $scope.go = function(campaign_id){
	// 	$state.go('home.dialer',{campaign_id: campaign_id})
	// }
}])