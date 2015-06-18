angular.module('PhoneCtrl',[]).controller('PhoneController',['$scope','$sessionStorage','$http','socket',function(scope,session,http,socket){

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
	scope.firstCall = true;

	//initializing the radio buttons
	this.pickedup = -1;
	this.enthusiasm = -1;
	this.lead = -1;
	scope.calledPrevious = false;
 
 	//making the phone call
    this.call = function(){
        // get the phone number to connect the call to
        if(scope.calledPrevious){
        	var r = confirm("If you call this number again and don't submit notes on your previous call, the data wont be saved. Continue anyway?");
        	if(r){
        		return;
        	}
        }
        if(scope.number!=""){
	        params = {"calledNumber": scope.number,
	                "outgoingNumber": scope.outgoingNumber,
	            	"authorization": session.token};

	        Twilio.Device.connect(params);
	        scope.called = true;
	        scope.notesSubmitted = false;
	        scope.firstCall = false;
	    	scope.calledPrevious = true;
	    }else{
	    	scope.showWarning("Press the get next number button!");
	    }
    }
 	
 	//hanging up that phone call
    this.hangUp = function() {
		Twilio.Device.disconnectAll();
    }

 	this.addNotes = function(){
 		if(this.pickedup == -1){
 			scope.showWarning("Did they pick up?");
 		}
 		else if(this.lead == -1){
 			scope.showWarning("Was it a lead?");
 		}
 		else if(this.enthusiasm == -1){
 			scope.showWarning("Were they enthsiastic?");
 		}
 		else if(scope.phoneCallNotes == ""){
 			scope.showWarning("Please enter something about the call!");
 		}
 		else if(scope.called == true && scope.firstCall == false){
 			if(scope.notesSubmitted == true){
 				var r = alert("Overwrite previous call notes?");
 				if(r == true)
 					return;
 			}
	 		http({
	 			method:'PUT',
	 			url:'/api/call/notes',
	 			data: {
	 				'notes' : scope.phoneCallNotes,
	 				'contactEmail' : scope.contactEmail,
	 				'additionalNumber' : scope.additionalNumber,
	 				'pickedup' : this.pickedup,
	                'enthusiasm' : this.enthusiasm,
	                'lead' : this.lead
	 			},
	 			cache: false
	 		}).success(function(data){
	 			console.log(data);
	 			scope.notesSubmitted = true;
	 			scope.firstCall = false;
	 			scope.showInfo("Notes successfully added!");
	 			socket.emit('call:update',{
					'authorization':session.token
				});
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
		if(number==null){
			scope.showWarning("Not a number!");
		}
		else if(number.substring(0,4) != '0044'){
			scope.showWarning("Please enter the country code 0044");
		}
		else if(business==null){
			scope.showWarning("Not a business name!");
		}
		else if(address==null){
			scope.showWarning("Not an address!");
		} 
		else if(scope.called == true && scope.notesSubmitted == true){
			scope.phoneCallNotes = "";
			this.pickedup = -1;
			this.lead = -1;
			this.enthusiasm = -1;
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
					scope.showInfo(data.message);
					this.phone_number_id = data.numberData._id;
					scope.calledPrevious = false;
					scope.number = data.numberData.number;
					scope.business = data.numberData.business;
					scope.address = data.numberData.address;
					scope.contactEmail = "";
	 				scope.additionalNumber = "";
				});
			});
		}else{
	 		scope.showWarning("Submit the notes on the call you just made first!");
	 	}
    };

    //get the next number
 	this.getNextNumber = function(){

 		var badNumber = false;

 		if(!(scope.called == true && scope.notesSubmitted == true)){
 			var r = confirm("Are you sure you want to skip this number?");
 			if(!r){
 				scope.showWarning("Please make the call then submit the notes!");
 				return;
 			}else{
 				badNumber = true;
 			}
 		}
 		// if(scope.called == true && scope.notesSubmitted == true){
		scope.phoneCallNotes = "";
		this.pickedup = -1;
		this.lead = -1;
		this.enthusiasm = -1;
		http({
			method:'PUT',
			url:'api/phoneNumber',
			data:{badNumber:badNumber}
		}).success(function(data){
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
				scope.calledPrevious = false;
				scope.showInfo("Got next number!");
				scope.contactEmail = "";
	 			scope.additionalNumber = "";
				// scope.updateCalls(); //this updates the calls for the stats
	 		});
		});
	 	// }
	 	// else{
	 	// 	scope.showWarning("Please make the call then submit the notes!");
	 	// }
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
    	getToken(function(data){
			Twilio.Device.setup(data.calltoken);
		});
    });
 
    Twilio.Device.connect(function (conn) {
    	scope.log = "Successfully established call";
    	scope.$apply();
    });
 
    Twilio.Device.disconnect(function (conn) {
        scope.log = "Call ended";
    });
}]);