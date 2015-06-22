// public/js/app.js
angular.module('app', ['ngRoute','ngStorage','appRoutes','ui.bootstrap','ui.calendar','btford.socket-io','ngAnimate', 'toasty','nvd3ChartDirectives','chart.js','ngDialog',
    'AgentCtrl','AuthCtrl','PhoneCtrl','AddNumbersCtrl','AppointmentsCtrl','NuggetCtrl','StatsCtrl','AdminCtrl','UpdatesCtrl','ClientCtrl','ClientLeadsCtrl','ClientStatsCtrl','ClientNuggetsCtrl','ScriptCtrl','AgentCampaignUpdatesCtrl','AdminCampaignUpdatesCtrl','AdminSchedulerCtrl',
    'PhoneDir','AddNumbersDir','AppointmentsDir','NuggetDir','StatsDir','UpdatesDir','ClientLeadsDir','ClientStatsDir','ClientNuggetsDir','ScriptDir','AgentCampaignUpdatesDir','AdminCampaignUpdatesDir','AdminSchedulerDir'])

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

.factory('socket', ['socketFactory', function(socketFactory){
    return socketFactory();
}])

.config(['$httpProvider',function($httpProvider) {
	$httpProvider.interceptors.push('myHttpResponseInterceptor');
}])

.directive('clientScript', ['$window', function (window) {
        return {
            restrict: 'E',
            scope: {
              url: '='
            },
            template:'<div id="container"></div>',
            link: function (scope, element, attrs) {
                
                scope.$watch('url', function(newurl) {
                    scope.render();
                }, true);

                scope.render = function(){
                    var e = element.find('div');
                    e.html('');
                    if (!scope.url) {
                        return;
                    } else {
                        var inner = '<iframe src="'+scope.url+'" id="script-frame"></iframe>'
                        e.html(inner);
                    }
                }
            }
        };
    }
])

.directive('modal', function () {
    return {
      template: '<div class="modal fade">' + 
          '<div class="modal-dialog">' + 
            '<div class="modal-content">' + 
              '<div class="modal-header">' + 
                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' + 
                '<h4 class="modal-title">{{ title }}</h4>' + 
              '</div>' + 
              '<div class="modal-body" ng-transclude></div>' + 
            '</div>' + 
          '</div>' + 
        '</div>',
      restrict: 'E',
      transclude: true,
      replace:true,
      scope:true,
      link: function postLink(scope, element, attrs) {
        scope.title = attrs.title;

        scope.$watch(attrs.visible, function(value){
          if(value == true)
            $(element).modal('show');
          else
            $(element).modal('hide');
        });

        $(element).on('shown.bs.modal', function(){
          scope.$apply(function(){
            scope.$parent[attrs.visible] = true;
          });
        });

        $(element).on('hidden.bs.modal', function(){
          scope.$apply(function(){
            scope.$parent[attrs.visible] = false;
          });
        });
      }
    };
  });

;