angular.module('AgentCampaignUpdatesCtrl',[]).controller('AgentCampaignUpdatesController',['$scope','$sessionStorage','$http','socket',function(scope,session,http,socket){

	scope.agentCampaignUpdates = [];

	socket.emit('agent:getCampaignUpdates',{
		'autorization':session.token
	});

	var getUpdates = function(){
		socket.emit('agent:getCampaignUpdates',{
			'authorization':session.token
		});
	}

	getUpdates();

	socket.on('agent:campaignUpdates',function(data){
		scope.agentCampaignUpdates = data;
		console.log(data);
		scope.showInfo("Received campaign updates!");
	});

	socket.on('agent:newUpdates',function(){
		console.log("Here");
		getUpdates();
	});

}]);