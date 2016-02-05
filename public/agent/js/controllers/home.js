/**
* appControllers Module
*
* Description
*/

app.controller('homeCtrl', ['$scope','$state','Agent','Alert',function($scope,$state,Agent,Alert){
	$scope.current_tab = $state.current.name.substring(15,45);
	var pusher = new Pusher('9d60e889329cae081239', {
      encrypted: true
    });
	$scope.logout = function(){
	    Agent.logout().then(function(data){
	    	$state.go('login')
	    }, function (error) {
	    });
	};
	$scope.$on('$stateChangeStart',
		function(event, toState, toParams, fromState, fromParams){
			if(fromState.name=='home.dialer'){
				Twilio.Device.disconnectAll();
				Twilio.Device.destroy();
			}
		})
}])