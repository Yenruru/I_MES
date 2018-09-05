define(["moment"], function (moment) {
	return ["$scope", "$filter", "$state", "WebService", "config", "$timeout", "$stateParams",
	function ($scope, $filter, $state, $WebService, config, $timeout, $stateParams) {
		//html無法存取
		console.log(config);
		var temp;
		const DEFSTRING = 'Null';
		const DEFINTEGER = -999;
		//html可以存取
		$scope.temp;
		$scope.userInfo = config.cache.account;
		var mono=''; var prdno='';  var prdversion=''; var userno='';
		var brno=''; var logininfo=false; var interfacename='';
				
		//Same like .NET form Load 
		$scope.init = function(){
			document.getElementById("txt_mono").focus();
			opno =  config.cache.opno;
			oparea = config.cache.oparea;
			userno = config.cache.account;
			logininfo=config.cache.logininfo;
			prdno = config.cache.prdno;
			interfacename=config.cache.interfacename;
			
			if (logininfo == true)
			{			
			//如人員已上工，顯示作業站資訊
			$scope.mono    = config.cache.mono;
			$scope.oparea  = config.cache.oparea;
			$scope.opno    = config.cache.opno;
			$scope.prdno   = config.cache.prdno;
			$scope.mono_readonly = true;
			}
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
			$scope.$root.changeProgram('login', {parent : 'login'});
		
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
				{$scope.$root.showAlert($filter('translate')('moin.unsup'),1)}										
			}
			else 
			{
				$scope.$root.showAlert($filter('translate')('main.nonemoin')+'<br>'+$filter('translate')('main.start')+$filter('translate')('main.moin'),1,function(){
				$timeout(function(){
						document.getElementById('txt_mono').focus();
				},750);
				});	
			}			
		}
		
		$scope.login = function (){
			//人員上工
			
			if (prdno == '')
			{
				$scope.$root.showAlert($filter('translate')('moin.nonemo'),1);
				return false;
			}
			
			
			MOOperatorLogOn_H5(function(){
			if (oMESReturn.result == 'success')
			{$scope.$root.showAlert($filter('translate')('moin.sucess'),0);}				
				logininfo=true;
				config.cache.logininfo=true;
				config.cache.prdno=$scope.prdno;
				config.cache.prdversion=prdversion;
				config.cache.mono=$scope.mono;				
			})
			
		}
		
		$scope.txt_mono_KeyPress = function(value){
						
				$scope.mono=value.toUpperCase();		
				mono=$scope.mono
				
				funLoadMOBasis(function(){
					if (oMESReturn.result == 'success') 
					{
						var tblMOBasis = $scope.$root.GetMESReturnValue_DT(oMESReturn,'loadmobasis');	
						
						if (tblMOBasis.length == 0)
						{	
							$scope.mono='';
							$scope.$root.showAlert($filter('translate')('moin.nonemo')+$filter('translate')('moin.mo')+":"+mono,1,function(){
							$timeout(function(){
									document.getElementById('txt_mono').focus();
							},750);
							});	
							return false;
						}						
												
						prdno = tblMOBasis[0].PRODUCTNO;
						prdversion = tblMOBasis[0].PRODUCTVERSION;
							
							funLoadPRDBasis(function()
							{
								if (oMESReturn.result == 'success') 
								{
									var tblPRDBasis = $scope.$root.GetMESReturnValue_DT(oMESReturn,'loadproduct');	
									
									if (tblPRDBasis.length == 0)
									{	
										$scope.mono='';
										$scope.$root.showAlert($filter('translate')('moin.noneprd')+$filter('translate')('moin.prd')+":"+prdno,1);
										return false;
									}
									
									//工單、產品驗證成功，顯示作業站資訊
									$scope.oparea  = config.cache.oparea;
									$scope.opno    = config.cache.opno;
									$scope.prdno   = prdno;
									$scope.mono_readonly = true;	
								}
							});	
						
					}
				});	
		}		
		
		function funLoadMOBasis(callback){			
			$WebService.Invoke({
				method : 'wsWIP.LoadMOBasis',
				param : {
					mono:$scope.$root.SetMESParameter('MONo', 'string', mono),
					mostate:$scope.$root.SetMESParameter('MOState', 'string', "3|6"),
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
		
		function funLoadPRDBasis(callback){			
			$WebService.Invoke({
				method : 'wsPRD.LoadProduct',
				param : {
					productno:$scope.$root.SetMESParameter('Productno', 'string', prdno),
					productversion:$scope.$root.SetMESParameter('ProductVersion', 'string', prdversion),
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
		
		function MOOperatorLogOn_H5(callback){			
			$WebService.Invoke({
				method : 'YOKE.wsWIP.MOOperatorLogOn_H5',
				param : {
					userno:$scope.$root.SetMESParameter('UserNo', 'string', userno),
					mono:$scope.$root.SetMESParameter('MONo', 'string', mono),
					opno:$scope.$root.SetMESParameter('OPNo', 'string', opno),
					areano:$scope.$root.SetMESParameter('AreaNo', 'string', oparea)
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
		
		function LoadMOOperatorState(callback){			
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
	}
]});





