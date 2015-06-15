// public/js/app.js
angular.module('app', ['ngRoute','ngStorage','appRoutes','ui.bootstrap','btford.socket-io','ngAnimate', 'toasty','nvd3ChartDirectives','chart.js',
    'AgentCtrl','AuthCtrl','PhoneCtrl','AddNumbersCtrl','AppointmentsCtrl','NuggetCtrl','StatsCtrl','AdminCtrl','UpdatesCtrl','ClientCtrl','ClientLeadsCtrl','ClientStatsCtrl','ClientNuggetsCtrl','ScriptCtrl',
    'PhoneDir','AddNumbersDir','AppointmentsDir','NuggetDir','StatsDir','UpdatesDir','ClientLeadsDir','ClientStatsDir','ClientNuggetsDir','ScriptDir'])

.run(['$rootScope','$location','$sessionStorage', function (root, location, session){
	
	root.$on("$routeChangeStart", function (event, next, current) {
        if(next.$$route){
            var nextUrl = next.$$route.originalPath;
            if (!session.token) {
                if (nextUrl != '/login') {
                    location.path('/login');
                }
            }
            // else{
            //     if (nextUrl == '/login') {
            //         location.path('/');
            //     }
            // }
        }else{
            location.path('/login');
        }
    });
}])

.factory('myHttpResponseInterceptor',['$q','$location','$sessionStorage',function($q, $location,session) { 
	return {
        request: function (config) {
            config.headers = config.headers || {};
            if (session.token) {
                config.headers.Authorization = 'Bearer ' + session.token;
            }
            return config;
        },
        responseError: function(response) {
            if(response.status === 401 || response.status === 403) {
                $location.path('/login');
            }
            return $q.reject(response);
        }
    };
}])

.directive('iframeSetDimensionsOnload', [function(){
return {
    restrict: 'A',
    link: function(scope, element, attrs){
        element.on('load', function(){
            /* Set the dimensions here, 
               I think that you were trying to do something like this: */
               var iFrameHeight = element[0].contentWindow.document.body.scrollHeight + 'px';
               var iFrameWidth = '100%';
               element.css('width', iFrameWidth);
               element.css('height', iFrameHeight);
        })
    }
}}])

.factory('socket', ['socketFactory', function(socketFactory){
    return socketFactory();
}])

.config(['$httpProvider',function($httpProvider) {
	$httpProvider.interceptors.push('myHttpResponseInterceptor');
}]);