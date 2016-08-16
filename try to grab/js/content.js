// var lotusMod = (function(){

// 	var main = function(){
	
// 	};

// 	return {
// 		run : main
// 	}
  
// }());

// lotusMod.run();





var send; //для обнуления таймаута в ивенте чекающем див на нау плейинг

chrome.runtime.onMessage.addListener(function(request){ //получаем входящее сообщение\запрос с бек таба и думаем че делать дальше
  	console.log("Получил от бека запрос!");
  	
	if ( request.action == "giveVK" ){
		sendSMS(getNowPlay(), "contentData");
	}

	if ( request.action == "play-button" ){
		$("#ac_play").trigger("click");
	}

	if ( request.action == "prev-button" ){
		$("#ac_prev").trigger("click");
	}

	if ( request.action == "next-button" ){
		$("#ac_next").trigger("click");
	}

});

function getNowPlay(){
	return nowPlay = $("#ac_name").html();
}

function sendSMS(message, action){
	chrome.runtime.sendMessage({"sms" : message, "action" : action}, function(response) {
		console.log("SMS на бек отправленo!");
	});  
}

$('#ac_name').bind("DOMSubtreeModified",function(){
	clearTimeout(send);
	send = setTimeout(function(){
		sendSMS(getNowPlay(), "contentData");
	}, 300);
});


