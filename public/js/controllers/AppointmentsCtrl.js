angular.module('AppointmentsCtrl',[]).

	controller('AppointmentsController',['$scope','$interval','$sessionStorage','$http','socket',function(scope,interval,session,http,socket){

	scope.myAppointments = [];

	this.number = "";
	this.address = "";
	this.business = "";
	this.notes = "";

	socket.on('appointments:appointments',function(data){
		scope.myAppointments = data.appointments;
		
		for(var i = 0; i < scope.myAppointments.length; i++){
			console.log(scope.myAppointments[i].time);
			scope.myAppointments[i].time = new Date(scope.myAppointments[i].time);
			scope.myAppointments[i].mine = data.mine[i];
		}
		console.log(scope.myAppointments);
		scope.$apply();
	});

	scope.isMine = function(appointment){
		if(appointment.mine)
			return 'success';
		return '';
	}

	scope.isNear = function(appointment){
		var minutes = Math.floor((appointment.time - scope.now)/(1000*60));
		if(minutes < 5){
			return 'danger';
		}
		return scope.isMine(appointment);
	}

	socket.on('appointments:update',function(data){
		scope.getAppointments();
	});

	socket.on('appointments:error',function(data){
		scope.showWarning(data.error);
	});

	scope.getAppointments = function(){
		socket.emit('appointments:getAppointments',{
			'authorization':session.token
		});
	}

	scope.getAppointments();

	this.fillFields = function(){
		this.number = scope.number;
		this.business = scope.business;
		this.address = scope.address;
		this.notes = scope.phoneCallNotes;
	}

	this.addAppointment = function(){
		if(this.number == ""){
			scope.showWarning("Please input a proper number!");
		}else if(this.address == ""){
			scope.showWarning("Please input a proper address!");
		}else if(this.business == ""){
			scope.showWarning("Please input a proper business name!");
		}else{
			socket.emit('appointments:addAppointment',{
				'authorization':session.token,
				'number':this.number,
				'business':this.business,
				'address':this.address,
				'notes':this.notes,
				'date':this.dt.toString()
			});
			this.number = "";
			this.address = "";
			this.business = "";
			this.adding=false;
		}
	}

	this.adding=false;
	this.startAdding = function(){
		this.adding=true;
		console.log(this.dt);
	}
	this.stopAdding = function(){
		this.adding=false;
	}

	this.takeAppointment = function(appointment){
		if(scope.called == true && scope.notesSubmitted == true){
			var a = scope.myAppointments.filter(function(entry){
				return entry._id === appointment;
			})[0];
			var i = scope.myAppointments.indexOf(a);
			console.log(scope.myAppointments[i]);
			var newNumber = scope.myAppointments[i].number;
			var newBusiness = scope.myAppointments[i].business;
			var newAddress = scope.myAppointments[i].address;
			var notes = scope.myAppointments[i].notes;
			http({
				method:'PUT',
				url:'api/phoneNumber'
			}).success(function(data){
				console.log(data);
				http({
					method:'POST',
					url:'api/phoneNumber',
					data: {
						'number' : newNumber,
						'business' : newBusiness,
						'address' : newAddress
					}
				}).success(function(data){
					scope.number = data.numberData.number;
					scope.business = data.numberData.business;
					scope.address = data.numberData.address;
					scope.called = false;
					scope.phoneCallNotes = notes;
					socket.emit('appointments:takeAppointment',{
						'appointment':appointment,
						'authorization':session.token
					});
					scope.calledPrevious = false;
					scope.showInfo("Appointment successfully taken!");
				});
			});
		}else{
			scope.showWarning("Please complete your current call before taking an appointment!");
		}
	}

	this.hstep = 1;
  	this.mstep = 15;

	this.today = function() {
		this.dt = new Date();
	};

	this.today();

	scope.rightNow = function(){
		scope.now = new Date();
	};

	scope.rightNow();

	// interval(this.today, 30000);
	interval(scope.rightNow,10000);
	
	this.clear = function () {
		this.dt = null;
	};

	// Disable weekend selection
	this.disabled = function(date, mode) {
		return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
	};

	this.toggleMin = function() {
		this.minDate = this.minDate ? null : new Date();
	};
	this.toggleMin();

	this.open = function($event) {
		$event.preventDefault();
		$event.stopPropagation();

		this.opened = true;
	};

	this.dateOptions = {
		formatYear: 'yy',
		startingDay: 1
	};

	this.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
	this.format = this.formats[0];

	var tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	var afterTomorrow = new Date();
	afterTomorrow.setDate(tomorrow.getDate() + 2);
	this.events =
	[
		// {
		// 	date: tomorrow,
		// 	status: 'full'
		// },
		// {
		// 	date: afterTomorrow,
		// 	status: 'partially'
		// }
	];

	this.getDayClass = function(date, mode) {
		if (mode === 'day') {
			var dayToCheck = new Date(date).setHours(0,0,0,0);

			for (var i=0;i<this.events.length;i++){
				var currentDay = new Date(this.events[i].date).setHours(0,0,0,0);

				if (dayToCheck === currentDay) {
					return this.events[i].status;
				}
			}
		}

		return '';
	};

}]);