/**
* appControllers Module
*
* Description
*/

app.controller('stripeCtrl', ['$scope','$state','Agent','Alert','$location','$http',function($scope,$state,Agent,Alert,$location,$http){
	$scope.stripe_loaded=false
	$scope.setup = function(){
		$http({
			method: 'GET',
			url: '/auth/agent/stripe'
		}).success(function(data){
			console.log(data);
			if(data!='0'){
				$scope.stripe_loaded=true,
				$state.go('home.campaigns');
			}
		});
	}
	$scope.setup()
}])