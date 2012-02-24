$('#slider')
    .anythingSlider({
        // zero time between slide transitions
        animationTime      : 0,
        // set this delay to fade out the current slide before animating
        // set here to match the fade time
        delayBeforeAnimate : 500 
    })
    .anythingSliderFx({
        // target the entire panel and fade will take 500ms
        // set opacity (value after the 'fade'),
        // the value must be between 0 and 1
        // (1 = 100% opacity and is the default)
        '.panel' : [ 'fade', '', 500, 'easeInOutCirc' ]
    },{
        // FX options - showing the defaults
        // Default FX easing
        easing     : 'swing',
        // Default time for in FX animation
        timeIn     : 800,
        // Default time for out FX animation - when using
        // predefined FX, this number gets divided by 2
        timeOut    : 800,
        // When true, the FX will not repeat when clicking
        // on the current navigation tab.
        stopRepeat : false,   
        // When outFx animations are called
        outFxBind  : 'slide_init',
        // When inFx animations are called
        inFxBind   : 'slide_complete'
    });
