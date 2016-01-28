// /**
// * app Module
// *
// * Description
// */
var app = angular.module('app', ['ui.router','ngAnimate','mgcrea.ngStrap','textAngular','ngCsvImport','ngSanitize'])

.config(function($stateProvider, $urlRouterProvider, $locationProvider,$httpProvider) {
    //================================================
    // Check if the user is authenticated
    //================================================
    var checkLoggedin = function($q, $timeout, $http, $state, $rootScope){
      // Initialize a new promise
      var deferred = $q.defer();
      // Make an AJAX call to check if the user is logged in
      $http({
        method:'GET',
        url:'/auth/client/loggedin',
        cache: false
      }).success(function(data){
        // Authenticated
        if (data !== '0'){
          /*$timeout(deferred.resolve, 0);*/
          $rootScope.user = {
            name: data.user.name,
            _id: data.user._id
          }
          deferred.resolve();
        // Not Authenticated
        }else {
          $timeout(function(){
            deferred.reject();
          }, 0);
          deferred.reject();
          $state.go('login');
        }
      });
      return deferred.promise;
    };

    var isLoggedin = function($q, $timeout, $http, $state, $rootScope){
      // Initialize a new promise
      var deferred = $q.defer();
      // Make an AJAX call to check if the user is logged in
      $http({
        method:'GET',
        url:'/auth/client/loggedin',
        cache: false
      }).success(function(data){
        // Authenticated
        if (data !== '0'){
          /*$timeout(deferred.resolve, 0);*/
          $rootScope.user = {
            name: data.user.name,
            _id: data.user._id
          }
          deferred.reject();
          console.log(data);
          if(data.campaign_id){
            $state.go('home.dashboard.setup',{'campaign_id':data.campaign_id});
          }else{
            $state.go('home');
          }
        // Not Authenticated
        }else {
          $timeout(function(){
            deferred.reject();
          }, 0);
          deferred.resolve();
        }
      });
      return deferred.promise;
    };

    //================================================
    //================================================
    // Add an interceptor for AJAX errors
    //================================================
    $httpProvider.interceptors.push(function($q, $location) {
      return {
        response: function(response) {
          // do something on success
          return response;
        },
        responseError: function(response) {
          if (response.status === 401)
            $location.url('/');
          return $q.reject(response);
        }
      };
    });

    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);
    $stateProvider

      // HOME STATES AND NESTED VIEWS ========================================
      .state('login', {
        url: '/',
        templateUrl: 'partials/login',
        controller: 'loginCtrl',
        resolve: {
          isLoggedIn: isLoggedin
        }
      })

      .state('home', {
        url: '/dashboard/',
        templateUrl: 'partials/home',
        controller: 'homeCtrl',
        resolve: {
          isLoggedIn: checkLoggedin
        }
      })

      .state('home.dashboard', {
        url: ':campaign_id/',
        templateUrl: 'partials/dashboard',
        controller: 'dashboardCtrl',
        resolve: {
          isLoggedIn: checkLoggedin
        }
      })

      .state('home.dashboard.setup', {
        url: 'setup',
        templateUrl: 'partials/setup',
        controller: 'setupCtrl'
      })

      .state('home.dashboard.results', {
        url: 'results',
        templateUrl: 'partials/results',
        controller: 'resultsCtrl'
      })

      .state('home.dashboard.stats', {
        url: 'stats',
        templateUrl: 'partials/stats',
        controller: 'statsCtrl'
      })

      .state('home.dashboard.updates', {
        url: 'updates',
        templateUrl: 'partials/updates',
        controller: 'updatesCtrl'
      });
});