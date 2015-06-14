/**
* Ctrl Module
*
* Description
*/
angular.module('ClientLeadsCtrl', [])
	.controller('ClientLeadsController', ['$scope','$sessionStorage','socket', function(scope,session,socket){
		scope.clientLeads = [];

		socket.emit('client:getLeads',{
			'authorization':session.token
		});

		socket.on('client:leadsData',function(data){
			scope.clientLeads = data;
			console.log(data);
		});
	}]);