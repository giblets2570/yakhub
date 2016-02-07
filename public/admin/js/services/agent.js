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
		show: function(params,fields,id){
			if(params)
				params.fields = fields;
			var defered = $q.defer();
			$http({
				method:'GET',
				url:'/api/agents/'+id,
				params: params,
				cache: false
			}).success(function(data){
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise
		}
	};
});