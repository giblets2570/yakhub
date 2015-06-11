/**
* AddNumbersCtrl Module
*
* Description
*/
angular.module('AddNumbersCtrl', []).controller('AddNumbersController', ['$scope','$http', function(scope,http){
	scope.jsonNumbers = "";
	scope.add_numbers_list = {};
	this.client_id = null;
	this.clientChosen = false;


	scope.isJsonString = function(str){
	    try {
	        JSON.parse(str);
	    } catch (e) {
	        return false;
	    }
	    return true;
	};

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

	scope.add = function(client_id){
		if(scope.isJsonString(scope.jsonNumbers)){
			var json = JSON.parse(scope.jsonNumbers);
			http({
				method: 'POST',
				url: 'api/phoneNumbers',
				data: {'numbers':json,'number_client_id': client_id}
			}).success(function(data){
				console.log(data.message);
				scope.showInfo("Numbers added successfully!");
				scope.jsonNumbers = "";
			});
		}else{
			scope.showAlert("Not a valid json object!");
		}
	}
}]);