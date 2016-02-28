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
		},
		update: function(call){
			var defered = $q.defer();
			$http({
				method:'PUT',
				url:'/api/calls/'+call._id,
				data: call,
				cache: false
			}).success(function(data){
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise
		},
		makeCall: function(data, agent_id){
			if(agent_id)
				data.agent = agent_id
			var defered = $q.defer();
			$http({
				method:'POST',
				url:'/api/calls/make',
				data: data,
				cache: false
			}).success(function(data){
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise;
		},
		addCallData: function(data,lead_id){
			var defered = $q.defer();
			$http({
				method:'PUT',
				url:'/api/calls/data/'+lead_id,
				data: data,
				cache: false
			}).success(function(data){
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise;
		},
		previous: function(){
			var defered = $q.defer();
			$http({
				method:'GET',
				url:'/api/calls/previous',
				cache: false
			}).success(function(data){
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise;
		},
	};
});