/**
* appControllers Module
*
* Description
*/

app.controller('agentsCtrl', ['$scope','$state','Agent','Alert','Payment','$stateParams',function($scope,$state,Agent,Alert,Payment,$stateParams){
	$scope.getAgents = function(){
		Agent.get({},'name alias earned paid pay').then(function(data){
			console.log(data);
			$scope.agents = data;
		})
	}
	$scope.old_names = {}
	$scope.getAgents();
	$scope.saveAgent = function(agent){
		agent.editing=!agent.editing;
		Agent.update({alias: agent.alias},agent._id).then(function(data){
			console.log(data);
		})
	}
	$scope.editAgent = function(agent){
		agent.editing=!agent.editing;
		$scope.old_names[agent._id] = agent.alias;
	}
	$scope.cancelAgent = function(agent){
		agent.editing=!agent.editing;
		agent.alias = $scope.old_names[agent._id];
	}
	$scope.payAgent = function(agent){
		var amount = prompt("Pay the agent how much");
		if(amount){
			amount = parseFloat(amount);
			if(isNaN(amount)) return;
			if(amount<0){
				alert("You can't take money from agents");
				return;
			}
			$scope.openHandler(amount*100,agent);
		}
	}
	$scope.initializeStripeHandler = function(key){
		$scope.handler = StripeCheckout.configure({
			key: key,
			image: '/assets/images/logo.png',
			locale: 'auto',
			token: function(token) {
				Agent.pay({amount:$scope.amount,stripeToken:token},$scope.agent._id).then(function(data){
					console.log(data);
					data.agent = $scope.agent._id;
					data.agent_name = $scope.agent.name;
					if(!data.error){
						Payment.save(data).then(function(data){
							console.log(data);
							$scope.agent.paid = $scope.agent.paid + $scope.amount;
							alert("Payment complete");
						})
					}else{
						alert(data.error);
					}
				})
			}
		});
	}
	$scope.openHandler = function(amount,agent){
		$scope.amount = amount;
		$scope.agent = agent;
		$scope.description = 'Payment of £'+amount/100+' to '+agent.name;
		$scope.handler.open({
			name: 'Yak Hub',
			description: $scope.description,
			currency: "gbp",
			amount: amount
		});
	}
	$scope.getStripeKey = function(){
		Payment.stripe().then(function(data){
			$scope.initializeStripeHandler(data.stripe);
		})
	}
	$scope.getStripeKey();
}]);