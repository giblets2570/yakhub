/**
* appControllers Module
*
* Description
*/

app.factory('Agent', function($http,$q){
	return {
		// This function returns the agents.
		// Inputs: params, fields
		// params: these are the query parameters we pass to the backend.
		// fields: these are the fields that we want returned from the database. This
		// query may specify whether we want to only get the agents for a given
		// campaign.
		// This returns a promise, which once the response has returned from the
		// server will contain the data.
		get: function(params,fields){
			if(params)
				params.fields = fields;
			var defered = $q.defer();
			$http({
				method:'GET',
				url:'/api/agents',
				params: params,
				cache: false
			}).success(function(data){
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise
		},
		update: function(data,id){
			var defered = $q.defer();
			$http({
				method:'PUT',
				url:'/api/agents/'+id,
				data: data,
				cache: false
			}).success(function(data){
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise
		},
		login : function(user){
			var defered = $q.defer();
			$http.post('/auth/agent/login', {
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
			$http.post('/auth/agent/signup', {
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
		},
		me: function(){
			var defered = $q.defer();
			$http({
				method:'GET',
				url:'/api/agents/me',
				cache: false
			}).success(function(data){
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise
		},
		url_agent: function(url_name){
			var defered = $q.defer();
			$http({
				method:'GET',
				url:'/api/agents/other',
				params: {
					url_name: url_name
				},
				cache: false
			}).success(function(data){
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise
		},
		rate: function(data,id){
			var defered = $q.defer();
			$http({
				method:'PUT',
				url:'/api/agents/'+id+'/rate',
				data: data,
				cache: false
			}).success(function(data){
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise
		},
		twilio: function(params){
			var defered = $q.defer();
			$http({
				method:'GET',
				url:'/api/agents/twilio',
				params: params,
				cache: false
			}).success(function(data){
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise
		},
		active: function(data,id){
			var defered = $q.defer();
			$http({
				method:'PUT',
				url:'/api/agents/'+id+'/active',
				data: data,
				cache: false
			}).success(function(data){
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise
		},
	};
});