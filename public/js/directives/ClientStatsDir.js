/**
* AppointmentDir Module
*
* Description
*/
angular.module('ClientStatsDir', []).
	directive('clientStatsDirective', function(){
		return{
			restrict:'A',
			templateUrl: 'views/clientStats.html',
			controller: 'ClientStatsController',
			controllerAs: 'clientStats'
		}
	});