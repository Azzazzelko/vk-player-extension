(function(){

	$(".skins__radio").eq(localStorage.current_skin_index).prop("checked", true); //смотрим, какой был выбранный ранее скин, что б поставить туда галочку

	$(".skins__radio").on("click", function(target){ //по клику на скин, записываем вал значение и текущее положение зис в хранилище, для использования в плеере
		var val = $(this).val(),
			indx = $(".skins__radio").index( $(this) );

		localStorage.current_skin = '<link rel="stylesheet" href="styles/' + val + '.css">';
		localStorage.current_skin_index = indx;
	});

})();
	
