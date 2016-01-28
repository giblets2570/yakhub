/**
* appControllers Module
*
* Description
*/

app.factory('Lead', function($http,$q){
	return {
		// This function returns the leads.
		// Inputs: params, fields
		// params: these are the query parameters we pass to the backend.
		// fields: these are the fields that we want returned from the database.
		// This returns a promise, which once the response has returned from the
		// server will contain the data.
		get: function(params,fields){
			if(params)
				params.fields = fields
			var defered = $q.defer();
			$http({
				method:'GET',
				url:'/api/leads',
				params: params,
				cache: false
			}).success(function(data){
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise;
		},
		add: function(data){
			var defered = $q.defer();
			$http({
				method:'POST',
				url:'/api/leads/add',
				data: data,
				cache: false
			}).success(function(data){
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise;
		},
		remove: function(params){
			var defered = $q.defer();
			$http({
				method:'DELETE',
				url:'/api/leads',
				params: params,
				cache: false
			}).success(function(data){
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise;
		}
	};
})