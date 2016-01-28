/**
* appControllers Module
*
* Description
*/

app.controller('homeCtrl', ['$scope','$state','$stateParams','Campaign','Client',function($scope,$state,$stateParams,Campaign,Client){
	$scope.newCampaign = function(){
		var name = prompt("Give your campaign a name");
		if(name){
			Campaign.create({name: name}).then(function(data){
				$state.go('home.dashboard.setup',{campaign_id: data._id})
			})
		}
	}
	$scope.current_tab = $state.current.name.substring(15,45);
	var pusher = new Pusher('9d60e889329cae081239', {
      encrypted: true
    });
    var channel = pusher.subscribe('test_channel');
    channel.bind('my_event', function(data) {
      alert(data.message);
    });
	$scope.logout = function(){
	    Client.logout().then(function(data){
	    	$state.go('login')
	    }, function (error) {
	    });
	};
}])