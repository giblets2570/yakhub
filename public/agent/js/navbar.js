/**
* navbarApp Module
*
* Description the main navbar module.
*/
angular.module('navbarApp', ['app.services','navbarSubApp'])

.config(function($locationProvider) {
  $locationProvider.html5Mode(true);
})

.controller('navbarCtrl',function($scope,$location,$window,$http,Agent){
	// Navigates to different parts of the site.
	$scope.go = function(type){
		var params = $location.path().split('/');
		var l = 5;
		if(type=='schedule' || type=='profile' || type=='messages' || type=='notifications')
			l--;
		var path = params[0];
		for (var i = 1; i < l - 1; i++) {
			params[i]=='agents' || params[i]=='campaigns' ? path = path + '/a'  : path = path + '/' + params[i];
		};
		path = path + '/' + type;
		$window.location.href = path;
	}
	// Returns the user to the dashboard. The backend will determine the correct route.
	$scope.home = function() {
		$window.location.href = '/a/a/a/dialer';
	};
	// Function that navigates to the profile of the agent.
	$scope.profile = function() {
		var params = $location.path().split('/');
		var agent_name = params[2];
		$window.location.href = '/agents/'+agent_name;
	};
	// Navigates to the agent browsing section of the app.
	$scope.browse = function() {
		$window.location.href = '/agents';
	};
	$scope.browseCampaigns = function() {
		$window.location.href = '/campaigns';
	}
	// Logs out of the app, and returns to the login screen.
	$scope.logout = function(){
		$http.get('/auth/logout');
		$window.location.href = '/';
	}
});