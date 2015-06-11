/**
* AppointmentDir Module
*
* Description
*/
angular.module('StatsDir', []).
	directive('statsDirective', function(){
		return{
			restrict:'A',
			templateUrl: 'views/stats.html',
			controller: 'StatsController',
			controllerAs: 'stats'
		}
	});