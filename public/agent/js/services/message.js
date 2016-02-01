/**
* appControllers Module
*
* Description
*/

app.factory('Message', ['$q','$http', function($q,$http){
	return {
		get: function(params,fields){
			if(fields)
				params.fields = fields;
			var defered = $q.defer();
			$http({
				method: 'GET',
				url:'/api/messages',
				params: params
			}).success(function(data){
		      // No error: authentication OK
		      defered.resolve(data);
		    }).error(function(){
		      // Error: authentication failed
		      defered.reject('0');
		    });
		    return defered.promise;
		}
	}
}])