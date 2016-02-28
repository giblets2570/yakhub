/**
* appControllers Module
*
* Description
*/

app.controller('loginCtrl', ['$scope','$state','Client','Alert',function($scope,$state,Client,Alert){
	$scope.user_login = {};
	$scope.user_signup = {
		username: {}
	};
	$scope.login = function(){
		Alert.success("Loading...").then(function(loading){
			loading.show();
			Client.login($scope.user_login).then(function(data){
				loading.hide();
				console.log(data);
			    if(data.campaign_id){
		            $state.go('home.dashboard.setup',{'campaign_id':data.campaign_id});
		        }else{
		            $state.go('home');
		        }
		    }, function (error) {
		    	loading.hide();
		    	Alert.warning('Login credentials wrong!','',3).then(function(alert){
		    		alert.show();
		    	});
		    	$scope.user_login = {};
		    });
		})
	};
	$scope.signup = function(){
		Alert.success("Loading...").then(function(loading){
			loading.show();
	    Client.signup($scope.user_signup).then(function(data){
				loading.hide();
		    if(data.campaign_id){
	            $state.go('home.dashboard.setup',{'campaign_id':data.campaign_id});
	        }else{
	            $state.go('home');
	        }
	    }, function (error) {
	    	loading.hide();
	    	Alert.warning('Username or email already in use!','',3).then(function(alert){
	    		alert.show();
	    	});
	    	$scope.user_signup = {
				username: {}
			};
	    });
		})
	};
}])