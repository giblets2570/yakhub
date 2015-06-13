angular.module('ClientCtrl',[])


	.controller('ClientController',['$scope','$sessionStorage','toasty','$location','$http','socket',function(scope,session,toasty,location,http,socket){


	scope.showWarning = function(message){
		toasty.pop.warning({
            title: 'Warning!',
            msg: message,
            sound: false,
            showClose: false,
            clickToClose: false,
            timeout: 3000
        });
	}

	scope.showAlert = function(message){
		toasty.pop.error({
            title: 'Error!',
            msg: message,
            sound: false,
            showClose: false,
            clickToClose: false,
            timeout: 3000
        });
	}

	scope.showInfo = function(message){
		toasty.pop.info({
            title: 'Info',
            msg: message,
            sound: false,
            showClose: false,
            clickToClose: false,
            timeout: 3000
        });
	}

	this.logout = function(){
		session.$reset();
		location.path('login');
	}

	this.empty = function(){
		this.appointments = false;
		this.nuggets = false;
		this.stats = false;
	}
	this.showAppointments = function(){
		this.empty();
		this.appointments = true;
	}
	this.showAppointments();
	this.showStats = function(){
		this.empty();
		this.stats = true;
	}
	this.showNuggets = function(){
		this.empty();
		this.nuggets = true;
	}

}]);