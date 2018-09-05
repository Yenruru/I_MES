require.config({
	baseUrl: "./",
    paths: {
        // angular
        "angular": "plugins/angular/angular.min",
        // angular-ui
        "angular-ui-router": "plugins/angular-ui-router/angular-ui-router",
        // angular-animate
        "angular-animate": "plugins/angular-animate/angular-animate.min",
        // angular-aria
        "angular-aria": "plugins/angular-aria/angular-aria.min",
        // angular-material
        //"angular-material": "plugins/angular-material/angular-material.min",
        "material-design-lite": "plugins/angular-material-lite/material-design-lite/material",
        "angular-material-lite": "plugins/angular-material-lite/angular-material-lite",
        // angular-css
        "angular-css": "plugins/angular-css/angular-css",
        // angular-translate
        "angular-translate": "plugins/angular-translate/angular-translate.min",
        // angular-resource
        "angular-resource": "plugins/angular-resource/angular-resource.min",
        "loader-static-files" : "plugins/angular-translate/loader-static-files.min",
        // angular-touch
        "angular-touch" : "plugins/angular-touch/angular-touch.min",
        "angular-pinch-zoom" : "plugins/angular-pinch-zoom/ng-pinch-zoom",
        // angular-scroll
        "angular-swipe" : "plugins/angular-swipe/angular-swipe",
        // angular-sqlite
        "angular-sqlite" : "plugins/angular-sqlite/angular-sqlite",
        // angularAMD
        "angularAMD": "plugins/angularAMD/angularAMD",
        "ngload": "plugins/angularAMD//ngload",
        //angular-Sanitize
        "angular-sanitize" : "plugins/angular-sanitize/angular-sanitize.min",
        //"ng-persist" : "plugins/ng-persist/ng-persist",
        //"ng-storage" : "plugins/ng-storage/ngStorage.min",
		
		"angular-soap" : "plugins/angular-soap/angular-soap",
		"soapclient" : "plugins/angular-soap/soapclient",
        // moment
        "moment": "plugins/moment/moment.min",
        // ionic
        "ionic": "plugins/ionic/js/ionic.min",
        "ionic-angular": "plugins/ionic/js/ionic-angular.min",
        // d3
        "d3": "plugins/d3/d3",
        "fastClick": "plugins/fastclick/lib/fastclick",
        
        'text':   'plugins/requirejs/text',
        'app' : 'js/app'
    },
    shim: {        
        // angular
		"angular": { exports: "angular" },
		"fastClick": { exports: "fastClick" },
        // angular-ui
        "angular-ui-router": ["angular"],
        // angular-css
        "angular-css": ["angular"],
        // angular-animate
        "angular-animate": ["angular"],
        // angular-aria
        "angular-aria": ["angular"],
        // angular-css
        //"angular-material": {
        //	deps : ["angular-animate", "angular-aria"]
        //},
        "angular-material-lite" : {deps:["material-design-lite", "angular", "d3"]},
        // angular-translate
        "angular-translate": ["angular"],
        "loader-static-files": ["angular-translate"],
        
        //angular-touch
        "angular-touch" : ["angular"],
        "angular-pinch-zoom" : ["angular"],
        "angular-swipe" : ["angular"],
        
        //angular-sqlite
        "angular-sqlite" : ["angular"],
        
        // angularAMD
        "angularAMD": ["angular"],
        "ngload": ["angularAMD"],
        "angular-sanitize" : ["angular"],
        "angular-resource" : ["angular"],
		"angular-soap":["soapclient", "angular"],
        //"ng-storage" : ["angular"],
        //"ng-persist" : ["ng-storage"],
        // ionic
        "ionic": { exports: "ionic" },
        "ionic-angular": ["ionic", "angular", "angular-animate", "angular-sanitize", "angular-resource"]
    },
    deps: ['js/bootstrap']
});