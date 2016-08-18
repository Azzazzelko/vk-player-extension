(function(){

	// var urlData;
	// waitMessage();

	// function waitMessage(){
	// 	chrome.runtime.onMessage.addListener(function(request){
	//       	console.log("Получил от контента запрос!");
	//       	var url = "https://yasp.co/matches/"+request.match_id+"/combat";
	//       	getUrlData(url);
	//       	setTimeout(function(){
	// 			sendSMS();
	// 		}, 1000);
 //    	});
	// }	

 //    function getUrlData(url) { 		//получаем дом дерево с указанного урла
 //        var xhr = new XMLHttpRequest();
 //        xhr.onreadystatechange = function(data) {
 //          if (xhr.readyState == 4) {
 //            if (xhr.status == 200) {
 //              urlData = data.srcElement.responseText;
 //            } else {
 //              null;
 //            }
 //          }
 //        }
 //        xhr.open('GET', url, true);
 //        xhr.send();
 //    };

	// function sendSMS(){ 	//отправка данных активному табу.
	// 	chrome.tabs.query( {active:true, currentWindow:true}, function(tabs) {
	//     	chrome.tabs.sendMessage(tabs[0].id, {test:urlData}, function(response) {
	//     		console.log("Все успешно отослано!");
	//   		});
	// 	});
	// };

	// chrome.browserAction.onClicked.addListener(function(activeTab){
 //  		var newURL = "http://stackoverflow.com/";
 //  		chrome.tabs.create({ url: newURL });
	// });











	var id;
	// clearStorage();

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){  //получили запрос от попАпа, создали новую вкладку и её колбеком является, отправка запроса на контент этой самой вкладки.
      	console.log("Получил от запрос!");

 		if ( request.action == "create-url" ){
			var newURL = "https://vk.com/audio";
			chrome.tabs.create({ url: newURL }, sendSMStoContentFirstStart);
 		}

 		if ( request.action == "play-pause" ){
			sendSMSwithOnlyAction("play-button");
 		}

 		if ( request.action == "prev-pls" ){
 			sendSMSwithOnlyAction("prev-button");
 		}

 		if ( request.action == "next-pls" ){
 			sendSMSwithOnlyAction("next-button");
 		}

 		if ( request.action == "contentData" ){
		    setTimeout(function(){
				setStorageValue("nowPlay", request.nowPlay);
				setStorageValue("nowVolume", request.nowVolume);
			}, 1000);
 		}

 		if ( request.action == "volume-change" ){
 			console.log(request.newMyVolume);
 			sendSMSandDATAtoContent("newMyVolume", request.newMyVolume, "volume-change");
 		}
 
	});

	function setStorageValue(key, value) {
        chrome.storage.sync.set({[key] : value}, function() {
            console.log('Settings saved');
        });
    };

    function sendSMStoContentFirstStart(tab){
		setTimeout(function(){
	    	chrome.tabs.sendMessage(tab.id, {action:"giveVK"}, function(response) {
	    		console.log("Все успешно отослано!");
	    		id = tab.id;
	  		});
		}, 1000);
    };

	function sendSMSwithOnlyAction(actionValue, tabs){ //отправка запроса на новосозданную вкладку только лиш с екшеном.
		chrome.tabs.query( {active:true, currentWindow:true}, function(tabs) {
    		chrome.tabs.sendMessage(id, {"action" : actionValue}, function(response) {
    			console.log("Кнопку жмакнули на поппе");
  			});
		});
	};

	function sendSMSandDATAtoContent(key, value, actionValue, tabs){ //отправка запроса на новосозданную вкладку.
		chrome.tabs.query( {active:true, currentWindow:true}, function(tabs) {
    		chrome.tabs.sendMessage(id, {[key] : value, "action" : actionValue}, function(response) {
    			console.log("Отправил какие-то данные на контент");
  			});
		});
	};

 //    function clearStorage() {
 //    	chrome.storage.sync.clear(function() {
	// 		console.log("Storage clear!");
 //    	});
	// };

 //    setTimeout(function(){
 //    	var value = "adas dasd asd sa das das dsa as ddddddd";
	// 	setStorageValue(value);
	// }, 1000);

})();
	
