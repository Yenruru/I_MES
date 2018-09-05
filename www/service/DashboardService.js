//DashboardService
define(["angularAMD"], function (angularAMD) {
    angularAMD.factory('DashboardService', ['$rootScope', '$filter', '$translate', 'config', 'MMWService', "$http", 
    function($rootScope, $filter, $translate, config, $MMWService, $http){
    	var timer;

		function getEquipmentStatus(equipment, callback){
			$MMWService.sendToWMMServer({
				uri : 'EquipmentStatus',
				content : {
					Equipment : equipment
				},
				success : function(data){
					if(callback)
						callback(data);
				},
				error : function(){
					//取得機台資訊失敗
				}
			}, false);
		}
		        
		function getWorkingInfo(dataType, callback){
			$MMWService.sendToWMMServer({
				uri : 'MachineWorkingInfo',
				content : {
					dataType : dataType
				},
				success : function(data){
					if(callback)
						callback(data);
				}
			}, false);
		}
			
		//取得dashboard的資料
		function getDashBoardData(equipment, dataType, callback){
			getEquipmentStatus(equipment, function(data){
				data = JSON.parse(data.Result);
				console.log('watch 1 = ',data);
				data.rate_detail = [];
				data.machine_utilization_rate_detail.forEach(function(detail){
					data.rate_detail.push({label:detail.status,value:detail.work_min,color:'rgb('+detail.status_color+')'});
				});
				angular.merge(factory.dashboard['deviceInfo'], data);
				getWorkingInfo(dataType, function(data){
					data = JSON.parse(data.Result);
					console.log('watch 2 = ',data);
					//人員上下工相關資料
					factory.dashboard['workOperator'].default_shift = data.shift;
					factory.dashboard['workOperator'].work_member_detail = data.work_member_detail;
					
					//品質狀態相關資料
					try{
						data.quality_detail[0].shift_defect_qty = data.quality_detail[0].shift_defect_qty||0;
						data.quality_detail[0].shift_work_qty = data.quality_detail[0].shift_work_qty||0;
						var qty_rate = data.quality_detail[0].shift_defect_qty/data.quality_detail[0].shift_work_qty*100;
						if(isNaN(qty_rate)){
							data.quality_detail[0].qty_rate = 0;
						} else {
							data.quality_detail[0].qty_rate = qty_rate;
						}
						data.quality_detail[0].lightColor = lightColor(data.quality_detail[0]);
					}catch(e){
						data.quality_detail[0].qty_rate = 0;
					}
					factory.dashboard['qualityStatus'].quality_detail = data.quality_detail[0];
					
					//上料相關資料
					factory.dashboard['workMaterial'].materials_detail = data.materials_detail;
					
					//生產資訊
					factory.dashboard['workLog'].production_info_detail = data.production_info_detail;
					//測試用
					//factory.dashboard['workLog'].production_info_detail.push({status:'C',qty:'1.0000',plot_no:'ST1-W01-1604120009-001',finish_time:'2016-05-03 09:38'});
		
					factory.dashboard.updateTime = new Date();
					if(callback)
						callback();
				});
			});
		}
			
		//呼叫getDashBoardData, 設定時間到了以後再執行callback
		//並且只有在第一次開始的時候傳入true讓loading出現
		function dashboardTimer(callback, isFirst){
			var equipment = config.cache.equipment
			var dataType = '1111';
			getDashBoardData(equipment, dataType, function(){
				if(isFirst)
					$rootScope.hideLoading();
				
				timer = setTimeout(function(){
					if(callback)
						callback(callback);
				}, config.setting.RefreshTime*1000);
			});
		}
		
		function lightColor(item){
			if(item.qty_rate<item.quality_guideline_y){
				return 'green';
			} else if(item.qty_rate>=item.quality_guideline_y && item.qty_rate<item.quality_guideline_r){
				return 'yellow';
			} else if(item.qty_rate >= item.quality_guideline_r){
				return 'red';
			}
			
			return '';
		}
		
    	var factory = {};
    	factory.isStart = false;
    	factory.dashboard;
    	factory.getEquipmentStatus = getEquipmentStatus;
    	factory.getWorkingInfo = getWorkingInfo;
    	factory.getDashBoardData = getDashBoardData;
    	factory.getDashboard = function(name){
    		return factory.dashboard[name];
    	}
    	//執行dashboardTimer以呼叫getDashBoardData, 並且時間到了之後再次執行dashboardTimer
    	//並且只有在第一次開始的時候傳入true讓loading出現
    	factory.startWatch = function(callback){
    		factory.isStart = true;
    		if(!timer){
    			$http.get('config/dashboard.json').then(function(res){
    				factory.dashboard = res.data;
    				if(callback)
    					callback();
    				$rootScope.showLoading();
    				dashboardTimer(dashboardTimer,true);
    			});    			
    			//$DashboardService.startWatch();
    		}
		}
    	factory.stopWatch = function(){
    		factory.isStart = false;
    		clearTimeout(timer);
    		timer = undefined;
    	}
    	factory.dashboardWarn = function (item){
			if(item.guideline_mode == '1'){
				if((+item.guideline_2) <= (+item.property_value))
					return 'is-warn';
			} else if(item.guideline_mode == '2'){
				if((+item.guideline_1) >= (+item.property_value))
					return 'is-warn';
			} else if(item.guideline_mode == '3'){
				if((+item.guideline_2) <= (+item.property_value)||
				(+item.guideline_1) >= (+item.property_value)){
					return 'is-warn';
				}
			}
			
			return '';
		}
    	return factory;
    }]);
});