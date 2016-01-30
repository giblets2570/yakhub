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
		makeCallBack: function(data){
			var defered = $q.defer();
			$http({
				method:'POST',
				url:'/api/leads/call_back',
				data: data,
				cache: false
			}).success(function(data){
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise;
		},
		next: function(){
			var defered = $q.defer();
			$http({
				method:'GET',
				url:'/api/leads/next',
				cache: false
			}).success(function(data){
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise;
		},
		skip: function(){
			var defered = $q.defer();
			$http({
				method:'GET',
				url:'/api/leads/skip',
				cache: false
			}).success(function(data){
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise;
		},
		update: function(data, id){
			var defered = $q.defer();
			$http({
				method:'PUT',
				url:'/api/leads/'+id,
				data: data,
				cache: false
			}).success(function(data){
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise;
		},
		custom: function(data){
			var defered = $q.defer();
			$http({
				method:'POST',
				url:'/api/leads/custom',
				data: data,
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
		remove: function(){
			var defered = $q.defer();
			$http({
				method:'DELETE',
				url:'/api/leads',
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