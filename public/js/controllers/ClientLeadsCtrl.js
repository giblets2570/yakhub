/**
* Ctrl Module
*
* Description
*/
angular.module('ClientLeadsCtrl', [])
	.controller('ClientLeadsController', ['$scope','$sessionStorage','socket', function(scope,session,socket){
		scope.clientLeads = [];

		socket.emit('client:getLeads',{
			'authorization':session.token
		});

		socket.on('client:leadsData',function(data){
			scope.clientLeads = data.calls;
			for(var i = 0; i < scope.clientLeads.length; i++){
				scope.clientLeads[i].created = new Date(scope.clientLeads[i].created);
				scope.clientLeads[i].agent_name = data.leads[i].agent_name;
				scope.clientLeads[i].followed = data.leads[i].followed;
				scope.clientLeads[i].leads_id = data.leads[i]._id;
			}
			console.log(scope.clientLeads);
		});

		scope.followedColour = function(lead){
			if(lead.followed)
				return 'success';
			return '';
		}

		scope.onFollowedUp = function(lead_id,lead_followed){
			console.log(lead_id,lead_followed);
			socket.emit('client:followUp',{
				'authorization':session.token,
				'lead_id':lead_id,
				'lead_followed':lead_followed
			});
		}

		scope.showRecording = function(url){
			if(url==""){
				console.log("No recording");
			}else{
				window.location.href = url;
			}
		}
	}]);