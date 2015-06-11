/**
* AppointmentDir Module
*
* Description
*/
angular.module('UpdatesDir', []).
	directive('updatesDirective', function(){
		return{
			restrict:'A',
			templateUrl: 'views/updates.html',
			controller: 'UpdatesController',
			controllerAs: 'updates'
		};
	});