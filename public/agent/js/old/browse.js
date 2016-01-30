/**
* browseApp Module
*
* Description
*/
angular.module('browseApp', ['navbarApp'])

.controller('browseCtrl', function($scope,$window,Agent){
	$scope.getAgents = function(){
		Agent.get({},'number_reviews rating name url_name campaigns price availabilities about_me skills location').then(function(data){
			$scope.agents = data;
		});
	}
	$scope.seeProfile = function(agent){
		$window.location.href = '/agents/'+agent.url_name;
	}
	$scope.getAgents();
});