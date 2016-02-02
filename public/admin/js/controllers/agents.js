/**
* appControllers Module
*
* Description
*/

app.controller('agentsCtrl', ['$scope','$state','Agent','Alert','$stateParams',function($scope,$state,Agent,Alert,$stateParams){
	$scope.getAgents = function(){
		Agent.get({},'name earned paid').then(function(data){
			console.log(data);
			$scope.agents = data;
		})
	}
	$scope.old_names = {}
	$scope.getAgents();
	$scope.saveAgent = function(agent){
		agent.editing=!agent.editing;
		Agent.update({name: agent.name},agent._id).then(function(data){
			console.log(data);
		})
	}
	$scope.editAgent = function(agent){
		agent.editing=!agent.editing;
		$scope.old_names[agent._id] = JSON.parse(JSON.stringify(agent.name));
	}
	$scope.cancelAgent = function(agent){
		agent.editing=!agent.editing;
		agent.name = $scope.old_names[agent._id];
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
				agent.paid = amount*100;
				Agent.update({paid:agent.paid},agent._id).then(function(data){
					console.log(data);
				})
			}
		}
		// console.log(isNaN(parseInt(prompt("Pay the agent how much"))));
	}
}]);