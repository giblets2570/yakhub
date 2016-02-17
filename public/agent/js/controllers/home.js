/**
* appControllers Module
*
* Description
*/

app.controller('homeCtrl', ['$scope','$rootScope','$state','Agent','Alert',function($scope,$rootScope,$state,Agent,Alert){
	var format_date = function(date){
		var day = String(date.getDate());
		if(day.length<2){day='0'+day}
		var month = String(date.getMonth()+1);
		if(month.length<2){month='0'+month}
		var year = String(date.getFullYear());
		return date+'/'+month+'/'+year;
	}
	$scope.current_tab = $state.current.name.substring(15,45);
	var pusher = new Pusher('9d60e889329cae081239', {
      encrypted: true
    });
    Intercom("boot", {
		app_id: "m28yn4x9",
		email: $rootScope.user.email,
		created_at: format_date(new Date($rootScope.user.created)),
		name: $rootScope.user.name,
		user_id: $rootScope.user._id,
		"user_type":"agent",
		widget: {
			activator: "#IntercomDefaultWidget"
		}
	});
	Intercom('onHide', function() {
		Intercom('update');
	});
	$scope.logout = function(){
	    Agent.logout().then(function(data){
	    	$state.go('login')
	    	Intercom("shutdown");
	    }, function (error) {
	    });
	};
	$scope.$on('$stateChangeStart',
		function(event, toState, toParams, fromState, fromParams){
			if(fromState.name=='home.dialer'){
				Twilio.Device.disconnectAll();
				Twilio.Device.destroy();
			}
			Intercom('update')
		})
	window.onpageunload = function(){
		Intercom("shutdown");
	}
}])