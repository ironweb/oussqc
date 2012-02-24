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

var lastOrientation;

$(document).bind("mobileinit", function(){
	$(".map").live("pageshow", function( event, data ){
		init();
		resizeMap();
		lastOrientation=window.orientation;
		bindOrientationChange(resizeMap, true, null);
	});
	$(".map").live("pagehide", function( event, data ){
		bindOrientationChange(resizeMap, false, null);
	});
});

function saveSearchParam() {
	localStorage.setItem('searchParam', JSON.stringify($("#searchForm").serializeArray()));
}

function bindOrientationChange(func, bind, namespace) {
    var supportsOrientationChange = "onorientationchange" in window,
    orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";
    if (namespace) orientationEvent = orientationEvent+namespace;
    (bind) ? $(window).bind(orientationEvent, func) : (namespace) ? $(window).unbind(orientationEvent) : $(window).unbind(orientationEvent, func);
}

function resizeMap() {
			if (this.lastOrientation!=window.orientation) {
                if (testMobile(/Android/i)) {
                    // PLG : bug Android orientation change firing slower than iOS...
                    setTimeout(updateSize,500);
                } else {updateSize();}
            }
}

function updateSize() {
	var viewPortSize = getViewPortSize();
    var extraHideUrlBar = 0;
    if (window.orientation==0&&!window.navigator.standalone&&(testMobile(/iPhone/i)||testMobile(/iPod/i))) {
        extraHideUrlBar=60;
    }

    $("#openlayersMap").css("width", viewPortSize.width+"px");
    $("#openlayersMap").css("height", viewPortSize.height-$.mobile.activePage.find(":jqmData(role='footer')").outerHeight()-$.mobile.activePage.find(":jqmData(role='header')").outerHeight()+"px");
    mapObject.map.updateSize();
    //setTimeout(function() {window.scrollTo(0, 1);$j.mobile.fixedToolbars.show();if ($j(".ui-btn-mw-transparency").length!=0) changeOpacity();}, 100);
}

function getViewPortSize() {
    var viewportwidth;
    var viewportheight;
    if (typeof window.innerWidth != 'undefined') {
        viewportwidth = window.innerWidth, viewportheight = window.innerHeight
    } else if (typeof document.documentElement != 'undefined' && typeof document.documentElement.clientWidth != 'undefined' && document.documentElement.clientWidth != 0) {
        viewportwidth = document.documentElement.clientWidth, viewportheight = document.documentElement.clientHeight
    } else {
        viewportwidth = document.getElementsByTagName('body')[0].clientWidth, viewportheight = document.getElementsByTagName('body')[0].clientHeight
    }
    return {
        width: viewportwidth,
        height: viewportheight
    };
}

function testMobile (type) {
    return navigator.userAgent.match(type);
}