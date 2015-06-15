/**
* StatsCtrl Module
*
* Description
*/
angular.module('UpdatesCtrl', [])
	.controller('UpdatesController', ['$scope','$http', function(scope,http){
		scope.status = {};
		scope.list = {};
		this.willCreate = false;
		this.willRemove = false;
		this.willAssign = false;
		this.willURL = false;
		this.agentChosen = false;
		this.clientChosen = false;
		this.scriptURL = "";

		scope.initialData = function(type){
			http({
				method:'GET',
				url:'api/'+type,
				cache: false
			}).success(function(data){
				scope.list[type] = data;
			});
		}
		scope.initialData('agent');
		scope.initialData('client');
		scope.initialData('admin');
		
		this.showCreate = function(type){
			this.willCreate = true;
			this.willRemove = false;
			this.willURL = false;
			this.willAssign = false;
			this.agentChosen = false;
			this.clientChosen = false;
			this.type = type;
		}

		this.showRemove = function(type){
			this.willCreate = false;
			this.willRemove = true;
			this.willURL = false;
			this.willAssign = false;
			this.agentChosen = false;
			this.clientChosen = false;
			this.type = type;
			scope.initialData(type);
		}

		this.remove = function(type,id){
			var r = confirm("Are you sure you want to delete?");
			if(r)
			{
				http({
					method:'DELETE',
					url:'api/'+this.type+'/'+id,
					cache:false
				}).success(function(data){
					scope.showInfo(data.message);
					scope.initialData(type);
				});
			}
		}
		this.create = function(type){
			console.log(type);
			http({
				method:'POST',
				url:'api/'+this.type,
				data:{
					name:this.name,
					password:this.password
				},
				cache:false
			}).success(function(data){
				console.log(data);
				if(data.error){
					scope.showAlert(data.error);
				}else{
					scope.showInfo(data.message);
				}
			});
		}

		this.assignAgent = function(){
			this.willCreate = false;
			this.willRemove = false;
			this.willAssign = true;
			this.willURL = false;
		}

		this.chooseAgent = function(agent_id){
			this.agent_id = agent_id;
			this.agentChosen = true;
		}

		this.chooseClient = function(client_id){
			this.client_id = client_id;
			this.clientChosen = true;
		}

		this.showAssignURL = function(){
			this.willCreate = false;
			this.willRemove = false;
			this.willAssign = false;
			this.willURL = true;
		}

		this.submitURL = function(){
			var url = this.scriptURL;
			this.scriptURL = "";
			http({
				method:'PUT',
				url:'api/client/'+this.client_id,
				data:{scriptURL:url},
				cache:false
			}).success(function(data){
				scope.showInfo("Script url added!");
				console.log(data);
			});
		}

		this.submitAssign = function(){
			http({
				method:'PUT',
				url:'api/agent/'+this.agent_id,
				data:{client:this.client_id},
				cache:false
			}).success(function(data){
				scope.showInfo("Agent assignment complete!");
				console.log(data);
			});
		}
	}]);