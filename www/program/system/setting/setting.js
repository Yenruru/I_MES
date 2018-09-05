define(["moment"], function (moment) {
	return ["$scope", "$filter", "$stateParams", "$translate", "$mdDialog", "WebService", "config", "$locale", 
	function ($scope, $filter, $stateParams, $translate, $mdDialog, $WebService, config, $locale) {

		$scope.parent = $stateParams.parent;
		$scope.isCordova = true;
		var defaultUse = $scope.currentUse = $translate.use();
		$scope.init = function(){
			try{
				//StatusBar.backgroundColorByHexString("#334199");
			}catch(e){}
			$scope.clientIp = config.client.ip.split('.');
			$scope.clientMask = config.client.mask.split('.');
			$scope.clientGateway = config.client.gateway.split('.');
			//2017.04.11 owenliu, change as Domain Name
			//$scope.serverIp = config.server.ip.split('.');
			$scope.serverIp = config.server.ip;
			$scope.config = angular.merge({}, config);//copy
						
		}
		
		$scope.back = function(){
			if(defaultUse!=$scope.currentUse){
				$scope.currentUse = defaultUse;
				$translate.use(defaultUse);
			}
			if($scope.parent=='home'){
				//當按下返回時候將cache回壓，cache才是真正使用的內容
				config.setting.workStation = config.cache.workStation;
				config.setting.equipment = config.cache.equipment;
			}
			$scope.$root.changeProgram($scope.parent, true);
		}
		
		$scope.confirm = function(){
			if(config.setting.RefreshTime <= 0 ){
				$scope.$root.showAlert($filter('translate')('Setting.msg.RefreshTimeZero'));
				return;
			}
			
			//config = $scope.config;
			config.server = $scope.config.server;
			//2017.04.11 owenliu, change as Domain Name
			//config.server.ip = combineIP($scope.serverIp);
			config.client.ip = combineIP($scope.clientIp);
			config.client.mask = combineIP($scope.clientMask);
			config.client.gateway = combineIP($scope.clientGateway);
			config.setting = $scope.config.setting;
			config.setting.lang = $scope.currentUse;
									
			if (typeof(Storage) !== "undefined") {
				localStorage.setItem(config.appName + "_server", JSON.stringify(config.server));
				localStorage.setItem(config.appName + "_setting", JSON.stringify(config.setting));
			}
			
			if($scope.parent=='home'){
				//當按下確定之後將setting的值寫入cache，cache才是真正使用的內容
				config.cache.workStation = config.setting.workStation; 
				config.cache.equipment = config.setting.equipment;
				$scope.$root.changeProgram('home', true);

			} else {				
				$scope.$root.changeProgram($scope.parent, true);
			}
			
		}
		
		function combineIP(array){
			var totalip;
			array.forEach(function(ipstring){
				if(!totalip)
					totalip = ipstring;
				else
					totalip += "." +ipstring;
			});
			return totalip;
		}

		//載入語系清單
		$scope.loadLoaclizationList = function(){
			$scope.$root.showSelect({
				title : $filter('translate')('Setting.localizationList'),
				label : 'label',
				code : 'code',
				selectCode : $scope.currentUse,
				list : [
					    {code:'zh_TW',label:$filter('translate')('Setting.zh_TW')},
					    {code:'zh_CN',label:$filter('translate')('Setting.zh_CN')}
				],
				confirm : function(item, dialog){
					$translate.use(item.code);
					$locale.id = "en-US";
					$scope.currentUse = item.code;
					dialog.hide();
				}
			});
		}
		
		$scope.loadMrs00 = function(){
			if($scope.parent != 'login')
				$scope.$root.changeProgram('mrs00', {parent:'setting'});
		}
		
		//TODO:調整URI及回傳後的內容
		//20170221 add by Dustdusk for mantis#35545:
		$scope.connectionTest = function(){
		    
            config.server = $scope.config.server;
		    config.client.ip = combineIP($scope.clientIp);
		    config.client.mask = combineIP($scope.clientMask);
		    config.client.gateway = combineIP($scope.clientGateway);
		    config.setting = $scope.config.setting;
		    config.setting.lang = $scope.currentUse;
            
            $WebService.setWSDL('/wsInvoke.asmx');
		    $WebService.Test({
				method : 'Test',
				success : function(data){
				    //config.mdssessionno = data.mdssessionno;

				    var NewArray = new Array();
				    var NewArray = data.split(",");
				    if (NewArray[0] == 'Test successfully') {
						//var testmsg = $scope.$root.GetMESSingleValue(data, 'testdb');
						$scope.$root.showAlert($filter('translate')('Setting.msg.connect.sucess')+"<br>",0);
					} else {
		                $scope.$root.showAlert($filter('translate')('Setting.msg.connect.failure'), 0);
					}
					
				},
				error : function(){
					$scope.$root.showAlert($filter('translate')('Setting.msg.connect.failure')+"<br>",1);
				}
			});
			/*
			$MMWService.sendToWMMServer({
				uri : 'connection_test',
				content : {},
				success : function(data){
					$scope.$root.showAlert($filter('translate')('Setting.msg.connect.sucess'));
				},
				error : function(data){
					$scope.$root.showAlert($filter('translate')('Setting.msg.connect.failure')+"<br>"+data.SysMsg);
				}
			});
			*/
		}
	}];
});