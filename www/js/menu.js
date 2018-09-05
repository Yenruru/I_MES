//menu function
define(["app"], function (app) {
	app.run(function($state, $rootScope, $filter, $templateRequest, $compile, config){
		
		$rootScope.menuState = '';
		$rootScope.isLoadMenu = false;
		$rootScope.isShowMenu = false;
		//載入menu
		$rootScope.loadMenu = function(){
			if(!$rootScope.isLoadMenu){
				$templateRequest('program/system/menu/menu.html').then(function(respose){
					var menuDiv = document.getElementById('menu');
					var menuScope = menuController($rootScope.$new(true));
					angular.element(menuDiv).append($compile(respose)(menuScope));
					$rootScope.isLoadMenu = true;
					showMenu();
				});
			} else {
				showMenu();
			}
		}
		
		//開啟menu
		$rootScope.showMenu = showMenu;
		function showMenu(){
			$rootScope.isShowMenu = true;
			$rootScope.menuState = 'is-menu-showed';
		}
		
		//關閉menu
		$rootScope.hideMenu = function(){
			$rootScope.isShowMenu = false;
			$rootScope.menuState = '';
		}
		
		function menuController(scope){
			scope.menuList = config.menu;

			scope.menuClick = function(item, event){
				var programName = item.name;
				
				$rootScope.changeProgram(programName);
			}
			
			return scope;
		}
		
		$rootScope.currentState = '';
		$rootScope.$on('$stateChangeSuccess',function(event, toState, toParams, fromState, fromParams){
			$rootScope.currentState = toState.name;
		})

	})
});