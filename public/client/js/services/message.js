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
		},
		show: function(params,fields,id){
			if(fields)
				params.fields = fields;
			var defered = $q.defer();
			$http({
				method: 'GET',
				url:'/api/messages/'+id,
				params: params
			}).success(function(data){
		      // No error: authentication OK
		      defered.resolve(data);
		    }).error(function(){
		      // Error: authentication failed
		      defered.reject('0');
		    });
		    return defered.promise;
		},
		create: function(data){
			var defered = $q.defer();
			$http.post('/api/messages', data)
		    .success(function(data){
		      // No error: authentication OK
		      defered.resolve(data);
		    })
		    .error(function(){
		      // Error: authentication failed
		      defered.reject('0');
		    });
		    return defered.promise;
		},
		update: function(data,id){
			var defered = $q.defer();
			$http.put('/api/messages/'+id, data)
		    .success(function(data){
		      // No error: authentication OK
		      defered.resolve(data);
		    })
		    .error(function(){
		      // Error: authentication failed
		      defered.reject('0');
		    });
		    return defered.promise;
		}
	}
}])