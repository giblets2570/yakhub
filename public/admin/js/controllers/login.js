/**
* appControllers Module
*
* Description
*/

app.controller('loginCtrl', ['$scope','$state','Admin','Alert',function($scope,$state,Admin,Alert){
	$scope.user_login = {};
	$scope.user_signup = {
		username: {}
	};
	$scope.login = function(){
		Alert.success("Loading...").then(function(loading){
			loading.show();
			Admin.login($scope.user_login).then(function(data){
				loading.hide();
				console.log(data);
		        $state.go('home.campaigns');
		    }, function (error) {
		    	loading.hide();
		    	Alert.warning('Login credentials wrong!').then(function(alert){
		    		alert.show();
		    	});
		    	$scope.user_login = {};
		    });
		})
	};
}])