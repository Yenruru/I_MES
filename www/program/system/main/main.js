define(["moment"], function (moment) {
	return ["$scope", "$filter", "$state", "WebService", "config", "$timeout",
	function ($scope, $filter, $state, $WebService, config, $timeout) {

		var temp;
		var userno = '';
		var mono='';
		var interfacename='';var brno ='';
		$scope.temp;
		$scope.userInfo = config.cache.account;
				
		//每隻程式都有，等於window.onload方法
		$scope.init = function(){
				userno =config.cache.account;
							
				//取得使用者上工資訊
				funLoadMOOperatorState(function(){
					
					if (oMESReturn.result == 'success')
					{
						var tblMOOperatorState = $scope.$root.GetMESReturnValue_DT(oMESReturn,'loadmooperatorstate');	
						if (tblMOOperatorState.length > 0)
						{	
							//如果人員已上工，判斷登入作業站區域、作業站編號是否相同
							if (tblMOOperatorState[0].AREANO != config.cache.oparea)
							{$scope.$root.showAlert($filter('translate')('main.useralreadylogin')+'<br>'+
													$filter('translate')('main.loginareais')+tblMOOperatorState[0].AREANO+'<br>'+$filter('translate')('main.loginagain'),1,function(){
											
									$timeout(function(){
										$scope.$root.changeProgram('login', true);
									},500);
										
								});
							}
							if (tblMOOperatorState[0].OPNO != config.cache.opno)
							{$scope.$root.showAlert($filter('translate')('main.useralreadylogin')+'<br>'+
													$filter('translate')('main.loginopis')+tblMOOperatorState[0].OPNO+'<br>'+$filter('translate')('main.loginagain'),1,function(){
											
									$timeout(function(){
										$scope.$root.changeProgram('login', true);
									},500);
										
								});
							}							
							
							config.cache.mono=tblMOOperatorState[0].MONO;
							mono=tblMOOperatorState[0].MONO;
							config.cache.logininfo=true;
							interfacename=config.cache.INTERFACENAME;

							//以工單再取出產品編號
							funLoadMOBasis(function()
								{
								if (oMESReturn.result == 'success')
									{
										var tblOEBasis = $scope.$root.GetMESReturnValue_DT(oMESReturn,'loadmobasis');	
										config.cache.prdno=tblOEBasis[0].PRODUCTNO;
										config.cache.prdversion=tblOEBasis[0].PRODUCTVERSION;
									}
								});	
						}
					}	
				});
				
				
						
				//取得作業站企業邏輯編號(檢查作業站是否有設定企業邏輯)
				LoadBusinessRuleRelation(function(){							
					if (oMESReturn.result == 'success') {
						var tblBusinessRuleRelation = $scope.$root.GetMESReturnValue_DT(oMESReturn,'loadbusinessrulerelation');
					
						if (tblBusinessRuleRelation.length == 0 || tblBusinessRuleRelation == undefined)
						{
							$scope.$root.showAlert($filter('translate')('Login.opno')+$filter('translate')('Login.nonebusinessrule'),1,function(){
							
								$timeout(function(){
									document.getElementById("txtopno").focus();
								},750);
									
							});					
							$scope.opno='';
							return false;													
							
						}
						else 
						{
							brno=tblBusinessRuleRelation[0].FROMNODE;
							
							//檢查作業站企業邏輯是否符合設備報工
							LoadBusinessRule(function(){													
							if (oMESReturn.result == 'success') {
								var tblBusinessRule = $scope.$root.GetMESReturnValue_DT(oMESReturn,'loadbusinessrule');
								
								debugger;
								if (tblBusinessRule[0].INTERFACENAME =='frmBR_U_BatchCO_GEN' || tblBusinessRule[0].INTERFACENAME =='frmBR_U_COASSY_ASM')
								{	
							
									config.cache.interfacename = tblBusinessRule[0].INTERFACENAME;
									interfacename=tblBusinessRule[0].INTERFACENAME;
									config.cache.brno=brno;

								}							
							}
							});	
						}
					}
				});													

			
		}

		$scope.change = function(){
			//切換帳號
			config.cache.mono='';
			config.cache.oparea='';
			config.cache.opno='';
			config.cache.prdno='';	
			config.cache.prdversion='';	
			config.cache.account='';
			config.cache.logininfo=false;				

			$scope.$root.changeProgram('login', true);
		}
		
		$scope.moin = function(){
			//工單上工			
			$scope.$root.changeProgram('moin');
		}
		
		$scope.moout = function(){
			//工單下工			
			$scope.$root.changeProgram('moout');
		}
			
		$scope.execute = function(){
			//報工
			if (config.cache.logininfo == true)
			{	
				if (interfacename == 'frmBR_U_BatchCO_GEN' )
				{$scope.$root.changeProgram('br_u_batchco_gen');}
				else if (interfacename == 'frmBR_U_COASSY_ASM')
				{$scope.$root.changeProgram('br_u_coassy_asm');}
				else
				{$scope.$root.showAlert('目前作業站不支援設備報工',1)}										
			}
			else 
			{
				$scope.$root.showAlert($filter('translate')('main.nonemoin')+'<br>'+$filter('translate')('main.start')+$filter('translate')('main.moin'),1)
			}			
			
		}
		
		function funLoadMOBasis(callback){			
			$WebService.Invoke({
				method : 'wsOE.LoadMOBasis',
				param : {
					mono:$scope.$root.SetMESParameter('MONO', 'string', mono),
					issuestate:$scope.$root.SetMESParameter('IssueState', 'Integer', 2)
				},
				success : function(data){				
					oMESReturn = data;
					if(callback) callback();
				},
				error : function(data){
					$scope.$root.showAlert((data.exception.code) + '<br>' + (data.exception.mesmsg) + '<br>' + (data.exception.sysmsg),1);
				}
			});
		}
		
		function funLoadMOOperatorState(callback){			
			$WebService.Invoke({
				method : 'YOKE.wsWIP.LoadMOOperatorState',
				param : {
					userno:$scope.$root.SetMESParameter('UserNo', 'string', userno)
				},
				success : function(data){				
					oMESReturn = data;
					if(callback) callback();
				},
				error : function(data){
					debugger;
					$scope.$root.showAlert((data.exception.code) + '<br>' + (data.exception.mesmsg) + '<br>' + (data.exception.sysmsg),1);
				}
			});
		}
		
		function LoadBusinessRule(callback){			
				$WebService.Invoke({
				method : 'wsOP.LoadBusinessRule',
				param : {
					issuestate:$scope.$root.SetMESParameter('IssueState', 'Integer',2),
					brno:$scope.$root.SetMESParameter('BRNo', 'string', brno)
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
		
		function LoadBusinessRuleRelation(callback){			
				debugger;
				$WebService.Invoke({
				method : 'wsOP.LoadBusinessRuleRelation',
				param : {
					opno:$scope.$root.SetMESParameter('OPNo', 'string',config.cache.opno),
					tonode:$scope.$root.SetMESParameter('ToNode', 'string', 'END')
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
		

	}
]});


