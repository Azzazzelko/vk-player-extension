// var lotusMod = (function(){

// 	var main = function(){
	
// 	};

// 	return {
// 		run : main
// 	}
  
// }());

// lotusMod.run();



//audioPlayer.player.setVolume(0.1); - изменение громкости, старый..=)//
//getAudioPlayer().seek(0.6)
//getAudioPlayer().getCurrentAudio()[5]


getCurrentAudioDuration();

var nowPlayTimer; //для обнуления таймаута в ивенте чекающем див на нау плейинг
var currentAudioDuration; //текущее положение прогресс-бара
var volumeLine = $(".slider.audio_page_player_volume_slider.slider_size_1 .slider_amount"); //Ползунок когда меняем ручками в ВК
var progressBar = $(".slider.audio_page_player_track_slider.slider_size_1 .slider_amount");
var playButton = $('.audio_page_player_play');
var prevButton = $('.audio_page_player_prev');
var nextButton = $('.audio_page_player_next');
var nowPlaying = $(".audio_page_player_title");

chrome.runtime.onMessage.addListener(function(request){ //получаем входящее сообщение\запрос с бек таба и думаем че делать дальше
  	console.log("Получил от бека запрос!");
  	
	if ( request.action == "giveVK" ){
		sendSMS("nowPlay", getNowPlay(), "contentData");
		sendSMS("nowVolume", getCurrentVolume(), "contentData");
		sendSMS("duration", getAudioDuration(), "contentData");
		// getCurrentAudioDuration();
		// setTimeout(function(){
		// 	sendSMS("nowProgress", currentAudioDuration, "contentData");
		// }, 750);
	}

	if ( request.action == "play-button" ){
		playButton.trigger("click");
	}

	if ( request.action == "prev-button" ){
		prevButton.trigger("click");
	}

	if ( request.action == "next-button" ){
		nextButton.trigger("click");
	}

	if ( request.action == "volume-change" ) {
 		createHideVolControl(request.newMyVolume);
	}
 
	if ( request.action == "giveCurrentBar" ) {
		getCurrentAudioDuration();
		setTimeout(function(){
			sendSMS("nowProgress", currentAudioDuration, "currentProgressBar");
		}, 750);
	}

	if ( request.action == "playORpause" ){
	    sendSMS("startOrPauseStatus", getStartOrPauseStatus(), "startOrPauseStatus");
	}

});

function getStartOrPauseStatus(){
	if ( $(".audio_playing").length == 0 ) {
		return "pause";
	} else {
		return "playing";
	}
}

function getNowPlay(){
	return nowPlay = nowPlaying.html();
}

function getCurrentVolume(){
	var width = volumeLine.css("width"),
        max = 50;
	    _width = width.substring(0,width.length-2),
	    result = (_width*100/max).toFixed(2);

	return result;
}

function getAudioDuration(){ //получаем продолжительность песенки в секундах.
	var audioData = $(".audio_row_current").attr("data-audio") || $(".audio_page_player._audio_page_player._audio_row").attr("data-audio");
	return JSON.parse(audioData)[5];
}

function getCurrentAudioDuration(){
	setTimeout(function(){
		var width = progressBar.css("width"),
		    max = 288; //размер прогресс бара у вк плеера
		    duration = getAudioDuration();
    	_width = width.substring(0,width.length-2),
    	procent = (_width*100/max);
    	result = (duration/100*procent).toFixed(4);

		currentAudioDuration = result;
	}, 750); //значение текущего прогресс бара
};

function sendSMS(key, value, actionValue){
	chrome.runtime.sendMessage({[key] : value, "action" : actionValue}, function(response) {
		console.log("SMS на бек отправленo!");
	});  
};

nowPlaying.bind("DOMSubtreeModified", function(){  //событие замечает изменение в диве в -сейчас играет-
	clearTimeout(nowPlayTimer);
	nowPlayTimer = setTimeout(function(){
			console.log(getAudioDuration());
		sendSMS("nowPlay", getNowPlay(), "contentData");
		sendSMS("duration", getAudioDuration(), "contentData");
		sendSMS("duration", getAudioDuration(), "newDuration");	
	}, 300);
});

new ResizeSensor(volumeLine, function() { //Событие от плагина, замечает, когда меняется размер элемента... посылаем сразу новое значение на бэк 
    sendSMS("nowVolume", getCurrentVolume(), "contentData");
});

function createHideVolControl(volumeValue){  //Создаем скрытый див, для управления грокостью плеера
	( volumeValue == 0 ) ? volumeValue = 0 : volumeValue = volumeValue || "1"; 

	if ( $(".hideVolume").length == 0 ) {
		var div = '<button class="hideVolume" style="display:none" onclick="getAudioPlayer().setVolume('+volumeValue+')"></button>';
		$('.audio_page_player._audio_page_player').append(div);
	} else {
		var onclick = 'getAudioPlayer().setVolume(' + volumeValue + ')';
		$(".hideVolume").attr("onclick", onclick);
	}

	$(".hideVolume").trigger("click"); 
}


