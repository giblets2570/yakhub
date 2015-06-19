/**
* AppointmentDir Module
*
* Description
*/
angular.module('AdminCampaignUpdatesDir', []).
	directive('adminCampaignUpdatesDirective', function(){
		return{
			restrict:'A',
			templateUrl: 'views/adminCampaignUpdates.html',
			controller: 'AdminCampaignUpdatesController',
			controllerAs: 'adminCampaignUpdates'
		}
	});