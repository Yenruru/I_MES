// Angular module
define(["angular", "angularAMD", "moment", "d3",
        //"angular-material",
        "angular-material-lite", "angular-swipe", "angular-animate", 
        "angular-touch",  "angular-ui-router", "angular-css", "angular-translate", "angular-sanitize",
        //"ng-persist",
        "loader-static-files", "angular-pinch-zoom", 
		"angular-soap"
        //"ionic-angular"
        //, "angular-sqlite"
        ], 
    function (angular, angularAMD, moment, d3) {
		'use strict';
	    return angular.module("app",[
	        "ui.router", "pascalprecht.translate", "angularCSS", "ngMaterialLite", 
	        "ngPinchZoom", "swipe", "ngAnimate", "ngSanitize", "ngTouch", 
			"angularSoap",
	        //'ngStorage',
	        //'ng-persist', 
	        //"ionic"
	        //, "ngSQLite"
	    ]);
	}
);