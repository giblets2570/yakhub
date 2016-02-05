// /**
// * app Module
// *
// * Description
// */
var app = angular.module('app', ['ngSanitize','ui.router','ngAnimate','mgcrea.ngStrap'])

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
        url:'/auth/agent/loggedin',
        cache: false
      }).success(function(data){
        // Authenticated
        if (data !== '0'){
          /*$timeout(deferred.resolve, 0);*/
          $rootScope.user = {
            name: data.user.name,
            email: data.user.email,
            created: new Date(data.user.created).valueOf(),
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
        url:'/auth/agent/loggedin',
        cache: false
      }).success(function(data){
        // Authenticated
        if (data !== '0'){
          /*$timeout(deferred.resolve, 0);*/
          $rootScope.user = {
            name: data.user.name,
            email: data.user.email,
            created: new Date(data.user.created).valueOf(),
            _id: data.user._id
          }
          deferred.reject();
          $state.go('home.campaigns');
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

    var isStripeSetup = function($q, $timeout, $http, $state, $rootScope){
      // Initialize a new promise
      var deferred = $q.defer();
      // Make an AJAX call to check if the user is logged in
      $http({
        method:'GET',
        url:'/auth/agent/stripe',
        cache: false
      }).success(function(data){
        // Authenticated
        if (data !== '0'){
          /*$timeout(deferred.resolve, 0);*/
          deferred.resolve();
        // Not Authenticated
        }else {
          $timeout(function(){
            deferred.reject();
          }, 0);
          deferred.reject();
          $state.go('home.stripe');
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
        abstract: true,
        controller: 'homeCtrl',
        resolve: {
          isLoggedIn: checkLoggedin
        }
      })

      .state('home.stripe', {
        url: 'stripe',
        templateUrl: 'partials/stripe',
        controller: 'stripeCtrl',
        resolve: {
          isLoggedIn: checkLoggedin
        }
      })

      .state('home.dialer', {
        url: ':campaign_id',
        templateUrl: 'partials/dialer',
        controller: 'dialerCtrl',
        resolve: {
          isLoggedIn: checkLoggedin,
          isStripeSetup: isStripeSetup,
        }
      })

      .state('home.campaigns', {
        url: 'campaigns',
        templateUrl: 'partials/campaigns',
        controller: 'campaignsCtrl',
        resolve: {
          isLoggedIn: checkLoggedin,
          isStripeSetup: isStripeSetup,
        }
      });
})