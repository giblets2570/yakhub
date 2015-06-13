/**
*  Module
*
* Description
*/
angular.module('ClientLeadsDir',[]).

	directive('clientLeadsDirective',function(){
		return {
			restrict: 'A',
			templateUrl: 'views/clientLeads.html',
			controller: 'ClientLeadsController',
			controllerAs: 'clientLeads'
		};
	});