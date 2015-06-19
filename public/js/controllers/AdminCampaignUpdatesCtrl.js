angular.module('AdminCampaignUpdatesCtrl',[]).controller('AdminCampaignUpdatesController',['$scope','$sessionStorage','$http','socket',function(scope,session,http,socket){

	scope.initialData = function(type){
		http({
			method:'GET',
			url:'api/'+type
		}).success(function(data){
			scope.add_numbers_list[type] = data;
		});
	};

	scope.initialData('client');

	this.chooseClient = function(client_id){
		this.client_id = client_id;
		this.clientChosen = true;
	}

	scope.addUpdate = function(client_id){
		socket.emit('admin:addCampaignUpdate',{
			'authorization':session.token,
			'update':scope.campaignUpdate,
			'client':client_id
		});
		scope.campaignUpdate = "";
	}

}]);