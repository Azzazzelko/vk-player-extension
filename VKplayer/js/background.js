(function(){

	// storage.clearStorage();
	var idMyOpenTab; //айди таба, который я открываю приложением

	var storage = {

		setStorageValue : function(key, value){ //записать значения в хранилище
	        chrome.storage.sync.set({[key] : value}, function() {
            	console.log('Settings to storage are saved.');
       	 	});
		},

		clearStorage : function(){ //очистка хранилища
	    	chrome.storage.sync.clear(function() {
				console.log("Storage clear!");
    		});
		}
	};

	var send = {

		sendSMStoContentFirstStart : function(tab){
			setTimeout(function(){
		    	chrome.tabs.sendMessage(tab.id, {action:"giveVK"}, function(response) {
		    		console.log("Все успешно отослано!");
		    		idMyOpenTab = tab.id;
		  		});
			}, 1000);			
		},

		sendSMSwithOnlyAction : function(actionValue, tabs){   //отправка запроса на новосозданную вкладку только лиш с екшеном.
			chrome.tabs.query( {active:true, currentWindow:true}, function(tabs) {
    			chrome.tabs.sendMessage(idMyOpenTab, {"action" : actionValue}, function(response) {
    				console.log("Отправил action запрос на контент.");
  				});
			});		
		},

		sendSMSandDATAtoContent : function(key, value, actionValue, tabs){   //отправка запроса на новосозданную вкладку c передачей каких-то значений
			chrome.tabs.query( {active:true, currentWindow:true}, function(tabs) {
	    		chrome.tabs.sendMessage(idMyOpenTab, {[key] : value, "action" : actionValue}, function(response) {
	    			console.log("Отправил какие-то данные на контент..");
	  			});
			});			
		}
	};

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){  //получили запрос от попАпа, создали новую вкладку и её колбеком является, отправка запроса на контент этой самой вкладки.
      	console.log("Получил запрос от", ( sender.frameId == 0 ) ? "Vk." : "Extension." );
 
 		switch(request.action){
 			case "create-url" :
				var newURL = "https://vk.com/audio";
				chrome.tabs.create({ url: newURL }, send.sendSMStoContentFirstStart); 				
 				break;
 			case "play-pause" :
 				send.sendSMSwithOnlyAction("play-button");
 				break;
  			case "prev-pls" :
  				send.sendSMSwithOnlyAction("prev-button");
 				break;
 			case "next-pls" :
 				send.sendSMSwithOnlyAction("next-button");
 				break;
 			case "contentData" : //записываем данные что ща играет, громкость текущую, длительность песни в хранилище, с которого генерится плеер. Тут меняются данные когда открываем через иконку в плеере только, либо при смене контента вк плеера.
 			    setTimeout(function(){
					if (!!request.nowPlay) storage.setStorageValue("nowPlay", request.nowPlay);
					if (!!request.nowVolume) storage.setStorageValue("nowVolume", request.nowVolume);
					if (!!request.duration) storage.setStorageValue("duration", request.duration);
				}, 1000);
 				break;
 			case "volume-change" :
	 			send.sendSMSandDATAtoContent("newMyVolume", request.newMyVolume, "volume-change");
 				break;
 			case "giveCurrentBar" :
 				send.sendSMSwithOnlyAction("giveCurrentBar");
 				break;
 			case "playORpause" :
 				send.sendSMSwithOnlyAction("playORpause");
 				break;
 			case "currentProgressBar":
				storage.setStorageValue("nowProgress", request.nowProgress);
 				break;
 			case "startOrPauseStatus":
 				setTimeout(function(){
					storage.setStorageValue("startOrPauseStatus", request.startOrPauseStatus);
				}, 1000);
 				break;				 				 				 				 				 				 				 								
 		}
	});

})();
	
