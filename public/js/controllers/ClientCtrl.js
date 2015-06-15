angular.module('ClientCtrl',[])


	.controller('ClientController',['$scope','$sessionStorage','toasty','$location','$http','socket',function(scope,session,toasty,location,http,socket){

	this.leads = true;
	this.nuggets = false;


	this.showLeads = function(){
		this.leads = true;
		this.nuggets = false;
	};

	this.showNuggets = function(){
		this.leads = false;
		this.nuggets = true;
	};

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
}]);