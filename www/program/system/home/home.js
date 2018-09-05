define(["app", "moment"], function (app, moment) {
	return ["$scope", "$filter", "$rootScope", "config", "$mdDialog","$http", "$stateParams", "MMWService", "$location", "$timeout",
	function ($scope, $filter, $rootScope, config,  $mdDialog, $http, $stateParams, $MMWService, $location, $timeout) {
		
		$scope.SubMenuShow = false;
		$scope.menu = config.menu;
		$scope.subMenu;
		$scope.selectModel = '';
		$scope.init = function(){
			try{
				//StatusBar.backgroundColorByHexString("#334199");
			}catch(e){}		
			
			//Screen always on
			//$scope.$root.DisplayOn(config.setting.ScreenOn);
			
			//backgroun process
			/*
			$scope.$root.OpenBackgroundService({
				title : '',
				text :  'APP正在背景運行.'
			});
			*/
			$scope.userInfo = config.cache.account+'：'+config.cache.name;
			$scope.version = config.appVersion;
			$scope.config = config;
			$rootScope.loadFinish = true;
			
			if($scope.$root.subMenu){
				showSubMenu($scope.$root.subMenu);
			}
		}
		$scope.setting = function(){
			$rootScope.changeProgram("setting", {parent : 'home'});
		}
		$scope.logout = function(){
			$rootScope.hideMenu();
			$rootScope.changeProgram("login", true);
		}
		 $scope.checkin = function(){
		    $rootScope.changeProgram("checkin", {parent : 'home'});
	    }
		 $scope.checkout = function(){
			$rootScope.changeProgram("checkout", {parent : 'home'});
		}
		 
		$scope.$root.subMenu;
		$scope.menuClick = function(menuItem){
			if(!menuItem.default && !menuItem.childs){
				$scope.$root.subMenu = undefined;
				$scope.$root.changeProgram(menuItem.name);
				$rootScope.loadMenu(config.menu);
			} else if(!menuItem.default){
				$scope.$root.subMenu = menuItem;
				if($scope.SubMenuShow){
					$scope.SubMenuShow = false;
					$scope.selectModel = undefined;
				} else {					
					showSubMenu(menuItem);
				}
			} else {
				$scope.$root.subMenu = undefined;
				$scope.$root.changeProgram(menuItem.default);
				if(!menuItem.hideMenu){
					$rootScope.loadMenu(menuItem.childs);
				} else {
					$rootScope.menuList = menuItem.childs;
				}
			}
		}
		
		function showSubMenu(menuItem){
			$scope.SubMenuShow = true;
			$scope.subMenu = menuItem.childs;
			$scope.selectModel = menuItem.name;
		}
		
		$scope.subMenuClick = function(menuItem){			
			$scope.$root.changeProgram(menuItem.default);
			if(!menuItem.hideMenu && menuItem.childs.length>1){					
				$rootScope.loadMenu(menuItem.childs);
			} else {
				$rootScope.menuList = menuItem.childs;
			}
		}
	  		
	}];
});