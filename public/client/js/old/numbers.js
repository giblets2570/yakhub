/**
* numbersApp Module
*
* Description
*/
angular.module('numbersApp', ['navbarApp','ngCsvImport','ngAnimate', 'ngSanitize','mgcrea.ngStrap'])

.controller('numbersCtrl', function($scope,$modal,$location,$filter,$window,Lead){
	$scope.pageEntries = 20;
	$scope.noOfPages= 1;
	$scope.filter = {
		called: false,
		page: 0
	};
	$scope.convert = {
		'number':['number','phone','phone number'],
		'company':['company','company name','business','business name'],
		'address':['address','company address'],
		'name':['name','contact name','person','contact','person name'],
		'role':['role','job','title','job title'],
		'email':['email','email address'],
		'notes':['note','notes'],
		'outcome':['outcome'],
		'called':['called','done']
	}

	$scope.changePage = function(value){
		if(value < 0){return;}
		if(value > $scope.noOfPages - 1){return;}
		$scope.filter.page = value;
		$location.search("page",$scope.filter.page+1);
	}

	$scope.isCalled = function(lead){
		return lead.called ? "Yes" : "No";
	}

	$scope.getLeads = function(){
		Lead.get({mine: true},'').then(function(data){
			$scope.leads = data;
			console.log($scope.leads);
		})
	}
	$scope.init = function(){
		var params = $location.search();
		if(params.called)
			$scope.filter.called = true;
		$scope.getLeads();
	};
	$scope.replace = function(){
		Lead.remove().then(function(data){
			$scope.leads = [];
			console.log(data);
			$scope.save();
		})
	}
	$scope.save = function(){
		var result = []
		$scope.csv.result = JSON.parse($scope.csv.result);
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
		console.log(result);
		$scope.leads = $scope.leads.concat(result);
		Lead.add({
			leads: result
		}).then(function(data){
			console.log(data);
			$scope.setCSV();
			$scope.applyFilter($scope.called);
		})
	}
	$scope.setCSV = function(){
		$scope.csv={
			header: true ,
			separator: ","
		}
	}
	$scope.setCSV();
	// Helper function that gets an array of numbers, for the pages.
	$scope.getNumber = function(num) {
	    var result = []
	    for (var i = 0; i < num; i++)
	    	result.push(i)
	    return result
	}
	var CSVModal = $modal({scope: $scope, templateUrl: '../../../client/views/templates/add-numbers-modal.html', show: false});
	$scope.showCSVModal = function() {
		CSVModal.$promise.then(CSVModal.show);
	};
	var replaceModal = $modal({scope: $scope, templateUrl: '../../../client/views/templates/replace-numbers-modal.html', show: false});
	$scope.showReplaceModal = function() {
		replaceModal.$promise.then(replaceModal.show);
	};
	$scope.applyFilter = function(called){
		$scope.filtered = $filter('callFilter')($scope.leads, called);
		if($scope.filtered){
			$scope.totalItems = $scope.filtered.length;
			$scope.noOfPages = Math.ceil($scope.totalItems / $scope.pageEntries);
		}
	}
	$scope.download = function(){
		var oldPage;
		if($scope.filter.page){
			oldPage = $scope.filter.page;
			$scope.filter.page = null;
			$scope.applyFilter($scope.filter);
		}
		var result = 'number\tcompany\tname\trole\toutcome\tcalled\n';
		for (var i = 0; i < $scope.filtered.length; i++) {
			result += $scope.filtered[i].number+'\t'+$scope.filtered[i].company+'\t'+$scope.filtered[i].person.name+'\t'+$scope.filtered[i].person.role+'\t'+$scope.filtered[i].outcome+'\t'+$scope.filtered[i].called+'\n';
		};
		if(oldPage){
			$scope.filter.page = oldPage;
			$scope.applyFilter($scope.filter);
		}
    	$window.open("data:text/csv;charset=utf-8," + encodeURIComponent(result));
	}
	// When the time is changed, we update the url query string
	$scope.changeCalled = function(){
		$scope.filter.called ? $location.search('called', $scope.filter.called) : $location.search('called', null)
	}
	$scope.$watch('filter', function (newVal, oldVal) {
		$scope.applyFilter(newVal);
	}, true);
})
.filter('callFilter',function(){
	return function(input, called){
		if(!called || !input) return input;
		var result = [];
		for (var i = 0; i < input.length; i++) {
			if(input[i].called)
				result.push(input[i])
		};
		return result;
	}
})