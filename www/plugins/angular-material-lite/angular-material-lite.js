/*!
 * Angular Material Design KMI
 * v2.0.0
 * author Dustdusk
 */
 (function(window,angular, moment, d3){
	"use strict";
	var isMobile = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/);
	
	(function(){
		"use strict";

		angular.module('ngMaterialLite',["ng", 'material.components.dialog', 'material.components.datePicker', 'material.components.calculater','material.components.dashboard', 'material.components.barcode'])
		.run(function ($rootScope,$timeout) {
	        $rootScope.$on('$viewContentLoaded', function(){
	          $timeout(function(){
	            componentHandler.upgradeAllRegistered();
	          })
	        })
	        $rootScope.$on("$includeContentLoaded", function(){
		        $timeout(function(){
			      componentHandler.upgradeAllRegistered();
			    })
	         });
	    })
	    .directive('pullRefresh', function($parse){
			  var PullRefresh = (function () {
				  var scope = {};
				  var content = null;
				  var feedback = null;
				  
				  var origin = null;
				  var isTop = false;
				  var showRefresh = false;
				  var pullDownMax = 350;
				  
				  function PullRefresh(scope, contents, feedback){
					  this.scope = scope;
					  this.scope.pullDownDistance = 0;
					  this.content = contents;
					  this.feedback = feedback;
					  
					  angular.element(this.content).on('touchstart', function(event){
						  this.touchstartHandler(event);
					  });
					  angular.element(this.content).on('touchmove', function(event){
						  this.touchmoveHandler(event);
					  });
					  angular.element(this.content).on('touchend', function(event){
						  this.touchendHandler(event);
					  });
				  }
			  
				  PullRefresh.prototype.touchstartHandler = function (event){
					  if(angular.element(this.content).parent()[0].scrollTop == 0){
					   	  isTop = true;
	                    var touches = event.originalEvent ? event.originalEvent.touches : event.touches;
					  	  origin = touches[0];
					  } else {
					  	  isTop = false;
					  }
				  }
				  PullRefresh.prototype.touchmoveHandler = function(event){
				  	if(isTop){
				  		var touches = event.originalEvent ? event.originalEvent.touches : event.touches;
				  		if(origin.clientY - touches[0].clientY < 0){
				  			event.preventDefault();
				  			showRefresh = true; //是否把refresh拉出來過
				  			this.scope.pullDownDistance = (touches[0].clientY-origin.clientY);
				  			if(this.scope.pullDownDistance>pullDownMax){
				  				this.scope.pullDownDistance = pullDownMax;
				  			}
				  			this.scope.$apply();
				  		} else {
				  			if(showRefresh){
				  				event.preventDefault();
				  			}
				  		}
				  	}
				  }
				  	
				  PullRefresh.prototype.touchendHandler = function(event){
				  	if(isTop){
				  		if(this.scope.pullDownDistance > 50){
				  			this.feedback(this.scope);
				  		}
				  		this.scope.pullDownDistance = 0;
				  		this.scope.$apply();
				  		showRefresh = false;
				  	}
				  }
				  
				  return PullRefresh;
			  })();

			  return {
				  restrict : "A",
				  scope : false,
				  compile : function(tElem, tAttrs){
					  angular.element(tElem).prepend('<div class="page-refresh" style="top:{{(pullDownDistance/2-48)}}px;overflow:hidden;"><div class="page-refresh__icon mdl-shadow--4dp"><i class="material-icons " style="transform: rotate({{(pullDownDistance*2)}}deg);opacity:{{pullDownDistance/150}}">refresh</i></div></div>');
					  return {
						  post : function(scope, element, attrs){
							  var PullRefreshInstance = new PullRefresh(
									  scope,
									  element[0].getElementsByClassName('page-content')[0],
									  $parse(attrs.pullRefresh)
							  );
					      }
					  }
				  }
			  }
		})
		.directive('type', ['$timeout', function ($timeout) {
		    return {
		        require: '?ngModel',
		        link: function (scope, elem, attrs, ctrl) {
		            if (!ctrl) return;
		            
		            //controller -> view
		            if(attrs.type == 'text' || attrs.type == 'checkbox' || attrs.type == 'tel' || attrs.type == 'number'){
			            ctrl.$formatters.push(function (a) {
			            	if (a && a.length > 0) {
			            		angular.element(elem[0].parentNode).addClass('is-dirty');
			            	}
			            	return a;
			            });
		            }
		        }
		    }
		}])
		.directive('kmiCanClick', function () {
		    return {
		    	restrict : "C",
		        link: function (scope, elem, attrs, ctrl) {
		        	var startEvent, endEvent;
		        	if(isMobile){
		        		startEvent = 'touchstart';
		        		endEvent = 'touchend';
		        	} else {
		        		startEvent = 'mousedown';
		        		endEvent = 'mouseup';
		        	}
		        	
		            angular.element(elem[0]).on(startEvent, function(){
		            	if(angular.element(elem[0]).parent().attr('disabled') != 'disabled')
		            		angular.element(elem[0]).addClass('is-active');
		            });
		            angular.element(elem[0]).on(endEvent, function(){
		            	if(angular.element(elem[0]).parent().attr('disabled') != 'disabled')
		            		angular.element(elem[0]).removeClass('is-active');
		            });
		        }
		    }
		});
	    
	})();
	(function(){
		"use strict";
		var dialog = {};
		var dialogScope;
		var dialogContent = null;
		var backupDialog = [];
		var backupContent = [];
		var nowContent;
		var dialogCount = 0;
		var dialogObject;
		
		function clearDialog(target ){
			for(var index in target){
				delete target[index];
			}
			return target
		};
		
		//TODO Dialog 要回復初始值, 等後續改寫
		angular
		  .module('material.components.dialog', [])
		  .provider('$mdDialog', function(){
			  this.$get = function($compile, $templateRequest, $controller, $rootScope){
				  return {
					  alert : function(msg,icon,feedback){
						  //當dialog background 已經開啟, 則要做之前的輩份
						  if(dialog.isShow){
							  backupDialog[backupDialog.length] = angular.extend({},dialog);
							  backupContent[backupContent.length] = nowContent;
						  } else if(backupDialog[backupDialog.length]){
							  console.err('please don\'t open two more dialog in one time');
							  return;
						  }
						  
						  
						  if (icon == 0)//information
						  {
							  $templateRequest('plugins/angular-material-lite/template/alert.tmp.ifo.html').then(function(respose){
							  //angular.element(dialogContent).append($compile(respose)(dialogScope));
							  nowContent = $compile('<div class="dialog-lay" >'+respose+'</div>')(dialogScope);
							  angular.element(dialogContent).append(nowContent);
							  dialog.show(msg);});
						  }
						  else if (icon == 1)//coding
						  {
							  $templateRequest('plugins/angular-material-lite/template/alert.tmp.exc.html').then(function(respose){
							  //angular.element(dialogContent).append($compile(respose)(dialogScope));
							  nowContent = $compile('<div class="dialog-lay" >'+respose+'</div>')(dialogScope);
							  angular.element(dialogContent).append(nowContent);
							  dialog.show(msg);});
						  }
						  else if  (icon ==2)//error
						  {
							  $templateRequest('plugins/angular-material-lite/template/alert.tmp.ero.html').then(function(respose){
							  //angular.element(dialogContent).append($compile(respose)(dialogScope));
							  nowContent = $compile('<div class="dialog-lay" >'+respose+'</div>')(dialogScope);
							  angular.element(dialogContent).append(nowContent);
							  dialog.show(msg);});							  
						  }
						  else 
						  {  
							  $templateRequest('plugins/angular-material-lite/template/alert.tmp.html').then(function(respose){
							  //angular.element(dialogContent).append($compile(respose)(dialogScope));
							  nowContent = $compile('<div class="dialog-lay" >'+respose+'</div>')(dialogScope);
							  angular.element(dialogContent).append(nowContent);
							  dialog.show(msg);});
						  }
						  
						  //dialog.isShow = false;
						  dialog.confirm = function(){
							  dialog.hide();
							  if(feedback != null)
							      feedback();
						  }
					  },
					  confirm : function(msg, confirm, cancel){
						  //當dialog background 已經開啟, 則要做之前的輩份
						  if(dialog.isShow){
							  backupDialog[backupDialog.length] = angular.extend({},dialog);
							  backupContent[backupContent.length] = nowContent;
						  } else if(backupDialog[backupDialog.length]){
							  console.err('please don\'t open two more dialog in one time');
							  return;
						  }
						  
						  $templateRequest('plugins/angular-material-lite/template/confirm.tmp.html').then(function(respose){
							  clearDialog(dialogScope.dialog);
							  nowContent = $compile('<div class="dialog-lay" >'+respose+'</div>')(dialogScope);
							  angular.element(dialogContent).append(nowContent);
							  dialog.show(msg);
						  });

						  dialog.confirm = confirm;
						  dialog.cancel = cancel||dialog.cancel;
					  },
					  dialog : function(templateURL, controller){
						  //當dialog background 已經開啟, 則要做之前的輩份
						  if(dialog.isShow){
							  backupDialog[backupDialog.length] = angular.extend({},dialog);
							  backupContent[backupContent.length] = nowContent;
						  } else if(backupDialog[backupDialog.length]){
							  console.err('please don\'t open two more dialog in one time');
							  return;
						  }
						  
						  $templateRequest(templateURL).then(function(respose){
							  nowContent = $compile('<div class="dialog-lay" >'+respose+'</div>')(dialogScope);
							  angular.element(dialogContent).append(nowContent);
							  dialog.show();
						  });
						  
						  angular.extend(dialog, controller(dialog));
						  dialog.templateURL = templateURL;
					  },
					  dialogObject:{
						  isShow: false,
						  content:'',
						  templateURL : '',
						  hide:function(){
							  //判斷有沒有舊版的dialog
							  if(!backupDialog[backupDialog.length-1]){
								  //沒有舊版的就全部關閉
								  dialog.isShow = false;  
								  angular.element(dialogContent).html('');
								  angular.element(dialogContent).css('display','none');
								  backupDialog = [];
								  backupContent = [];
								  
								  angular.extend(clearDialog(dialog), dialogObject);
							  } else {
								  //有舊版的就把舊版的拉出來, 把新版的移除
								  angular.element(nowContent).remove();

								  angular.extend(dialog, backupDialog[backupDialog.length-1]);
								  nowContent = backupContent[backupContent.length-1];
								  
								  backupDialog.splice(backupDialog.length-1, 1);
								  backupContent.splice(backupContent.length-1, 1);
								  console.log(dialog);
							  }
						  },
				  	      show:function(msg){
				  	    	dialog.content = msg;
				  	    	dialog.isShow = true;
				  	    	angular.element(dialogContent).css('display','block');
				  	      },
						  confirm:null,
						  cancel:function(){
							  dialog.hide();
						  },
						  controller:null
					  },
				  };
			  };
		  })
		  .config(function(){
			  angular.element(document.getElementsByTagName("body")).append(
					  '<div class="dialog-background" ng-controller="dialog" style="display:none;">'
					  //+ '<div class="dialog-lay" ></div>'
					  + '</div>');
			  //dialogContent = document.getElementsByClassName('dialog-lay')[0];
			  dialogContent = document.getElementsByClassName('dialog-background')[0];
			  
		  })
		  .controller('dialog',function($scope, $mdDialog){
			  dialogObject = angular.merge({}, $mdDialog.dialogObject);
			  dialog = $scope.dialog = $mdDialog.dialogObject;
			  dialogScope = $scope;
		  })
		  .directive('dialogContainer', function($mdDialog, $timeout){
			  return {
				  restrict : "C",
				  link : function(scope, element, attrs){
					  $timeout(function(){
						  componentHandler.upgradeAllRegistered()
					  });
			      }
			  }
		  });
	})();
	(function(){
		"use strict";
		angular
		  .module('material.components.datePicker', ['material.components.dialog'])
		  .provider('$datePicker', function($translateProvider){

			  var DatePicker = (function () {
				  	moment.locale('zh_TW',{
				  		months : "一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split("_"),
				  		monthsShort : "一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split("_"),
				  		weekdays : "星期日_星期一_星期二_星期三_星期四_星期五_星期六".split("_"),
				  		weekdaysShort : "星期日_星期一_星期二_星期三_星期四_星期五_星期六".split("_"),
				  		weekdaysMin : "日_一_二_三_四_五_六".split("_"),
				  	})
					var pickDate;	//選擇的日子
					var today;		//紀錄今天
					var date;		//目前頁面選擇的日子
					
					var startDate;
					var endDate;
					
					var weekdays;
					var dayArray;
					//var monthArray;
					var datepickerURL;
					var isYearList = false;

				    // constructors
				    function DatePicker(pickDate,limitDate) {
				    	moment.locale($translateProvider.use());
				        // users
						this.today = new Date();

						this.weekdays = moment.weekdaysMin();
						this.dayArray = [];
						//this.monthArray = [];
						this.datepickerURL = 'plugins/angularMDL/template/mdl-datepicker.html';
						
						this.pickDate = pickDate;
						this.date = moment(pickDate).clone().toDate();
						if(limitDate){
							this.startDate = limitDate.start;
							this.endDate = limitDate.end;
						}
						this.monthDays();
				    }
				    
				    // methods
					//20151208 [modify] create day array
				    DatePicker.prototype.monthDays = function(){
						var date = moment(this.date);
						var tempDayArray = [];
						for (var i=0;i<date.startOf('month').day();i++){
							tempDayArray.push({
								value : '',
								isDisabled : true
							});
						}
						var today = moment(this.today);
						var pickDate = moment(this.pickDate);
						for (var i=1;i<=date.endOf('month').date();i++) {
							var isDsiabled = true;
							if(this.startDate != undefined){
								isDsiabled = isDsiabled && (date.date(i).isAfter(this.startDate) || date.date(i).isSame(this.startDate));
							}
							if(this.endDate != undefined){
								isDsiabled = isDsiabled && (date.date(i).isBefore(this.endDate) || date.date(i).isSame(this.endDate));
							}
							tempDayArray.push({
								value : i,
								isTody : today.isSame(this.date,'month') && (today.date() == i),
								isDisabled : !isDsiabled
							});
						}
						this.dayArray = tempDayArray;
				    }
				    DatePicker.prototype.isEqual = function(day){
						var pickDate = moment(this.pickDate);
						return pickDate.isSame(this.date,'month') && (pickDate.date() == day);
					}
						
				    DatePicker.prototype.pick = function(day){
						if(!day.isDisabled){
							var tempDate = moment(this.date).clone().date(day.value);
							this.pickDate = tempDate.toDate();
						}
					}
				    DatePicker.prototype.dayClass = function(day){
				    	var dayClass = '';
				    	if(this.isEqual(day.value)){
				    		dayClass += ' is-checked';
				    	}
				    	if(day.isTody){
				    		dayClass += ' mdl-datepicker-date__today';
				    	}
				    	return dayClass;
				    }
				    
				    DatePicker.prototype.gotoToday = function(){
				    	this.date.setFullYear(this.pickDate.getFullYear());
				    	this.date.setMonth(this.pickDate.getMonth());
				    	this.monthDays();
				    	//this.isYearList = false;
				    }
				    DatePicker.prototype.displayMonth = function(){
				    	return moment(this.date).format('MMMM YYYY');
				    }
				    DatePicker.prototype.displayPickDate = function(){
				    	return moment(this.pickDate).format('dddd, MMM D');
				    }
				    /*
				    DatePicker.prototype.showYearList = function(){
				    	this.isYearList = true;
				    	this.yearMonth();
				    }
				    
				    DatePicker.prototype.yearMonth = function(){
				    	var tempMonthArray = [];
				    	var month = this.pickDate.getMonth()-12;
				    	for(var i = month ; i < 24;i++){
				    		tempMonthArray.push({
				    			year : 2000,
				    			month: month+i
				    		});
				    	}
				    	
				    	this.monthArray = tempMonthArray;
				    	
				    }
				    */
				    // return
				    return DatePicker;
				})();

			  this.$get = function($mdDialog){
				  return {
					  open : function(pickDate, confirm, cancel, options){
						  var datePickerInstance  = new DatePicker(pickDate,options);
						  $mdDialog.dialog('plugins/angular-material-lite/template/datepicker.tmp.html', function(dialog){
							  var returnObject = {};
							  returnObject.datePacker = datePickerInstance;
							  returnObject.confirm = confirm;
							  if(cancel)
								  returnObject.cancel = cancel;
							  return returnObject;
						  });
					  },
					  getDatePickerInstance : function(pickDate,limitDate){
						  return new DatePicker(pickDate,limitDate);
					  }
				  };
			  };
		  })
		  .directive('mdlDatepicker', function($parse, $datePicker){
		    return {
			    restrict : "A",
				scope : {
					mdlDatepicker:'=',
					mdlDateMin:'=',
					mdlDateMax:'='
				},
				compile : function(tElem, tAttrs){
				    return {
					    post : function(scope, element, attrs){
					    	var eventName
				        	if(isMobile){
				        		eventName = 'touchend';
				        	} else {
				        		eventName = 'mouseup';
				        	}
					    	angular.element(element[0]).attr('readonly','readonly').on(eventName, function(){
					    		angular.element(element[0]).addClass('is-focus');
								$datePicker.open(scope.mdlDatepicker||new Date(), 
								function(dialog){
									angular.element(element[0]).removeClass('is-focus');
									scope.mdlDatepicker = dialog.datePacker.pickDate;
									dialog.hide();
								},
								function(dialog){
									angular.element(element[0]).removeClass('is-focus');
									dialog.hide();
								},
								{
									start : scope.mdlDateMin,
									end : scope.mdlDateMax
								});
					    	});
					    	scope.$watch('mdlDatepicker',function(newVals, oldVals){
					    		if(newVals == undefined)
					    			element[0].value = '';
					    		else
					    			element[0].value = moment(newVals).format('YYYY/MM/DD');
					    	});
					    }
					}
				}
			}
		})
	})();
	(function(){
		"use strict";
		angular
		.module('material.components.calculater', ['material.components.dialog'])
		.provider('$calculater', function(){
			var calculater = (function () {
				// constructors
				/**
				 * options : {
				 *  title,
				 *  defaultNum,
				 * 	numMax:0,
				 *  numMin:0,
				 *  decimal:true/false
				 * }
				 */
				var numBtnArray = [7,8,9,4,5,6,1,2,3];
				function Calculater(options) {
					this.options = options||{};
					this.options.title = this.options.title||'請輸入數字';
					this.numDisplay = ''+(this.options.defaultNum||'0');
					this.numBtnArray = numBtnArray;
				}
				Calculater.prototype.addNum = function(numBtn){
					if(numBtn=='.' && this.numDisplay.indexOf(numBtn)!=-1){
						return;
					} else if(numBtn=='.' && !this.options.decimal){
						return;
					}
					
					if(numBtn !='.' && this.numDisplay === '0'){
						this.numDisplay = '';
					}
					
					this.numDisplay += numBtn+'';
				}
				Calculater.prototype.deleteNum = function(){
					this.numDisplay = this.numDisplay.substr(0,this.numDisplay.length-1);
					if(this.numDisplay === '')
						this.numDisplay = '0';
				}
				Calculater.prototype.confirmNum = function(confirm){
					this.numDisplay = new Number(this.numDisplay)+'';
					if(confirm)
						confirm(this.numDisplay);
				}
				return Calculater;
			})();
			
			this.$get = function($mdDialog){
				return {
					open : function(calcConfirm, calcCancel, options){
						var calculaterInstance  = new calculater(options);
						$mdDialog.dialog('plugins/angular-material-lite/template/calculater.tmp.html', function(dialog){
							return {
								calculater : calculaterInstance,
								confirm : function(numDisplay){
									if(calcConfirm)
										calcConfirm(numDisplay, dialog);
								},
								cancel : function(){
									if(calcCancel)
										calcCancel(dialog);
								}
							};
						});
					}
				};
			};
		})
		.directive('mdlCalculater', function($parse, $calculater){
		    return {
			    restrict : "A",
				scope : {
					mdlCalculater:'=',
					mdlCalculaterTitle:'@',
					mdlCalculaterDecimal:'@',
				},
				compile : function(tElem, tAttrs){
				    return {
					    post : function(scope, element, attrs){
					    	var eventName
				        	if(isMobile){
				        		eventName = 'touchend';
				        	} else {
				        		eventName = 'mouseup';
				        	}
					    	angular.element(element[0]).attr('readonly','readonly').on(eventName, function(){
					    		angular.element(element[0]).addClass('is-focus');
					    		$calculater.open(function(num,dialog){
					    			angular.element(element[0]).removeClass('is-focus');
					    			scope.mdlCalculater = num;
					    			dialog.hide();
					    		},
					    		function(dialog){
					    			angular.element(element[0]).removeClass('is-focus');
					    			dialog.hide();
					    		},
					    		{
					    			defaultNum : scope.mdlCalculater,
					    			title : scope.mdlCalculaterTitle,
					    			decimal : scope.mdlCalculaterDecimal
					    		});
					    	});
					    	scope.$watch('mdlCalculater',function(newVals, oldVals){
					    		if(newVals == undefined)
					    			element[0].value = '';
					    		else
					    			element[0].value = newVals;
					    	});
					    }
					}
				}
			}
		})
	})();
	
	(function(){
		"use strict";
		angular
		  .module('material.components.barcode', [])
		  .provider('$mdlBarcode', function(){
              this.$get = function(){
	              return {
	            	  avgTimeByChar : 30,
	            	  minLength : 1
	              };
              };
		  })
		  .directive('mdlBarcode', function($mdlBarcode, $timeout){
			  return {
				  restrict : 'A',
				  scope: {
					  onComplete: '=mdlBarcode'
				  },
				  link : function(scope, element, attrs){

					  var input_value = '';
					  var input_time;
						  //*** only for develope
						  angular.element(element).on('keypress', function(events){
							  //events.preventDefault();
							  //events.stopImmediatePropagation();
							  if(events.keyCode == 13){
								  $timeout(function(){
							          scope.onComplete(element[0].value);  
								  })
							  }
						  });
					  
				  }
			  }
		  })
	})();
	(function(){
		"use strict";
		angular
		  .module('material.components.dashboard', [])
		  .directive('mdlDashboard', function(){
			  var config = {
			      radius : 36,
			      innerRadiusRate : 0.5,
			      startAngle : -45,
				  endAngle : 45,
				  padding_top : 20,
				  padding_left : 5,
				  colorType : {
				               '1':['#eaebeb', '#68bd84', '#f6cf5a', '#db4b3c'],//綠黃紅
				               '2':['#eaebeb', '#db4b3c', '#f6cf5a', '#68bd84'],//紅黃綠
				               '3':['#eaebeb', '#db4b3c', '#68bd84', '#db4b3c']//紅綠紅
				  }
			  }
			  var pie,arc,arcs;
			  
			  function prepareDatas(data){
				  var datas = [];
				  if(data.guideline_max && data.guideline_max!=''){
					  datas.push({label:data.guideline_min, value:0});
					  
					  if(data.guideline_1 && data.guideline_1!='')
						  datas.push({label:data.guideline_1,   value:(data.guideline_1-data.guideline_min)});
					  
					  if(data.guideline_2 && data.guideline_2!='')
						  datas.push({label:data.guideline_2,   value:(data.guideline_2-data.guideline_1)});
					  
					  
					  datas.push({label:data.guideline_max, value:(data.guideline_max-data.guideline_2)});
				  } else {
					  datas.push({label:'', value:100});
				  }
				  
				  return datas;
			  }
			  
			  function prepareHtml(element){
				  d3.select(element[0]).selectAll('div').remove();
				  d3.select(element[0]).attr("class", "mdl-dashboard");
				  d3.select(element[0]).append('div').attr('class', "mdl-dashboard-cicle");
				  d3.select(element[0]).append('div').attr('class', "mdl-dashboard-bottom");
				  d3.select(element[0]).append('div').attr('class', "mdl-dashboard-label");
				  
				  return element;
			  }
			  
			  function calcValueDeg(data){
				  var deg = 0;
				  if(data.guideline_max && data.guideline_max!=''){					  
					  deg = (config.endAngle-config.startAngle)/(data.guideline_max - data.guideline_min)*(data.property_value-data.guideline_min);
				  }
				  return deg;
			  }
			  
			  function checkWarn(data){
				  if(data.guideline_max && data.guideline_max!=''){	
				      if(data.guideline_mode == '1'){
					      if((+data.guideline_2) <= (+data.property_value))
					          //return 'is-warn';
					    	  data.isWarn = true;
					  } else if(data.guideline_mode == '2'){
						  if((+data.guideline_1) >= (+data.property_value))
								  //return 'is-warn';
							  data.isWarn = true;
					  } else if(data.guideline_mode == '3'){
						  if((+data.guideline_2) <= (+data.property_value)||
							  (+data.guideline_1) >= (+data.property_value)){
								  //return 'is-warn';
							  data.isWarn = true;
					      }
					  }
				  }
			      return data;
			  }
			  
			  function initDashboard(element, data){
				  data.property_value = new Number(data.property_value);
				  element = prepareHtml(element);
				  var circle = d3.select(element[0]).select('.mdl-dashboard-cicle');
				  var pi = pi = Math.PI;
				  //var datas = prepareDatas(checkWarn(data)); //產生出d3.js 能讀取的資料集合
				  var datas = prepareDatas(data); //產生出d3.js 能讀取的資料集合
				  var valueDeg = calcValueDeg(data); //算出目前的度數
				  var color = d3.scaleOrdinal(config.colorType[data.guideline_mode]);

				  //清空directive下的svg
			      d3.select(element[0]).selectAll('svg').remove();
				  var vis = circle.append("svg").data([datas])//設定資料
				    .attr("width", config.radius * 2+config.padding_left*2).attr("height", config.radius+config.padding_top+5)//設定長寬
				    .append("svg:g").attr("transform", "translate(" + (config.radius+config.padding_left) + "," + (config.radius+config.padding_top) + ")");
				  arc = d3.arc().outerRadius(config.radius).innerRadius(config.radius*config.innerRadiusRate);
				  pie = d3.pie().value(function(d) { return d.value; })
				  .startAngle(config.startAngle * (pi/180)).endAngle(config.endAngle * (pi/180))//設定起始/結束角度
				  .sort(null); //取消排序
				 
				  arcs = vis.selectAll("g.slice").data(pie).enter().append("svg:g").attr("class", "slice");    
				  arcs.append("svg:path").attr("fill", function(d, i) { return color(i); } ).attr("d", arc);
				  
				  arcs.append("text").attr("transform", function(d) {
				    	var x = Math.sin(d.endAngle)*(config.radius+6);
				    	var y = 0-Math.cos(d.endAngle)*(config.radius+6);
				    	return "translate(" + x +  ',' + y +  ")"; 
				    })
				    .style("font-size","10px")
				    .attr("text-anchor", "middle")                          
				    .text(function(d, i) { 
				    	return datas[i].label!=''?new Number(datas[i].label):''; 
				    });
				    
				  //指針
				  circle.selectAll('svg').append('line').attr("class", "pointer")
				    .attr('x1', config.padding_left-2).attr('y1', config.radius+config.padding_top)//起
				    .attr('x2', config.radius-10).attr('y2', config.radius+config.padding_top)//迄
				    .style('stroke', 'black').style('stroke-width', 2)
				    .style('transform-origin', config.radius+config.padding_left+'px '+(config.radius+config.padding_top)+'px')
				    .style('transform', 'rotate('+(valueDeg+90+config.startAngle)+'deg)');
				  //目前數值
				  circle.selectAll('svg').append('text').attr("class", "pointer-value")
				    .attr("transform", 'translate('+(config.radius+config.padding_left)+', '+(config.radius+config.padding_top)+')')
				    .style("font-size","16px")
				    .attr("text-anchor", "middle")
				    .text(new Number(data.property_value));
				  //label
				  d3.select(element[0]).select('.mdl-dashboard-label').text(data.property_name);
				  d3.select(element[0]).classed("is-warn", (data.need_alert == 'Y'));
			  }
			  
			  function updateDashboard(element, data){
				  var circle = d3.select(element[0]).select('.mdl-dashboard-cicle');
				  //var datas = prepareDatas(checkWarn(data)); //產生出d3.js 能讀取的資料集合
				  var datas = prepareDatas(data); //產生出d3.js 能讀取的資料集合
				  arcs.data(pie(datas));
		          //為了獲得遍歷<g> group的index
				  arcs.each(function(d, index) {
		            //更新圓餅圖
		            d3.select(this).selectAll('path')
		              .data(function(d) {
		                //更新<path>的datum (data是reference，但datum不是，所以要更新)，
		                //在這裡的d為<g>的datum
		                return [d];
		              }).attr('d', function(d, i) {
			                return arc(d);
			          });
		            //更新文字
		            d3.select(this).selectAll('text')
		              .data(function(d) { //更新<text>的datum
		                return [d];
		              }).text(function(d, i) {
		            	  return datas[i].label!=''?new Number(datas[i].label):'';
		              }).attr("transform", function(d) {
					    	var x = Math.sin(d.endAngle)*(config.radius+6);
					    	var y = 0-Math.cos(d.endAngle)*(config.radius+6);
					    	return "translate(" + x +  ',' + y +  ")"; 
					  });
		          });
				  
				  var valueDeg = calcValueDeg(data); //算出目前的度數
				  circle.selectAll('.pointer').style('transform', 'rotate('+(valueDeg+90+config.startAngle)+'deg)');
				  circle.selectAll('.pointer-value').text(new Number(data.property_value));
				  d3.select(element[0]).classed("is-warn", (data.need_alert == 'Y'));
			  }
			  
			  return {
				  restrict : 'A',
				  scope: {
					  'datas': '='
				  },
				  link : function(scope, element, attrs){
					  var isInitialed = false;
				      scope.$watch('datas', function(newVals, oldVals) {
					      //if (!isInitialed) {
					      //  isInitialed = true;
					    	  initDashboard(element, newVals); //繪圖初始化
					      //} else {
					      //	  updateDashboard(element, newVals, oldVals); //更新繪圖
					      //}
					  }, true);
				  }
			  }
		  })
		  .directive('mdlPiechart', function(){
			  var config = {
				      radius : 50,
				      innerRadiusRate : 0,
					  padding : 10,
					  colorType : {
					               '1':['black', 'green', 'yellow', 'red'],//綠黃紅
					               '2':['black', 'red', 'yellow', 'green'],//紅黃綠
					               '3':['black', 'red', 'green', 'red']//紅綠紅
					  },
					  isShowLabel:true
			  }
			  var pie,arc,arcs;
			  
			  function prepareColor(datas){
				  var colors = [];
				  datas.forEach(function(data){
					  colors.push(data.color);
				  });
				  return colors;
			  };
			  
			  function initPiechart(element, data){
				  d3.select(element[0]).attr("class", "mdl-piechart");
				  
				  var pi = pi = Math.PI;
				  var color = d3.scaleOrdinal(prepareColor(data));

				  //清空directive下的svg
			      d3.select(element[0]).selectAll('svg').remove();
				  var vis = d3.select(element[0]).append("svg").data([data])//設定資料
				    .attr("width", config.radius * 2+config.padding*2).attr("height", config.radius * 2+config.padding*2)//設定長寬
				    .append("svg:g").attr("transform", "translate(" + (config.radius+config.padding) + "," + (config.radius+config.padding) + ")");
				  arc = d3.arc().outerRadius(config.radius).innerRadius(config.radius*config.innerRadiusRate);
				  pie = d3.pie().value(function(d) { return d.value; })
				  .sort(null); //取消排序
				 
				  arcs = vis.selectAll("g.slice").data(pie).enter().append("svg:g").attr("class", "slice");    
				  arcs.append("svg:path").attr("fill", function(d, i) { return color(i); } ).attr("d", arc);
				  
				  if(config.isShowLabel){
					  arcs.append("text").attr("transform", function(d) {
						  var angle = (d.endAngle - d.startAngle)/2 + d.startAngle;
						  
					      var x = Math.sin(angle)*(config.radius+20);
					      var y = 0-Math.cos(angle)*(config.radius+20)+6;
					      return "translate(" + x +  ',' + y +  ")"; 
					  })
					    .style("font-size","12px")
					    .attr("text-anchor", "middle")                          
					    .text(function(d, i) { return data[i].label; });
				  }
			  }
			  
			  function updatePiechart(element, data){
				  arcs.data(pie(data));
		          //為了獲得遍歷<g> group的index
				  arcs.each(function(d, index) {
		            //更新圓餅圖
		            d3.select(this).selectAll('path')
		              .data(function(d) {
		                //更新<path>的datum (data是reference，但datum不是，所以要更新)，
		                //在這裡的d為<g>的datum
		                return [d];
		              }).attr('d', function(d, i) {
			                return arc(d);
			          });
		            if(config.isShowLabel){
			            //更新文字
			            d3.select(this).selectAll('text')
			              .data(function(d) { //更新<text>的datum
			                return [d];
			              }).text(function(d, i) {
			            	  return data[d.index].label
			              }).attr("transform", function(d) {
			            	  var angle = (d.endAngle - d.startAngle)/2 + d.startAngle;
							  
						      var x = Math.sin(angle)*(config.radius+20);
						      var y = 0-Math.cos(angle)*(config.radius+20);
						    	return "translate(" + x +  ',' + y +  ")"; 
						  });
		            }
		          });
			  }
			  
			  return {
				  restrict : "A",
				  scope: {
				      datas: '=' //雙向data binding
				  },
				  link : function(scope, element, attrs){
					  var isInitialed = false;
					  config.radius = new Number(attrs.chartRadius);
					  config.isShowLabel = attrs.isShowLabel=="true";
				      scope.$watch('datas', function(newVals, oldVals) {
				    	  //newVals = newVals||[];
					      if (!isInitialed) {
					    	  initPiechart(element, newVals); //繪圖初始化
					          isInitialed = true;
					      } else {
					    	  updatePiechart(element, newVals, oldVals); //更新繪圖
					      }
					  }, true);
			      }
			  }
		  });
	})();
 })(window, window.angular , require('moment'), require('d3'));