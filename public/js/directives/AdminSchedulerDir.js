/**
* AppointmentDir Module
*
* Description
*/
angular.module('AdminSchedulerDir', []).
	directive('adminSchedulerDirective', function(){
		return{
			restrict:'A',
			templateUrl: 'views/adminScheduler.html',
			controller: 'AdminSchedulerController',
			controllerAs: 'adminScheduler'
		}
	});