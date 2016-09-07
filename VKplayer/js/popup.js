$(document).ready(function () {

	//************Переменные********//
	var intervalProBar, 	 //таймер для прогресс бара
	    intervalDuration,    //таймер для длительность
	    currentDurationLeft, //для сохранения остатка длительности песни текущей в секундах.
	    audioDuration, 		 //значение полной длительности композиции
	    uCanRunBar = 0; 	 //значение, что б синхронно запускать бар с длительностью, флаг, выключенный.


	var $buttons = { //кнопочки

		$buVkOpen : $(".button-open-url"),
	    $buPlayPause : $(".button-play-pause"),
	    $buPrev : $(".button-prev"),
	    $buNext : $(".button-next"),
	    $buVolMute : $(".button-vol-mute"),
	    $buVolFull : $(".button-vol-full")
	};

	var $divs = { //блоки, нужные для данных

		$nowPlay : $(".now-play"),
		$loaderPlayer : $(".player-loader"),
		$allBlock : $(".block-control")
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
				clearInterval(intervalDuration);
			} else {
				$this.addClass('pause-now');
				progressBar.runProgressBar();
				progressBar.runDuration();
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

		buMute : function(){
			chrome.runtime.sendMessage({action: "vol-mute"}, function(response) {
	  			console.log("Громкость нулевая!");
			});

			$slider.$slVolume.slider("value", "0");
		},

		buVolFull : function(){
			chrome.runtime.sendMessage({action: "vol-full"}, function(response) {
	  			console.log("Громкость максимальная!");
			});

			$slider.$slVolume.slider("value", "100");
		},

		onMessageRecive : function(request){
		  	console.log("Пришли данные с контента.");

		  	switch(request.action){
	 			case "contentData" :
		  			$divs.$nowPlay.html(request.nowPlay);
	 				break;

	 			case "newDuration" :
 					duration.getDurationOnline(request.duration);
 					audioDuration = request.duration; //при онлайн обновлении, сейвим новую длительность этой мелодии
 					currentDurationLeft = 0; //при онлайне, обнуляем остаток песни, ибо теперь он равен нулю, ведь только начался..
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

		progressChange : function(){
				var $this = $(this),
				    newAudioPosition = $(this).slider("value")*100/audioDuration/100;

				chrome.runtime.sendMessage({"newMyPosition" : newAudioPosition, action : "position-change"}, function(response) {
	  				console.log("Позиция музыки поменялась..");
				});

				currentDurationLeft = $(this).slider("value");
				uCanRunBar = 1;
		},

		setUpListeners : function(){
			$buttons.$buVkOpen.on("click", this.buVkOpen); //клик по вк иконке
	 
			$buttons.$buPlayPause.on("click", this.buPlayPause); //клик по плей\паузе

			$buttons.$buPrev.on("click", this.buPrev); //клик назад

			$buttons.$buNext.on("click", this.buNext); //клик вперед

			$buttons.$buVolMute.on("click", this.buMute); //клик вперед

			$buttons.$buVolFull.on("click", this.buVolFull); //клик вперед

			chrome.runtime.onMessage.addListener(this.onMessageRecive); //если получаем собщения с контект страницы..

			$slider.$slVolume.on("slidechange", this.volChange); //если слайдер с громкостью меняется

			$slider.$slProgressBar.on("slidestop", this.progressChange); //отпускание головки на прогресс баре

			$slider.$slProgressBar.on("slidestart", function(){
				clearInterval(intervalProBar);
			}); 
		}
	};

	var storage = { //ф-ции для работы с хранилищем

		getStorageNowPlay : function(key){ //получаем значение с хранилище, в данном случае что щас играет и суем это в див.
	 		chrome.storage.local.get(key, function(result) {
				$divs.$nowPlay.html(result[key]);
    		});
		},

		getStorageAndCreateVolume : function(key){
			chrome.storage.local.get(key, function(result) {
				$slider.$slVolume.slider({
					value: result[key],
				    orientation: "horizontal",
				    range: "min",
				    animate: false
				});
    		});
		},

		getStorageAndСreateProgressBar : function(key){ //тут получим текущее значение полоски, текущие секунды песни
			chrome.storage.local.get(key, function(result) {
				currentDurationLeft = result[key];
				$slider.$slProgressBar.slider({
					value: result[key],
				    orientation: "horizontal",
				    range: "min",
				    animate: false
				});
			});
		},

		getStorageAndUpgradeProgressBar : function(key){ //тут получим длительность песни в секундах
			chrome.storage.local.get(key, function(result) {
				duration.getDurationOnload(result[key]);
				audioDuration = result[key];
				$slider.$slProgressBar.slider({
					min: 0,
					max: result[key],
					step: 1
				});
			});
		},

		getStorageAndCheckPlayStatus : function(key){
			chrome.storage.local.get(key, function(result) {
				if (result[key] == "playing" ){
					progressBar.runProgressBar();
					progressBar.runDuration();
					$buttons.$buPlayPause.addClass('pause-now');
				} else if (result[key] == "block" ) {
					$divs.$allBlock.show();
				};
			});
		},

		setChoosenSkin : function(){
			var link = localStorage.current_skin;
	    	$("head").append(link);
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

		runDuration : function(){
			clearInterval(intervalDuration);
			intervalDuration = setInterval(function(){
				if ( uCanRunBar ) {	//что б синхронно запустился и бар и длительность
					progressBar.runProgressBar();
					uCanRunBar = 0;
				} 
				currentDurationLeft = Math.round(currentDurationLeft)+1;
				duration.getDurationOnload(audioDuration, currentDurationLeft);
			}, 1000);
		},

		runPrBarIfPrevOrNextButton : function(){ //запуск прогр бара при нажатии на кнопки след\пред композиция
			if ( !$buttons.$buPlayPause.hasClass('pause-now') ){
				$buttons.$buPlayPause.addClass('pause-now');
				this.runProgressBar();
				this.runDuration();
			};
		}
	};

	var duration = {

		getDurationOnline : function(dur){ //получаем циферки длительности, при онлайн обновлении
			var sec = ( dur%60 < 10 ) ? "0"+dur%60 : dur%60,
			    str = (dur/60).toFixed(2),
			    min = "-"+str.substring(0, str.length-3);

		    if ( $(".duration").length == 0 ) {
    			var div = '<div class="duration">'+min+':'+sec+'</div>';
				$divs.$nowPlay.append(div); 
		    } else {
		    	$(".duration").html(min+':'+sec);
		    }
		},

		getDurationOnload : function(dur, newDur){ //получаем циферки длительности, при загрузке плеера
 			var duration = dur,
				_currentDurationLeft = newDur || currentDurationLeft,
			    durLeft = Math.round(_currentDurationLeft),
			    resultDurLeft = duration - durLeft;

			this.getDurationOnline(resultDurLeft);
		}
	};

	//**Player init**
	loadPlayer();

	function loadPlayer(){ //при запуске попапа, генерим *сейчас играет*, *громкость*, *progress bar*, проверяем играет ли ща музыка
		storage.setChoosenSkin(); //устанавливаем выбранный пользователем скин плеера
		storage.getStorageNowPlay("nowPlay"); //вытаскиваем инфу с хранилища, что щас играет
		storage.getStorageAndCreateVolume("nowVolume"); //вытаскиваем инфу с хранилища где ползунок громкости
		sendReq.sendRequestForNewProgressBar(); //запрос на состояние прогресс бара..
		sendReq.sendRequestForPlayOrPause(); //запрос на сейчас музыка играет или нет
		eventFunc.setUpListeners(); //прослушка событий
		setTimeout(function(){ //есть задержка на сохранение данных со стороны контента и бека, что б не вытащить пустоту, ставим тайм-аут
			storage.getStorageAndCheckPlayStatus("startOrPauseStatus"); //смотрим ответ, играет ли музыка
			storage.getStorageAndСreateProgressBar("nowProgress"); //смотрим ответ, где прогресс бар и генерим похожий
			storage.getStorageAndUpgradeProgressBar("duration"); //смотрим ответ, и дополняем прогрес бар..
			$divs.$loaderPlayer.fadeOut();  //убираем прелойдер с плеера
		}, 1250);	
	};
});

