angular.module('AdminCtrl',[]).controller('AdminController',['$scope','$sessionStorage','toasty','$location','$http',function(scope,session,toasty,location,http){

	this.logout = function(){
		session.$reset();
		location.path('login');
	}

	this.empty = function(){
		this.addNumbers = false;
		this.updates = false;
		this.campaignUpdates = false;
	}
	
	this.showAddNumbers= function(){
		this.empty();
		this.addNumbers = true;
	}

	this.showUpdates = function(){
		this.empty();
		this.updates = true;
	}
	this.showCampaignUpdates = function(){
		this.empty();
		this.campaignUpdates = true;
	}
	this.showUpdates();

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

}]);