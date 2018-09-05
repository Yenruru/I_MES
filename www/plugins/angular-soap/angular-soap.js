angular.module('angularSoap', []).factory("$soap",['$q',function($q){
	return {
		post: function(url, action, params, errorCallback){
			var deferred = $q.defer();
			
			//Create SOAPClientParameters
			var soapParams = new SOAPClientParameters();
			for(var param in params){
				soapParams.add(param, params[param]);
			}
			
			//Create Callback
			var soapCallback = function(e){
				if(e !== null){
					if(e.constructor.toString().indexOf("function Error()") != -1){
						deferred.reject("An error has occurred.");
					} else {
						deferred.resolve(e);
					}
				} else {
					deferred.reject("An error has occurred.");
				}
			}
			
			SOAPClient.invoke(url, action, soapParams, true, soapCallback, errorCallback);

			return deferred.promise;
		},
		setCredentials: function(username, password){
			SOAPClient.username = username;
			SOAPClient.password = password;
		}
	}
}]);