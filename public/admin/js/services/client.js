/**
* appControllers Module
*
* Description
*/

app.factory('Client', ['$q','$http', function($q,$http){
	return {
		show : function(id){
			var defered = $q.defer();
			$http.get('/api/clients/'+id)
		    .success(function(user){
		      // No error: authentication OK
		      defered.resolve(user);
		    })
		    .error(function(){
		      // Error: authentication failed
		      defered.reject('0');
		    });
		    return defered.promise;
		},
		get : function(query,fields){
			if(query){
				query.fields = fields;
			}
			var defered = $q.defer();
			$http.get('/api/clients')
		    .success(function(clients){
		      // No error: authentication OK
		      defered.resolve(clients);
		    })
		    .error(function(){
		      // Error: authentication failed
		      defered.reject('0');
		    });
		    return defered.promise;
		},
		update: function(data,id){
			var defered = $q.defer();
			$http({
				method: 'PUT',
				url: '/api/clients/'+id,
				data: data,
				cache: false
			}).success(function(data){
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise;
		},
		login : function(user){
			var defered = $q.defer();
			$http.post('/auth/client/login', {
		      username: user.username,
		      password: user.password,
		    })
		    .success(function(user){
		      // No error: authentication OK
		      defered.resolve(user);
		    })
		    .error(function(){
		      // Error: authentication failed
		      defered.reject('0');
		    });
		    return defered.promise;
		},
		signup : function(user){
			var defered = $q.defer();
			$http.post('/auth/client/signup', {
		      username: user.username,
		      password: user.password,
		    })
		    .success(function(user){
		      // No error: authentication OK
		      defered.resolve(user);
		    })
		    .error(function(){
		      // Error: authentication failed
		      defered.reject('0');
		    });
		    return defered.promise;
		},
		logout : function(user){
			var defered = $q.defer();
			$http.get('/auth/logout')
		    .success(function(user){
		      defered.resolve(user);
		    })
		    .error(function(){
		      defered.reject('0');
		    });
		    return defered.promise;
		}
	}
}]);