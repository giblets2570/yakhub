/**
* AppointmentDir Module
*
* Description
*/
angular.module('AgentCampaignUpdatesDir', []).
	directive('agentCampaignUpdatesDirective', function(){
		return{
			restrict:'A',
			templateUrl: 'views/agentCampaignUpdates.html',
			controller: 'AgentCampaignUpdatesController',
			controllerAs: 'agentCampaignUpdates'
		}
	});