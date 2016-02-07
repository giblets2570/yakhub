/**
* appControllers Module
*
* Description
*/

app.factory('Admin', function($http,$q){
	return {
		// This function returns the admins.
		// Inputs: params, fields
		// params: these are the query parameters we pass to the backend.
		// fields: these are the fields that we want returned from the database. This
		// query may specify whether we want to only get the admins for a given
		// campaign.
		// This returns a promise, which once the response has returned from the
		// server will contain the data.
		get: function(params,fields){
			if(params)
				params.fields = fields;
			var defered = $q.defer();
			$http({
				method:'GET',
				url:'/api/admins',
				params: params,
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
			$http.post('/auth/admin/login', {
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
			$http.post('/auth/admin/signup', {
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
	};
});