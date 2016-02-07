// /**
// * app Module
// *
// * Description
// */
var app = angular.module('app', ['intercom','ui.router','ngAnimate','mgcrea.ngStrap'])

.config(function($stateProvider, $urlRouterProvider, $locationProvider,$httpProvider) {
    //================================================
    // Check if the user is authenticated
    //================================================
    var checkLoggedin = function($q, $timeout, $http, $state, $rootScope){
      console.log("checkloggedin");
      // Initialize a new promise
      var deferred = $q.defer();
      // Make an AJAX call to check if the user is logged in
      $http({
        method:'GET',
        url:'/auth/admin/loggedin',
        cache: false
      }).success(function(data){
        // Authenticated
        console.log("checkloggedin success", data);
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
      }).error(function(err){
        console.log(err);
      });
      return deferred.promise;
    };

    var isLoggedin = function($q, $timeout, $http, $state, $rootScope){
      // Initialize a new promise
      console.log("isloggedin");
      var deferred = $q.defer();
      // Make an AJAX call to check if the user is logged in
      $http({
        method:'GET',
        url:'/auth/admin/loggedin',
        cache: false
      }).success(function(data){
        // Authenticated
        console.log("isloggedin success", data);
        if (data !== '0'){
          /*$timeout(deferred.resolve, 0);*/
          $rootScope.user = {
            name: data.user.name,
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
        abstract: true,
        templateUrl: 'partials/home',
        controller: 'homeCtrl',
        resolve: {
          isLoggedIn: checkLoggedin
        }
      })

      .state('home.campaigns', {
        url: 'campaigns',
        templateUrl: 'partials/campaigns',
        controller: 'campaignsCtrl',
      })

      .state('home.agents', {
        url: 'agents',
        templateUrl: 'partials/agents',
        controller: 'agentsCtrl',
      });
})

// .config(['IntercomProvider', function(IntercomProvider) {
//   IntercomProvider.init('m28yn4x9');
// }])

// .directive("intercom", ['Intercom', function(Intercom) {
//   return {
//     link: function(scope, element, attrs) {
//       scope.$watch('user', function(user) {
//         if(user){
//           Intercom.boot({
//             // loaded user object should contain those attributes
//             // this is hardcoded for testing purposes :)
//             name: 'hello',
//             email: 'world@world.com',
//             created_at: 1234567890
//             // created_at should be a unix timestamp
//             // you can get a unix timestamp using
//             // Math.round(+new Date(user.created_at)/1000)
//           });
//         }
//       });
//     }
//   };
// }]);