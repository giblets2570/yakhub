/**
*  Module
*
* Description
*/
angular.module('NuggetDir',[]).

	directive('nuggetDirective',function(){
		return {
			restrict: 'A',
			templateUrl: 'views/nugget.html',
			controller: 'NuggetController',
			controllerAs: 'nugget'
		};
	});