/**
* AppointmentDir Module
*
* Description
*/
angular.module('AppointmentsDir', []).
	directive('appointmentsDirective', function(){
		return{
			restrict:'A',
			templateUrl: 'views/appointments.html',
			controller: 'AppointmentsController',
			controllerAs: 'appointments'
		}
	});