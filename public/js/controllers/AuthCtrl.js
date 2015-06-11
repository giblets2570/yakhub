angular.module('AuthCtrl',[]).controller('AuthController',['$scope','toasty','$sessionStorage','$location','$http',function(scope,toasty,session,location,http){

	this.agent=true;
	this.client=false;
	this.admin=false;

	this.empty = function(){
		this.agent=false;
		this.client=false;
		this.admin=false;
	}

	this.clientLogin = function(){
		this.empty();
		this.client = true;
	}
    this.agentLogin = function(){
    	this.empty();
    	this.agent = true;
    }
    this.adminLogin = function(){
    	this.empty();
    	this.admin = true;
    }

	this.loginAgent = function(){
		http({
			method: 'POST',
			url: 'agent_authenticate',
			data: {name: this.name, password: this.password},
			cache: false
		}).success(function(data){
			console.log(data.message);

			if(data.token){
				session.token = data.token;
				scope.showInfo("Successful login!");
				location.path('/agent');
			}else{
				scope.showWarning("Wrong username/password");
			}
		});
	};
	this.loginClient = function(){
		http({
			method: 'POST',
			url: 'client_authenticate',
			data: {name: this.name, password: this.password},
			cache: false
		}).success(function(data){
			console.log(data.message);

			if(data.token){
				session.token = data.token;
				scope.showInfo("Successful login!");
				location.path('/client');
			}else{
				scope.showWarning("Wrong username/password");
			}
		});
	};
	this.loginAdmin = function(){
		http({
			method: 'POST',
			url: 'admin_authenticate',
			data: {name: this.name, password: this.password},
			cache: false
		}).success(function(data){
			console.log(data.message);

			if(data.token){
				session.token = data.token;
				scope.showInfo("Successful login!");
				location.path('/admin');
			}else{
				scope.showWarning("Wrong username/password");
			}
		});
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

}]);