// public/js/appRoutes.js
    angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function(route, location) {

    route.
        when('/agent',{
            templateUrl: 'views/agent.html',
            controller: 'AgentController',
            controllerAs:'agent'
        }).
        when('/client',{
            templateUrl: 'views/client.html',
            controller: 'ClientController',
            controllerAs:'client'
        }).
        when('/admin',{
            templateUrl: 'views/admin.html',
            controller: 'AdminController',
            controllerAs:'admin'
        }).
        when('/login',{
            templateUrl: 'views/login.html',
            controller: 'AuthController',
            controllerAs: 'auth'
        }).
        otherwise({
            redirectTo: '/login'
        });

    location.html5Mode(true);

}]);