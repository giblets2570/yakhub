/**
* appControllers Module
*
* Description
*/

app.controller('homeCtrl', ['$scope','$state','$stateParams','Agent','Alert',function($scope,$state,$stateParams,Agent,Alert){
	$scope.current_tab = $state.current.name.substring(5,45);
	console.log($scope.current_tab);
	var pusher = new Pusher('9d60e889329cae081239', {
      encrypted: true
    });
	$scope.logout = function(){
	    Agent.logout().then(function(data){
	    	$state.go('login')
	    }, function (error) {
	    });
	};
	$scope.chosenTab = function(tab){
		return tab == $scope.current_tab ? 'chosen' : '';
	}
	$scope.changeTab = function(tab){
		$scope.current_tab = tab;
		$state.go('home.'+tab,{campaign_id: $stateParams.campaign_id})
	}
}])