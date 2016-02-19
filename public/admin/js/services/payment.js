/**
* appControllers Module
*
* Description
*/

app.factory('Payment', function($http,$q){
	return {
		// This function returns the admins.
		// Inputs: params, fields
		// params: these are the query parameters we pass to the backend.
		// fields: these are the fields that we want returned from the database. This
		// query may specify whether we want to only get the admins for a given
		// campaign.
		// This returns a promise, which once the response has returned from the
		// server will contain the data.
		save: function(data){
			var defered = $q.defer();
			$http({
				method:'POST',
				url:'/api/payments',
				data: data,
				cache: false
			}).success(function(data){
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise
		},
		stripe: function(data){
			var defered = $q.defer();
			$http({
				method:'GET',
				url:'/api/payments/stripe',
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