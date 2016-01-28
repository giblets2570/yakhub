/**
* navbarApp Module
*
* Description
*/
angular.module('navbarApp', ['app.services','navbarSubApp','ngAnimate', 'ngSanitize','mgcrea.ngStrap'])

.config(function($locationProvider) {
  $locationProvider.html5Mode(true);
})

.controller('navbarCtrl',function($scope,$location,$window,$http,$modal,Campaign){
	$scope.current_campaign = null;
	$scope.modal = {};
	$scope.getCampaigns = function(){
		Campaign.get({current:true}, 'name url_name').then(function(data){
			$scope.campaigns = data.campaigns;
			$scope.current_campaign = data.campaign;
			if($scope.init)
				$scope.init();
		});
	};
	var newCampaignModal = $modal({scope: $scope, templateUrl: '../../../client/views/templates/new-campaign-modal.html', show: false});
	$scope.showNewCampaignModal = function() {
		newCampaignModal.$promise.then(newCampaignModal.show);
	};
	$scope.modal.makeNewCampaign = function(){
		Campaign.create({name: $scope.modal.newCampaignName}).then(function(data){
			$scope.change(data._id);
		})
	}
	$scope.logout = function(){
		$http.get('/auth/logout');
		$window.location.href = '/';
	}
	$scope.browse = function() {
		$window.location.href = '/agents';
	};
	$scope.home = function() {
		$window.location.href = '/c/c/c/dashboard';
	};
	$scope.go = function(type){
		var params = $location.path().split('/');
		var l = 5;
		if(type=='profile' || type=='messages')
			l--;
		var path = params[0];
		for (var i = 1; i < l - 1; i++) {
			params[i]=='agents' ? path = path + '/c'  : path = path + '/' + params[i];
		};
		path = path + '/' + type;
		$window.location.href = path;
	}
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
});