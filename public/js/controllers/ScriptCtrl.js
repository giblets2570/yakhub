/**
* StatsCtrl Module
*
* Description
*/
angular.module('ScriptCtrl', [])
	.controller('ScriptController', ['$scope','$http','$sessionStorage','socket', function(scope,http,session,socket){
		console.log("Hello");
	}]);