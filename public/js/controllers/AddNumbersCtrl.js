/**
* AddNumbersCtrl Module
*
* Description
*/
angular.module('AddNumbersCtrl', []).controller('AddNumbersController', ['$scope','$http', function(scope,http){
	scope.jsonNumbers = "";

	scope.isJsonString = function(str){
	    try {
	        JSON.parse(str);
	    } catch (e) {
	        return false;
	    }
	    return true;
	};

	scope.add = function(){
		if(scope.isJsonString(scope.jsonNumbers)){
			var json = JSON.parse(scope.jsonNumbers);
			http({
				method: 'POST',
				url: 'api/phoneNumbers',
				data: json
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