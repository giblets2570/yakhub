/**
*  Module
*
* Description
*/
angular.module('ClientNuggetsDir',[]).

	directive('clientNuggetsDirective',function(){
		return {
			restrict: 'A',
			templateUrl: 'views/clientNuggets.html',
			controller: 'ClientNuggetsController',
			controllerAs: 'clientNuggets'
		};
	});