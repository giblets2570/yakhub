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
    var channel = pusher.subscribe('test_channel');
    channel.bind('my_event', function(data) {
      alert(data.message);
    });
	$scope.logout = function(){
	    Agent.logout().then(function(data){
	    	$state.go('login')
	    }, function (error) {
	    });
	};
}])