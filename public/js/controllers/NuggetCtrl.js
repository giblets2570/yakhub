/**
* NuggetCtrl Module
*
* Description
*/
angular.module('NuggetCtrl', []).

	controller('NuggetController', ['$scope','$http',function(scope,http){
		this.nugget = "";

		this.addNugget = function(){
			var nugget = this.nugget;
			this.nugget = "";
			http({
				method:'POST',
				url:'/api/nugget',
				data:{nugget:nugget}
			}).success(function(data){
				console.log(data);
				scope.showInfo("Nugget successfully added!");
			});
		}
	}]);