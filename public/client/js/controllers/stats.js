/**
* appControllers Module
*
* Description
*/

app.controller('statsCtrl', ['$scope','$state','Client','Alert','Lead',function($scope,$state,Client,Alert,Lead){
	$scope.getStats = function(){
		$scope.total = $scope.leads.length;
		$scope.dialed = 0;
		$scope.one_or_less = 0;
		$scope.two_or_more = 0;
		$scope.outcomes = {};
		for (var i = $scope.leads.length - 1; i >= 0; i--) {
			if($scope.leads[i].called){
				$scope.dialed+=1;
				if($scope.leads[i].rating<2){$scope.one_or_less+=1;}
				else{$scope.two_or_more+=1;}
				if ($scope.leads[i].outcome){
					if ($scope.leads[i].outcome in $scope.outcomes){
						$scope.outcomes[$scope.leads[i].outcome] += 1;
					}else{
						$scope.outcomes[$scope.leads[i].outcome] = 1;
					}
				}
			}
		};
		console.log($scope.outcomes);
	}
	$scope.timeLeft = function(){
		if(!($scope.campaign && $scope.campaign.start_date && $scope.campaign.end_date)) return '';
		var day = 1000*60*60*24;
		var days_left = Math.floor(((new Date($scope.campaign.end_date)).valueOf() - (new Date($scope.campaign.start_date)).valueOf())/day);
		return days_left;
	}
	$scope.numAgents = function(){
		if(!($scope.campaign && $scope.campaign.agents)) return 0;
		return $scope.campaign.agents.length;
	}
	$scope.getLeads = function(){
		Lead.get({campaign_id: $scope.campaign._id},'').then(function(data){
			$scope.leads = data;
			// $scope.applyFilter();
			$scope.getStats();
		})
	};
	$scope.$watch('campaign',function(c){
		if(c && c._id){
			$scope.getLeads();
			console.log(c);
		}
	})
}])