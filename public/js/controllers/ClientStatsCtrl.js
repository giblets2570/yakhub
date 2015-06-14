/**
* StatsCtrl Module
*
* Description
*/
angular.module('ClientStatsCtrl', [])
	.controller('ClientStatsController', ['$scope','$http','$sessionStorage','socket', function(scope,http,session,socket){
		scope.clientDataToday = [[0,0,0]];
		scope.clientDataWeek = [[0,0,0]];
		scope.clientDataAll = [[0,0,0]];
		scope.labels = ['Calls','Pickups','Leads'];
		scope.today = new Date();

		scope.isToday = function(date){
			var date = new Date(date);
			return date.getDate() === scope.today.getDate();
		}

		scope.isWeek = function(date){
			var date = new Date(date);
			return (date.getDate() >= scope.today.getDate() - 7);
		}

		socket.emit('client:callUpdate',{
			'authorization':session.token
		});

		socket.on('client:signalUpdateCalls',function(){
			socket.emit('client:callUpdate',{
				'authorization':session.token
			});
		});

		socket.on('client:callData',function(data){
			console.log(data);
			scope.clientDataAll = [[data.calls.length,data.pickups.length,data.leads.length]];
			var today = 0, week = 0;
			for(var i = 0; i < data.calls.length; i++){
				if(scope.isWeek(data.calls[i].created)) {
					week+=1;
					if(scope.isToday(data.calls[i].created)) {
						today+=1;
					}
				}
			}
			var callsToday = today, callsWeek = week;
			today = 0, week = 0;
			for(var i = 0; i < data.pickups.length; i++){
				if(scope.isWeek(data.pickups[i].created)) {
					week+=1;
					if(scope.isToday(data.pickups[i].created)) {
						today+=1;
					}
				}
			}
			var pickupsToday = today, pickupsWeek = week;
			today = 0, week = 0;
			for(var i = 0; i < data.leads.length; i++){
				if(scope.isWeek(data.leads[i].created)) {
					week+=1;
					if(scope.isToday(data.leads[i].created)) {
						today+=1;
					}
				}
			}
			scope.clientDataToday = [[callsToday,pickupsToday,today]];
			scope.clientDataWeek = [[callsWeek,pickupsWeek,week]];
		});
	}]);