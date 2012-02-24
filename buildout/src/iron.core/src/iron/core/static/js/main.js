var red = {};

red.goBack = function(){
}

red.getCurPage = function(){
    return $('.ui-page-active').attr('class').split(' ')[0];
}

red.getPrevPage = function(){
    var curPage = red.getCurPage();
    console.log(curPage);
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


/*
$( function(){

    $('#boutonHeaderBack').click( function(){
        var prevPage = red.getPrevPage();
        window.location.href = prevPage;

    });

});
*/

function saveSearchParam() {
	arrJSONParam = $("#searchForm").serializeArray();
	localStorage.setItem('searchParam', JSON.stringify(arrJSONParam));
	
	for (i=0;i<arrJSONParam.length-1;i++) {
		if (arrJSONParam[i].name=="distance" && parseInt(arrJSONParam[i].value)>0) {
			$.mobile.showPageLoadingMsg;
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(success, error);
			} else {
				alert("Fail");
				$.mobile.hidePageLoadingMsg;
				return false;
			}
		}
	}
}

function success (position) {
	var lat = position.coords.latitude;
	var lon = position.coords.longitude;
	console.debug(lat + " " + lon);
}

function error () {
	alert("Fail");
	$.mobile.hidePageLoadingMsg;
	return false;
}
