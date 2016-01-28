/**
* navbarSubApp Module
*
* Description
*/
angular.module('navbarSubApp', [])

.controller('navbarSubCtrl', function($scope,$location,$window){
// Navigates to different parts of the site.
	$scope.go = function(type){
		var params = $location.path().split('/');
		var l = 5;
		if(type=='profile' || type=='messages')
			l--;
		var path = params[0];
		for (var i = 1; i < l - 1; i++) {
			params[i]=='agents' ? path = path + '/c'  : path = path + '/' + params[i];
		};
		path = path + '/' + type;
		$window.location.href = path;
	}
})