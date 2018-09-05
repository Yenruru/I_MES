(function () { "use strict";

	var appName = "KMI_Client_YOKE";
	//取出設定檔
	var serverStorage = localStorage.getItem(appName+"_server");
	if(serverStorage){
		serverStorage = JSON.parse(serverStorage);
	} else {
		serverStorage = {};
	}

    // startup for device
    document.addEventListener("deviceready", function () {
        // events
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);

        // onInitialize
        if (serverStorage.ip) {
        	onInitialize(serverStorage.ip);
        }
    }, false);
	document.getElementById("confirm").addEventListener("click", confirm);
	
	
    //初始化並開始跟MobileMiddleWare連線
    function onInitialize(ip) {
		//判斷當MobileMiddleWare不存在的時候則直接進入index.html
		if(window.digiwin!=undefined){
			// define
			// 內容管理下載位置
			var contentServerUrl = "http://"+ip+"/MobileMiddleware";
		
			// task
			var task01 = function (result) { execute(task02, "TunnelClient", "initializeSettings", []) };
			var task02 = function (result) { execute(task03, "ContentContext", "initializeSettings", [contentServerUrl]) };
			var task03 = function (result) { execute(task04, "ContentContext", "deploy", []) };
			var task04 = function (result) { execute(task05, "ContentContext", "getStartUrl", []) };
			var task05 = function (result) { 
				document.location.href = result; 
				//document.location.href = "file:///android_asset/www/index.html#/login";
			};
			// execute
			task01();
		} else {
			document.location.href = "index.html";
		}

    };

    // TODO: 這個應用程式已發生錯誤。請在這裡執行錯誤處理。
    function onError(error) {

        // message
        var message = error.message;

        // display
        alert("Error:" + message);
		//當跟MobileMiddle連線失敗的時候則將Cover關閉並帶出資料
		navigator.splashscreen.hide();
    };

    // TODO: 這個應用程式已回報進度。請在這裡處理進度回報。
    function onNotify(progress) {
        
        // message
        var message = progress.description + "(" +
                      progress.completedCount + "/" +
                      progress.totalCount + ")";

        // display
        //alert("Notify:" + message);
    };

    // TODO: 這個應用程式已暫停。請在這裡儲存應用程式狀態。
    function onPause() {

    };

    // TODO: 這個應用程式已重新啟動。請在這裡還原應用程式狀態。
    function onResume() {

    };

    function execute(onSuccess, service, method, args) {
        digiwin.exec(
            function (result) { if (onSuccess != null) onSuccess(result); },
            onError,
            onNotify,
            service,
            method,
            args
        );
    }
    
    function confirm(){
    	var server_ip = 
		document.getElementById("serverIp1").value+"."+
		document.getElementById("serverIp2").value+"."+
		document.getElementById("serverIp3").value+"."+
		document.getElementById("serverIp4").value;

		serverStorage.ip = server_ip;
		localStorage.setItem(appName+"_server", JSON.stringify(serverStorage));
		onInitialize(serverStorage.ip);
    }
})();



