define(["moment"], function (moment) {
	return ["$scope", "$filter", "$state", "WebService", "config", "$timeout",
	function ($scope, $filter, $state, $WebService, config, $timeout) {
		//html無法存取
		console.log();

		//html可以存取
		var mono=''; var prdno='';  var prdversion=''; var userno='';var arydefect=[];
		var brno=''; var logininfo=false; var interfacename=''; var lotno ='';var linkname='';var lotstamp='';
		var triggerflag=false;
		$scope.userInfo = config.cache.account;
		
		//same like .net form load
		$scope.init = function(){
			
			opno =  config.cache.opno;
			oparea = config.cache.oparea;
			userno = config.cache.account;
			logininfo=config.cache.logininfo;
			prdno = config.cache.prdno;
			interfacename=config.cache.interfacename;
			brno=config.cache.brno;
			
			if (logininfo == true)
			{			
			//如人員已上工，顯示作業站資訊
			$scope.mono    = config.cache.mono;
			$scope.oparea  = config.cache.oparea;
			$scope.opno    = config.cache.opno;
			$scope.prdno   = config.cache.prdno;
			$scope.mono_readonly = true;
			}
			
			//GetOPError
			loadoperrorjoinbasis(function(){													
				if (oMESReturn.result == 'success') {
					tblOPError = $scope.$root.GetMESReturnValue_DT(oMESReturn,'loadoperrorjoinbasis');
					debugger;					
				}
			});	
			
			document.getElementById("runcard").focus();
			
		}

		$scope.change = function(){
			//切換帳號
			ReverseTriggerOP(function(){});
			triggerflag=false;
			$scope.$root.hideMenu();
			$scope.$root.changeProgram('login', true);
		}
		
		$scope.moin = function(){
			//工單上工
			ReverseTriggerOP(function(){});
			triggerflag=false;
			$scope.$root.hideMenu();
			$scope.$root.changeProgram('moin');
		}
		
		$scope.moout = function(){
			//工單下工
			ReverseTriggerOP(function(){});
			triggerflag=false;
			$scope.$root.hideMenu();
			$scope.$root.changeProgram('moout');
		}
		
		//刷條碼
		$scope.EnterKeyeruncard= function(value){
				
			$scope.runcard = value;	
			
			//刷卡區資訊
			if ($scope.runcard.toLowerCase() == 'ng' || $scope.runcard.toLowerCase() == 'pass')
				{//Result
				 if ($scope.lotno == '' || $scope.lotno == undefined)
					{
					 $scope.runcard ='';
					 $scope.$root.showAlert($filter('translate')('br_u_batchco_gen.nonserialinfo'));
					 return false;
					}
				 else 
				 {
					//過帳
					linkname = $scope.runcard.toLowerCase();
					 
					//格式化資料-Error
					var paraError = [];
					for (Temp_Row in arydefect) 
					 {
						var ErrorItem = {lotno:'',errorno:'',errorqty:'',errorlevel:'',reasontype:''};
						ErrorItem.lotno = lotno;
						ErrorItem.errorno =arydefect[Temp_Row].ERRORNO;
						ErrorItem.errorqty ='1';
						ErrorItem.errorlevel =arydefect[Temp_Row].ERRORLEVEL;
						ErrorItem.reasontype ='1';						
						paraError.push(ErrorItem);
					 } 
					 
					//格式化資料BatchLot
					var paraBatchLot = [];
					var BatchLotItem = {lotno:'',lotstamp:'',loggroupserial:'',lotserial:'',baselotno:''};
					BatchLotItem.lotno = tblRefLot[0].LOTNO;
					BatchLotItem.lotstamp = tblRefLot[0].LOTSTAMP;
					BatchLotItem.loggroupserial = tblRefLot[0].LOGGROUPSERIAL;
					BatchLotItem.lotserial = tblRefLot[0].LOTSERIAL;				
					BatchLotItem.baselotno = tblRefLot[0].BASELOTNO;
					paraBatchLot.push(BatchLotItem);
					
					$timeout(function(){
						exe_batchco_unit(function(){	
						
							if (oMESReturn.result == 'success') 
							{
								//TRANSFERLOT
								TransferLot(function(){
									
									$timeout(function(){
									
									tblRefLot.length=0;
									arydefect.length=0;
									$scope.lotno='';
									$scope.runcard ='';
									document.getElementById("runcard").focus();
									},500);											
									});								
									
							}						
						
						},paraBatchLot,paraError);
					},500);
					
				 }
				}
			else 
				{				 
				 //Defect
					for (TempRow in tblOPError)
					{
						if ($scope.runcard.toUpperCase() == tblOPError[TempRow].ERRORNO)
						{
							if ($scope.lotno == '' || $scope.lotno == undefined)
							{	
								$scope.$root.showAlert($filter('translate')('br_u_batchco_gen.nonserialinfo'),1,function(){
								$timeout(function(){
										document.getElementById("runcard").focus();
									},750);
								});
							 return false;
							}
							
							for (Temp_ErrorNo in arydefect)
								{	
									if ($scope.runcard.toUpperCase() == arydefect[Temp_ErrorNo].ERRORNO)
									{debugger;
									arydefect.splice(Temp_ErrorNo,1);
									$scope.arydefect=arydefect;
									$scope.runcard='';
									document.getElementById("runcard").focus();
									return false;
									}									
								}					
						 debugger;
						 var para_defect;
						 para_defect = {ERRORNO:'',ERRORLEVEL:''};
						 para_defect.ERRORNO=$scope.runcard.toUpperCase();	
						 para_defect.ERRORLEVEL=tblOPError[TempRow].REASONLEVEL;
						 arydefect.push(para_defect);
						 $scope.arydefect=arydefect;	
						 $scope.runcard ='';						 
						 return false;
						}
					}
				 //lotno
					lotno = $scope.runcard.toUpperCase();						
					//刷入重複序號清除已刷入序號
					if ($scope.lotno == lotno)
					{
						$scope.runcard ='';
						$scope.lotno = '';
						arydefect.length=0;		
						ReverseTriggerOP(function(){});
						triggerflag=false;						
						return false;
					}
					
						//1.executelot 
						executelot(function(){													
							if (oMESReturn.result == 'success') {
									triggerflag=false;
									TriggerOP(function(){
									if (oMESReturn.result == 'success') {
											triggerflag=true;	
											//2.取得生產批現況是否符合人員上工站
											loadlotbasisjoinstateprod(function(){													
												if (oMESReturn.result == 'success') {
													tblRefLot = $scope.$root.GetMESReturnValue_DT(oMESReturn,'loadlotbasisjoinstateprod');	
													
													if (tblRefLot.length == 0)
													{
														//無此生產批
														ReverseTriggerOP(function(){});
														triggerflag=false;
														$scope.$root.showAlert($filter('translate')('br_u_batchco_gen.nonserial'),1,function(){
														$timeout(function(){
																document.getElementById("runcard").focus();
															},750);
														});
														return false;
													}
													
													lotstamp= tblRefLot[0].LOTSTAMP;
													
													if (tblRefLot[0].OPNO != opno || tblRefLot[0].INTERFACENAME != "frmBR_U_BatchCO_GEN")
													{	
														$scope.runcard ='';
														//生產批作業站與上工作業站不符
														ReverseTriggerOP(function(){});
														triggerflag=false;
														$scope.$root.showAlert($filter('translate')('br_u_batchco_gen.nonop'),1,function(){
														$timeout(function(){
																document.getElementById("runcard").focus();
															},750);
														});
														return false;
													}
													
													//2018-06-01 Yenru,新增卡控 刷進批號之工單必須為上工工單
													if (tblRefLot[0].MONO != $scope.mono)
													{
														$scope.lotno='';
														ReverseTriggerOP(function(){});
														triggerflag=false;
														//生產批工單上工工單不符
														$scope.$root.showAlert($filter('translate')('br_u_batchco_gen.wrongmo'),1,function(){
														$timeout(function(){
																document.getElementById("runcard").focus();
															},750);
														});
														return false;
													}
													else 
													{
														$scope.lotno=lotno;
														$scope.runcard ='';
													}		
												}
											});	
														
										}
									});	
							}
						});					 
				}
		}
			
		//functions
		function executelot(callback){			
			$WebService.Invoke({
				method : 'wsWIP.ExecuteLot',
				param : {
					lotno:$scope.$root.SetMESParameter('LotNo', 'String', lotno),
					employeeno:$scope.$root.SetMESParameter('EmployeeNo', 'String', userno)
				},
				success : function(data){				
					oMESReturn = data;
					if(callback) callback();
				},
				error : function(data){		
					lotno=$scope.lotno;
					$scope.runcard='';
					$scope.$root.showAlert((data.exception.code) + '<br>' + (data.exception.mesmsg) + '<br>' + (data.exception.sysmsg),1,function(){
							$timeout(function(){
								document.getElementById("runcard").focus();
							},750);
					});
				}
			});
		}
		//TriggerOP
		function TriggerOP(callback){			
			$WebService.Invoke({
				method : 'wsWIP.TriggerOP',
				param : {	
					lotno:$scope.$root.SetMESParameter('LotNo', 'String', lotno)
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

		//ReverseTriggerOP
		function ReverseTriggerOP(callback){			
			$WebService.Invoke({
				method : 'wsWIP.ReverseTriggerOP',
				param : {	
					lotno:$scope.$root.SetMESParameter('LotNo', 'String', lotno),
					lotstamp:$scope.$root.SetMESParameter('LotStamp', 'String', lotstamp)
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
		//序號資訊
		function loadlotbasisjoinstateprod(callback){			
			$WebService.Invoke({
				method : 'YOKE.wsWIP_ASM.LoadLotBasisJoinStateProd',
				param : {
					lotno:$scope.$root.SetMESParameter('LotNo', 'String', lotno)
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
				
		function loadtemp_lotstate(callback){			
			$WebService.Invoke({
				method : 'wsWIP.LoadTemp_LotState',
				param : {
					lotno:$scope.$root.SetMESParameter('LotNo', 'String', lotno)
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

		function loadoperrorjoinbasis(callback){			
			$WebService.Invoke({
				method : 'wsOP.LoadOPErrorJoinBasis',
				param : {
					opno:$scope.$root.SetMESParameter('OPNo', 'String', opno),
					reasontype:$scope.$root.SetMESParameter('ReasonType', 'Integer', 1)
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
		
		function exe_batchco_unit(callback,strBatchLot,strError){			
			$WebService.Invoke({
				method : 'wsWIP.Exe_BatchCO_Unit',
				param : {
					reflotno:$scope.$root.SetMESParameter('RefLotNo', 'String', lotno),
					linkname:$scope.$root.SetMESParameter('LinkName', 'String', linkname),
					checkineqp:$scope.$root.SetMESParameter('CheckInEQP', 'String', false),
					batchlot:$scope.$root.SetMESParameter_Multi('BatchLot', 'String', strBatchLot),
					error:$scope.$root.SetMESParameter_Multi('Error', 'String', strError)
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
		
		function TransferLot(callback){			
			$WebService.Invoke({
				method : 'wsWIP.TransferLot',
				param : {
					lotno:$scope.$root.SetMESParameter('LotNo', 'String', lotno),
					linkname:$scope.$root.SetMESParameter('LinkName', 'String', linkname)					
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

		
	}
]});


