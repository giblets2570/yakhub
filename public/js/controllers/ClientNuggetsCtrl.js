/**
* Ctrl Module
*
* Description
*/
angular.module('ClientNuggetsCtrl', [])
	.controller('ClientNuggetsController', ['$scope','$sessionStorage','socket', function(scope,session,socket){
		scope.clientNuggets = [];

		socket.emit('client:getNuggets',{
			'authorization':session.token
		});

		socket.on('client:nuggetsData',function(data){
			scope.clientNuggets = data;
			console.log(data);
		});
	}]);