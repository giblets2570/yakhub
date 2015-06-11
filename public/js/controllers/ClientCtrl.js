/**
* ClientCtrl Module
*
* Description
*/
angular.module('ClientCtrl', []).
	
	controller('ClientController', ['$scope','$sessionController', function(scope,session){
		this.logout = function(){
			session.$reset();
			location.path('login');
		}
	}]);