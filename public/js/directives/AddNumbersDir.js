/**
*  Module
*
* Description
*/
angular.module('AddNumbersDir',[]).

	directive('addNumbersDirective',function(){
		return {
			restrict: 'A',
			templateUrl: 'views/addNumbers.html',
			controller: 'AddNumbersController'
		};
	});