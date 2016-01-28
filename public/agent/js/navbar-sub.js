/**
* navbarSubApp Module
*
* Description this module controls the behaviour of the sub navbar.
*/
angular.module('navbarSubApp', [])

.controller('navbarSubCtrl', function($scope,$location,$window,Campaign){
	// Function that navigates to different parts of the site.
	$scope.go = function(type){
		var params = $location.path().split('/');
		console.log(params);
		var path = params[0];
		for (var i = 1; i < params.length - 1; i++) {
			path = path + '/' + params[i];
		};
		path = path + '/' + type;
		$window.location.href = path;
	}
	// This part gets the name of the campaigns, so we can toggle through
	// them in the select component.
	$scope.current_campaign = null;
	$scope.getCampaigns = function(){
		Campaign.get({current:true}, 'name url_name').then(function(data){
			$scope.campaigns = data.campaigns;
			$scope.current_campaign = data.campaign;
			$scope.init();
		})
	};
	// When the agent changes the current campaign, this function fires,
	// resulting in a navigation to a different page.
	$scope.change = function(new_campaign_id){
		Campaign.change(new_campaign_id).then(function(data){
			if(data=='0')
				return
			var pathArray = $window.location.pathname.split('/');
			var path = pathArray[0];
			for (var i = 1; i < pathArray.length; i++) {
				path = (i != 3 ? path + '/'+ pathArray[i] : path + '/'+ data.campaign);
			};
			$window.location.href = path;
		});
	};
	$scope.getCampaigns();
})