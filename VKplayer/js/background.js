(function(){

	// storage.clearStorage();

	var storage = {

		setStorageValue : function(key, value){ //записать значения в хранилище
	        chrome.storage.local.set({[key] : value}, function() {
            	console.log('Settings to storage are saved.');
       	 	});
		},

		clearStorage : function(){ //очистка хранилища
	    	chrome.storage.local.clear(function() {
				console.log("Storage clear!");
    		});
		}
	};

	var send = {

		sendSMStoContentFirstStart : function(tab){
			setTimeout(function(){
		    	chrome.tabs.sendMessage(tab.id, {action:"giveVK"}, function(response) {
		    		console.log("Все успешно отослано!");
		    		localStorage.idMyOpenTab = tab.id;          //айди таба, который я открываю приложением
		  		});
			}, 1000);			
		},

		sendSMSwithOnlyAction : function(actionValue, tabs){   //отправка запроса на новосозданную вкладку только лиш с екшеном.
			var _id = parseInt(localStorage.idMyOpenTab);
			localStorage.findPlayer = 0;		               //значение, есть ли вообще чем управлять, изначально фолс. При проверки, играет ли плеер, значит к нему доступ есть, значит он существует
			chrome.tabs.sendMessage(_id, {"action" : actionValue}, function(response) {
				console.log("Отправил action запрос на контент.");
				if ( response ){
					localStorage.findPlayer = 1;
				}
			});			
		},

		sendSMSandDATAtoContent : function(key, value, actionValue, tabs){   //отправка запроса на новосозданную вкладку c передачей каких-то значений
			var _id = parseInt(localStorage.idMyOpenTab);
    		chrome.tabs.sendMessage(_id, {[key] : value, "action" : actionValue}, function(response) {
    			console.log("Отправил какие-то данные на контент..");
  			});
		}
	};

	var notify = {

		myNotification : 0,   //нотификация, что б обнулять предыдущую.

		notifyTimeout : 0,    //нотификация, что б обнулять предыдущую.

		getFullMusicName : function(recive){  //получаем название и автора в одну строку
			if ( recive ) {
				var fullSong = "";

				$(recive).each(function(index, el) {
					var $this = $(this);
					fullSong = fullSong+$this.text();
				});

				notify.createNotification("Сейчас играет", fullSong, localStorage.notifications_status);
			}
		},

		createNotification : function(theTitle, theBody, status){  //создаем нотификацию
			if (notify.myNotification) notify.myNotification.close();
			if (notify.notifyTimeout) clearTimeout(notify.notifyTimeout);
			var status = status || 1;
			if (status == 0) return;
			
			var options = {  
				body: theBody,
				icon: "../images/vk.png"
			};

			notify.myNotification = new Notification(theTitle,options);

			notify.notifyTimeout = setTimeout(function(){
				notify.myNotification.close()
			}, 4000);			
		}
	};

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){  //получили запрос от попАпа, создали новую вкладку и её колбеком является, отправка запроса на контент этой самой вкладки.
      	console.log("Получил запрос от", ( sender.frameId == 0 ) ? "Vk." : "Extension." );
 		switch(request.action){
 			case "create-url" :
				var newURL = "https://vk.com/audio";
				chrome.tabs.create({ url: newURL, index: 0 }, send.sendSMStoContentFirstStart); 				
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
	  			notify.getFullMusicName(request.nowPlay);
 				break;
 			case "volume-change" :
	 			send.sendSMSandDATAtoContent("newMyVolume", request.newMyVolume, "volume-change");
 				break;
 			case "giveCurrentBar" :
 				send.sendSMSwithOnlyAction("giveCurrentBar");
 				break;
 			case "playORpause" :
 				send.sendSMSwithOnlyAction("playORpause");
 					setTimeout(function(){
 						if ( localStorage.findPlayer == 0 ) {   //проверка с тайм-аутом, если есть доступ к управлению плеером, то норм, если нет доступа, тормозим плеер, ибо он может еще играть, думая что вк еще открыто и играет
			 				setTimeout(function(){
								storage.setStorageValue("startOrPauseStatus", "block");
							}, 500);
 						};
 					}, 500);
 				break;
 			case "currentProgressBar":
				storage.setStorageValue("nowProgress", request.nowProgress);
 				break;
 			case "vol-mute":
				send.sendSMSwithOnlyAction("setVolMute");
 				break;
 			case "vol-full":
				send.sendSMSwithOnlyAction("setVolFull");
 				break;	
 			case "position-change":
				send.sendSMSandDATAtoContent("newMyPosition", request.newMyPosition, "position-change");
 				break;
 			case "startOrPauseStatus":
 				setTimeout(function(){
					storage.setStorageValue("startOrPauseStatus", request.startOrPauseStatus);
				}, 1000);
 				break;				 				 				 				 				 				 				 								
 		}
	});

})();
	