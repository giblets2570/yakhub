/**
* appControllers Module
*
* Description
*/

app.controller('updatesCtrl', ['$scope','$state','Client','Alert','Message',function($scope,$state,Client,Alert,Message){
	$scope.getMessages = function(){
		Message.get({campaign_id: $scope.campaign._id}).then(function(data){
			console.log(data);
			$scope.messages = data.messages;
			for (var i = $scope.messages.length - 1; i >= 0; i--) {
				$scope.messages[i].time = new Date($scope.messages[i].time);
			};
			$scope.messages_id = data._id;
		})
	}
	$scope.send = function(){
		if(!$scope.message) return;
		var message = $scope.message;
		$scope.message = '';
		$scope.messages.push({
			text: message,
			time: new Date()
		});
		if($scope.messages_id){
			Message.update({messages: $scope.messages},$scope.messages_id).then(function(data){
				console.log(data);
			})
		}else{
			Message.create({messages: $scope.messages, campaign: $scope.campaign._id, campaign_name: $scope.campaign.name},$scope.messages).then(function(data){
				console.log(data);
			})
		}
	}
	$scope.$watch('campaign',function(c){
		if(c && c._id){
			$scope.getMessages();
		}
	})
}])

.filter('formatDate', function(){
	return function(input){
		if(!input) return "";
		return input.getDate() + "/" + input.getMonth()+1 + "/" + input.getFullYear()
	}
});