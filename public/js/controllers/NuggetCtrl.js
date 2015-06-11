/**
* NuggetCtrl Module
*
* Description
*/
angular.module('NuggetCtrl', []).

	controller('NuggetController', ['$scope','$http',function(scope,http){
		this.nugget = "";

		this.addNugget = function(){
			this.nugget = "";
			http({
				method:'POST',
				url:'/api/nugget',
				data:{nugget:this.nugget}
			}).success(function(data){
				console.log(data);
				scope.showInfo("Nugget successfully added!");
			});
		}
	}]);