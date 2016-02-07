/**
* appControllers Module
*
* Description
*/

app.factory('Campaign', ['$q','$http', function($q,$http){
	return {
		get: function(query,fields){
			if(fields)
				query.fields = fields;
			var defered = $q.defer();
			$http({
				method: 'GET',
				url:'/api/campaigns',
				params: query
			}).success(function(data){
		      // No error: authentication OK
		      defered.resolve(data);
		    }).error(function(){
		      // Error: authentication failed
		      defered.reject('0');
		    });
		    return defered.promise;
		},
		show: function(query,fields,id){
			if(fields)
				query.fields = fields;
			var defered = $q.defer();
			$http({
				method: 'GET',
				url:'/api/campaigns/'+id,
				params: query
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
			$http.post('/api/campaigns', data)
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
			$http.put('/api/campaigns/'+id, data)
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