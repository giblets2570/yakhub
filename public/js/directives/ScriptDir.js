/**
* AppointmentDir Module
*
* Description
*/
angular.module('ScriptDir', []).
	directive('scriptDirective', function(){
		return{
			restrict:'A',
			templateUrl: 'views/script.html',
			controller: 'ScriptController',
			controllerAs: 'script'
		}
	});