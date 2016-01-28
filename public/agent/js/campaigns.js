/**
* campaignsApp Module
*
* Description
*/
angular.module('campaignsApp', ['navbarApp'])

.controller('campaignsCtrl', function($scope,$window,Campaign){
	$scope.getCampaigns = function(){
		Campaign.get({browse: true},'name url_name background website objective agents').then(function(data){
			console.log(data);
			$scope.campaigns = data;
		})
	}
	$scope.seeCampaign = function(campaign){
		$window.location.href = '/campaigns/'+campaign.url_name;
	}
	$scope.getCampaigns();
});