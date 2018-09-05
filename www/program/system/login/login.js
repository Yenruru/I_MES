define(["moment"], function (moment) {
	return ["$scope", "$filter", "$state", "WebService", "config", "$timeout",
	function ($scope, $filter, $state, $WebService, config, $timeout) {
		
		const DEFSTRING = 'Null';
		const DEFINTEGER = -999;
		var userno='';var groupno='';
				 
        //Same as .NET Form Load
		$scope.init = function(){
			$scope.isElectron = false;
			try{
				$scope.isElectron = nodeRequire?true:false;
			}catch(e){}
			$timeout(function(){
				$scope.showLogin = true;
		    	$timeout(function(){
		    		try{
						componentHandler.upgradeAllRegistered();
						
							document.getElementById('txtoparea').focus();
						
						angular.element(document.getElementById('loginPanel')).css("opacity", "1");
		    			navigator.splashscreen.hide();
		    		}catch(e){
		    			console.log(e);
		    		}
		    	});
			});
		}
			
		$scope.opareaKeyPress = function(value){			
			$scope.oparea=value.toUpperCase();
			config.cache.oparea = $scope.oparea.toUpperCase();
			document.getElementById('txtopno').focus();
		}
		
		$scope.opnoKeyPress = function(value){				
			$scope.opno=value.toUpperCase();
			config.cache.opno = $scope.opno.toUpperCase();
			document.getElementById('account').focus();				
		}
			
		$scope.accountKeyPress = function(value){
			$scope.account=value.toUpperCase();
			config.cache.account = $scope.account.toUpperCase();
			document.getElementById('password').focus();			
		}	
		
		//密碼欄位迴車觸發登入
		$scope.passwordKeyPress = function(value){				
			$scope.password=value;			
			config.cache.password = $scope.password;		
			
			$timeout(function()
			{
				if($scope.account=='' || $scope.password==''||$scope.oparea==''||$scope.opno=='' || $scope.account==undefined || $scope.password==undefined||$scope.oparea==undefined||$scope.opno==undefined) 
				{
					$scope.$root.showAlert($filter('translate')('Login.msg'),1,function(){
									
						$timeout(function(){
							document.getElementById("txtoparea").focus();
						},750);
							
					});
				} 
				else 
				{					
					login_event(function(){});					
				}
			},100);
			
		}
		
		$scope.setting = function(){			
			//切換頁面(設定)
			$scope.$root.changeProgram('setting', {parent : 'login'});
        }
		
		//按鍵登入觸發
		$scope.login = function()
		{
		  $timeout(function()
		  {
			if($scope.account=='' || $scope.password==''||$scope.oparea==''||$scope.opno=='' || $scope.account==undefined || $scope.password==undefined||$scope.oparea==undefined||$scope.opno==undefined) 
			{
				$scope.$root.showAlert($filter('translate')('Login.msg'),1,function(){
					$timeout(function(){
						document.getElementById("txtoparea").focus();
					},750);
				});
			} 
			else 
			{				
				login_event(function(){});
			}
		  },100);
        }
			
		function login_event(){
			
				//避免無處發回車，所有資訊確認後，再寫入cache
				config.cache.oparea = $scope.oparea.toUpperCase();
				config.cache.opno = $scope.opno.toUpperCase();
				config.cache.account = $scope.account.toUpperCase();
				config.cache.password = $scope.password;
				
					//1.檢查區域是否正確
					//2.檢查作業站編號是否正確(chkop)	
					chkop(function(){
							if (oMESReturn.result == 'success') {
								var oOPArea = $scope.$root.GetMESReturnValue_DT(oMESReturn,'loadoparea');	
								
								if (oOPArea.length == 0)
								{
								$scope.oparea='';
								$scope.opno = '';
								$scope.$root.showAlert($filter('translate')('Login.erroropno'),1,function(){
								
									$timeout(function(){
										document.getElementById("txtoparea").focus();
									},750);
										
								});								
								return false;											
								}
								else 
								{	
									debugger;
									if (oOPArea[0].AREATYPE != 1)
									{	
										$scope.oparea='';
										$scope.opno = '';
										$scope.$root.showAlert($filter('translate')('Login.erroroparea'),1,function(){
								
											$timeout(function(){
												document.getElementById("txtoparea").focus();
											},750);
												
										});		
										return false;		
									}
									
									//6.登入
									login(function(){
										$scope.$root.reciprocalStart();//開始登出倒數
										//2017.03.13 owenliu, 調整回傳的處理
										if (oMESReturn.result == 'success') {
											var oUserSecurity = $scope.$root.GetMESReturnValue(oMESReturn,'chkusersecurity');
											config.cache.name = oUserSecurity.username;
										}
										//2017.03.22 owenliu, 檢核登入使用者是否有EXECUTE LOT(執行生產批)的權限
										loadUserPrivilege(function(){
											if (oMESReturn.result == 'success') {
												var aryUserPriv = $scope.$root.GetMESReturnValue_DT(oMESReturn,'loaduserpriv');
												if (aryUserPriv.length==0){
													//沒有執行生產批的權限
													$scope.account = '';
													$scope.password = '';
													$scope.$root.showAlert($filter('translate')('MESSeries.error.executelotpriv'),1);
												}
												else {
													
													$scope.$root.changeProgram('main');
												}
											}	
										},config.cache.account,DEFSTRING,'EXECUTE LOT|EXECUTE LOT_EPI|EXECUTE LOT_EQP');
									});													
									
								}
							}
						});	
		}
	
		function login(callback){
			$WebService.Invoke_Session({
				method : 'YOKE.wsUSR.ChkUserSecurity_H5',
				param : {
					userno:$scope.$root.SetMESParameter('UserNo', 'string', $scope.account, 'login userid'),
					password:$scope.$root.SetMESParameter('Password', 'string', $scope.password, 'login password'),
					clearcodepassword:$scope.$root.SetMESParameter('ClearCodePassword', 'string', $scope.password, 'login clear code pw')
				},
				success : function(data){
					config.mdssessionno = data.mdssessionno;
					oMESReturn = data;
					if(callback) callback();
				},
				error : function(data){
					$scope.account = '';
					$scope.password = '';
					
					$scope.$root.showAlert((data.exception.code) + '<br>' + (data.exception.mesmsg) + '<br>' + (data.exception.sysmsg),1,function()
						{
											
							$timeout(function(){
								document.getElementById("account").focus();
							},750);
								
						});
				}
			});
		}
		function chkop(callback){		
			$WebService.Invoke({
				method : 'wsOP.LoadOPArea',
				param : {
					opno:$scope.$root.SetMESParameter('OPNo', 'string', $scope.opno),
					areano:$scope.$root.SetMESParameter('AreaNo', 'string', $scope.oparea)					
				},
				success : function(data){					
					oMESReturn = data;
					if(callback) callback();
				},
				error : function(data){
					$scope.account = '';
					$scope.password = '';
					$scope.$root.showAlert((data.exception.code) + '<br>' + (data.exception.mesmsg) + '<br>' + (data.exception.sysmsg),1);
				}
			});
		}
		
		function loadUserPrivilege(callback,userno,groupno,functionno){			
			
			//處理傳入參數預設值
			if (typeof userno == 'undefined') {userno = DEFSTRING;}
			if (typeof groupno == 'undefined') {groupno = DEFSTRING;}
			if (typeof functionno == 'undefined') {functionno = DEFSTRING;}
					
			$WebService.Invoke({
				method : 'wsUSR.LoadUserPrivilege',
				param : {
					userno:$scope.$root.SetMESParameter('UserNo', 'string',userno),
					groupno:$scope.$root.SetMESParameter('GroupNo', 'string', groupno),
					functionno:$scope.$root.SetMESParameter('FunctionNo', 'string', functionno)
				},
				success : function(data){
					config.mdssessionno = data.mdssessionno;
					oMESReturn = data;
					if(callback) callback();
				},
				error : function(data){
					$scope.$root.showAlert((data.exception.code) + '<br>' + (data.exception.mesmsg) + '<br>' + (data.exception.sysmsg),1);
				}
			});
		}
		
			
			
	}];
});