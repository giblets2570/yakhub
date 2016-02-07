/**
* appControllers Module
*
* Description
*/

app.factory('Call', function($http,$q){
	return {
		// This function returns the calls.
		// Inputs: params, fields
		// params: these are the query parameters we pass to the backend. This
		// query may specify whether we want to only get the calls for a given
		// campaign.
		// fields: these are the fields that we want returned from the database.
		// This returns a promise, which once the response has returned from the
		// server will contain the data.
		get: function(params,fields){
			if(params)
				params.fields = fields;
			var defered = $q.defer();
			$http({
				method:'GET',
				url:'/api/calls',
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