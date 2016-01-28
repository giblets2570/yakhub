/**
* infoApp Module
*
* Description
*/
angular.module('infoApp', ['navbarApp','textAngular','ngAnimate','ngSanitize','mgcrea.ngStrap'])

.controller('infoCtrl',function($scope,$modal,Campaign){
	$scope.score_definition={};
	$scope.contact_info={};
	$scope.getCampaignInfo = function(){
		Campaign.show({},'background website from_email demographic objective score_definition pricing contact_info follow_up_email questions faqs','mine').then(function(data){
			$scope.campaign = data;
			$scope.modal = {
				follow_up_email: data.follow_up_email
			}
		})
	}
	$scope.addQuestion = function(){
		if($scope.campaign.questions.length > 5) return;
		$scope.campaign.questions.push({
			question: '',
			description: ''
		})
	}
	var followUpModal = $modal({scope: $scope, templateUrl: '../../../client/views/templates/follow-up-modal.html', show: false});
	$scope.showFollowUpModal = function() {
		followUpModal.$promise.then(followUpModal.show);
	};
	$scope.deleteQuestion = function(index){
		$scope.campaign.questions.splice(index,1);
	}
	$scope.addFAQ = function(){
		$scope.campaign.faqs.push({
			question: '',
			answer: ''
		})
	}
	$scope.deleteFAQ = function(index){
		$scope.campaign.faqs.splice(index,1);
	}
	$scope.editAll = function(){
		$scope.edit_all = !$scope.edit_all;
	}
	$scope.save = function(){
		$scope.edit_all = !$scope.edit_all;
		for (var i = $scope.campaign.questions.length - 1; i >= 0; i--) {
			if($scope.campaign.questions[i].question == '')
				$scope.campaign.questions.splice(i,1);

		};
		for (var i = $scope.campaign.faqs.length - 1; i >= 0; i--) {
			if(!$scope.campaign.faqs[i].question || !$scope.campaign.faqs[i].answer)
				$scope.campaign.faqs.splice(i,1);
		};
		Campaign.update($scope.campaign,'mine').then(function(data){
			console.log(data);
		})
	}
	$scope.saveEmail = function(){
		Campaign.update({
			follow_up_email: $scope.modal.follow_up_email
		},'mine').then(function(data){
			console.log(data);
		})
	}
	$scope.init = function(){
		$scope.getCampaignInfo();
	};

})