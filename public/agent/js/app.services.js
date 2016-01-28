/**
* app.services Module
*
* Description
# This module contains the functions used to communicate with the backend.
# These are functions that get or update data on the server.
*/
angular.module('app.services', ['ngFileUpload'])

.factory('Campaign', function($http,$q){
	return {
		// This function returns the campaigns.
		// Inputs: params, fields
		// params: these are the query parameters we pass to the backend. This
		// query may specify whether we want to only get the calls for a given
		// campaign.
		// fields: these are the fields that we want returned from the database.
		// This returns a promise, which once the response has returned from the
		// server will contain the data.
		get: function(params,fields){
			if(params)
				params.fields = fields
			var defered = $q.defer();
			$http({
				method:'GET',
				url:'/api/campaigns',
				params: params,
				cache: false
			}).success(function(data){
				for (var j = data.length - 1; j >= 0; j--) {
					if(data[j].available_slots){
					for (var i = data[j].available_slots.length - 1; i >= 0; i--)
						data[j].available_slots[i].time = new Date(data[j].available_slots[i].time)
					}
					if(data[j].allocated_slots){
						for (var i = data[j].allocated_slots.length - 1; i >= 0; i--){
							data[j].allocated_slots[i].time = new Date(data[j].allocated_slots[i].time)
							data[j].allocated_slots[i].created = new Date(data[j].allocated_slots[i].created)
						}
					}
					if(data[j].requested_slots){
						for (var i = data[j].requested_slots.length - 1; i >= 0; i--){
							data[j].requested_slots[i].time = new Date(data[j].requested_slots[i].time)
							data[j].requested_slots[i].created = new Date(data[j].requested_slots[i].created)
						}
					}
				};
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise
		},
		url_campaign: function(params,fields){
			if(params)
				params.fields = fields
			var defered = $q.defer();
			$http({
				method:'GET',
				url:'/api/campaigns/other',
				params: params,
				cache: false
			}).success(function(data){
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise
		},
		apply: function(params,fields){
			if(params)
				params.fields = fields
			var defered = $q.defer();
			$http({
				method:'GET',
				url:'/api/campaigns/apply',
				params: params,
				cache: false
			}).success(function(data){
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise
		},
		// This function updates a campaign.
		// Inputs: data, id
		// data: this is the data that we want the campaign to be updated with.
		// id: this is the id for the campaign we want to update.
		// This returns a promise, which once the response has returned from the
		// server tell us that the update has succeeded/failed.
		update: function(data,id){
			var defered = $q.defer();
			$http({
				method:'PUT',
				url:'/api/campaigns/'+id,
				data: data,
				cache: false
			}).success(function(data){
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise
		},
		// This function returns one campaign.
		// Inputs: params, fields, id
		// params: these are the query parameters we pass to the backend.
		// fields: these are the fields that we want returned from the database.
		// id: this is the id for the campaign we want to get.
		// This returns a promise, which once the response has returned from the
		// server will contain the data.
		show: function(params,fields,id){
			if(params)
				params.fields = fields
			var defered = $q.defer();
			$http({
				method:'GET',
				url:'/api/campaigns/'+id,
				params: params,
				cache: false
			}).success(function(data){
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise
		},
		// This function changes the campaign that we are currently on on the server.
		// Inputs: new_campaign_id
		// new_campaign_id: this is the new id for the campaign we want to change to.
		// This returns a promise, which once the response has returned from the
		// server will tell us if the update succeeded/failed.
		change: function(new_campaign_id){
			var defered = $q.defer();
			$http({
				method: 'PUT',
				url: '/api/campaigns',
				data:{
					campaign: new_campaign_id
				},
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

.factory('Client', function($http,$q){
	return {
		// This function returns the clients.
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
				url:'/api/clients',
				params: params,
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
				url:'/api/clients/'+id,
				data: data,
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

.factory('Lead', function($http,$q){
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

.factory('Message', function($http,$q,Upload){
	return {
		get: function(params,fields){
			if(params)
				params.fields = fields;
			var defered = $q.defer();
			$http({
				method:'GET',
				url:'/api/messages',
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
				url:'/api/messages/'+id,
				data: data,
				cache: false
			}).success(function(data){
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise
		},
		create: function(data){
			var defered = $q.defer();
			$http({
				method:'POST',
				url:'/api/messages',
				data: data,
				cache: false
			}).success(function(data){
				defered.resolve(data);
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise
		},
		sendFile: function(file){
			var defered = $q.defer();
			$http({
				method:'GET',
				url:'/api/messages/upload',
				cache: false
			}).success(function(data){
				var ext = '.'+file.name.split('.').pop();
				Upload.upload({
				    url: 'https://yakhub-chats.s3.amazonaws.com/', //S3 upload url including bucket name
				    method: 'POST',
				    data: {
				        key: 'uploads/'+(new Date()).getTime()+randomString(16)+ext, // the key to store the file on S3, could be file name or customized
				        AWSAccessKeyId: data.key,
				        acl: 'public-read', // sets the access to the uploaded file in the bucket: private, public-read, ...
				        policy: data.policy, // base64-encoded json policy (see article below)
				        signature: data.signature, // base64-encoded signature based on policy string (see article below)
				        "Content-Type": file.type != '' ? file.type : 'application/octet-stream', // content type of the file (NotEmpty)
				        // filename: file.name, // this is needed for Flash polyfill IE8-9
				        file: file
				    }
				}).then(function (resp) {
		            defered.resolve(resp);
		        }, function (error) {
		            defered.reject(error);
		        }, function (evt) {
		            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
		            console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
		        });
			}).error(function(error){
				defered.reject(error);
			})
			return defered.promise
		}
	}
})

.factory('Agent', function($http,$q){
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
})

.factory('Call', function($http,$q){
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
		addCallData: function(data){
			var defered = $q.defer();
			$http({
				method:'PUT',
				url:'/api/calls/data',
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

function randomString(length) {
	var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var result = '';
	for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];

	return result;
};