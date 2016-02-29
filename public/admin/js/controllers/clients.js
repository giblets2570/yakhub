/**
* appControllers Module
*
* Description
*/

app.controller('clientsCtrl', ['$scope','$state','Client','Alert','$stateParams',function($scope,$state,Client,Alert,$stateParams){
	$scope.getClients = function(){
		Client.get({},'name').then(function(data){
			$scope.clients = data;
		})
	}
	$scope.getClients();
}]);