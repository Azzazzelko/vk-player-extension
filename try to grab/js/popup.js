$(document).ready(function () {

	loadPlayer();

	$(".button-open-url").on("click", function(){  //по нажатию на кнопку, посылаем на бек запрос, дабы он открыл новую вкладку.. далее см. там
		chrome.runtime.sendMessage({action: "create-url"}, function(response) {
  			console.log("Запрос на бек отправлен!");
		});   
	});

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
	  		$(".now-play").html(request.nowPlay);
	  	}
	});

	$("#volume").on("slidechange", function( event, ui ) {
		var $this = $(this),
		    newVolume = $this.slider("value")/100;
	
		chrome.runtime.sendMessage({"newMyVolume" : newVolume, action : "volume-change"}, function(response) {
  			console.log("Громкость поменялась..");
		});  
	});

	function setStorageValue(key, value) {
        chrome.storage.sync.set({[key] : value}, function() {
            console.log('Settings saved');
        });
    };

    function getStorageValue(key) {	//получаем значение с хранилище, в данном случае что щас играет и суем это в див.
 		chrome.storage.sync.get(key, function(result) {
			$(".now-play").html(result[key]);
    	});
	};

	function getStorageAndCreateVolume(key){
		chrome.storage.sync.get(key, function(result) {
			$("#volume").slider({
				value: result[key],
			    orientation: "horizontal",
			    range: "min",
			    animate: false
			});
    	});
	};

	function loadPlayer(){ //при запуске попапа, генерим -сейчас играет- и -громкость-
		getStorageValue("nowPlay");
		getStorageAndCreateVolume("nowVolume");
	};

});
