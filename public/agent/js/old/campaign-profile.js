/**
* campaignProfileApp Module
*
* Description
*/
angular.module('campaignProfileApp', ['navbarApp'])

.controller('campaignProfileCtrl', function($scope,$location,Campaign){
	$scope.applied = false;
	$scope.getCampaignData = function(){
		var params = $location.path().split('/');
		$scope.campaign_url_name = params[params.length-1];
		Campaign.url_campaign({url_name: $scope.campaign_url_name},'-available_slots -requested_slots -allocated_slots -contact_info').then(function(data){
			$scope.campaign = data;
		})
	}
	$scope.getCampaignData();

	$scope.apply = function(){
		if(!confirm('Do you want to apply to this campaign?'))
			return;
		Campaign.apply({url_name: $scope.campaign_url_name}).then(function(data){
			console.log(data);
			$scope.applied = true;
		});
	}
})