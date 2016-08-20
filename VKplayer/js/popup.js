$(document).ready(function () {

	//************Переменные********//
	var intervalProBar; //таймер для прогресс бара

	var $buttons = { //кнопочки

		$buVkOpen : $(".button-open-url"),
	    $buPlayPause : $(".button-play-pause"),
	    $buPrev : $(".button-prev"),
	    $buNext : $(".button-next")
	};

	var $divs = { //блоки, нужные для данных

		$nowPlay : $(".now-play"),
		$loaderProgress : $(".progress-loading"),
		$loaderPlayer : $(".player-loader")
	};

	var $slider = { //слайдеры

		$slProgressBar : $("#progress-bar"),
		$slVolume : $("#volume")
	};

	//*************Functions*********//
	var eventFunc = { //ф-ции для событий онКлик

		buVkOpen : function(){
			chrome.runtime.sendMessage({action: "create-url"}, function(response) {
	  			console.log("Запрос на бек отправлен!");
			}); 
		},

		buPlayPause : function(){
			var $this = $(this);
			if ( $this.hasClass('pause-now') ){
				$this.removeClass('pause-now');
				clearInterval(intervalProBar);
			} else {
				$this.addClass('pause-now');
				progressBar.runProgressBar();
			}

			chrome.runtime.sendMessage({action: "play-pause"}, function(response) {
	  			console.log("Запрос на бек отправлен, play-pause button.");
			});
		},

		buPrev : function(){
			chrome.runtime.sendMessage({action: "prev-pls"}, function(response) {
	  			console.log("Запрос на бек отправлен, previous button.");
			});

			progressBar.runPrBarIfPrevOrNextButton();  
		},

		buNext : function(){
			chrome.runtime.sendMessage({action: "next-pls"}, function(response) {
	  			console.log("Запрос на бек отправлен, next button.");
			}); 

			progressBar.runPrBarIfPrevOrNextButton(); 
		},

		onMessageRecive : function(request){
		  	console.log("Пришли данные с контента.");

		  	switch(request.action){
	 			case "contentData" :
		  			$divs.$nowPlay.html(request.nowPlay);
	 				break;

	 			case "newDuration" :
					$slider.$slProgressBar.slider({
						value : 0,
						max: request.duration
					});
	 				break;
		  	}
		},

		volChange : function(){
			var $this = $(this),
			    newVolume = $this.slider("value")/100;
		
			chrome.runtime.sendMessage({"newMyVolume" : newVolume, action : "volume-change"}, function(response) {
	  			console.log("Громкость поменялась..");
			});
		},

		setUpListeners : function(){
			$buttons.$buVkOpen.on("click", this.buVkOpen); //клик по вк иконке
	 
			$buttons.$buPlayPause.on("click", this.buPlayPause); //клик по плей\паузе

			$buttons.$buPrev.on("click", this.buPrev); //клик назад

			$buttons.$buNext.on("click", this.buNext); //клик вперед

			chrome.runtime.onMessage.addListener(this.onMessageRecive); //если получаем собщения с контект страницы..

			$slider.$slVolume.on("slidechange", this.volChange); //если слайдер с громкостью меняется
		}
	};

	var storage = { //ф-ции для работы с хранилищем

		getStorageNowPlay : function(key){ //получаем значение с хранилище, в данном случае что щас играет и суем это в див.
	 		chrome.storage.sync.get(key, function(result) {
				$divs.$nowPlay.html(result[key]);
    		});
		},

		getStorageAndCreateVolume : function(key){
			chrome.storage.sync.get(key, function(result) {
				$slider.$slVolume.slider({
					value: result[key],
				    orientation: "horizontal",
				    range: "min",
				    animate: false
				});
    		});
		},

		getStorageAndСreateProgressBar : function(key){
			chrome.storage.sync.get(key, function(result) {
				$slider.$slProgressBar.slider({
					value: result[key],
				    orientation: "horizontal",
				    range: "min",
				    animate: false
				});
			});
		},

		getStorageAndUpgradeProgressBar : function(key){
			chrome.storage.sync.get(key, function(result) {
				console.log("onLoad", result[key]);
				$slider.$slProgressBar.slider({
					min: 0,
					max: result[key],
					step: 1
				});
			});
		},

		getStorageAndCheckPlayStatus : function(key){
			chrome.storage.sync.get(key, function(result) {
				if (result[key] == "playing" ){
					progressBar.runProgressBar();
					$buttons.$buPlayPause.addClass('pause-now');
				}
			});
		} 
	};

	var sendReq = { //ф-ции отправки запросов

		sendRequestForNewProgressBar : function(){
			chrome.runtime.sendMessage({action: "giveCurrentBar"}, function(response) {
  				console.log("Give me current progress bar pls");
			});
		},

		sendRequestForPlayOrPause : function(){
			chrome.runtime.sendMessage({action: "playORpause"}, function(response) {
  				console.log("Play or Pause?");
			}); 
		}
	};

	var progressBar = { //ф-ции для взаимодействия с прогресс баром

		runProgressBar : function(){ //запускаем прогресс бар
			clearInterval(intervalProBar);
			intervalProBar = setInterval(function(){
				var currentVal = $slider.$slProgressBar.slider("value");
				$slider.$slProgressBar.slider("value", currentVal+1);
			}, 1000);
		},

		runPrBarIfPrevOrNextButton : function(){ //запуск прогр бара при нажатии на кнопки след\пред композиция
			if ( !$buttons.$buPlayPause.hasClass('pause-now') ){
				$buttons.$buPlayPause.addClass('pause-now');
				this.runProgressBar();
			};
		}
	};

	//**Player init**
	loadPlayer();

	function loadPlayer(){ //при запуске попапа, генерим *сейчас играет*, *громкость*, *progress bar*, проверяем играет ли ща музыка
		storage.getStorageNowPlay("nowPlay"); //вытаскиваем инфу с хранилища, что щас играет
		storage.getStorageAndCreateVolume("nowVolume"); //вытаскиваем инфу с хранилища где ползунок громкости
		sendReq.sendRequestForNewProgressBar(); //запрос на состояние прогресс бара..
		sendReq.sendRequestForPlayOrPause(); //запрос на сейчас музыка играет или нет
		eventFunc.setUpListeners(); //прослушка событий
		setTimeout(function(){ //есть задержка на сохранение данных со стороны контента и бека, что б не вытащить пустоту, ставим тайм-аут
			storage.getStorageAndCheckPlayStatus("startOrPauseStatus"); //смотрим ответ, играет ли музыка
			storage.getStorageAndСreateProgressBar("nowProgress"); //смотрим ответ, где прогресс бар и генерим похожий
			storage.getStorageAndUpgradeProgressBar("duration"); //смотрим ответ, и дополняем прогрес бар..
			$divs.$loaderProgress.hide();	//убираем прелойдер с прогресс бара
			$divs.$loaderPlayer.fadeOut();  //убираем прелойдер с плеера
		}, 1250);	
	};
});
