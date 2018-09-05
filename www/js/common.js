//common function
define(["app"], function (app) {
	app.run(function($state, $rootScope, $filter, $mdDialog, $timeout, $location, $anchorScroll, $templateRequest, $compile, config){
		$rootScope.loadFinish = false;
		console.log(navigator.userAgent);
		// 紀錄目前Loading的狀態
		//disabled : true - 隱藏/false - 顯示
		$rootScope.Loading = {
			disabled : true,
			count : 0,
			msg : ''
		}
		
		//顯示Loading, 會記錄目前顯示幾次Loading
		$rootScope.showLoading = function(msg){
			angular.element(document.getElementsByClassName('LoadingContener')[0]).removeClass('ng-hide');
			$rootScope.Loading.msg = msg||'Loading...';
		    $rootScope.Loading.disabled = false;
		    $rootScope.Loading.count++;
		}
		
		//隱藏Loading, 當Loading 全部被關閉的時候才會完全關閉
		$rootScope.hideLoading = function(isForce){
			if(isForce){
				$rootScope.Loading.count = 0;
			}
			
			$rootScope.Loading.count--;
			if($rootScope.Loading.count<=0){
				angular.element(document.getElementsByClassName('LoadingContener')[0]).addClass('ng-hide');
				$rootScope.Loading.disabled = true;
				$rootScope.Loading.count == 0;
			}
		}
		        
		//顯示 Alert
		$rootScope.showAlert = function(alertMsg,icon,confirm){
			$mdDialog.alert(alertMsg,icon,confirm);
	    }
		
		//顯示 confirm
		$rootScope.showConfirm = function(alertMsg, confirm, cancel){
			$mdDialog.confirm(alertMsg, confirm, cancel);
	    }
		
		//MES common function, owenliu add on 2017/03/14
		//產生MES單一參數的物件(功能類似CombineXMLParameter)
		$rootScope.SetMESParameter = function(paraName,paraType,paraValue,paradesc) { 
			/* Invoke Sample
				function loadOPBasis(callback,OPNo,IssueState,GetXml_CLOB) {
					$WebService.setWSDL('/wsOP/wsOP.asmx');
					
					//處理傳入參數預設值
					if (typeof OPNo == 'undefined') {OPNo = DEFSTRING;}
					if (typeof IssueState == 'undefined') {IssueState = DEFINTEGER;}
					if (typeof GetXml_CLOB == 'undefined') {GetXml_CLOB = false;}
					
					$WebService.send({
						method : 'LoadOPBasis',
						param : {
							opno:$scope.$root.SetMESParameter('OPNo', 'string', OPNo),
							issuestate:$scope.$root.SetMESParameter('IssueState', 'integer', IssueState),
							getxml_clob:$scope.$root.SetMESParameter('GetXml_CLOB', 'boolean', GetXml_CLOB)
						},
						success : function(data){
							config.mdssessionno = data.mdssessionno;
							oMESReturn = data;
							if(callback)
								callback();
						},
						error : function(){
							//$scope.$root.showAlert($filter('translate')('Login.error.login'));
						}
					});
				}
			*/
			var MESParameter = {name:'', type:'string', value:'', desc: ''};
			
			//判斷是否為string類型，自動作CInput處理
			if (typeof paraName !== 'undefined') {MESParameter.name = paraName;}
			if (typeof paraType !== 'undefined') {
				MESParameter.type = paraType;
				if (paraType == 'string') { 
					MESParameter.value = CInput(paraValue);
				}
				else{
					MESParameter.value = paraValue;
				}
			}
			if (typeof paradesc !== 'undefined') {MESParameter.desc = CInput(paradesc);}
			
			return MESParameter;
		}
		
		//產生MES傳遞給WS DataTable參數的物件(功能類似CombineXMLParameterMultiValue)
		$rootScope.SetMESParameter_Multi = function(paraName,paraType,paraValue,paradesc) { 
			
			//paraValue應該是如下列所示的物件陣列，每一個陣列元素(物件)代表一筆資料
			//paraValueItem = {privno:'', controlname:''};
			/* Invoke Sampe
				var paraPrivilegescontrol = [];
				for (i=1; i<3; i++) {
					var paraValueItem = {privno:'', controlname:''};
					paraValueItem.privno = 'Priv00' + i ;
					paraValueItem.controlname = 'btnOK' + i;
					paraPrivilegescontrol.push(paraValueItem);
				}
				testDataTable(function(){
					if (oMESReturn.result == 'success' ) {
						var aryTestData = $scope.$root.GetMESReturnValue_DT(oMESReturn,'testdatatable');
					}
				},'1',paraPrivilegescontrol);
			
				function testDataTable(callback,userno,paraValue) {
					$WebService.setWSDL('/wsUSR/wsUSR.asmx');
					$WebService.send({
						method : 'TestDataTable',
						param : {
							userno:$scope.$root.SetMESParameter('UserNo', 'string', userno),
							privilegescontrol:$scope.$root.SetMESParameter_Multi('privilegescontrol', 'string', paraValue)
						},
						success : function(data){
							config.mdssessionno = data.mdssessionno;
							oMESReturn = data;
							if(callback)
								callback();
						},
						error : function(){
							//$scope.$root.showAlert($filter('translate')('Login.error.login'));
						}
					});
				}
			*/
			var MESParameter = {name:'', type:'string', value:[], desc: ''};
			
			if (typeof paraName !== 'undefined') {MESParameter.name = paraName;}
			if (typeof paraType !== 'undefined') {MESParameter.type = paraType;}
			if (typeof paradesc !== 'undefined') {MESParameter.desc = CInput(paradesc);}
			
			for (i=0; i<paraValue.length; i++) {
				//先將陣列中的所有物件先作字串處理(特殊字元轉換)
				var oMESValue = paraValue[i];
				for (colItem in oMESValue) {oMESValue[colItem] = CInput(oMESValue[colItem]);}
				//陣列中的每一個物件直接push到array即可
				MESParameter.value.push(oMESValue);
			}
			
			return MESParameter;
		}
		
		$rootScope.GetMESReturnValue = function (oMES,tagName) {
			//oMES.identity
			//oMES.returnvalue.chkusersecurity>> array[5] of object
			//		each object : name/type/value/desc/schema
			//轉換成一個物件，物件Element名稱是欄位
			
			var oMESDataTable = {};
			
			for (var i=0; i<oMES.returnvalue[tagName].length; i++) {
				var colName = oMES.returnvalue[tagName][i].name;
				var colValue = (oMES.returnvalue[tagName][i].value);
				oMESDataTable[colName] = colValue;
			}
			return oMESDataTable;
		}
		
		$rootScope.GetMESSingleValue = function (oMES,tagName) {
			//oMES.identity
			//oMES.returnvalue.linkname.name(string)/schema(object)/value(object)
			var sMESReturnValue = '';
			sMESReturnValue = (oMES.returnvalue[tagName].value);
			return sMESReturnValue;
		}
		$rootScope.GetMESReturnValue_DT = function (oMES,tagName,tableName) {
			//oMES.identity
			//oMES.returnvalue.loadopbasis.name(string)/schema(object)/value(object)
			//轉換成一個物件，物件Element名稱是欄位
			
			var aryMESData = [];
			
			//TableName	
			if (typeof tableName == 'undefined') {tableName = oMES.returnvalue[tagName].name;}
			//if (tableName == undefined)	{var tableName = oMES.returnvalue[tagName].name;}
					
			//處理Table Schema(暫時不知道要怎麼取出)
			
			//處理Data
			//2017.03.14 owenliu, 增加處理找不到資料時的處置方式，會以
			//2018.02.02 yenru, 所有欄位名稱轉為大寫
			if (oMES.returnvalue[tagName].value.NewDataSet !== 'null' ) {
				if (typeof oMES.returnvalue[tagName].value.NewDataSet[tableName].length !== 'undefined') {
					if (oMES.returnvalue[tagName].value.NewDataSet[tableName].length > 0) {
						for (rowItem in oMES.returnvalue[tagName].value.NewDataSet[tableName]) {
							var MESData = (oMES.returnvalue[tagName].value.NewDataSet[tableName][rowItem]);
							aryMESData.push(MESData);
						}
					}	
				}
				else{
					var MESData = {};
					for (colItem in oMES.returnvalue[tagName].value.NewDataSet[tableName]) {
						MESData[colItem.toUpperCase()] = (oMES.returnvalue[tagName].value.NewDataSet[tableName][colItem]);
					}
					aryMESData.push(MESData);
				}
				
			}
			return aryMESData;
		}
		
		function CInput (SourcsStr) {
		
			if (typeof SourcsStr == 'undefined'){return SourcsStr};
			var TargetStr = SourcsStr;
			
			//轉換 ' 為 '' (單引號轉為兩個單引號)
			TargetStr = TargetStr.replace("'", "''");
			//轉換 & 為 &amp;
			TargetStr = TargetStr.replace("&", "&amp;");
			//轉換 > 為 &gt;
			TargetStr = TargetStr.replace(">", "&gt;");
			//轉換 < 為 &lt;
			TargetStr = TargetStr.replace("<", "&lt;");
			
			return TargetStr;
		}
		
		//顯示Select
		/*
		 * options : {
		 * 	title   : 標題
		 *  label   : list 中外顯值得變數名稱
		 *  code    : list 中內存值的變數名稱
		 *  selectCode : 預設值，對應code設定的變數
		 *  list    : 要呈現的list
		 *  confirm : 按下list以後的處理，會傳入dialog，可以用dialog.hide()
		 *            關閉開窗
		 * }
		 */
		$rootScope.showSelect = function(options){
			$mdDialog.dialog('plugins/angular-material-lite/template/radioList.tmp.html', function(){
				return {
					title : options.title,
					label : options.label,
					code : options.code,
					selectCode : options.selectCode,
					back : function() {
				    	this.hide();
					},
					itemList : options.list,
					itemClick : function(item, event){
						//$translate.use(item.code);
						//$scope.currentUse = item.code;
						if(options.confirm)
							options.confirm(item, this);
						//this.hide();
					}
					
				}
			});
		}
		
		// Change Program
		$rootScope.changeProgram = function(program, parameters, isLeave){
			$rootScope.reciprocalRestart();
			if(typeof(parameters)=='boolean'){
				isLeave = parameters;
			} else {
				isLeave = isLeave||false;
			}

			if(!isLeave){
				//從任何地點 > 載入一般程式
				$rootScope.programState = 'load-program';
			} else {
				//從其他程式> 載入home
				$rootScope.programState = 'leave-program';
			}
			
		    if(parameters!= undefined){
		        $state.go(program, parameters);
		    } else {
		        $state.go(program);
		    }
		}
		
		$rootScope.refreshDataList = function(){
			componentHandler.upgradeAllRegistered();
		}
		  
		/***
		 * 顯示 local Notification, 由App本身所觸發的通知
		 * 此部分有加入使用html5 實作 web browser 通知
		 * data {
		 *     id : id表示此訊息的身分,當有兩個相同的id時,後者會覆蓋前者
		 *     msg : 通知的訊息
		 *     sound : 通知的聲音, 預設是file://sound/sound.mp3
		 *     target : 點擊通知訊息後會開啟的頁面
		 * }
		 */
		$rootScope.ShowNotification = function(data, prepareData, clickHandler){
		    try{
		    	if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
		    		cordova.plugins.notification.local.schedule(prepareData(data));
			        cordova.plugins.notification.local.on("click", clickHandler(data), this);
			     } else {
			    	//產生HTML5的通知
			        Notification.requestPermission(function(permission){
			        	var feedbackData = prepareData(data);
			        	var notification = new Notification(feedbackData.title, {
					        body : feedbackData.text,
				            dir:'auto' 
			            });
			        	notification.click = function(){
			        		window.location = "/";
			        	}
			        });
			    }
		    }catch(error){
		        console.log(error);
		    }
		}
		        
		// Open Background Service
		$rootScope.OpenBackgroundService = function(data){
		    try{
			    // Android customization
			    cordova.plugins.backgroundMode.setDefaults(data);
			    // Enable background mode
			    cordova.plugins.backgroundMode.enable();
			    // Called when background mode has been activated
			    cordova.plugins.backgroundMode.onactivate = function () {
			    	
			    }
		    }catch(error){
		        console.log(error);
		    }
		}
		
		// Screen always on
		$rootScope.DisplayOn = function(ScreenOn){
			if(window.plugins){
				if(ScreenOn)
					window.plugins.insomnia.keepAwake();
				else
					window.plugins.insomnia.allowSleepAgain();
			}
		}
		
		// open Server Send Event Connection
		$rootScope.openSSECenection = function(config, prepareData, clickHandler){
			if (typeof (EventSource) !== "undefined") {
	    		var server = config.server;
				var source = new EventSource('http://'+server.ip+':'+server.port+'/'+server.name+'/'+'startSSE');
				source.addEventListener('open', function(e) {
					//console.log("Open Connection");
				}, false);
				//Set CallbackFunction
				source.addEventListener('message', function (msg) {
					//console.log("SSE get message ");
					//console.log(msg.data);
					var data = JSON.parse(msg.data);

					if(data.command == 'refresh'){
						if($rootScope.refresh != undefined){
							$rootScope.refresh(data);
						}
						
						if(data.equipment && config.setting.machineNot){
							$rootScope.ShowNotification(data, prepareData, clickHandler);
						}
					}
		        });
				source.addEventListener('error', function(e) {
					console.log(e);
					try{
						if(cordova.plugins.backgroundMode.isEnabled()){
							cordova.plugins.backgroundMode.configure({
				                text:$filter('translate')('error.connectRefused')
				            });
						}
					} catch(error){
						console.log(error);
					}
					
					source.close();
					console.log('prepare alert');
					$MDLUtirlity.alert($filter('translate')('error.connectRefused'),function(){
						$rootScope.openSSECenection();
						$MDLUtirlity.alertClose();
					});
		       }, false);
			} else {
				console.log('Your browser don\'t support SSE.');
			}
		}
		
		// open Camera for barcode/QRcode scan
		$rootScope.OpenScanner = function(programName, qrcode_descript, afterOpen, exception){
			setTimeout(function(){
				$rootScope.showLoading();
				$rootScope.$apply();
				setTimeout(function(){
					try{
						/***
						 * result.text
						 * Format: " + result.format
						 * result.cancelled
						 */
						
						cordova.plugins.barcodeScanner.scan(
							function (result) {
								$rootScope.hideLoading(true);
								$rootScope.$apply();
								afterOpen(programName, result);
							},
							function (error) {
								$rootScope.hideLoading(true);
								$rootScope.$apply();
							},
							{
							    "preferFrontCamera" : false, // iOS and Android //使用前鏡頭
							    "showFlipCameraButton" : false, // iOS and Android //切換前後鏡頭
							    "prompt" : qrcode_descript, // 掃描的文字
							    "formats" : "QR_CODE", // 要掃描的格式
							    "orientation" : "unset" // Android only (portrait|landscape), default unset so it rotates with the device
							}
						);
					}catch(e){
						$rootScope.hideLoading(true);
						$rootScope.$apply();
						exception(programName);
					}
				}, 400);
			}, 200);			
		}
		
		//auto logout
		var LogoutTimer = (function(){
			var reciprocalTime = 0;
			var timer;
			function LogoutTimer(rt){
				if(rt)
					reciprocalTime = rt;
			}
			LogoutTimer.prototype.start = function(rt){
				
				if(!timer){
					if(rt)
						reciprocalTime = rt;
					reciprocal();
				}
			}
			
			LogoutTimer.prototype.stop = function(){
				clearTimeout(timer);
				timer = undefined;
			}
			
			LogoutTimer.prototype.refresh = function(rt){
				LogoutTimer.prototype.stop();
				LogoutTimer.prototype.start(rt);
			}
			
			function reciprocal(){
				if(reciprocalTime!=0){
					timer = setTimeout(function(){
						$rootScope.hideMenu();
						$rootScope.changeProgram('login',true);
					},reciprocalTime*60*1000);
				} else {
					console.warn('config.setting.timeout is 0, auto logout wound\'t start');
				}
			}
			
			return LogoutTimer;
		})();
		var logoutTimerIns;
		$rootScope.reciprocalStart = function(){			
			logoutTimerIns = new LogoutTimer(config.setting.timeout);
			logoutTimerIns.start();
		}
		
		$rootScope.reciprocalRestart = function(){		
			if(logoutTimerIns)
				logoutTimerIns.refresh();
		}
		
		//fix keyboard cover input problem - only work with 'Material Design Lite' framework and cordova-keyboard-plugin
		window.addEventListener('native.keyboardshow', function(info) {
			var element = document.activeElement;
			if(element!=undefined && element.tagName == 'INPUT'){				
				$timeout(function(){
					if($location.hash() == element.id){
				        // set the $location.hash to `newHash` and
				        // $anchorScroll will automatically scroll to it
						$anchorScroll();
					} else{
				        // call $anchorScroll() explicitly,
				        // since $location.hash hasn't changed
						$location.hash(element.id);
					}
				});
			}
		});
	
	}).controller('gallery', function($scope, $gallery){
		$scope.gallery = $gallery;
	}).provider('$gallery', function(){
		this.$get = function($rootScope, $controller){
			return {
				url : '',
				title : '',
				isHide : true,
				hide : function(){
					this.isHide = true;
					if(this.feedback){
						this.feedback();
					}
				},
				show : function(title, url, feedback){
					this.title = title;
					this.url = url;
					this.feedback = feedback;
					this.isHide = false;
					try{
						StatusBar.backgroundColorByHexString("#000000");
					}catch(e){}
				},
				feedback : null
			};
		};
	}).directive('format', ['$filter', function ($filter) {
		var replaceDoubleDot = function(plainNumber){
			var isOne = false;
			var returnValue = '';
			Array.from(plainNumber).forEach(function(value){
				if(value == '.'){
					if(!isOne){
						returnValue += value;
						isOne = true;
					}
				} else {
					returnValue += value;
				}
			});
			return returnValue;
		}
		var formateNumber = function(plainNumber){
			//去除非(數字及小數點)
			if(typeof(plainNumber) == 'string'){
				var plainNumber = replaceDoubleDot(plainNumber.replace(/[^\d|^\.]/g, ''));
				if(plainNumber != ''){
					//當小數點不在最後一位表示不是正在輸入中, 則做數字格式化
	            	if(plainNumber.indexOf('.')!=(plainNumber.length-1)){
	                	plainNumber = new Number(plainNumber)
	                	//格式化結果為非數字則返回0
	                	if(isNaN(plainNumber))
	                		plainNumber = 0;
	            	}
	        	} else {
	        		plainNumber = 0;
	        	}
			}
			return plainNumber;
		}
		
	    return {
	        require: '?ngModel',
	        link: function (scope, elem, attrs, ctrl) {
	            if (!ctrl) return;
	            
	            //controller -> view
	            /*
	            ctrl.$formatters.push(function (a) {
	            	return $filter(attrs.format)(ctrl.$modelValue);
	            });
	            */

	            //view -> controller
	            ctrl.$parsers.push(function (viewValue) {
	                if(attrs.format == 'number'){
	                	var plainNumber = formateNumber(viewValue);
	                	ctrl.$setViewValue(plainNumber);// Update the `$viewValue`
	                	ctrl.$render(); // Update the element's displayed value
	                } else {
	                	elem.val(plainNumber = $filter(attrs.format)(plainNumber));
	                }
	                return plainNumber+'';
	            });
	        }
	    }
	}]);
});