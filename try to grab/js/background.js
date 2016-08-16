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
      	console.log("Получил от попапа запрос!");

 		if ( request.action == "create-url" ){
			var newURL = "https://vk.com/audio";
			chrome.tabs.create({ url: newURL }, sendSMStoContent);
 		}

 		if ( request.action == "play-pause" ){
			sendSMSwithOneMessage("play-button");
 		}

 		if ( request.action == "prev-pls" ){
 			sendSMSwithOneMessage("prev-button");
 		}

 		if ( request.action == "next-pls" ){
 			sendSMSwithOneMessage("next-button");
 		}

 		if ( request.action == "idPLS" ){
			console.log(sender.tab.id);
 		}

 		if ( request.action == "contentData" ) {
 				console.log(request.sms);
 				// setStorageValue(request.sms);
			    setTimeout(function(){
					setStorageValue(request.sms);
				}, 1000);
 		}
 
	});

	function setStorageValue(value) {
        chrome.storage.sync.set({"fromBack" : value}, function() {
            console.log('Settings saved');
        });
    };

    function sendSMStoContent(tab){
		setTimeout(function(){
	    	chrome.tabs.sendMessage(tab.id, {action:"giveVK"}, function(response) {
	    		console.log("Все успешно отослано!");
	    		id = tab.id;
	  		});
		}, 1000);
    };

	function sendSMSwithOneMessage(sms, tabs){ //отправка запроса на новосозданную вкладку.
		// setTimeout(function(){
			chrome.tabs.query( {active:true, currentWindow:true}, function(tabs) {
	    		chrome.tabs.sendMessage(id, {"action" : sms}, function(response) {
	    			console.log("Play-button нажался на попе");
	  			});
			});
		// }, 1000);
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
	
