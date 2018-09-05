define(['app', 'angularAMD', 'angular-ui-router', 'loader-static-files'], function (app, angularAMD) {
    'use strict';
    var $stateProviderRef;
    app.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
    	// Don't sync the url till we're ready
    	$urlRouterProvider.deferIntercept();
    	  
    	//Setting System Router
        $stateProvider
        .state("login", angularAMD.route({
            url          : "/login",
            params       : {},
            templateUrl  : "program/system/login/login.html",
            controllerUrl: "program/system/login/login.js",
            css          : "program/system/login/login.css"
        }))
        .state("home", angularAMD.route({
        	url          : "/home",
        	params       : {
        		"data":{}
        	},
	      	templateUrl  : "program/system/home/home.html",
        	controllerUrl: "program/system/home/home.js",
        	css          : "program/system/home/home.css"
        }))
        .state("menu", angularAMD.route({
        	url          : "/menu",
        	params       : {},
	      	templateUrl  : "program/system/menu/menu.html",
        	controllerUrl: "program/system/menu/menu.js",
        	css          : "program/system/menu/menu.css"
        }))
        .state("setting", angularAMD.route({
            url          : "/setting",
            //parent       : "home",
            params       : {parent:''},
            templateUrl  : "program/system/setting/setting.html",
            controllerUrl: "program/system/setting/setting.js",
            css          : "program/system/setting/setting.css"
        }));       
           
        
        $urlRouterProvider.otherwise("/login");
        $stateProviderRef = $stateProvider;

    }])
    // Get Config json file
    .run(['$http', '$urlRouter', '$rootScope', '$state', '$templateCache', function($http, $urlRouter, $rootScope, $state, $templateCache){
    	//Get program.json file, and put into state
    	$http.get('config/program.json').success(function(data){
    		angular.forEach(data,function(value, key){
    			var state = angularAMD.route(value);
    			
    			state.onEnter = function(){
    				//TODO
    			};
                $stateProviderRef.state(value.name, state);
    		});
    		$urlRouter.sync();
            $urlRouter.listen();
    	});
    }]);
});