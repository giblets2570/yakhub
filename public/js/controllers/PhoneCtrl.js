angular.module('PhoneCtrl',[]).controller('PhoneController',['$scope','$sessionStorage','$http',function(scope,session,http){

	scope.log='Setting up...';

	this.id = session.id;

	var getToken = function(callback){
		http({
			method:'GET',
			url: '/api/twilio',
			cache: false
		}).success(callback);
	};

	getToken(function(data){
		Twilio.Device.setup(data.calltoken);
	});

	//initializing the phone number
	scope.number = "";
	scope.business = "";
	scope.address = "";

	scope.called = true;
	scope.notesSubmitted = true;

	//initializing the radio buttons
	this.pickedup = false;
	this.enthusiasm = -1;
	this.lead = false;
 
 	//making the phone call
    this.call = function(){
        // get the phone number to connect the call to
        if(scope.number!=""){
	        params = {"calledNumber": scope.number,
	                "outgoingNumber": scope.outgoingNumber,
	            	"authorization": session.token};

	        Twilio.Device.connect(params);
	        scope.called = true;
	        scope.notesSubmitted = false;
	    }else{
	    	scope.showWarning("Press the get next number button!");
	    }
    }
 	
 	//hanging up that phone call
    this.hangUp = function() {
		Twilio.Device.disconnectAll();
    }

 	this.addNotes = function(){
 		if(scope.called == true){
	 		http({
	 			method:'PUT',
	 			url:'/api/call/notes',
	 			data: {
	 				'notes' : this.phoneCallNotes,
	 				'pickedup' : this.pickedup,
	                'enthusiasm' : this.enthusiasm,
	                'lead' : this.lead
	 			},
	 			cache: false
	 		}).success(function(data){
	 			console.log(data);
	 			scope.notesSubmitted = true;
	 			scope.showInfo("Notes successfully added!");
	 		});
	 	}else{
	 		scope.showWarning("You need to make a call before submitting notes!");
	 	}
 	}

 	this.getNotes = function(){
 		http({
 			method:'GET',
 			url:'/api/call/notes',
 			cache: false
 		}).success(function(data){
 			console.log(data);
 		});
 	}

 	//new business input
	this.addNewNumber = function(number,business,address){
		if(scope.called == true && scope.notesSubmitted == true){
			http({
				method:'PUT',
				url:'api/phoneNumber'
			}).success(function(data){
				console.log(data);
				http({
					method:'POST',
					url:'api/phoneNumber',
					data: {
						'number' : number,
						'business' : business,
						'address' : address
					}
				}).success(function(data){
					console.log(data);
					this.phone_number_id = data.numberData._id;

					scope.number = data.numberData.number;
					scope.business = data.numberData.business;
					scope.address = data.numberData.address;

					this.phoneCallNotes = "";
					this.pickedup = false;
					this.lead = false;
					this.enthusiasm = -1;
				});
			});
		}else{
	 		scope.showWarning("Submit the notes on the call you just made first!");
	 	}
    };

    //get the next number
 	this.getNextNumber = function(){
 		if(scope.called == true && scope.notesSubmitted == true){
 			this.phoneCallNotes = "";
			this.pickedup = false;
			this.lead = false;
			this.enthusiasm = -1;
	 		http({
	 			method:'GET',
	 			url:'/api/phoneNumber',
	 			cache: false
	 		}).success(function(data){
	 			console.log(data);
	 			if(data.error){
	 				console.log(data.error);
	 				scope.showWarning(data.error);
	 				return;
	 			}
	 			this.phone_number_id = data.numberData._id;
				scope.number = data.numberData.number;
				scope.business = data.numberData.business;
				scope.address = data.numberData.address;
				scope.called = false;
				scope.showInfo("Got next number!");
	 		});
	 	}else{
	 		scope.showWarning("Please make the call then submit the notes!");
	 	}
 	};

    //Twilio javascript
    Twilio.Device.ready(function (device) {
        scope.log = "Ready";
        console.log(scope.log);
        scope.$apply();
    });
 
    Twilio.Device.error(function (error) {
    	scope.log = "Error: " + error.message;
    	scope.$apply();
    });
 
    Twilio.Device.connect(function (conn) {
    	scope.log = "Successfully established call";
    	scope.$apply();
    });
 
    Twilio.Device.disconnect(function (conn) {
        scope.log = "Call ended";
    });
}]);