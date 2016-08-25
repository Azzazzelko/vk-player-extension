(function(){

	$(".skins__radio").eq(localStorage.current_skin_index).prop("checked", true); //смотрим, какой был выбранный ранее скин, что б поставить туда галочку
	$(".notifications__radio").eq(localStorage.notifications_status_index).prop("checked", true); //смотрим, где была галка ранее 

	$(".skins__radio").on("click", function(){ //по клику на скин, записываем вал значение и текущее положение зис в хранилище, для использования в плеере
		var val = $(this).val(),
			indx = $(".skins__radio").index( $(this) );

		localStorage.current_skin = '<link rel="stylesheet" href="styles/' + val + '.css">';
		localStorage.current_skin_index = indx;
	});

	$(".notifications__radio").on("click", function(){ //по клику на он\офф, записываем вал значение и текущее положение зис в хранилище, для использования в беке
		var val = $(this).val(),
			indx = $(".notifications__radio").index( $(this) );

		localStorage.notifications_status = val;
		localStorage.notifications_status_index = indx;
	});

})();
	
