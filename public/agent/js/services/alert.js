/**
* appControllers Module
*
* Description
*/

app.factory('Alert', ['$alert','$q',function($alert,$q){
	return {
		success: function(title,content){
			var defered = $q.defer();
	  		var alert = $alert({
				title: title,
				content: content,
				placement: 'floater-top-left',
				type: 'success',
				duration: 3,
				show: false
		  	});
		  	alert.$promise.then(function(){
		  		defered.resolve(alert);
		  	})
		  	return defered.promise;
		},
		warning: function(title,content){
	  		var defered = $q.defer();
	  		var alert = $alert({
				title: title,
				content: content,
				placement: 'floater-top-left',
				type: 'warning',
				duration: 3,
				show: false
		  	});
		  	alert.$promise.then(function(){
		  		defered.resolve(alert);
		  	})
		  	return defered.promise;
	  	}
	}
}]);