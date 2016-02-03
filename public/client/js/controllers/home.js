/**
* appControllers Module
*
* Description
*/

app.controller('homeCtrl', ['$scope','$state','$stateParams','Campaign','Client','$rootScope','$http',function($scope,$state,$stateParams,Campaign,Client,$rootScope,$http){
	Intercom("boot", {
		app_id: "m28yn4x9",
		email: $rootScope.user.email,
		created_at: $rootScope.user.created,
		name: $rootScope.user.name,
		user_id: $rootScope.user._id,
		widget: {
			activator: "#IntercomDefaultWidget"
		}
	});
	$scope.newCampaign = function(){
		var name = prompt("Give your campaign a name");
		if(name){
			Campaign.create({name: name}).then(function(data){
				$state.go('home.dashboard.setup',{campaign_id: data._id})
			})
		}
	}
	$scope.getClient = function(){
		Client.show({},'funds funds_used','me').then(function(data){
			console.log(data);
			$scope.client = data;
		});
	}
	$scope.getClient();
	$scope.handler = StripeCheckout.configure({
		key: 'pk_test_2a5qQm7wUtDiB6VCJAkoPc5n',
		image: '/assets/images/logo.png',
		locale: 'auto',
		token: function(token) {
		  // Use the token to create the charge with a server-side script.
		  // You can access the token ID with `token.id`
		  $http({
		  	method: 'POST',
		  	url:'/api/clients/charge',
		  	data:{
		  		stripeToken: token,
		  		amount: $scope.amount,
		  	}
		  }).success(function(data){
		  	console.log(data);
		  	if(data.error||data.status!='paid'){
		  		alert('There was a problem with the payment!');
		  	}else{
		  		$scope.client.funds+=$scope.amount;
		  		alert('Funds successfully added!');
		  	}
		  })
		}
	});
	$scope.openHandler = function(amount){
		$scope.amount = amount;
		$scope.description = 'Deposit of £'+amount/100
		$scope.handler.open({
			name: 'Yak Hub',
			description: $scope.description,
			currency: "gbp",
			amount: amount
		});
	}
	$scope.addFunds = function(){
		var amount = prompt("How much would you like to deposit (in £)?");
		if(amount){
			amount = parseFloat(amount);
			if(isNaN(amount)) return;
			if(amount<0){
				alert("You can't deposit negative funds");
				return;
			}
			$scope.openHandler(amount*100);
		}
	}
	$scope.current_tab = $state.current.name.substring(15,45);
	$scope.showIntercom = function(){
		console.log("Show intercom");
		Intercom('show');
	}
	$scope.logout = function(){
	    Client.logout().then(function(data){
	    	$rootScope.user = null;
	    	Intercom("shutdown");
	    	$state.go('login');
	    }, function (error) {
	    });
	};
}])