/**
* appControllers Module
*
* Description
*/

app.controller('agentsCtrl', ['$scope','$state','Agent','Alert','Payment','$stateParams',function($scope,$state,Agent,Alert,Payment,$stateParams){
	$scope.getAgents = function(){
		Agent.get({},'name alias earned paid').then(function(data){
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
			if(confirm("Are you sure about paying "+agent.name+": £"+amount+"?")) {
				alert("Paying "+agent.name+": £"+amount);
				var total = agent.paid+amount*100;
				Agent.pay({paid:total},agent._id).then(function(data){
					console.log(data);
					data.agent = agent._id;
					data.agent_name = agent.name;
					if(!data.error){
						Payment.save(data).then(function(data){
							console.log(data);
							agent.paid = total;
							alert("Payment complete");
						})
					}else{
						alert(data.error);
					}
				})
			}
		}
		// console.log(isNaN(parseInt(prompt("Pay the agent how much"))));
	}
}]);