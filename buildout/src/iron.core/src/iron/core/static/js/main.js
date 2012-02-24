function loadQuartier (select) {
	console.debug(select);
}

var red = {};

red.goBack = function(){
}

red.getCurPage = function(){
    return $('body > div').attr('class').split(' ')[0];
}

red.getPrevPage = function(){
    var curPage = red.getCurPage();
    switch(curPage){
        case 'recherche':
            return '/';
            break;
        case 'liste':
        case 'map':
            return '/recherche/';
            break;
        case 'activite':
            // étions nous mode liste ou map ?
            return '/liste/';
            break;
        case 'accueil':
        default:
            return null;
            break;
    }
}


$( function(){

    $('#boutonHeaderBack').click( function(){

        var prevPage = red.getPrevPage();
        window.location.href = prevPage;

    });

});

$(document).bind("mobileinit", function(){
	$("#map").live("pageshow", function( event, data ){
		alert("wtf");
	});
});

function saveSearchParam() {
	localStorage.setItem('searchParam', JSON.stringify($("#searchForm").serializeArray()));
}
