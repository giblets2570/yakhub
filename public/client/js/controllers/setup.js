/**
* appControllers Module
*
* Description
*/

app.controller('setupCtrl', ['$scope','$state','Client','Alert','Campaign','Lead','$modal','$location','$filter','$window','$interval',function($scope,$state,Client,Alert,Campaign,Lead,$modal,$location,$filter,$window,$interval){
	$scope.current_screen = 'brief';
	$scope.pageEntries = 50;
	$scope.leads_loaded = false;
	$scope.end_time_period = "AM";
	$scope.day_mapper = {
		'mon':'Monday',
		'tues':'Tuesday',
		'wed':'Wednesday',
		'thurs':'Thursday',
		'fri':'Friday',
		'sat':'Saturday',
		'sun':'Sunday'
	}
	$scope.changesMade = false;
	$scope.getDays = function(){
		var result = '';
		if(!$scope.campaign) return "";
		for(var key in $scope.campaign.days){
			if($scope.campaign.days[key]){
				if(!result){
					result+=$scope.day_mapper[key]
				}else{
					result=$scope.day_mapper[key]+", "+result
				}
			}
		}
		return result;
	}
	$scope.changeLive = function(bool){
		var q;
		if(bool) {
			if($scope.client.funds-$scope.client.funds_used<=0){
				alert("You have insufficient funds to make this campaign live!");
				return;
			}
			if(!$scope.campaign.start_date || !$scope.campaign.end_date){
				alert("You need to specify the range of dates you want the campaign to run for");
				$scope.changeScreen('brief');
				return;
			}
			if($scope.campaign.start_date > $scope.campaign.end_date){
				alert("Your end date in is before your start date");
				$scope.changeScreen('brief');
				return;
			}
			q = "Are you sure you want to start your campaign?"
		}
		else {q = "Are you sure you want to end your campaign?"}
		if(confirm(q)) $scope.campaign.live = bool;
	}
	$scope.getLeads = function(){
		Alert.warning('Loading leads...').then(function(loading){
			loading.show();
			Lead.get({campaign_id: $scope.campaign._id},'').then(function(data){
				$scope.leads = data;
				for (var i = $scope.leads.length - 1; i >= 0; i--) {
					if($scope.leads[i].call_timestamp)
						$scope.leads[i].call_timestamp = new Date($scope.leads[i].call_timestamp);
				};
				$scope.applyFilter();
				loading.hide();
				Alert.success('Leads loaded','',3).then(function(loading){
					loading.show();
				})
			})
		})
	};
	$scope.setScreen = function(){
		var params = $location.search();
		if(params.step){
			$scope.current_screen = params.step;
		}else{
			$scope.current_screen = 'brief';
			$location.search('step','brief');
		}
	}
	$scope.$watch('campaign', function(c){
		if(c && c._id){
			console.log(c);
			$scope.start_time = String(c.start_time);
			$scope.end_time = String(c.end_time);
		}
	});
	$scope.changeTime = function(when){
		if(when=="start"){
			$scope.campaign.start_time = parseInt($scope.start_time)
		}else if(when=="end"){
			$scope.campaign.end_time = parseInt($scope.end_time)
		}
	}
	$scope.timePick = function(time,when){
		if(when=='start'){
			$scope.campaign.start_time = $scope.campaign.start_time % 24
			if(time=='PM')
				$scope.campaign.start_time+=24;
		}else if(when=='end'){
			$scope.campaign.end_time = $scope.campaign.end_time % 24
			if(time=='PM')
				$scope.campaign.end_time+=24;
		}
	}
	$scope.saveLeads = function(){
		// console.log(result);
		Alert.warning("Saving leads...","Don't leave the screen just yet").then(function(loading){
			loading.show();
			var result = []
			console.log($scope.csv.result);
			$scope.csv.result = JSON.parse($scope.csv.result);
			console.log($scope.csv.result);
			for (var i = $scope.csv.result.length - 1; i >= 0; i--) {
				var entry = {'person':{}}
				for(var key in $scope.csv.result[i]){
					for(var type in $scope.convert){
						if($scope.convert[type].indexOf(key.toLowerCase())>-1){
							if(type == 'name' || type == 'role'){
								entry.person[type] = $scope.csv.result[i][key]
							}else if(type == 'called'){
								if($scope.csv.result[i][key].toLowerCase() == 'false' || $scope.csv.result[i][key].toLowerCase() == 'n')
									entry[type] = false;
								else if($scope.csv.result[i][key].toLowerCase() == 'true' || $scope.csv.result[i][key].toLowerCase() == 'y')
									entry[type] = true;
							}else{
								entry[type] = $scope.csv.result[i][key]
							}
							break
						}
					}
				}
				result.push(entry);
			};
			var recursive = function(index, total_length, loading, data){
				console.log("Adding ",index);
				$scope.leads = $scope.leads.concat(result.slice(index-200,index));
				$scope.setCSV();
				$scope.applyFilter($scope.called);
				if(index>total_length){
					// console.log(data);
					loading.hide();
					Alert.success("Numbers added successfully",'',3).then(function(loading){
						loading.show();
					})
				}else{
					// console.log(data);
					Lead.add({
						leads: result.slice(index,index+200),
						campaign: $scope.campaign._id
					}).then(function(data){
						recursive(index+200,total_length,loading);
					})
				}
			}
			Lead.add({
				leads: result.slice(0,200),
				campaign: $scope.campaign._id
			}).then(function(data){
				// console.log(data);
				recursive(200,result.length,loading,data);
			})
		})
	}
	$scope.setScreen();
	$scope.isCurrentScreen = function(_screen){
		return $scope.current_screen == _screen ? 'strong' : 'weak';
	}
	$scope.isCurrentScreenForWrapper = function(_screen){
		return $scope.current_screen == _screen ? 'current-link' : 'not-current-link';
	}
	$scope.save = function(callback){
		if(!$scope.campaign) return;
		callback = callback || angular.noop;
		Campaign.update($scope.campaign,$scope.campaign._id).then(callback);
	}
	$scope.changeScreen = function(_screen){
		$scope.current_screen = _screen;
		$location.search('step',_screen);
		document.body.scrollTop = document.documentElement.scrollTop = 0;
		$scope.save();
		if(_screen=='list' && !$scope.leads_loaded){
			$scope.leads_loaded = true;
			$scope.getLeads();
		}
	}
	$scope.dayChosen = function(day){
		return $scope.campaign && $scope.campaign.days[day] ? 'btn-danger-cust' : 'btn-success-cust'
	}
	$scope.chooseDay = function(day){
		$scope.campaign.days[day] = !$scope.campaign.days[day];
	}
	$scope.toolbar = [
      ['p', 'h2', 'h3'],
      ['bold', 'italics', 'ul', 'ol', 'undo', 'redo'],
      [],
      ['insertImage','insertLink', 'wordcount']
  	];
  	$scope.addFAQ = function(){
		$scope.campaign.faqs.push({
			question: '',
			answer: ''
		})
	}
	$scope.deleteFAQ = function(index){
		$scope.campaign.faqs.splice(index,1);
	}
	$scope.addQuestion = function(){
		if($scope.campaign.questions.length > 5) return;
		$scope.campaign.questions.push({
			question: '',
			description: ''
		})
	}
	$scope.deleteQuestion = function(index){
		$scope.campaign.questions.splice(index,1);
	}
	// This stuff is for the leads
	$scope.filter = {
		called: false,
		uncalled: false
	};
	$scope.page = 0
	$scope.convert = {
		'number':['number','phone','phone number'],
		'company':['company','company name','business','business name'],
		'address':['address','company address'],
		'name':['name','contact name','person','contact','person name'],
		'role':['role','job','title','job title'],
		'email':['email','email address'],
		'notes':['note','notes'],
		'outcome':['outcome'],
		'rating':['rating','score','star','stars'],
		'called':['called','done']
	}
	var CSVModal = $modal({scope: $scope, templateUrl: '../../../client/templates/add-numbers-modal.html', show: false});
	$scope.showCSVModal = function() {
		CSVModal.$promise.then(CSVModal.show)
	};
	$scope.setCSV = function(){
		$scope.csv={
			header: true ,
			separator: ","
		}
	}
	$scope.setCSV();
	$scope.remove = function(){
		if(confirm("Are you sure you wish to remove your list of contacts?")){
			Lead.remove({campaign_id: $scope.campaign._id}).then(function(data){
				$scope.leads = [];
			});
		}
	}
	$scope.changePage = function(value){
		console.log(value,$scope.noOfPages,$scope.page);
		if(value < 0){return;}
		if(value > $scope.noOfPages - 1){return;}
		$scope.page = value;
		// $location.search("page",$scope.page+1);
	}
	$scope.download = function(){
		var oldPage;
		if($scope.page){
			oldPage = $scope.page;
			$scope.page = null;
			$scope.applyFilter($scope.filter);
		}
		var result = 'number\tcompany\tname\trole\toutcome\tcalled\n';
		for (var i = 0; i < $scope.filtered.length; i++) {
			result += $scope.filtered[i].number+'\t'+$scope.filtered[i].company+'\t'+$scope.filtered[i].person.name+'\t'+$scope.filtered[i].person.role+'\t'+$scope.filtered[i].outcome+'\t'+$scope.filtered[i].called+'\n';
		};
		result = result.replace(/\t/g,',');
		if(oldPage){
			$scope.page = oldPage;
			$scope.applyFilter($scope.filter);
		}
    	$window.open("data:text/csv;charset=utf-8," + encodeURIComponent(result));
	}
	$scope.applyFilter = function(filter){
		$scope.filtered = $filter('leadFilter')($scope.leads, filter);
		if($scope.filtered){
			$scope.totalItems = $scope.filtered.length;
			$scope.noOfPages = Math.ceil($scope.totalItems / $scope.pageEntries);
			console.log($scope.noOfPages)
		}
	}
	$scope.called = function(){
		if($scope.filter.uncalled) $scope.filter.uncalled = false;
	}
	$scope.uncalled = function(){
		if($scope.filter.called) $scope.filter.called = false;
	}
	$scope.getNumber = function(j){
		var r = []
		for (var i = 0; i < j; i++) {
			r.push(i);
		};
		return r
	}
	$scope.saving = $interval(function(){
		console.log("Checking if changes made");
		if(!$scope.changesMade) return;
		console.log("Changes were made");
		$scope.changesMade = false;
		Alert.warning('Saving campaign...').then(function(loading){
			loading.show();
			$scope.save(function(){
				loading.hide();
				Alert.success('Campaign saved!','',2).then(function(loading){
					loading.show();
				})
			})
		})
	}, 5000);
	$scope.$watch('filter', function (newVal, oldVal) {
		$scope.applyFilter(newVal);
	}, true);
	$scope.$watch('campaign', function (newVal, oldVal) {
		if($scope.firstLoad>0){
			$scope.firstLoad--;
		}else{
			$scope.changesMade = true;
			$scope.firstLoad--;
		}
	}, true);
	$scope.isCalled = function(lead){
		return lead.called ? "Yes" : "No";
	}
}])

.filter('formatDate', function(){
	return function(input){
		if(!input) return "";
		return input.getDate() + "/" + input.getMonth()+1 + "/" + input.getFullYear()
	}
})

.filter('pageFilter',function(){
	return function(input, page, pageEntries){
		if(!input) return []
		return input.slice(page*pageEntries,(page+1)*pageEntries);
	}
})

.filter('leadFilter',function(){
	return function(input, filter){
		if(!filter || (!filter.uncalled && !filter.called) || !input) return input;
		var result = [];
		for (var i = 0; i < input.length; i++) {
			if(!input[i].called && filter.uncalled)
				result.push(input[i])
			else if(input[i].called && filter.called)
				result.push(input[i])
		};
		return result;
	}
});