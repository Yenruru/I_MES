define(["moment"], function (moment) {
	return ["$scope", "$filter", "$state", "WebService", "config", "$timeout",
	function ($scope, $filter, $state, $WebService, config, $timeout) {
		//html無法存取
		console.log();

		
		//html可以存取
		var mono=''; var prdno='';  var prdversion=''; var userno='';var aryprocedure=[];var dtPRDOPASMProcedure=[];
		var brno=''; var logininfo=false; var interfacename=''; var lotno ='';var linkname='';var loggroupserial='';	
		var KeyPartNo='';var subopmax=0;var subopseq=0;var serialno ='';var Acceptflag =false;var triggerflag=false;
		var lotstamp='';var goodqty=0;var lotrecord='';
		$scope.temp;
		$scope.userInfo = config.cache.account;
		
		//same like .net form load
		$scope.init = function(){
			
			opno =  config.cache.opno;
			oparea = config.cache.oparea;
			userno = config.cache.account;
			logininfo=config.cache.logininfo;
			prdno = config.cache.prdno;
			prdversion= config.cache.prdversion;
			interfacename=config.cache.interfacename;
			brno=config.cache.brno;
			
			if (logininfo == true)
			{			
			//如人員已上工，顯示作業站資訊
			$scope.mono    = config.cache.mono;
			$scope.oparea  = config.cache.oparea;
			$scope.opno    = config.cache.opno;
			$scope.prdno   = config.cache.prdno;			
			}
			
			//Getsubopinfo
			loadsubopinfo(function(){													
				if (oMESReturn.result == 'success') {
					tblsupop = $scope.$root.GetMESReturnValue_DT(oMESReturn,'loadsubopinfo');
					
					//找出最大工序
					for (temprow in tblsupop)
					{
						if (parseInt(tblsupop[temprow].SUBOPNO)> subopmax)
						{
							subopmax=parseInt(tblsupop[temprow].SUBOPNO);
						}
					}
					
				}
			});	

						
			document.getElementById("runcard").focus();
			
		}

		$scope.change = function(){
			//切換帳號
			$scope.$root.hideMenu();
			$scope.$root.changeProgram('login', true);
			if (triggerflag == true)
			{
				ReverseTriggerOP(function(){});
			}			
		}
		
		$scope.moin = function(){
			//工單上工
			$scope.$root.hideMenu();
			$scope.$root.changeProgram('moin');
			if (triggerflag == true)
			{
				ReverseTriggerOP(function(){});
			}
		}
		
		$scope.moout = function(){
			//工單下工
			$scope.$root.hideMenu();
			$scope.$root.changeProgram('moout');
			if (triggerflag == true)
			{
				ReverseTriggerOP(function(){});
			}
		}
			
		//刷條碼
		$scope.EnterKeyeruncard= function(value){
			
			document.getElementById('runcard').value='';
			$scope.runcard = value;
						
			//刷入序號
			//若重複刷入相同序號，清空已刷入序號資訊
			if ($scope.runcard == $scope.lotno )
			{
				$scope.lotno ='';
				dtPRDOPASMProcedure.length=0;
				aryprocedure.length=0;
				$scope.runcard='';
				$scope.supopno='';
				ReverseTriggerOP(function(){});
				triggerflag=false;
				lotno='';
				document.getElementById('runcard').focus();								
				return false;
			}
			//設備若未刷入序號，判斷此筆Runcard為序號
			if ($scope.lotno == '' || $scope.lotno == undefined)
			{	
				lotno=$scope.runcard;
				//executelot
				executelot(function(){
					if (oMESReturn.result == 'success') {
						triggerflag=false;
						TriggerOP(function(){
							if (oMESReturn.result == 'success') {
									triggerflag=true;	
									//取得序號資訊				
									loadlotbasisjoinstateprod(function(){													
										if (oMESReturn.result == 'success') {
											$scope.lotno=lotno;
											tblRefLot = $scope.$root.GetMESReturnValue_DT(oMESReturn,'loadlotbasisjoinstateprod');		
											
											loggroupserial = tblRefLot[0].LOGGROUPSERIAL;
											lotstamp= tblRefLot[0].LOTSTAMP;
											goodqty=tblRefLot[0].CURQTY;		
											
											if (tblRefLot[0].INTERFACENAME != "frmBR_U_COASSY_ASM")
											{
												$scope.lotno='';
												ReverseTriggerOP(function(){});
												triggerflag=false;
												//生產批作業站與上工作業站不符
												$scope.$root.showAlert($filter('translate')('br_u_coassy_asm.nonop'),1,function(){
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
												$scope.$root.showAlert($filter('translate')('br_u_coassy_asm.wrongmo'),1,function(){
												$timeout(function(){
														document.getElementById("runcard").focus();
													},750);
												});
												return false;
											}											
											
											loadprdopasmprocedure(function(){													
												if (oMESReturn.result == 'success') {
													dtPRDOPASMProcedure_Temp = $scope.$root.GetMESReturnValue_DT(oMESReturn,'loadprdopasmprocedure');						
													
													var cnt=0;
													if (dtPRDOPASMProcedure_Temp.length != 0 )
													{
														dtPRDOPASMProcedure.length=0;
														for (temprow in dtPRDOPASMProcedure_Temp)
														{
															var temptable={PRODUCTNO:'',PRODUCTVERSION:'',OPNO:'',SUBOPNO:'',SUBOPSEQ:'',ASMSEQ:'',COMPONENTNO:'',STDQTY:'',COMPONENTTYPE:'',MASTERCOMPONENT:'',UNITID:'',LOGGROUPSERIAL:'',KEYPARTNO:'',SERIALNO:'',KEYPARTNAME:'',EVENTTIME:'',COMPLETEFLAG:'',ROWINDEX:''};
															temptable.PRODUCTNO=dtPRDOPASMProcedure_Temp[temprow].ProductNo;
															temptable.PRODUCTVERSION=dtPRDOPASMProcedure_Temp[temprow].productVersion;
															temptable.OPNO=dtPRDOPASMProcedure_Temp[temprow].OPNo;
															temptable.SUBOPNO=dtPRDOPASMProcedure_Temp[temprow].SubOPNo;
															temptable.SUBOPSEQ=dtPRDOPASMProcedure_Temp[temprow].SubOPSeq;
															temptable.ASMSEQ=dtPRDOPASMProcedure_Temp[temprow].ASMSeq;
															temptable.COMPONENTNO=dtPRDOPASMProcedure_Temp[temprow].ComponentNo;
															temptable.STDQTY=dtPRDOPASMProcedure_Temp[temprow].StdQty;
															temptable.COMPONENTTYPE=dtPRDOPASMProcedure_Temp[temprow].ComponentType;
															temptable.MASTERCOMPONENT=dtPRDOPASMProcedure_Temp[temprow].MasterComponent;
															temptable.UNITID=tblRefLot[0].LOTNO;
															temptable.LOGGROUPSERIAL=tblRefLot[0].LOGGROUPSERIAL;
															
															if (dtPRDOPASMProcedure_Temp[temprow].ComponentType == 1)
															{temptable.SERIALNO=tblRefLot[0].LOTNO;}
															else if (dtPRDOPASMProcedure_Temp[temprow].SERIALNO == undefined || dtPRDOPASMProcedure_Temp[temprow].SERIALNO=='')
															{temptable.SERIALNO='';}
															else 
															{temptable.SERIALNO=dtPRDOPASMProcedure_Temp[temprow].SERIALNO;}

															if (dtPRDOPASMProcedure_Temp[temprow].ComponentType == 1)
															{temptable.KEYPARTNO=tblRefLot[0].PRODUCTNO;}
															else if (dtPRDOPASMProcedure_Temp[temprow].KEYPARTNO == undefined || dtPRDOPASMProcedure_Temp[temprow].KEYPARTNO=='')
															{temptable.KEYPARTNO='';}
															else 
															{temptable.KEYPARTNO=dtPRDOPASMProcedure_Temp[temprow].KEYPARTNO;}
															
															if (dtPRDOPASMProcedure_Temp[temprow].ComponentType == 1)
															{temptable.KEYPARTNAME=tblRefLot[0].PRODUCTNAME;}
															else if (dtPRDOPASMProcedure_Temp[temprow].KEYPARTNAME == undefined || dtPRDOPASMProcedure_Temp[temprow].KEYPARTNAME=='')
															{temptable.KEYPARTNAME='';}
															else 
															{
																if (dtPRDOPASMProcedure_Temp[temprow].ComponentType == 6 || dtPRDOPASMProcedure_Temp[temprow].ComponentType == 7)
																{temptable.KEYPARTNAME=dtPRDOPASMProcedure_Temp[temprow].KEYPARTNO;}
																else 
																{temptable.KEYPARTNAME=dtPRDOPASMProcedure_Temp[temprow].KEYPARTNAME;}												
															}										
															
															temptable.EVENTTIME=dtPRDOPASMProcedure_Temp[temprow].EVENTTIME;
															temptable.COMPLETEFLAG=dtPRDOPASMProcedure_Temp[temprow].COMPLETEFLAG;
															temptable.ROWINDEX=cnt;
															
															cnt ++;
															
															dtPRDOPASMProcedure.push(temptable);																								
														}
														
														//判斷作業工序	
														aryprocedure.length=0;
														loop_subop:
														for (subopseq = 0; subopseq <= subopmax; subopseq++) 
														{	
															//先找出 未完成工序														
															for (temprow in dtPRDOPASMProcedure)
															{	
																if (dtPRDOPASMProcedure[temprow].SUBOPSEQ == subopseq)
																{
																	if (dtPRDOPASMProcedure[temprow].SERIALNO == '')
																	{
																		$scope.supopno=subopseq;
																		
																		//建立dtTable
																		for (temprow in dtPRDOPASMProcedure)
																		{	
																			if (dtPRDOPASMProcedure[temprow].SUBOPSEQ==$scope.supopno)
																			{
																			var tempary={COMPONNENTNO:'',SERIALNO:''};
																			tempary.COMPONNENTNO = dtPRDOPASMProcedure[temprow].COMPONENTNO;
																			tempary.SERIALNO = dtPRDOPASMProcedure[temprow].SERIALNO;
																			aryprocedure.push(tempary);
																			}
																		}	
																		$scope.aryprocedure=aryprocedure;	
																		break loop_subop;
																	}
																}																											
															}														
														}
														
														$timeout(function(){
															$scope.runcard='';
															document.getElementById('runcard').focus();
														}, 300);
													}
													else 
													{													
													$scope.$root.showAlert($filter('translate')('br_u_coassy_asm.procedurenotdefine'));
													}									
												}
											});	
											
											loadscanrule(function(){
												if (oMESReturn.result == 'success') {
												dtSNRule=$scope.$root.GetMESReturnValue_DT(oMESReturn,'loadscanrule');	
												}
											});	
										}
									});	
							}
						});
					}
				});
			}
			//半成品||原物料批號
			else 
			{	
				serialno = $scope.runcard;
				var componenttype ='';
				var componentno = '';
				var CheckFlag=false;var CheckProd=false;var CheckMtrl=false;var PassFlag=false;
				var KeyPartName='';var KeyPartNo='';
				Acceptflag = false;
				var tempdtprdopasmprocedure=[];
				var blnchkserial=false;
				looppr: {									
					for (temprow in dtPRDOPASMProcedure)
					{	
						if (dtPRDOPASMProcedure[temprow].SUBOPSEQ == $scope.supopno.toString() && dtPRDOPASMProcedure[temprow].SERIALNO == serialno )
						{							

							dtPRDOPASMProcedure[temprow].SERIALNO ='';
							
							//刪除UnitState												
							var datetime =moment().format('MMMM Do YYYY, h:mm:ss a');
							var aryDeleteUnitState=[];
							var aryTempUnitState={unitid:'',loggroupserial:'',opno:'',subopno:'',asmsequence:'',componentno:'',keypartno:'',componenttype:'',mastercomponent:'',serialno:'',stdqty:'',eventtime:''};
							
							aryTempUnitState.unitid=dtPRDOPASMProcedure[temprow].UNITID;
							aryTempUnitState.loggroupserial=tblRefLot[0].LOGGROUPSERIAL;
							aryTempUnitState.opno=dtPRDOPASMProcedure[temprow].OPNO;
							aryTempUnitState.subopno=dtPRDOPASMProcedure[temprow].SUBOPNO;
							aryTempUnitState.asmsequence=dtPRDOPASMProcedure[temprow].ASMSEQ;
							aryTempUnitState.componentno=dtPRDOPASMProcedure[temprow].COMPONENTNO;
							aryTempUnitState.keypartno=dtPRDOPASMProcedure[temprow].KEYPARTNO;
							aryTempUnitState.componenttype=dtPRDOPASMProcedure[temprow].COMPONENTTYPE;
							aryTempUnitState.mastercomponent=dtPRDOPASMProcedure[temprow].MASTERCOMPONENT;
							aryTempUnitState.serialno=dtPRDOPASMProcedure[temprow].SERIALNO;
							aryTempUnitState.stdqty=dtPRDOPASMProcedure[temprow].STDQTY;
							aryTempUnitState.eventtime=datetime;
							aryDeleteUnitState.push(aryTempUnitState);
							
							deleteunitstate(function(){},aryDeleteUnitState);
							
							
							//找出未完成工序
							loop_subop:
							for (subopseq = $scope.supopno; subopseq <= subopmax; subopseq++) 
							{
								for (temprow in dtPRDOPASMProcedure)
								{	
									if (dtPRDOPASMProcedure[temprow].SUBOPSEQ == subopseq && dtPRDOPASMProcedure[temprow].SERIALNO == '')
									{								
										$scope.supopno=subopseq; 
										break loop_subop;
									}							
								}
							}
							
							aryprocedure.length=0;
							for (temprow in dtPRDOPASMProcedure)
							{	
								if (dtPRDOPASMProcedure[temprow].SUBOPSEQ==$scope.supopno.toString())
								{
								var tempary={COMPONNENTNO:'',SERIALNO:''};
								tempary.COMPONNENTNO = dtPRDOPASMProcedure[temprow].COMPONENTNO;
								tempary.SERIALNO = dtPRDOPASMProcedure[temprow].SERIALNO;
								aryprocedure.push(tempary);
								}
							}
							
							$scope.aryprocedure=aryprocedure;													
							$scope.runcard='';
							document.getElementById('runcard').focus();	
							
							break looppr;
						}
						
						if (dtPRDOPASMProcedure[temprow].SUBOPSEQ == $scope.supopno.toString() && dtPRDOPASMProcedure[temprow].SERIALNO == '' )
						{	
					
							var tmpidx=temprow;
							
							componenttype=dtPRDOPASMProcedure[tmpidx].COMPONENTTYPE;
							componentno=dtPRDOPASMProcedure[tmpidx].COMPONENTNO;
							KeyPartName=''; KeyPartNo ='';
							funCheckSN(function(){},componenttype,componentno,KeyPartNo);	
						
							if (blnfunCheckSN==true)
							{								
								switch(componenttype) 
								{
									case '1' :					
										dtPRDOPASMProcedure[tmpidx].SERIALNO=tblRefLot[0].LOTNO;
										dtPRDOPASMProcedure[tmpidx].KEYPARTNO=tblRefLot[0].PRODUCTNO;
										dtPRDOPASMProcedure[tmpidx].KEYPARTNAME=tblRefLot[0].PRODUCTNAME;
										PassFlag=true;
										AcceptChanges(function(){});												
									break;
									
									case '2' :		
										CheckProd = true;
										checkandgetproddata(function(){
											
											if (oMESReturn.result == 'success') {
											var	tmpTable=$scope.$root.GetMESReturnValue_DT(oMESReturn,'checkandgetproddata');
												
												if (tmpTable.length >0)
												{
													dtPRDOPASMProcedure[tmpidx].SERIALNO=serialno;
													dtPRDOPASMProcedure[tmpidx].KEYPARTNO=tmpTable[0].PRODUCTNO;
													dtPRDOPASMProcedure[tmpidx].KEYPARTNAME=tmpTable[0].PRODUCTNAME;
													PassFlag=true;
													AcceptChanges(function(){});															
												}									
											}											
										},componentno,componenttype);	
											
									break;
									
									case '3' :	
										CheckProd = true;
										checkandgetproddata(function(){
											
											if (oMESReturn.result == 'success') {
											var	tmpTable=$scope.$root.GetMESReturnValue_DT(oMESReturn,'checkandgetproddata');
												
												if (tmpTable.length >0)
												{
													dtPRDOPASMProcedure[tmpidx].SERIALNO=serialno;
													dtPRDOPASMProcedure[tmpidx].KEYPARTNO=tmpTable[0].PRODUCTNO;
													dtPRDOPASMProcedure[tmpidx].KEYPARTNAME=tmpTable[0].PRODUCTNAME;
													PassFlag=true;	
													AcceptChanges(function(){});														
												}									
											}
										},componentno,componenttype);
									break;
									
									case '4' :	
										CheckMtrl = true;
										
										if (KeyPartNo == '' || KeyPartNo == undefined)
										{materialno=componentno;}
										else
										{materialno=KeyPartNo;}
										
										
										checkandgetmtrldata(function(){
											
											if (oMESReturn.result == 'success') {
											var	tmpTable=$scope.$root.GetMESReturnValue_DT(oMESReturn,'checkandgetmtrldata');
												 
												if (tmpTable.length >0)
												{
													dtPRDOPASMProcedure[tmpidx].SERIALNO=serialno;
													dtPRDOPASMProcedure[tmpidx].KEYPARTNO=tmpTable[0].MATERIALNO;
													dtPRDOPASMProcedure[tmpidx].KEYPARTNAME=tmpTable[0].MATERIALNAME;
													PassFlag=true;	
													AcceptChanges(function(){});													
												}									
											}
										},materialno,componenttype);
									break;
									
									case '5' :			
										CheckMtrl = true;
										
										if (KeyPartNo == '' || KeyPartNo == undefined)
										{materialno=componentno;}
										else
										{materialno=KeyPartNo;}
										
										checkandgetmtrldata(function(){
											
											if (oMESReturn.result == 'success') {
											var	tmpTable=$scope.$root.GetMESReturnValue_DT(oMESReturn,'checkandgetmtrldata');
												
												if (tmpTable.length >0)
												{
													dtPRDOPASMProcedure[tmpidx].SERIALNO=serialno;
													dtPRDOPASMProcedure[tmpidx].KEYPARTNO=tmpTable[0].MATERIALNO;
													dtPRDOPASMProcedure[tmpidx].KEYPARTNAME=tmpTable[0].MATERIALNAME;
													PassFlag=true;	
													AcceptChanges(function(){});														
												}									
											}
										},materialno,componenttype);
									break;
									
									case '6' :					
										dtPRDOPASMProcedure[tmpidx].SERIALNO=serialno;
										dtPRDOPASMProcedure[tmpidx].KEYPARTNO='MAC';
										dtPRDOPASMProcedure[tmpidx].KEYPARTNAME='MAC';
										PassFlag=true;	
										AcceptChanges(function(){});											
									break;
									
									case '7' :					
										dtPRDOPASMProcedure[tmpidx].SERIALNO=serialno;
										dtPRDOPASMProcedure[tmpidx].KEYPARTNO='IMEI';
										dtPRDOPASMProcedure[tmpidx].KEYPARTNAME='IMEI';
										PassFlag=true;
										AcceptChanges(function(){});											
									break;									
								}
								blnchkserial =true;
								break looppr;
							}							
						}	
					}
					if (blnchkserial == false)
					{
						if(CheckProd == true )
						{$scope.$root.showAlert('0000-003000'+ '<br>' + $filter('translate')('br_u_coassy_asm.snno') + serialno + '<br>' + $filter('translate')('br_u_coassy_asm.prdno')+ prdno + '<br>' + $filter('translate')('br_u_coassy_asm.nonexist'));}
						else if(CheckMtrl == true)
						{$scope.$root.showAlert('0000-003000'+ '<br>' + $filter('translate')('br_u_coassy_asm.snno') + serialno + '<br>' + $filter('translate')('br_u_coassy_asm.mtlno')+ KeyPartNo + '<br>' + $filter('translate')('br_u_coassy_asm.nonexist1'));}
						else
						{$scope.$root.showAlert($filter('translate')('br_u_coassy_asm.serialnonexist'));}						
					}
				}			

			}						
		}
		
		
		//--functions--//
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
					$scope.$root.showAlert((data.exception.code) + '<br>' + (data.exception.mesmsg) + '<br>' + (data.exception.sysmsg),1,function(){
					$timeout(function(){
							$scope.runcard='';
							document.getElementById('runcard').focus();
					},750);
					});
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
		
		//取得作業工序
		function loadsubopinfo(callback){			
			$WebService.Invoke({
				method : 'YOKE.wsWIP_ASM.LoadSubOPInfo',
				param : {
					productno:$scope.$root.SetMESParameter('ProductNo', 'String', prdno),
					productversion:$scope.$root.SetMESParameter('ProductVersion', 'String', prdversion),
					opno:$scope.$root.SetMESParameter('OPNo', 'String', opno)
					
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

		//取得組裝程序
		function loadprdopasmprocedure(callback){			
			$WebService.Invoke({
				method : 'YOKE.wsWIP_ASM.LoadPrdOPASMProcedure',
				param : {
					lotno:$scope.$root.SetMESParameter('LotNo', 'String', lotno),
					productno:$scope.$root.SetMESParameter('ProductNo', 'String', prdno),
					productversion:$scope.$root.SetMESParameter('ProductVersion', 'String', prdversion),
					loggroupserial:$scope.$root.SetMESParameter('LogGroupSerial', 'String', loggroupserial),
					opno:$scope.$root.SetMESParameter('OPNo', 'String', opno)					
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

		//取得序號規則
		function loadscanrule(callback){			
			$WebService.Invoke({
				method : 'YOKE.wsWIP_ASM.LoadScanRule',
				param : {		
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
		
		//取得產品資料
		function checkandgetproddata(callback,prdno,componenttype){			
			$WebService.Invoke({
				method : 'YOKE.wsWIP_ASM.CheckAndGetProdData',
				param : {		
					productno:$scope.$root.SetMESParameter('ProductNo', 'String', prdno),
					componenttype:$scope.$root.SetMESParameter('ComponentType', 'String', componenttype),
					mono:$scope.$root.SetMESParameter('MONo', 'String', mono),
					materiallotno:$scope.$root.SetMESParameter('MaterialLotNo', 'String', $scope.runcard)				
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
		
		//'取得物料資料
		function checkandgetmtrldata(callback,materialno,componenttype){			
			$WebService.Invoke({
				method : 'YOKE.wsWIP_ASM.CheckAndGetMtrlData',
				param : {	
					materialno:$scope.$root.SetMESParameter('MaterialNo', 'String', materialno),
					componenttype:$scope.$root.SetMESParameter('ComponentType', 'String', componenttype),
					materiallotno:$scope.$root.SetMESParameter('MaterialLotNo', 'String', $scope.runcard)						
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
		
		//刪除UnitState
		function deleteunitstate(callback,strUnitASMState){			
			$WebService.Invoke({
				method : 'YOKE.wsWIP_ASM.DeleteUnitState',
				param : {
					unitasmstate:$scope.$root.SetMESParameter_Multi('UnitASMState', 'String', strUnitASMState)
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
		
		//寫入/更新UnitState
		function modifyunitstate(callback,strUnitASMState){			
			$WebService.Invoke({
				method : 'YOKE.wsWIP_ASM.ModifyUnitState',
				param : {
					unitasmstate:$scope.$root.SetMESParameter_Multi('UnitASMState', 'String', strUnitASMState)
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

		//組裝作業CheckOut
		function exe_checkout_asm(callback,strUnitASMState){			
			$WebService.Invoke({
				method : 'YOKE.wsWIP_ASM.Exe_CheckOut_ASM',
				param : {
					lotstamp:$scope.$root.SetMESParameter('LotStamp', 'String', lotstamp),
					lotno:$scope.$root.SetMESParameter('LotNo', 'String', lotno),
					linkname:$scope.$root.SetMESParameter('LinkName', 'String', 'pass'),
					goodqty:$scope.$root.SetMESParameter('GoodQty', 'Integer', goodqty),					
					unitasmstate:$scope.$root.SetMESParameter_Multi('UnitASMState', 'String', strUnitASMState)
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
					linkname:$scope.$root.SetMESParameter('LinkName', 'String', 'pass')					
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
		
		//'取得替代料資訊
		function LoadSubMaterial(callback,materialno){			
			$WebService.Invoke({
				method : 'YOKE.wsWIP_ASM.LoadSubMaterial',
				param : {	
					materialno:$scope.$root.SetMESParameter('MaterialNo', 'String', materialno),
					productno:$scope.$root.SetMESParameter('ProductNo', 'String', prdno),
					productversion:$scope.$root.SetMESParameter('ProductVersion', 'String', prdversion)						
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
			
		function funCheckSN(callback,componenttype,rulebase,keypartno){
				var SelRow=[];	blnfunCheckSN =true;
				
					switch(componenttype) 
					{
						case '1' :					
								if ($scope.runcard != tblRefLot[0].LOTNO)
								{
									blnfunCheckSN =false;									
								}
						break;
						
						case '2' :
								for (temprow in dtSNRule) 
								{
									if (dtSNRule[temprow].SerialType == '1' && dtSNRule[temprow].RuleBase == rulebase)
									{
										SelRow.push(dtSNRule[temprow]);
									}
								}
						break;
						
						case '3' :
								for (temprow in dtSNRule) 
								{
									if (dtSNRule[temprow].SerialType == '1' && dtSNRule[temprow].RuleBase == rulebase)
									{
										SelRow.push(dtSNRule[temprow]);
									}
								}
						
						break;

						case '4' :
								for (temprow in dtSNRule) 
								{
									if (dtSNRule[temprow].SerialType == '2' && dtSNRule[temprow].RuleBase == rulebase)
									{
										SelRow.push(dtSNRule[temprow]);
									}
								}
						
						break;
						
						case '5' :
								for (temprow in dtSNRule) 
								{
									if (dtSNRule[temprow].SerialType == '2' && dtSNRule[temprow].RuleBase == rulebase)
									{
										SelRow.push(dtSNRule[temprow]);
									}
								}
						
						break;
						
						case '6' :
								for (temprow in dtSNRule) 
								{
									if (dtSNRule[temprow].SerialType == '3' && dtSNRule[temprow].RuleBase == 'N/A')
									{
										SelRow.push(dtSNRule[temprow]);
									}
								}
						
						break;
						
						case '7' :
								for (temprow in dtSNRule) 
								{
									if (dtSNRule[temprow].SerialType == '4' && dtSNRule[temprow].RuleBase == 'N/A')
									{
										SelRow.push(dtSNRule[temprow]);
									}
								}
						
						break;
					}	
				
				if (SelRow.length > 0)
				{
					var CheckFlagCase1 =false;	var CheckFlagCase2 =false;	var CheckFlagCase3 =false;	var CheckFlagCase4 =false;
					var Case1Pass = false;		var Case2Pass = false;		var Case3Pass = false;		var Case4Pass = false;
					
					
					for (temprow in SelRow)
					{
						var RuleType = -1;
						 
						RuleType = SelRow[temprow].RuleType;
						
						switch(RuleType)
						{
							case '1' : //判斷長度
								CheckFlagCase1 = true;
								
								if (Case1Pass != true)
								{
									var SerialLength =-1;
									SerialLength = SelRow[temprow].SerialLength;
									
									if ($scope.runcard.length == SerialLength)
									{
										Case1Pass=true;
									}									
								}								
							break;
							
							case '2' : //第N1~N2碼需為XXX
								
								CheckFlagCase2 = true;
								
								if (Case2Pass != true)
								{ var StartIdx = -1 ; var SerialLength = -1; var EndIdx = -1; var ContainString = '';
									
								  StartIdx = SelRow[temprow].StartIndex;
								  SerialLength = SelRow[temprow].SerialLength;
								  EndIdx = parseInt(StartIdx) - 1 + parseInt(SerialLength);
								  ContainString = SelRow[temprow].ContainString;
								  
								  if ($scope.runcard.length < EndIdx)
								  {}
								  else 
								  {
									  var tmpstr = $scope.runcard.substring(parseInt(StartIdx)-1,EndIdx);
									  if (tmpstr == ContainString)
									  {
										  Case2Pass =true;
									  }  							 
								  }
								}
							break;
							
							case '3' : //字串前n 碼必須為『XXX』
								CheckFlagCase3 = true;
								 if (Case3Pass != true)
								 { var FirstStr= SelRow[temprow].FirstString;
									 if ($scope.runcard.indexOf(FirstStr) != 0)
									 {}
									 else 
									 {
										 Case3Pass=true;
									 }
								 }
							break;
							
							case '4' : //字串後n碼必須為『XXX』
								CheckFlagCase4 = true;
								
								if (Case4Pass != true)
								{ var LastStr = SelRow[temprow].LASTSTRING;
									if (($scope.runcard.lastIndexOf(LastStr)+LastStr.length) != $scope.runcard.length)
									{}
									else 
									{
									 Case4Pass= true;
									}
								}
							break;						
						}
					}
					
					if (blnfunCheckSN == true) 
					{
						if (CheckFlagCase1 == true)
						{
							if (Case1Pass != true)
							{
								blnfunCheckSN = false;
							}
						}
					}
					
					if (blnfunCheckSN == true) 
					{
						if (CheckFlagCase2 == true)
						{
							if (Case2Pass != true)
							{
								blnfunCheckSN = false;
							}
						}						
					}
					
					if (blnfunCheckSN == true) 
					{
						if (CheckFlagCase3 == true)
						{
							if (Case3Pass != true)
							{
								blnfunCheckSN = false;
							}
						}						
					}
					
					if (blnfunCheckSN == true) 
					{
						if (CheckFlagCase4 == true)
						{
							if (Case4Pass != true)
							{
								blnfunCheckSN = false;
							}
						}						
					}
				}
				
				if (blnfunCheckSN != true)
				{ //物料需多判斷是不是刷入替代料 ，判斷替代料是否符合規則
					if (componenttype ==4 || componenttype==5)
					{
						//取得替代料資訊
						LoadSubMaterial(function(){													
							if (oMESReturn.result == 'success') {
								tblSubMaterial = $scope.$root.GetMESReturnValue_DT(oMESReturn,'loadsubmaterial');	
								
								if (tblSubMaterial.length > 0)
								{ var SubMaterialRuleCheck = false;
								  SelRow.length=0;
								  
								 for (temprow_Material in tblSubMaterial)
								 {										
									for (temprow in dtSNRule) 
									{
										if (dtSNRule[temprow].SERIALTYPE == 2 && dtSNRule[temprow].RULEBASE == tblSubMaterial[temprow].SUBMATERIAL)
										{
											SelRow.push(dtSNRule[temprow]);
										}
									}
									
									if (SelRow.length > 0)
									{var CheckFlagCase1 =false;	var CheckFlagCase2 =false;	var CheckFlagCase3 =false;	var CheckFlagCase4 =false;
									 var Case1Pass = false;		var Case2Pass = false;		var Case3Pass = false;		var Case4Pass = false;
										
									 for (temprow in SelRow)
									 { 	var RuleType= -1;
										RuleType=SelRow[temprow].RuleType
										
										switch(RuleType)
										{
											case 1 : //判斷長度
												CheckFlagCase1 = true;
												
												if (Case1Pass != true)
												{
													var SerialLength =-1;
													SerialLength = SelRow[temprow].SerialLength;
													
													if ($scope.runcard == SerialLength)
													{
														Case1Pass=true;
													}									
												}								
											break;
											
											case 2 : //第N1~N2碼需為XXX
								
												CheckFlagCase2 = true;
												
												if (Case2Pass != true)
												{ var StartIdx = -1 ; var SerialLength = -1; var EndIdx = -1; var ContainString = '';
												  StartIdx = SelRow[temprow].StartIndex;
												  SerialLength = SelRow[temprow].SerialLength;
												  EndIdx = StartIdx - 1 + SerialLength;
												  ContainString = SelRow[temprow].ContainString;
												  
												  if ($scope.runcard.length < EndIdx)
												  {}
												  else 
												  {
													  var tmpstr = $scope.runcard.substring(StartIdx-1,SerialLength);
													  if (tmpstr == ContainString)
													  {
														  Case2Pass =true;
													  }  							 
												  }
												}
											break;
											
											case 3 : //字串前n 碼必須為『XXX』
												CheckFlagCase3 = true;
												 if (Case3Pass != true)
												 { var FirstStr= SelRow[temprow].FIRSTSTRING;
													 if ($scope.runcard.indexOf(FirstStr) != 0)
													 {}
													 else 
													 {
														 Case3Pass=true;
													 }
												 }
											break;
											
											case 4 : //字串後n碼必須為『XXX』
												CheckFlagCase4 = true;
												
												if (Case4Pass != true)
												{ var LastStr = SelRow[temprow].LASTSTRING;
													if (($scope.runcard.lastIndexOf(LastStr)+LastStr.length) != $scope.runcard.length)
													{}
													else 
													{
													 Case4Pass= true;
													}
												}
											break;
										}
									 }
									}
									
									if (SubMaterialRuleCheck == true) 
									{
										if (CheckFlagCase1 == true)
										{
											if (Case1Pass != true)
											{
												SubMaterialRuleCheck = false;
											}
										}
									}
									
									if (SubMaterialRuleCheck == true) 
									{
										if (CheckFlagCase2 == true)
										{
											if (Case2Pass != true)
											{
												SubMaterialRuleCheck = false;
											}
										}						
									}
									
									if (SubMaterialRuleCheck == true) 
									{
										if (CheckFlagCase3 == true)
										{
											if (Case3Pass != true)
											{
												SubMaterialRuleCheck = false;
											}
										}						
									}
									
									if (SubMaterialRuleCheck == true) 
									{
										if (CheckFlagCase4 == true)
										{
											if (Case4Pass != true)
											{
												SubMaterialRuleCheck = false;
											}
										}						
									}
									
									if (SubMaterialRuleCheck == true)
									{	
										keyPartNo = tblSubMaterial[temprow_Material].SUBMATERIAL;
									}
								 }
								 blnfunCheckSN=SubMaterialRuleCheck;
								}
							}
						},rulebase);	
					}
					
				}
					
				if(callback) callback();
					
		}
				
		//'組裝序號
		function AcceptChanges(callback){	
		
			var datetime =moment().format('MMMM Do YYYY, h:mm:ss a');
			var aryModifyUnitState=[];var blnsubop_flag=false;
			//判斷作業工序
			loop_subop:
			for (subopseq = $scope.supopno; subopseq <= subopmax; subopseq++) 
			{
				for (temprow in dtPRDOPASMProcedure)
				{						
					//未完成工序，找出下一工序
					if (dtPRDOPASMProcedure[temprow].SUBOPSEQ == subopseq && dtPRDOPASMProcedure[temprow].SERIALNO == '')
					{
						blnsubop_flag = true;
						$scope.supopno=subopseq;
						
						aryprocedure.length=0;
						for (temprow in dtPRDOPASMProcedure)
						{	
							if (dtPRDOPASMProcedure[temprow].SUBOPSEQ==$scope.supopno.toString())
							{
							var tempary={COMPONNENTNO:'',SERIALNO:''};
							tempary.COMPONNENTNO = dtPRDOPASMProcedure[temprow].COMPONENTNO;
							tempary.SERIALNO = dtPRDOPASMProcedure[temprow].SERIALNO;
							aryprocedure.push(tempary);
							}
						}
						$scope.aryprocedure=aryprocedure;		
						$scope.runcard='';
						document.getElementById('runcard').focus();
						break loop_subop;
					}
				}				
			}
			//完成所有工序
			if (blnsubop_flag == false)
			{
				for (temprowProcedure in dtPRDOPASMProcedure)
				{
					var aryTempModifyUnitState={unitid:'',loggroupserial:'',opno:'',subopno:'',asmsequence:'',componentno:'',keypartno:'',componenttype:'',mastercomponent:'',serialno:'',stdqty:'',eventtime:''};
					aryTempModifyUnitState.unitid=dtPRDOPASMProcedure[temprowProcedure].UNITID;
					aryTempModifyUnitState.loggroupserial=tblRefLot[0].LOGGROUPSERIAL;
					aryTempModifyUnitState.opno=dtPRDOPASMProcedure[temprowProcedure].OPNO;
					aryTempModifyUnitState.subopno=dtPRDOPASMProcedure[temprowProcedure].SUBOPNO;
					aryTempModifyUnitState.asmsequence=dtPRDOPASMProcedure[temprowProcedure].ASMSEQ;
					aryTempModifyUnitState.componentno=dtPRDOPASMProcedure[temprowProcedure].COMPONENTNO;
					aryTempModifyUnitState.keypartno=dtPRDOPASMProcedure[temprowProcedure].KEYPARTNO;
					aryTempModifyUnitState.componenttype=dtPRDOPASMProcedure[temprowProcedure].COMPONENTTYPE;
					aryTempModifyUnitState.mastercomponent=dtPRDOPASMProcedure[temprowProcedure].MASTERCOMPONENT;
					aryTempModifyUnitState.serialno=dtPRDOPASMProcedure[temprowProcedure].SERIALNO;
					aryTempModifyUnitState.stdqty=dtPRDOPASMProcedure[temprowProcedure].STDQTY;
					aryTempModifyUnitState.eventtime=datetime;
					aryModifyUnitState.push(aryTempModifyUnitState);												
				}
				
				
				exe_checkout_asm(function(){
					
					if (oMESReturn.result == 'success') 
					{
						TransferLot(function(){});
						$scope.runcard='';$scope.supopno='';
						$scope.lotno ='';lotno='';
						dtPRDOPASMProcedure.length=0;
						aryprocedure.length=0;
						$scope.aryprocedure=aryprocedure;		
						$scope.$root.showAlert($filter('translate')('br_u_coassy_asm.success'),0,function(){
						$timeout(function(){
								document.getElementById('runcard').focus();
						},750);
						});	
					}				
					
				},aryModifyUnitState);					
			}
			else
			{
							
			//更新UnitState
			for (temprowProcedure in dtPRDOPASMProcedure)
			{
				if (dtPRDOPASMProcedure[temprowProcedure].SERIALNO !='' && dtPRDOPASMProcedure[temprowProcedure].SUBOPNO==$scope.supopno.toString())
				{
					var aryTempModifyUnitState={unitid:'',loggroupserial:'',opno:'',subopno:'',asmsequence:'',componentno:'',keypartno:'',componenttype:'',mastercomponent:'',serialno:'',stdqty:'',eventtime:''};
					aryTempModifyUnitState.unitid=dtPRDOPASMProcedure[temprowProcedure].UNITID;
					aryTempModifyUnitState.loggroupserial=tblRefLot[0].LOGGROUPSERIAL;
					aryTempModifyUnitState.opno=dtPRDOPASMProcedure[temprowProcedure].OPNO;
					aryTempModifyUnitState.subopno=dtPRDOPASMProcedure[temprowProcedure].SUBOPNO;
					aryTempModifyUnitState.asmsequence=dtPRDOPASMProcedure[temprowProcedure].ASMSEQ;
					aryTempModifyUnitState.componentno=dtPRDOPASMProcedure[temprowProcedure].COMPONENTNO;
					aryTempModifyUnitState.keypartno=dtPRDOPASMProcedure[temprowProcedure].KEYPARTNO;
					aryTempModifyUnitState.componenttype=dtPRDOPASMProcedure[temprowProcedure].COMPONENTTYPE;
					aryTempModifyUnitState.mastercomponent=dtPRDOPASMProcedure[temprowProcedure].MASTERCOMPONENT;
					aryTempModifyUnitState.serialno=dtPRDOPASMProcedure[temprowProcedure].SERIALNO;
					aryTempModifyUnitState.stdqty=dtPRDOPASMProcedure[temprowProcedure].STDQTY;
					aryTempModifyUnitState.eventtime=datetime;
					aryModifyUnitState.push(aryTempModifyUnitState);
				}							
			}
			
			modifyunitstate(function(){},aryModifyUnitState);
			}
		}	
	}
]});


