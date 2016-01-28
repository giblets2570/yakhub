/**
* browseApp Module
*
* Description
*/
angular.module('browseApp', ['navbarApp'])

.controller('browseCtrl', function($scope,Agent){
	$scope.getAgents = function(){
		Agent.get({},'number_reviews rating url_name name campaigns price availabilities about_me skills location').then(function(data){
			$scope.agents = data;
		});
	}
	$scope.seeProfile = function(agent){
		$window.location.href = '/agents/'+agent.url_name;
	}
	$scope.getAgents();
});