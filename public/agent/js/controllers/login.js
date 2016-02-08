/**
* appControllers Module
*
* Description
*/

app.controller('loginCtrl', ['$scope','$state','Agent','Alert',function($scope,$state,Agent,Alert){
	$scope.user_login = {};
	$scope.user_signup = {
		username: {}
	};
	$scope.login = function(){
		Alert.success("Loading...").then(function(loading){
			loading.show();
			Agent.login($scope.user_login).then(function(data){
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
	$scope.signup = function(){
		if(!$scope.agreement){
			alert("Have you agreed to the Yak Hub contractor agreement?");
			return;
		}
		if($scope.user_signup.confirm_password!=$scope.user_signup.password){
			alert("Passwords don't match");
			$scope.user_signup.confirm_password = '';
			return;
		}
		Alert.success("Loading...").then(function(loading){
			loading.show();
		    Agent.signup($scope.user_signup).then(function(data){
				loading.hide();
			    $state.go('home.campaigns');
		    }, function (error) {
		    	loading.hide();
		    	Alert.warning('Login credentials wrong!').then(function(alert){
		    		alert.show();
		    	});
		    	$scope.user_signup = {
					username: {}
				};
		    });
		})
	};
}])