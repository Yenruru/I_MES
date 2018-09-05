define(["moment"], function (moment) {
	return ["$scope", "$filter", "$state", "WebService", "config", "$timeout","$stateParams",
	function ($scope, $filter, $state, $WebService, config, $timeout,$stateParams) {
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
				
		//等同於.NET form load		
		$scope.init = function(){
            document.getElementById("txt_mono").focus();
            opno =  config.cache.opno;
            oparea = config.cache.oparea;
            userno = config.cache.account;
            logininfo=config.cache.logininfo;
            prdno = config.cache.prdno;			
            if (logininfo == true)
            {
                //如人員已上工，顯示作業站資訊
                $scope.mono    = config.cache.mono;
                $scope.oparea  = config.cache.oparea;
                $scope.opno    = config.cache.opno;
                $scope.prdno   = config.cache.prdno;
                $scope.mono_readonly = true;
				interfacename=config.cache.interfacename;
            }else{                
				$scope.$root.showAlert(
					$filter('translate')('moout.notlogin')+'<br>'+$filter('translate')('main.start')+$filter('translate')('main.moin')
					,1 
					,function(){
						$timeout(function(){
							$scope.$root.changeProgram('moin');},750);
					}
				)
            }
		}
		
		$scope.change = function(){
            //切換帳號
            config.cache.mono='';
            config.cache.oparea='';
            config.cache.opno='';
            config.cache.prdno='';
            config.cache.account='';
            config.cache.logininfo=false;
            $scope.$root.changeProgram('login', {parent : 'login'});
		}

        $scope.moin = function(){
            //工單上工
            $scope.$root.changeProgram('moin');
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
                $scope.$root.showAlert($filter('translate')('main.nonem')+'<br>'+$filter('translate')('main.start')+$filter('translate')('main.moout'),1)
            }
        }

        $scope.logoff = function (){
            //人員下工
			
			if ($scope.userInfo == '')
            {
                $scope.$root.showAlert($filter('translate')('moout.noneuser'),1);
                return false;
            }
			
			if (config.cache.logininfo == false)
            {
                $scope.$root.showAlert($filter('translate')('moout.notlogin')+'<br>'+$filter('translate')('main.start')+$filter('translate')('main.moin'),1);
                return false;
            }

            MOOperatorLogOff_H5(function(){
                if (oMESReturn.result == 'success')
                {
                    $scope.$root.showAlert($filter('translate')('moout.success'),0);

                    config.cache.mono='';
                    config.cache.prdno='';
                    config.cache.logininfo=false;
					$scope.mono = '';
					$scope.oparea = '';
					$scope.opno = '';
					$scope.prdno = '';									
                }
            })

        }

        $scope.txt_mono_KeyPress = function($event){
            if ($event.charCode == 13) {
				
                mono=$scope.mono

                funLoadMOBasis(function(){
                    if (oMESReturn.result == 'success')
                    {
                        var tblMOBasis = $scope.$root.GetMESReturnValue_DT(oMESReturn,'loadmobasis');

                        if (tblMOBasis.length == 0)
                        {
                            $scope.$root.showAlert($filter('translate')('moout.nonemo')+$filter('translate')('moout.mo')+":"+mono,1);
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
                                    $scope.$root.showAlert($filter('translate')('moout.noneprd')+":"+prdno,1);
									$scope.mono.infocus()
                                    return false;
                                }

                                //工單、產品驗證成功，顯示作業站資訊
                                $scope.oparea  = config.cache.oparea;
                                $scope.opno    = config.cache.opno;
                                $scope.prdno   = prdno;

                            }
                        });

                    }
                });

            }
        }


        function MOOperatorLogOff_H5(callback){
            $WebService.Invoke({
                method : 'YOKE.wsWIP.MOOperatorLogOff_H5',
                param : {
                    userno:$scope.$root.SetMESParameter('UserNo', 'string', userno),
                    mono:$scope.$root.SetMESParameter('MONo', 'string', $scope.mono),
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
    }
]});
