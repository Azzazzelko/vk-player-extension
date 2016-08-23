var lotusMod = (function(){

	var nowPlayTimer,         	//для обнуления таймаута в ивенте чекающем див на нау плейинг
    	currentAudioDuration; 	//для текущего положение прогресс-бара

	var main = function(){
		eventFunc.setUpListeners();
	};

	var $divs = { //дом объекты

		$addMusicButton : $(".audio_page_player_btn.audio_page_player_add._audio_page_player_add"), //спрятанная фигня, если чужую музыку слушаем, прогресс бар будет меньше, а нам нужна его ширина..
		$volumeLine : $(".slider.audio_page_player_volume_slider.slider_size_1 .slider_amount"), //Ползунок когда меняем ручками в ВК
		$progressBar : $(".slider.audio_page_player_track_slider.slider_size_1 .slider_amount"),
		$playButton : $('.audio_page_player_play'),
		$prevButton : $('.audio_page_player_prev'),
		$nextButton : $('.audio_page_player_next'),
		$nowPlaying : $(".audio_page_player_title")
	};

	var get = { //получаем некие значения

		getStartOrPauseStatus : function(){
			if ( $(".audio_playing").length == 0 ) {
				return "pause";
			} else {
				return "playing";
			}
		},

		getNowPlay : function(){
			return nowPlay = $divs.$nowPlaying.html();
		},

		getCurrentVolume : function(){
			var width = $divs.$volumeLine.css("width"),
		        max = 50;
			    _width = width.substring(0,width.length-2),
			    result = (_width*100/max).toFixed(2);

			return result;
		},

		getAudioDuration : function(){ //получаем продолжительность песенки в секундах.
			var audioData = $(".audio_row_current").attr("data-audio") || $(".audio_page_player._audio_page_player._audio_row").attr("data-audio");
			return JSON.parse(audioData)[5];
		},

		getCurrentAudioDuration : function(){ //значение текущего прогресс бара --> результат в секундах.
			setTimeout(function(){
				var width = $divs.$progressBar.css("width"),
				    max = ( $divs.$addMusicButton.css("display") == "none" ) ? 288 : 264; //размер прогресс бара у вк плеера
			    duration = get.getAudioDuration(); //получаем длительность копозиции
		    	_width = width.substring(0,width.length-2),
		    	procent = (_width*100/max);
		    	result = (duration/100*procent).toFixed(4);

				currentAudioDuration = result;
			}, 750); 
		}
	};

	var send = { //запрос на что-то, с отправкой\без данных 

		sendSMS : function(key, value, actionValue){
			chrome.runtime.sendMessage({[key] : value, "action" : actionValue}, function(response) {
				console.log("SMS на бек отправленo!");
			});  
		}
	};

	var create = {  //создаем див в дом дереве

		createHideVolControl : function(volumeValue){  //Создаем скрытый див, для управления грокостью плеера
			( volumeValue == 0 ) ? volumeValue = 0 : volumeValue = volumeValue || "1"; 

			if ( $(".hideVolume").length == 0 ) {
				var div = '<button class="hideVolume" style="display:none" onclick="getAudioPlayer().setVolume('+volumeValue+')"></button>';
				$('.audio_page_player._audio_page_player').append(div);
			} else {
				var onclick = 'getAudioPlayer().setVolume(' + volumeValue + ')';
				$(".hideVolume").attr("onclick", onclick);
			}

			$(".hideVolume").trigger("click"); 
		},

		createHideProgressControl : function(progressValue){  //Создаем скрытый див, для управления прогресс баром плеера
			( progressValue == 0 ) ? progressValue = 0 : ""; 

			if ( $(".hideProgress").length == 0 ) {
				var div = '<button class="hideProgress" style="display:none" onclick="getAudioPlayer().seek('+progressValue+')"></button>';
				$('.audio_page_player._audio_page_player').append(div);
			} else {
				var onclick = 'getAudioPlayer().seek(' + progressValue + ')';
				$(".hideProgress").attr("onclick", onclick);
			}

			$(".hideProgress").trigger("click"); 
		}
	};

	var eventFunc = {  //события

		onMessageRecive : function(request, sender, sendResponse){ //получаем входящее сообщение\запрос с бек таба и думаем че делать дальше
		  	console.log("Получил от бека запрос!");
	  	
		  	switch(request.action){
				case "giveVK" :
					send.sendSMS("nowPlay", get.getNowPlay(), "contentData");
					send.sendSMS("nowVolume", get.getCurrentVolume(), "contentData");
					send.sendSMS("duration", get.getAudioDuration(), "contentData");			
					break;
				case "play-button" :
					$divs.$playButton.trigger("click");
					break;
				case "prev-button" :
					$divs.$prevButton.trigger("click");
					break;
				case "next-button" :
					$divs.$nextButton.trigger("click");
					break;
				case "volume-change" :
					create.createHideVolControl(request.newMyVolume);
					break;
				case "giveCurrentBar" :
					get.getCurrentAudioDuration();
					setTimeout(function(){
						send.sendSMS("nowProgress", currentAudioDuration, "currentProgressBar");
					}, 750);
					break;
				case "playORpause" :
					sendResponse({"control" : "yes"}); //для проверки, если респонса не будет, то нечем управлять, это и проверяем.
					send.sendSMS("startOrPauseStatus", get.getStartOrPauseStatus(), "startOrPauseStatus");
					break;
				case "setVolMute" :
					create.createHideVolControl(0);
					break;
				case "setVolFull" :
					create.createHideVolControl(1);
					break;
				case "position-change" :
					create.createHideProgressControl(request.newMyPosition);
					break;
		  	}
		},

		nowPlayingChange : function(){ //Событие от плагина, замечает, когда меняется размер элемента... посылаем сразу новое значение на бэк 
			clearTimeout(nowPlayTimer);
			nowPlayTimer = setTimeout(function(){
				send.sendSMS("nowPlay", get.getNowPlay(), "contentData");
				send.sendSMS("duration", get.getAudioDuration(), "contentData");
				send.sendSMS("duration", get.getAudioDuration(), "newDuration");	
			}, 300);
					console.log("change!!");
		},

		volumeChange : function(){ //Событие от плагина, замечает, когда меняется размер элемента... посылаем сразу новое значение на бэк 
			send.sendSMS("nowVolume", get.getCurrentVolume(), "contentData");
		},

		setUpListeners : function(){
			chrome.runtime.onMessage.addListener(this.onMessageRecive);

			$divs.$nowPlaying.bind("DOMSubtreeModified", this.nowPlayingChange);

			new ResizeSensor($divs.$volumeLine, this.volumeChange);
		}
	};

	return {
		run : main
	}
  
}());

lotusMod.run();





