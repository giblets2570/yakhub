angular.module('TimelineCtrl',[]).controller('TimelineController',['$scope','$interval','$http','$sessionStorage',function(scope,interval,http,session){
	scope.updateTimeline = function(){
		http({
			method:'GET',
			params:{'agentname':session.username,'clientname':session.clientname},
			url:'endpoints/getAgentCalls.php',
			cache:false
		}).success(function(data){
			console.log(data);
			scope.calls = data;
		});
	};

	scope.updateTimeline();

	update = interval(scope.updateTimeline, 30000);
}]);