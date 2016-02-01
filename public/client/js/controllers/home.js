/**
* appControllers Module
*
* Description
*/

app.controller('homeCtrl', ['$scope','$state','$stateParams','Campaign','Client','$rootScope',function($scope,$state,$stateParams,Campaign,Client,$rootScope){
	$scope.newCampaign = function(){
		var name = prompt("Give your campaign a name");
		if(name){
			Campaign.create({name: name}).then(function(data){
				$state.go('home.dashboard.setup',{campaign_id: data._id})
			})
		}
	}
	$scope.current_tab = $state.current.name.substring(15,45);
    // Intercom('showNewMessage');
    // Intercom('show');
 //    Intercom('onShow',function(){
 //    	console.log("Intercom shown");
 //    });
 //    Intercom('onHide',function(){
 //    	console.log("Intercom hidden");
 //    });
	// $scope.showIntercom = function(){
	// 	Intercom('show');
	// }
	$scope.logout = function(){
	    Client.logout().then(function(data){
	    	$rootScope.user = null;
	    	Intercom("shutdown");
	    	$state.go('login');
	    }, function (error) {
	    });
	};
}])