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
			for(var i = 0; i < scope.clientLeads.length; i++){
				scope.clientLeads[i].created = new Date(scope.clientLeads[i].created);
			}
			console.log(data);
		});

		scope.showRecording = function(url){
			if(url==""){
				console.log("No recording");
			}else{
				window.location.href = url;
			}
		}
	}]);