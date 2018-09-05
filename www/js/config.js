define(['app', 'angularAMD', 'fastClick', 'text!config/config.json', 'text!config/menu.json', 'loader-static-files', 'angular-translate'], function (app, angularAMD, FastClick, config, menu) {
    'use strict';
	function successFunction(){
		console.info("It worked!");
	}
	
	function errorFunction(error){
		console.error(error);
	}
	var initConfig = {};
	(function(){
		initConfig = JSON.parse(config);
		initConfig.menu = JSON.parse(menu);
		initConfig.cache = {};
	})();
	
    app.value('config',initConfig)
    .config(["$httpProvider", "$provide", "$translateProvider", "$touchProvider", 
        function($httpProvider, $provide, $translateProvider, $touchProvider) {
    		//$httpProvider.defaults.useXDomain = true;			//allow cross domain
    		//$httpProvider. defaults.withCredentials = true;	//allow cross domain Cookie
	    	try{
	    		
	    		//ionic config
	    		//$ionicConfigProvider.templates.maxPrefetch(0);
	    		
		        //Get Config.json and menu.json 
	    		$touchProvider.ngClickOverrideEnabled(true);
		    	if (typeof(Storage) !== "undefined") {
		    		initConfig.server = angular.merge(initConfig.server, JSON.parse(localStorage.getItem(initConfig.appName + "_server")));
		    		initConfig.setting = angular.merge(initConfig.setting, JSON.parse(localStorage.getItem(initConfig.appName + "_setting")));
		    		/*
					var version = localStorage.getItem(initConfig.appName + "_version");
					if(version){
						initConfig.appVersion = version;
					}
					*/
		    	}				        
				
			    //Get App Infomation
			    try{
			    	cordova.getAppVersion.getPackageName().then(function(packageName){
			    		initConfig.packageName = packageName;
			    	});
			    }catch(e){}
				
		        // Localization Config
		        $translateProvider.useStaticFilesLoader({ prefix: 'localization/localization-', suffix: '.json' });
		        $translateProvider.preferredLanguage(initConfig.setting.lang);
				
				FastClick.attach(document.body);
				
				try{
					//設定全螢幕
					AndroidFullScreen.immersiveMode(successFunction, errorFunction);
				}catch(e){};
				
				try{
					//綁定直向畫面
					screen.lockOrientation('portrait');
				}catch(e){}
					
				try{
					//關閉狀態列
					StatusBar.hide();									
				}catch(e){}
				
				try{
					//override Android返回鍵
					document.addEventListener("backbutton", function onBackKeyDown(e) {
						e.preventDefault();
					}, false);								
				}catch(e){}				
					
	    	}catch(e){
	    		console.log(e);
	    	}
    	}
    ]);
});