//MobileMidleware standard send Service
define(["angularAMD"], function (angularAMD) {
	angularAMD.service('MMWService', ['$rootScope', '$filter', '$translate', 'config', '$http', 
    function($rootScope, $filter, $translate, config, $http){
		
		/**prepare header data**/
		function prepareHeader(data){
			var header = {};
			//TODO
			header.Method = data.uri;
			header["mds.userid"] = config.cache.account;
			header["mds.password"] = config.cache.password;
			header["mds.environment"] = config.setting.environment;
			header["mds.language_mode"] = $translate.use();
			header["mds.computer_name"] = config.client.ip;
			header["mds.sessionno"] = config.mdssessionno;
			return header;
		}
		
		/* prepare content data
		 * add default fields
		 * use angular merge method to combine data.content
		 */
		function prepareContent(data){
			var content = {};
			content.CompanyID = config.setting.companyId;
			content.Equipment = config.cache.equipment;
			content = angular.merge(content, data.content);
			return content;
		}
		
		/* MMW send method
		 *   '*' mean require
		 *   sendData fields example {
		 *     *uri     : header's method 
		 *     *content : data you want send
		 *     *success : success callback method , paramter is feedback data 
		 *     *error    : error callback method , paramter is feedback data
		 *     netError : connect error callback method , paramter is feedback data
		 *     notify   : notify callback method , paramter is feedback data 
		 *   }
		 */
		this.sendToWMMServer = function(sendData, showLoading){
			var digiwin = digiwin;
			if(showLoading == undefined)
				showLoading = true;
			
			if(showLoading){
				$rootScope.showLoading();
			}
			
			//TODO TransactClient 及 send 是否可以修改?
			var	header = prepareHeader(sendData);
			var content = prepareContent(sendData);
			//if(digiwin != undefined){
			if(false){
				digiwin.exec(
						function(data){
							if(showLoading)
								$rootScope.hideLoading();
							
							MMWConnectSuccess(data, sendData.success, sendData.error); 
						},
						function(data){ 
							if(showLoading)
								$rootScope.hideLoading();
							
							MMWConnectError(data, sendData.netError); 
						},
						function(data){ 
							if(showLoading)
								$rootScope.hideLoading();
							
							MMWConnectNotify(data, sendData.notify); 
						}, 
						"TransactClient", "send", [sendData.uri, JSON.stringify(content), header]);
			} else {
				send(header, content, sendData, showLoading);
			}
		}

		function send(header, content, sendData, showLoading){
			var data = {
				url : 'http://'+config.server.ip+':'+config.server.port+'/mobilemiddleware/api/v1/transaction/json',
				method : 'POST',
				headers : {
					'Content-Type': 'application/json;charset=UTF-8'
				},
				data : {
				    "applicationId":config.applicationId,
				    "uri": sendData.uri,
				    "headers":header,
				    "cookies":[],
					'content':JSON.stringify(content)
				}
			};
			if(config.server.timeout != 0)
				data.timeout =config.server.timeout; 
			
			$http(data).success(function(data, status, headers, config) {
				if(showLoading)
					$rootScope.hideLoading();
				
				MMWConnectSuccess(data, sendData.success, sendData.error); 
			}).error(function(a,b,c,d){
				if(showLoading)
					$rootScope.hideLoading();
				
				MMWConnectError(data, sendData.netError); 
			});
		}
		
		/**send success handler**/
		function MMWConnectSuccess(data, success, error){
			var contentData = JSON.parse(data.content);
			contentData.mdssessionno = data.headers.mdssessionno;
			if(contentData.IsSuccess){
				if(success)
					success(contentData);
			} else {
				if(error){
					error(contentData);
				} else {					
					$rootScope.showAlert(contentData.SysException);
				}
			}
		}
		
		/**send error handler**/
		function MMWConnectError(data, callback){
			$rootScope.showAlert($filter('translate')('error.connectRefused'), function(data){
				if(callback)
					callback(data);
			});
		}
		
		/**send notify handler**/
		function MMWConnectNotify(data, callback){
			$rootScope.showAlert($filter('translate')('error.connectNotify'), function(data){
				if(callback)
					callback(data);
			});
		}
	}]);
});