/**
*  Module
*
* Description
*/
angular.module('PhoneDir',[]).

	directive('phoneDirective',function(){
		return {
			restrict: 'A',
			templateUrl: 'views/phone.html',
			controller: 'PhoneController',
			controllerAs: 'phone'
		};
	});