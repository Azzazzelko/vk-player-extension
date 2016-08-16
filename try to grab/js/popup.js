$(document).ready(function () {

	getStorageValue("fromBack");

	$(".button-open-url").on("click", function(){  //по нажатию на кнопку, посылаем на бек запрос, дабы он открыл новую вкладку.. далее см. там
		chrome.runtime.sendMessage({action: "create-url"}, function(response) {
  			console.log("Запрос на бек отправлен!");
		});   
	})

	$(".button-play-pause").on("click", function(){ //клик по кнопке плей
		chrome.runtime.sendMessage({action: "play-pause"}, function(response) {
  			console.log("Запрос на бек отправлен, play-pause button.");
		});   
	});

	$(".button-prev").on("click", function(){ //клик по кнопке назад
		chrome.runtime.sendMessage({action: "prev-pls"}, function(response) {
  			console.log("Запрос на бек отправлен, play-pause button.");
		});   
	});

	$(".button-next").on("click", function(){ //клик по кнопке вперед
		chrome.runtime.sendMessage({action: "next-pls"}, function(response) {
  			console.log("Запрос на бек отправлен, play-pause button.");
		});   
	});

	chrome.runtime.onMessage.addListener(function(request){ //получаем входящее сообщение\запрос с бек таба и думаем че делать дальше
	  	console.log("Пришли данные с контента");

	  	if ( request.action == "contentData" ){
	  		console.log(request.sms);

	  			$("div").html(request.sms);

	  			var $dom = $("body").html();
	
	  	// 		chrome.runtime.sendMessage({action: "saveMyDom"}, function(response) {
  		// 			console.log("Дом на бек отправлен");
				// }); 
	  	}

	});

	function setStorageValue(key, value) {
        chrome.storage.sync.set({[key] : value}, function() {
            console.log('Settings saved');
        });
    };

    function getStorageValue(key) {
   		chrome.storage.sync.get(key, function(result, final) {
			$("div").html(result[key]);
			console.log(result[key]);
    	});
	};

});
