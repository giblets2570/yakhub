/**
* scriptApp Module
*
* Description
*/
angular.module('scriptApp', ['navbarApp','textAngular'])

.controller('scriptCtrl', function($scope,Campaign){
	$scope.editing = false;
	$scope.getCampaign = function(){
		Campaign.show({},'script','mine').then(function(data){
			console.log(data);
			$scope.script = data.script;
		});
	};
	$scope.save = function(){
		$scope.editing = !$scope.editing;
		Campaign.update({
			script: $scope.script
		},'mine').then(function(data){
			console.log(data);
		});
	}
	$scope.init = function(){
		$scope.getCampaign();
	};
	$scope.edit = function(){
		$scope.editing = !$scope.editing;
		$scope.old_script = new String($scope.script);
	}
	$scope.cancel = function(){
		$scope.editing = !$scope.editing;
		$scope.script = $scope.old_script;
	}
	$scope.toolbar = [
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'],
      ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'],
      [],
      ['insertImage','insertLink', 'insertVideo', 'wordcount', 'charcount']
  	];
});