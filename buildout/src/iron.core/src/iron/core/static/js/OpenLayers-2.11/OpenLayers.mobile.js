var OpenLayers = {
    VERSION_NUMBER: "Release 2.11",
    singleFile: true,
    _getScriptLocation: (function () {
        var r = new RegExp("(^|(.*?\\/))(OpenLayers\.js)(\\?|$)"),
            s = document.getElementsByTagName('script'),
            src, m, l = "";
        for (var i = 0, len = s.length; i < len; i++) {
            src = s[i].getAttribute('src');
            if (src) {
                var m = src.match(r);
                if (m) {
                    l = m[1];
                    break;
                }
            }
        }
        return (function () {
            return l;
        });
    })()
};
OpenLayers.Class = function () {
    var len = arguments.length;
    var P = arguments[0];
    var F = arguments[len - 1];
    var C = typeof F.initialize == "function" ? F.initialize : function () {
            P.prototype.initialize.apply(this, arguments);
        };
    if (len > 1) {
        var newArgs = [C, P].concat(Array.prototype.slice.call(arguments).slice(1, len - 1), F);
        OpenLayers.inherit.apply(null, newArgs);
    } else {
        C.prototype = F;
    }
    return C;
};
OpenLayers.Class.isPrototype = function () {};
OpenLayers.Class.create = function () {
    return function () {
        if (arguments && arguments[0] != OpenLayers.Class.isPrototype) {
            this.initialize.apply(this, arguments);
        }
    };
};
OpenLayers.Class.inherit = function (P) {
    var C = function () {
            P.call(this);
        };
    var newArgs = [C].concat(Array.prototype.slice.call(arguments));
    OpenLayers.inherit.apply(null, newArgs);
    return C.prototype;
};
OpenLayers.inherit = function (C, P) {
    var F = function () {};
    F.prototype = P.prototype;
    C.prototype = new F;
    var i, l, o;
    for (i = 2, l = arguments.length; i < l; i++) {
        o = arguments[i];
        if (typeof o === "function") {
            o = o.prototype;
        }
        OpenLayers.Util.extend(C.prototype, o);
    }
};
OpenLayers.Util = OpenLayers.Util || {};
OpenLayers.Util.extend = function (destination, source) {
    destination = destination || {};
    if (source) {
        for (var property in source) {
            var value = source[property];
            if (value !== undefined) {
                destination[property] = value;
            }
        }
        var sourceIsEvt = typeof window.Event == "function" && source instanceof window.Event;
        if (!sourceIsEvt && source.hasOwnProperty && source.hasOwnProperty("toString")) {
            destination.toString = source.toString;
        }
    }
    return destination;
};
OpenLayers.Console = {
    log: function () {},
    debug: function () {},
    info: function () {},
    warn: function () {},
    error: function () {},
    userError: function (error) {
        alert(error);
    },
    assert: function () {},
    dir: function () {},
    dirxml: function () {},
    trace: function () {},
    group: function () {},
    groupEnd: function () {},
    time: function () {},
    timeEnd: function () {},
    profile: function () {},
    profileEnd: function () {},
    count: function () {},
    CLASS_NAME: "OpenLayers.Console"
};
(function () {
    var scripts = document.getElementsByTagName("script");
    for (var i = 0, len = scripts.length; i < len; ++i) {
        if (scripts[i].src.indexOf("firebug.js") != -1) {
            if (console) {
                OpenLayers.Util.extend(OpenLayers.Console, console);
                break;
            }
        }
    }
})();
OpenLayers.Lang = {
    code: null,
    defaultCode: "en",
    getCode: function () {
        if (!OpenLayers.Lang.code) {
            OpenLayers.Lang.setCode();
        }
        return OpenLayers.Lang.code;
    },
    setCode: function (code) {
        var lang;
        if (!code) {
            code = (OpenLayers.BROWSER_NAME == "msie") ? navigator.userLanguage : navigator.language;
        }
        var parts = code.split('-');
        parts[0] = parts[0].toLowerCase();
        if (typeof OpenLayers.Lang[parts[0]] == "object") {
            lang = parts[0];
        }
        if (parts[1]) {
            var testLang = parts[0] + '-' + parts[1].toUpperCase();
            if (typeof OpenLayers.Lang[testLang] == "object") {
                lang = testLang;
            }
        }
        if (!lang) {
            OpenLayers.Console.warn('Failed to find OpenLayers.Lang.' + parts.join("-") + ' dictionary, falling back to default language');
            lang = OpenLayers.Lang.defaultCode;
        }
        OpenLayers.Lang.code = lang;
    },
    translate: function (key, context) {
        var dictionary = OpenLayers.Lang[OpenLayers.Lang.getCode()];
        var message = dictionary && dictionary[key];
        if (!message) {
            message = key;
        }
        if (context) {
            message = OpenLayers.String.format(message, context);
        }
        return message;
    }
};
OpenLayers.i18n = OpenLayers.Lang.translate;
OpenLayers.String = {
    startsWith: function (str, sub) {
        return (str.indexOf(sub) == 0);
    },
    contains: function (str, sub) {
        return (str.indexOf(sub) != -1);
    },
    trim: function (str) {
        return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    },
    camelize: function (str) {
        var oStringList = str.split('-');
        var camelizedString = oStringList[0];
        for (var i = 1, len = oStringList.length; i < len; i++) {
            var s = oStringList[i];
            camelizedString += s.charAt(0).toUpperCase() + s.substring(1);
        }
        return camelizedString;
    },
    format: function (template, context, args) {
        if (!context) {
            context = window;
        }
        var replacer = function (str, match) {
                var replacement;
                var subs = match.split(/\.+/);
                for (var i = 0; i < subs.length; i++) {
                    if (i == 0) {
                        replacement = context;
                    }
                    replacement = replacement[subs[i]];
                }
                if (typeof replacement == "function") {
                    replacement = args ? replacement.apply(null, args) : replacement();
                }
                if (typeof replacement == 'undefined') {
                    return 'undefined';
                } else {
                    return replacement;
                }
            };
        return template.replace(OpenLayers.String.tokenRegEx, replacer);
    },
    tokenRegEx: /\$\{([\w.]+?)\}/g,
    numberRegEx: /^([+-]?)(?=\d|\.\d)\d*(\.\d*)?([Ee]([+-]?\d+))?$/,
    isNumeric: function (value) {
        return OpenLayers.String.numberRegEx.test(value);
    },
    numericIf: function (value) {
        return OpenLayers.String.isNumeric(value) ? parseFloat(value) : value;
    }
};
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (sStart) {
        OpenLayers.Console.warn(OpenLayers.i18n("methodDeprecated", {
            'newMethod': 'OpenLayers.String.startsWith'
        }));
        return OpenLayers.String.startsWith(this, sStart);
    };
}
if (!String.prototype.contains) {
    String.prototype.contains = function (str) {
        OpenLayers.Console.warn(OpenLayers.i18n("methodDeprecated", {
            'newMethod': 'OpenLayers.String.contains'
        }));
        return OpenLayers.String.contains(this, str);
    };
}
if (!String.prototype.trim) {
    String.prototype.trim = function () {
        OpenLayers.Console.warn(OpenLayers.i18n("methodDeprecated", {
            'newMethod': 'OpenLayers.String.trim'
        }));
        return OpenLayers.String.trim(this);
    };
}
if (!String.prototype.camelize) {
    String.prototype.camelize = function () {
        OpenLayers.Console.warn(OpenLayers.i18n("methodDeprecated", {
            'newMethod': 'OpenLayers.String.camelize'
        }));
        return OpenLayers.String.camelize(this);
    };
}
OpenLayers.Number = {
    decimalSeparator: ".",
    thousandsSeparator: ",",
    limitSigDigs: function (num, sig) {
        var fig = 0;
        if (sig > 0) {
            fig = parseFloat(num.toPrecision(sig));
        }
        return fig;
    },
    format: function (num, dec, tsep, dsep) {
        dec = (typeof dec != "undefined") ? dec : 0;
        tsep = (typeof tsep != "undefined") ? tsep : OpenLayers.Number.thousandsSeparator;
        dsep = (typeof dsep != "undefined") ? dsep : OpenLayers.Number.decimalSeparator;
        if (dec != null) {
            num = parseFloat(num.toFixed(dec));
        }
        var parts = num.toString().split(".");
        if (parts.length == 1 && dec == null) {
            dec = 0;
        }
        var integer = parts[0];
        if (tsep) {
            var thousands = /(-?[0-9]+)([0-9]{3})/;
            while (thousands.test(integer)) {
                integer = integer.replace(thousands, "$1" + tsep + "$2");
            }
        }
        var str;
        if (dec == 0) {
            str = integer;
        } else {
            var rem = parts.length > 1 ? parts[1] : "0";
            if (dec != null) {
                rem = rem + new Array(dec - rem.length + 1).join("0");
            }
            str = integer + dsep + rem;
        }
        return str;
    }
};
if (!Number.prototype.limitSigDigs) {
    Number.prototype.limitSigDigs = function (sig) {
        OpenLayers.Console.warn(OpenLayers.i18n("methodDeprecated", {
            'newMethod': 'OpenLayers.Number.limitSigDigs'
        }));
        return OpenLayers.Number.limitSigDigs(this, sig);
    };
}
OpenLayers.Function = {
    bind: function (func, object) {
        var args = Array.prototype.slice.apply(arguments, [2]);
        return function () {
            var newArgs = args.concat(Array.prototype.slice.apply(arguments, [0]));
            return func.apply(object, newArgs);
        };
    },
    bindAsEventListener: function (func, object) {
        return function (event) {
            return func.call(object, event || window.event);
        };
    },
    False: function () {
        return false;
    },
    True: function () {
        return true;
    },
    Void: function () {}
};
if (!Function.prototype.bind) {
    Function.prototype.bind = function () {
        OpenLayers.Console.warn(OpenLayers.i18n("methodDeprecated", {
            'newMethod': 'OpenLayers.Function.bind'
        }));
        Array.prototype.unshift.apply(arguments, [this]);
        return OpenLayers.Function.bind.apply(null, arguments);
    };
}
if (!Function.prototype.bindAsEventListener) {
    Function.prototype.bindAsEventListener = function (object) {
        OpenLayers.Console.warn(OpenLayers.i18n("methodDeprecated", {
            'newMethod': 'OpenLayers.Function.bindAsEventListener'
        }));
        return OpenLayers.Function.bindAsEventListener(this, object);
    };
}
OpenLayers.Array = {
    filter: function (array, callback, caller) {
        var selected = [];
        if (Array.prototype.filter) {
            selected = array.filter(callback, caller);
        } else {
            var len = array.length;
            if (typeof callback != "function") {
                throw new TypeError();
            }
            for (var i = 0; i < len; i++) {
                if (i in array) {
                    var val = array[i];
                    if (callback.call(caller, val, i, array)) {
                        selected.push(val);
                    }
                }
            }
        }
        return selected;
    }
};
OpenLayers.Bounds = OpenLayers.Class({
    left: null,
    bottom: null,
    right: null,
    top: null,
    centerLonLat: null,
    initialize: function (left, bottom, right, top) {
        if (left != null) {
            this.left = OpenLayers.Util.toFloat(left);
        }
        if (bottom != null) {
            this.bottom = OpenLayers.Util.toFloat(bottom);
        }
        if (right != null) {
            this.right = OpenLayers.Util.toFloat(right);
        }
        if (top != null) {
            this.top = OpenLayers.Util.toFloat(top);
        }
    },
    clone: function () {
        return new OpenLayers.Bounds(this.left, this.bottom, this.right, this.top);
    },
    equals: function (bounds) {
        var equals = false;
        if (bounds != null) {
            equals = ((this.left == bounds.left) && (this.right == bounds.right) && (this.top == bounds.top) && (this.bottom == bounds.bottom));
        }
        return equals;
    },
    toString: function () {
        return [this.left, this.bottom, this.right, this.top].join(",");
    },
    toArray: function (reverseAxisOrder) {
        if (reverseAxisOrder === true) {
            return [this.bottom, this.left, this.top, this.right];
        } else {
            return [this.left, this.bottom, this.right, this.top];
        }
    },
    toBBOX: function (decimal, reverseAxisOrder) {
        if (decimal == null) {
            decimal = 6;
        }
        var mult = Math.pow(10, decimal);
        var xmin = Math.round(this.left * mult) / mult;
        var ymin = Math.round(this.bottom * mult) / mult;
        var xmax = Math.round(this.right * mult) / mult;
        var ymax = Math.round(this.top * mult) / mult;
        if (reverseAxisOrder === true) {
            return ymin + "," + xmin + "," + ymax + "," + xmax;
        } else {
            return xmin + "," + ymin + "," + xmax + "," + ymax;
        }
    },
    toGeometry: function () {
        return new OpenLayers.Geometry.Polygon([new OpenLayers.Geometry.LinearRing([new OpenLayers.Geometry.Point(this.left, this.bottom), new OpenLayers.Geometry.Point(this.right, this.bottom), new OpenLayers.Geometry.Point(this.right, this.top), new OpenLayers.Geometry.Point(this.left, this.top)])]);
    },
    getWidth: function () {
        return (this.right - this.left);
    },
    getHeight: function () {
        return (this.top - this.bottom);
    },
    getSize: function () {
        return new OpenLayers.Size(this.getWidth(), this.getHeight());
    },
    getCenterPixel: function () {
        return new OpenLayers.Pixel((this.left + this.right) / 2, (this.bottom + this.top) / 2);
    },
    getCenterLonLat: function () {
        if (!this.centerLonLat) {
            this.centerLonLat = new OpenLayers.LonLat((this.left + this.right) / 2, (this.bottom + this.top) / 2);
        }
        return this.centerLonLat;
    },
    scale: function (ratio, origin) {
        if (origin == null) {
            origin = this.getCenterLonLat();
        }
        var origx, origy;
        if (origin.CLASS_NAME == "OpenLayers.LonLat") {
            origx = origin.lon;
            origy = origin.lat;
        } else {
            origx = origin.x;
            origy = origin.y;
        }
        var left = (this.left - origx) * ratio + origx;
        var bottom = (this.bottom - origy) * ratio + origy;
        var right = (this.right - origx) * ratio + origx;
        var top = (this.top - origy) * ratio + origy;
        return new OpenLayers.Bounds(left, bottom, right, top);
    },
    add: function (x, y) {
        if ((x == null) || (y == null)) {
            var msg = OpenLayers.i18n("boundsAddError");
            OpenLayers.Console.error(msg);
            return null;
        }
        return new OpenLayers.Bounds(this.left + x, this.bottom + y, this.right + x, this.top + y);
    },
    extend: function (object) {
        var bounds = null;
        if (object) {
            switch (object.CLASS_NAME) {
            case "OpenLayers.LonLat":
                bounds = new OpenLayers.Bounds(object.lon, object.lat, object.lon, object.lat);
                break;
            case "OpenLayers.Geometry.Point":
                bounds = new OpenLayers.Bounds(object.x, object.y, object.x, object.y);
                break;
            case "OpenLayers.Bounds":
                bounds = object;
                break;
            }
            if (bounds) {
                this.centerLonLat = null;
                if ((this.left == null) || (bounds.left < this.left)) {
                    this.left = bounds.left;
                }
                if ((this.bottom == null) || (bounds.bottom < this.bottom)) {
                    this.bottom = bounds.bottom;
                }
                if ((this.right == null) || (bounds.right > this.right)) {
                    this.right = bounds.right;
                }
                if ((this.top == null) || (bounds.top > this.top)) {
                    this.top = bounds.top;
                }
            }
        }
    },
    containsLonLat: function (ll, inclusive) {
        return this.contains(ll.lon, ll.lat, inclusive);
    },
    containsPixel: function (px, inclusive) {
        return this.contains(px.x, px.y, inclusive);
    },
    contains: function (x, y, inclusive) {
        if (inclusive == null) {
            inclusive = true;
        }
        if (x == null || y == null) {
            return false;
        }
        x = OpenLayers.Util.toFloat(x);
        y = OpenLayers.Util.toFloat(y);
        var contains = false;
        if (inclusive) {
            contains = ((x >= this.left) && (x <= this.right) && (y >= this.bottom) && (y <= this.top));
        } else {
            contains = ((x > this.left) && (x < this.right) && (y > this.bottom) && (y < this.top));
        }
        return contains;
    },
    intersectsBounds: function (bounds, inclusive) {
        if (inclusive == null) {
            inclusive = true;
        }
        var intersects = false;
        var mightTouch = (this.left == bounds.right || this.right == bounds.left || this.top == bounds.bottom || this.bottom == bounds.top);
        if (inclusive || !mightTouch) {
            var inBottom = (((bounds.bottom >= this.bottom) && (bounds.bottom <= this.top)) || ((this.bottom >= bounds.bottom) && (this.bottom <= bounds.top)));
            var inTop = (((bounds.top >= this.bottom) && (bounds.top <= this.top)) || ((this.top > bounds.bottom) && (this.top < bounds.top)));
            var inLeft = (((bounds.left >= this.left) && (bounds.left <= this.right)) || ((this.left >= bounds.left) && (this.left <= bounds.right)));
            var inRight = (((bounds.right >= this.left) && (bounds.right <= this.right)) || ((this.right >= bounds.left) && (this.right <= bounds.right)));
            intersects = ((inBottom || inTop) && (inLeft || inRight));
        }
        return intersects;
    },
    containsBounds: function (bounds, partial, inclusive) {
        if (partial == null) {
            partial = false;
        }
        if (inclusive == null) {
            inclusive = true;
        }
        var bottomLeft = this.contains(bounds.left, bounds.bottom, inclusive);
        var bottomRight = this.contains(bounds.right, bounds.bottom, inclusive);
        var topLeft = this.contains(bounds.left, bounds.top, inclusive);
        var topRight = this.contains(bounds.right, bounds.top, inclusive);
        return (partial) ? (bottomLeft || bottomRight || topLeft || topRight) : (bottomLeft && bottomRight && topLeft && topRight);
    },
    determineQuadrant: function (lonlat) {
        var quadrant = "";
        var center = this.getCenterLonLat();
        quadrant += (lonlat.lat < center.lat) ? "b" : "t";
        quadrant += (lonlat.lon < center.lon) ? "l" : "r";
        return quadrant;
    },
    transform: function (source, dest) {
        this.centerLonLat = null;
        var ll = OpenLayers.Projection.transform({
            'x': this.left,
            'y': this.bottom
        }, source, dest);
        var lr = OpenLayers.Projection.transform({
            'x': this.right,
            'y': this.bottom
        }, source, dest);
        var ul = OpenLayers.Projection.transform({
            'x': this.left,
            'y': this.top
        }, source, dest);
        var ur = OpenLayers.Projection.transform({
            'x': this.right,
            'y': this.top
        }, source, dest);
        this.left = Math.min(ll.x, ul.x);
        this.bottom = Math.min(ll.y, lr.y);
        this.right = Math.max(lr.x, ur.x);
        this.top = Math.max(ul.y, ur.y);
        return this;
    },
    wrapDateLine: function (maxExtent, options) {
        options = options || {};
        var leftTolerance = options.leftTolerance || 0;
        var rightTolerance = options.rightTolerance || 0;
        var newBounds = this.clone();
        if (maxExtent) {
            while (newBounds.left < maxExtent.left && (newBounds.right - rightTolerance) <= maxExtent.left) {
                newBounds = newBounds.add(maxExtent.getWidth(), 0);
            }
            while ((newBounds.left + leftTolerance) >= maxExtent.right && newBounds.right > maxExtent.right) {
                newBounds = newBounds.add(-maxExtent.getWidth(), 0);
            }
        }
        return newBounds;
    },
    CLASS_NAME: "OpenLayers.Bounds"
});
OpenLayers.Bounds.fromString = function (str, reverseAxisOrder) {
    var bounds = str.split(",");
    return OpenLayers.Bounds.fromArray(bounds, reverseAxisOrder);
};
OpenLayers.Bounds.fromArray = function (bbox, reverseAxisOrder) {
    return reverseAxisOrder === true ? new OpenLayers.Bounds(parseFloat(bbox[1]), parseFloat(bbox[0]), parseFloat(bbox[3]), parseFloat(bbox[2])) : new OpenLayers.Bounds(parseFloat(bbox[0]), parseFloat(bbox[1]), parseFloat(bbox[2]), parseFloat(bbox[3]));
};
OpenLayers.Bounds.fromSize = function (size) {
    return new OpenLayers.Bounds(0, size.h, size.w, 0);
};
OpenLayers.Bounds.oppositeQuadrant = function (quadrant) {
    var opp = "";
    opp += (quadrant.charAt(0) == 't') ? 'b' : 't';
    opp += (quadrant.charAt(1) == 'l') ? 'r' : 'l';
    return opp;
};
OpenLayers.Element = {
    visible: function (element) {
        return OpenLayers.Util.getElement(element).style.display != 'none';
    },
    toggle: function () {
        for (var i = 0, len = arguments.length; i < len; i++) {
            var element = OpenLayers.Util.getElement(arguments[i]);
            var display = OpenLayers.Element.visible(element) ? 'hide' : 'show';
            OpenLayers.Element[display](element);
        }
    },
    hide: function () {
        OpenLayers.Console.warn(OpenLayers.i18n("methodDeprecated", {
            newMethod: "element.style.display = 'none';"
        }));
        for (var i = 0, len = arguments.length; i < len; i++) {
            var element = OpenLayers.Util.getElement(arguments[i]);
            if (element) {
                element.style.display = 'none';
            }
        }
    },
    show: function () {
        OpenLayers.Console.warn(OpenLayers.i18n("methodDeprecated", {
            newMethod: "element.style.display = '';"
        }));
        for (var i = 0, len = arguments.length; i < len; i++) {
            var element = OpenLayers.Util.getElement(arguments[i]);
            if (element) {
                element.style.display = '';
            }
        }
    },
    remove: function (element) {
        element = OpenLayers.Util.getElement(element);
        element.parentNode.removeChild(element);
    },
    getHeight: function (element) {
        element = OpenLayers.Util.getElement(element);
        return element.offsetHeight;
    },
    getDimensions: function (element) {
        element = OpenLayers.Util.getElement(element);
        if (OpenLayers.Element.getStyle(element, 'display') != 'none') {
            return {
                width: element.offsetWidth,
                height: element.offsetHeight
            };
        }
        var els = element.style;
        var originalVisibility = els.visibility;
        var originalPosition = els.position;
        var originalDisplay = els.display;
        els.visibility = 'hidden';
        els.position = 'absolute';
        els.display = '';
        var originalWidth = element.clientWidth;
        var originalHeight = element.clientHeight;
        els.display = originalDisplay;
        els.position = originalPosition;
        els.visibility = originalVisibility;
        return {
            width: originalWidth,
            height: originalHeight
        };
    },
    hasClass: function (element, name) {
        var names = element.className;
        return ( !! names && new RegExp("(^|\\s)" + name + "(\\s|$)").test(names));
    },
    addClass: function (element, name) {
        if (!OpenLayers.Element.hasClass(element, name)) {
            element.className += (element.className ? " " : "") + name;
        }
        return element;
    },
    removeClass: function (element, name) {
        var names = element.className;
        if (names) {
            element.className = OpenLayers.String.trim(names.replace(new RegExp("(^|\\s+)" + name + "(\\s+|$)"), " "));
        }
        return element;
    },
    toggleClass: function (element, name) {
        if (OpenLayers.Element.hasClass(element, name)) {
            OpenLayers.Element.removeClass(element, name);
        } else {
            OpenLayers.Element.addClass(element, name);
        }
        return element;
    },
    getStyle: function (element, style) {
        element = OpenLayers.Util.getElement(element);
        var value = null;
        if (element && element.style) {
            value = element.style[OpenLayers.String.camelize(style)];
            if (!value) {
                if (document.defaultView && document.defaultView.getComputedStyle) {
                    var css = document.defaultView.getComputedStyle(element, null);
                    value = css ? css.getPropertyValue(style) : null;
                } else if (element.currentStyle) {
                    value = element.currentStyle[OpenLayers.String.camelize(style)];
                }
            }
            var positions = ['left', 'top', 'right', 'bottom'];
            if (window.opera && (OpenLayers.Util.indexOf(positions, style) != -1) && (OpenLayers.Element.getStyle(element, 'position') == 'static')) {
                value = 'auto';
            }
        }
        return value == 'auto' ? null : value;
    }
};
OpenLayers.LonLat = OpenLayers.Class({
    lon: 0.0,
    lat: 0.0,
    initialize: function (lon, lat) {
        this.lon = OpenLayers.Util.toFloat(lon);
        this.lat = OpenLayers.Util.toFloat(lat);
    },
    toString: function () {
        return ("lon=" + this.lon + ",lat=" + this.lat);
    },
    toShortString: function () {
        return (this.lon + ", " + this.lat);
    },
    clone: function () {
        return new OpenLayers.LonLat(this.lon, this.lat);
    },
    add: function (lon, lat) {
        if ((lon == null) || (lat == null)) {
            var msg = OpenLayers.i18n("lonlatAddError");
            OpenLayers.Console.error(msg);
            return null;
        }
        return new OpenLayers.LonLat(this.lon + OpenLayers.Util.toFloat(lon), this.lat + OpenLayers.Util.toFloat(lat));
    },
    equals: function (ll) {
        var equals = false;
        if (ll != null) {
            equals = ((this.lon == ll.lon && this.lat == ll.lat) || (isNaN(this.lon) && isNaN(this.lat) && isNaN(ll.lon) && isNaN(ll.lat)));
        }
        return equals;
    },
    transform: function (source, dest) {
        var point = OpenLayers.Projection.transform({
            'x': this.lon,
            'y': this.lat
        }, source, dest);
        this.lon = point.x;
        this.lat = point.y;
        return this;
    },
    wrapDateLine: function (maxExtent) {
        var newLonLat = this.clone();
        if (maxExtent) {
            while (newLonLat.lon < maxExtent.left) {
                newLonLat.lon += maxExtent.getWidth();
            }
            while (newLonLat.lon > maxExtent.right) {
                newLonLat.lon -= maxExtent.getWidth();
            }
        }
        return newLonLat;
    },
    CLASS_NAME: "OpenLayers.LonLat"
});
OpenLayers.LonLat.fromString = function (str) {
    var pair = str.split(",");
    return new OpenLayers.LonLat(pair[0], pair[1]);
};
OpenLayers.LonLat.fromArray = function (arr) {
    var gotArr = OpenLayers.Util.isArray(arr),
        lon = gotArr && arr[0],
        lat = gotArr && arr[1];
    return new OpenLayers.LonLat(lon, lat);
};
OpenLayers.Pixel = OpenLayers.Class({
    x: 0.0,
    y: 0.0,
    initialize: function (x, y) {
        this.x = parseFloat(x);
        this.y = parseFloat(y);
    },
    toString: function () {
        return ("x=" + this.x + ",y=" + this.y);
    },
    clone: function () {
        return new OpenLayers.Pixel(this.x, this.y);
    },
    equals: function (px) {
        var equals = false;
        if (px != null) {
            equals = ((this.x == px.x && this.y == px.y) || (isNaN(this.x) && isNaN(this.y) && isNaN(px.x) && isNaN(px.y)));
        }
        return equals;
    },
    distanceTo: function (px) {
        return Math.sqrt(Math.pow(this.x - px.x, 2) + Math.pow(this.y - px.y, 2));
    },
    add: function (x, y) {
        if ((x == null) || (y == null)) {
            var msg = OpenLayers.i18n("pixelAddError");
            OpenLayers.Console.error(msg);
            return null;
        }
        return new OpenLayers.Pixel(this.x + x, this.y + y);
    },
    offset: function (px) {
        var newPx = this.clone();
        if (px) {
            newPx = this.add(px.x, px.y);
        }
        return newPx;
    },
    CLASS_NAME: "OpenLayers.Pixel"
});
OpenLayers.Size = OpenLayers.Class({
    w: 0.0,
    h: 0.0,
    initialize: function (w, h) {
        this.w = parseFloat(w);
        this.h = parseFloat(h);
    },
    toString: function () {
        return ("w=" + this.w + ",h=" + this.h);
    },
    clone: function () {
        return new OpenLayers.Size(this.w, this.h);
    },
    equals: function (sz) {
        var equals = false;
        if (sz != null) {
            equals = ((this.w == sz.w && this.h == sz.h) || (isNaN(this.w) && isNaN(this.h) && isNaN(sz.w) && isNaN(sz.h)));
        }
        return equals;
    },
    CLASS_NAME: "OpenLayers.Size"
});
OpenLayers.Util = OpenLayers.Util || {};
OpenLayers.Util.getElement = function () {
    var elements = [];
    for (var i = 0, len = arguments.length; i < len; i++) {
        var element = arguments[i];
        if (typeof element == 'string') {
            element = document.getElementById(element);
        }
        if (arguments.length == 1) {
            return element;
        }
        elements.push(element);
    }
    return elements;
};
OpenLayers.Util.isElement = function (o) {
    return !!(o && o.nodeType === 1);
};
OpenLayers.Util.isArray = function (a) {
    return (Object.prototype.toString.call(a) === '[object Array]');
};
if (typeof window.$ === "undefined") {
    window.$ = OpenLayers.Util.getElement;
}
OpenLayers.Util.removeItem = function (array, item) {
    for (var i = array.length - 1; i >= 0; i--) {
        if (array[i] == item) {
            array.splice(i, 1);
        }
    }
    return array;
};
OpenLayers.Util.clearArray = function (array) {
    OpenLayers.Console.warn(OpenLayers.i18n("methodDeprecated", {
        'newMethod': 'array = []'
    }));
    array.length = 0;
};
OpenLayers.Util.indexOf = function (array, obj) {
    if (typeof array.indexOf == "function") {
        return array.indexOf(obj);
    } else {
        for (var i = 0, len = array.length; i < len; i++) {
            if (array[i] == obj) {
                return i;
            }
        }
        return -1;
    }
};
OpenLayers.Util.modifyDOMElement = function (element, id, px, sz, position, border, overflow, opacity) {
    if (id) {
        element.id = id;
    }
    if (px) {
        element.style.left = px.x + "px";
        element.style.top = px.y + "px";
    }
    if (sz) {
        element.style.width = sz.w + "px";
        element.style.height = sz.h + "px";
    }
    if (position) {
        element.style.position = position;
    }
    if (border) {
        element.style.border = border;
    }
    if (overflow) {
        element.style.overflow = overflow;
    }
    if (parseFloat(opacity) >= 0.0 && parseFloat(opacity) < 1.0) {
        element.style.filter = 'alpha(opacity=' + (opacity * 100) + ')';
        element.style.opacity = opacity;
    } else if (parseFloat(opacity) == 1.0) {
        element.style.filter = '';
        element.style.opacity = '';
    }
};
OpenLayers.Util.createDiv = function (id, px, sz, imgURL, position, border, overflow, opacity) {
    var dom = document.createElement('div');
    if (imgURL) {
        dom.style.backgroundImage = 'url(' + imgURL + ')';
    }
    if (!id) {
        id = OpenLayers.Util.createUniqueID("OpenLayersDiv");
    }
    if (!position) {
        position = "absolute";
    }
    OpenLayers.Util.modifyDOMElement(dom, id, px, sz, position, border, overflow, opacity);
    return dom;
};
OpenLayers.Util.createImage = function (id, px, sz, imgURL, position, border, opacity, delayDisplay) {
    var image = document.createElement("img");
    if (!id) {
        id = OpenLayers.Util.createUniqueID("OpenLayersDiv");
    }
    if (!position) {
        position = "relative";
    }
    OpenLayers.Util.modifyDOMElement(image, id, px, sz, position, border, null, opacity);
    if (delayDisplay) {
        image.style.display = "none";
        OpenLayers.Event.observe(image, "load", OpenLayers.Function.bind(OpenLayers.Util.onImageLoad, image));
        OpenLayers.Event.observe(image, "error", OpenLayers.Function.bind(OpenLayers.Util.onImageLoadError, image));
    }
    image.style.alt = id;
    image.galleryImg = "no";
    if (imgURL) {
        image.src = imgURL;
    }
    return image;
};
OpenLayers.Util.setOpacity = function (element, opacity) {
    OpenLayers.Util.modifyDOMElement(element, null, null, null, null, null, null, opacity);
};
OpenLayers.Util.onImageLoad = function () {
    if (!this.viewRequestID || (this.map && this.viewRequestID == this.map.viewRequestID)) {
        this.style.display = "";
    }
    OpenLayers.Element.removeClass(this, "olImageLoadError");
};
OpenLayers.IMAGE_RELOAD_ATTEMPTS = 0;
OpenLayers.Util.onImageLoadError = function () {
    this._attempts = (this._attempts) ? (this._attempts + 1) : 1;
    if (this._attempts <= OpenLayers.IMAGE_RELOAD_ATTEMPTS) {
        var urls = this.urls;
        if (urls && OpenLayers.Util.isArray(urls) && urls.length > 1) {
            var src = this.src.toString();
            var current_url, k;
            for (k = 0; current_url = urls[k]; k++) {
                if (src.indexOf(current_url) != -1) {
                    break;
                }
            }
            var guess = Math.floor(urls.length * Math.random());
            var new_url = urls[guess];
            k = 0;
            while (new_url == current_url && k++ < 4) {
                guess = Math.floor(urls.length * Math.random());
                new_url = urls[guess];
            }
            this.src = src.replace(current_url, new_url);
        } else {
            this.src = this.src;
        }
    } else {
        OpenLayers.Element.addClass(this, "olImageLoadError");
    }
    this.style.display = "";
};
OpenLayers.Util.alphaHackNeeded = null;
OpenLayers.Util.alphaHack = function () {
    if (OpenLayers.Util.alphaHackNeeded == null) {
        var arVersion = navigator.appVersion.split("MSIE");
        var version = parseFloat(arVersion[1]);
        var filter = false;
        try {
            filter = !! (document.body.filters);
        } catch (e) {}
        OpenLayers.Util.alphaHackNeeded = (filter && (version >= 5.5) && (version < 7));
    }
    return OpenLayers.Util.alphaHackNeeded;
};
OpenLayers.Util.modifyAlphaImageDiv = function (div, id, px, sz, imgURL, position, border, sizing, opacity) {
    OpenLayers.Util.modifyDOMElement(div, id, px, sz, position, null, null, opacity);
    var img = div.childNodes[0];
    if (imgURL) {
        img.src = imgURL;
    }
    OpenLayers.Util.modifyDOMElement(img, div.id + "_innerImage", null, sz, "relative", border);
    if (OpenLayers.Util.alphaHack()) {
        if (div.style.display != "none") {
            div.style.display = "inline-block";
        }
        if (sizing == null) {
            sizing = "scale";
        }
        div.style.filter = "progid:DXImageTransform.Microsoft" + ".AlphaImageLoader(src='" + img.src + "', " + "sizingMethod='" + sizing + "')";
        if (parseFloat(div.style.opacity) >= 0.0 && parseFloat(div.style.opacity) < 1.0) {
            div.style.filter += " alpha(opacity=" + div.style.opacity * 100 + ")";
        }
        img.style.filter = "alpha(opacity=0)";
    }
};
OpenLayers.Util.createAlphaImageDiv = function (id, px, sz, imgURL, position, border, sizing, opacity, delayDisplay) {
    var div = OpenLayers.Util.createDiv();
    var img = OpenLayers.Util.createImage(null, null, null, null, null, null, null, false);
    div.appendChild(img);
    if (delayDisplay) {
        img.style.display = "none";
        OpenLayers.Event.observe(img, "load", OpenLayers.Function.bind(OpenLayers.Util.onImageLoad, div));
        OpenLayers.Event.observe(img, "error", OpenLayers.Function.bind(OpenLayers.Util.onImageLoadError, div));
    }
    OpenLayers.Util.modifyAlphaImageDiv(div, id, px, sz, imgURL, position, border, sizing, opacity);
    return div;
};
OpenLayers.Util.upperCaseObject = function (object) {
    var uObject = {};
    for (var key in object) {
        uObject[key.toUpperCase()] = object[key];
    }
    return uObject;
};
OpenLayers.Util.applyDefaults = function (to, from) {
    to = to || {};
    var fromIsEvt = typeof window.Event == "function" && from instanceof window.Event;
    for (var key in from) {
        if (to[key] === undefined || (!fromIsEvt && from.hasOwnProperty && from.hasOwnProperty(key) && !to.hasOwnProperty(key))) {
            to[key] = from[key];
        }
    }
    if (!fromIsEvt && from && from.hasOwnProperty && from.hasOwnProperty('toString') && !to.hasOwnProperty('toString')) {
        to.toString = from.toString;
    }
    return to;
};
OpenLayers.Util.getParameterString = function (params) {
    var paramsArray = [];
    for (var key in params) {
        var value = params[key];
        if ((value != null) && (typeof value != 'function')) {
            var encodedValue;
            if (typeof value == 'object' && value.constructor == Array) {
                var encodedItemArray = [];
                var item;
                for (var itemIndex = 0, len = value.length; itemIndex < len; itemIndex++) {
                    item = value[itemIndex];
                    encodedItemArray.push(encodeURIComponent((item === null || item === undefined) ? "" : item));
                }
                encodedValue = encodedItemArray.join(",");
            } else {
                encodedValue = encodeURIComponent(value);
            }
            paramsArray.push(encodeURIComponent(key) + "=" + encodedValue);
        }
    }
    return paramsArray.join("&");
};
OpenLayers.Util.urlAppend = function (url, paramStr) {
    var newUrl = url;
    if (paramStr) {
        var parts = (url + " ").split(/[?&]/);
        newUrl += (parts.pop() === " " ? paramStr : parts.length ? "&" + paramStr : "?" + paramStr);
    }
    return newUrl;
};
OpenLayers.ImgPath = '';
OpenLayers.Util.getImagesLocation = function () {
    return OpenLayers.ImgPath || (OpenLayers._getScriptLocation() + "img/");
};
OpenLayers.Util.Try = function () {
    var returnValue = null;
    for (var i = 0, len = arguments.length; i < len; i++) {
        var lambda = arguments[i];
        try {
            returnValue = lambda();
            break;
        } catch (e) {}
    }
    return returnValue;
};
OpenLayers.Util.getXmlNodeValue = function (node) {
    var val = null;
    OpenLayers.Util.Try(function () {
        val = node.text;
        if (!val) {
            val = node.textContent;
        }
        if (!val) {
            val = node.firstChild.nodeValue;
        }
    }, function () {
        val = node.textContent;
    });
    return val;
};
OpenLayers.Util.mouseLeft = function (evt, div) {
    var target = (evt.relatedTarget) ? evt.relatedTarget : evt.toElement;
    while (target != div && target != null) {
        target = target.parentNode;
    }
    return (target != div);
};
OpenLayers.Util.DEFAULT_PRECISION = 14;
OpenLayers.Util.toFloat = function (number, precision) {
    if (precision == null) {
        precision = OpenLayers.Util.DEFAULT_PRECISION;
    }
    if (typeof number !== "number") {
        number = parseFloat(number);
    }
    return precision === 0 ? number : parseFloat(number.toPrecision(precision));
};
OpenLayers.Util.rad = function (x) {
    return x * Math.PI / 180;
};
OpenLayers.Util.deg = function (x) {
    return x * 180 / Math.PI;
};
OpenLayers.Util.VincentyConstants = {
    a: 6378137,
    b: 6356752.3142,
    f: 1 / 298.257223563
};
OpenLayers.Util.distVincenty = function (p1, p2) {
    var ct = OpenLayers.Util.VincentyConstants;
    var a = ct.a,
        b = ct.b,
        f = ct.f;
    var L = OpenLayers.Util.rad(p2.lon - p1.lon);
    var U1 = Math.atan((1 - f) * Math.tan(OpenLayers.Util.rad(p1.lat)));
    var U2 = Math.atan((1 - f) * Math.tan(OpenLayers.Util.rad(p2.lat)));
    var sinU1 = Math.sin(U1),
        cosU1 = Math.cos(U1);
    var sinU2 = Math.sin(U2),
        cosU2 = Math.cos(U2);
    var lambda = L,
        lambdaP = 2 * Math.PI;
    var iterLimit = 20;
    while (Math.abs(lambda - lambdaP) > 1e-12 && --iterLimit > 0) {
        var sinLambda = Math.sin(lambda),
            cosLambda = Math.cos(lambda);
        var sinSigma = Math.sqrt((cosU2 * sinLambda) * (cosU2 * sinLambda) + (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda));
        if (sinSigma == 0) {
            return 0;
        }
        var cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
        var sigma = Math.atan2(sinSigma, cosSigma);
        var alpha = Math.asin(cosU1 * cosU2 * sinLambda / sinSigma);
        var cosSqAlpha = Math.cos(alpha) * Math.cos(alpha);
        var cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha;
        var C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
        lambdaP = lambda;
        lambda = L + (1 - C) * f * Math.sin(alpha) * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
    }
    if (iterLimit == 0) {
        return NaN;
    }
    var uSq = cosSqAlpha * (a * a - b * b) / (b * b);
    var A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
    var B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
    var deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) - B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
    var s = b * A * (sigma - deltaSigma);
    var d = s.toFixed(3) / 1000;
    return d;
};
OpenLayers.Util.destinationVincenty = function (lonlat, brng, dist) {
    var u = OpenLayers.Util;
    var ct = u.VincentyConstants;
    var a = ct.a,
        b = ct.b,
        f = ct.f;
    var lon1 = lonlat.lon;
    var lat1 = lonlat.lat;
    var s = dist;
    var alpha1 = u.rad(brng);
    var sinAlpha1 = Math.sin(alpha1);
    var cosAlpha1 = Math.cos(alpha1);
    var tanU1 = (1 - f) * Math.tan(u.rad(lat1));
    var cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1)),
        sinU1 = tanU1 * cosU1;
    var sigma1 = Math.atan2(tanU1, cosAlpha1);
    var sinAlpha = cosU1 * sinAlpha1;
    var cosSqAlpha = 1 - sinAlpha * sinAlpha;
    var uSq = cosSqAlpha * (a * a - b * b) / (b * b);
    var A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
    var B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
    var sigma = s / (b * A),
        sigmaP = 2 * Math.PI;
    while (Math.abs(sigma - sigmaP) > 1e-12) {
        var cos2SigmaM = Math.cos(2 * sigma1 + sigma);
        var sinSigma = Math.sin(sigma);
        var cosSigma = Math.cos(sigma);
        var deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) - B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
        sigmaP = sigma;
        sigma = s / (b * A) + deltaSigma;
    }
    var tmp = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1;
    var lat2 = Math.atan2(sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1, (1 - f) * Math.sqrt(sinAlpha * sinAlpha + tmp * tmp));
    var lambda = Math.atan2(sinSigma * sinAlpha1, cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1);
    var C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
    var L = lambda - (1 - C) * f * sinAlpha * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
    var revAz = Math.atan2(sinAlpha, -tmp);
    return new OpenLayers.LonLat(lon1 + u.deg(L), u.deg(lat2));
};
OpenLayers.Util.getParameters = function (url) {
    url = (url === null || url === undefined) ? window.location.href : url;
    var paramsString = "";
    if (OpenLayers.String.contains(url, '?')) {
        var start = url.indexOf('?') + 1;
        var end = OpenLayers.String.contains(url, "#") ? url.indexOf('#') : url.length;
        paramsString = url.substring(start, end);
    }
    var parameters = {};
    var pairs = paramsString.split(/[&;]/);
    for (var i = 0, len = pairs.length; i < len; ++i) {
        var keyValue = pairs[i].split('=');
        if (keyValue[0]) {
            var key = keyValue[0];
            try {
                key = decodeURIComponent(key);
            } catch (err) {
                key = unescape(key);
            }
            var value = (keyValue[1] || '').replace(/\+/g, " ");
            try {
                value = decodeURIComponent(value);
            } catch (err) {
                value = unescape(value);
            }
            value = value.split(",");
            if (value.length == 1) {
                value = value[0];
            }
            parameters[key] = value;
        }
    }
    return parameters;
};
OpenLayers.Util.getArgs = function (url) {
    OpenLayers.Console.warn(OpenLayers.i18n("methodDeprecated", {
        'newMethod': 'OpenLayers.Util.getParameters'
    }));
    return OpenLayers.Util.getParameters(url);
};
OpenLayers.Util.lastSeqID = 0;
OpenLayers.Util.createUniqueID = function (prefix) {
    if (prefix == null) {
        prefix = "id_";
    }
    OpenLayers.Util.lastSeqID += 1;
    return prefix + OpenLayers.Util.lastSeqID;
};
OpenLayers.INCHES_PER_UNIT = {
    'inches': 1.0,
    'ft': 12.0,
    'mi': 63360.0,
    'm': 39.3701,
    'km': 39370.1,
    'dd': 4374754,
    'yd': 36
};
OpenLayers.INCHES_PER_UNIT["in"] = OpenLayers.INCHES_PER_UNIT.inches;
OpenLayers.INCHES_PER_UNIT["degrees"] = OpenLayers.INCHES_PER_UNIT.dd;
OpenLayers.INCHES_PER_UNIT["nmi"] = 1852 * OpenLayers.INCHES_PER_UNIT.m;
OpenLayers.METERS_PER_INCH = 0.02540005080010160020;
OpenLayers.Util.extend(OpenLayers.INCHES_PER_UNIT, {
    "Inch": OpenLayers.INCHES_PER_UNIT.inches,
    "Meter": 1.0 / OpenLayers.METERS_PER_INCH,
    "Foot": 0.30480060960121920243 / OpenLayers.METERS_PER_INCH,
    "IFoot": 0.30480000000000000000 / OpenLayers.METERS_PER_INCH,
    "ClarkeFoot": 0.3047972651151 / OpenLayers.METERS_PER_INCH,
    "SearsFoot": 0.30479947153867624624 / OpenLayers.METERS_PER_INCH,
    "GoldCoastFoot": 0.30479971018150881758 / OpenLayers.METERS_PER_INCH,
    "IInch": 0.02540000000000000000 / OpenLayers.METERS_PER_INCH,
    "MicroInch": 0.00002540000000000000 / OpenLayers.METERS_PER_INCH,
    "Mil": 0.00000002540000000000 / OpenLayers.METERS_PER_INCH,
    "Centimeter": 0.01000000000000000000 / OpenLayers.METERS_PER_INCH,
    "Kilometer": 1000.00000000000000000000 / OpenLayers.METERS_PER_INCH,
    "Yard": 0.91440182880365760731 / OpenLayers.METERS_PER_INCH,
    "SearsYard": 0.914398414616029 / OpenLayers.METERS_PER_INCH,
    "IndianYard": 0.91439853074444079983 / OpenLayers.METERS_PER_INCH,
    "IndianYd37": 0.91439523 / OpenLayers.METERS_PER_INCH,
    "IndianYd62": 0.9143988 / OpenLayers.METERS_PER_INCH,
    "IndianYd75": 0.9143985 / OpenLayers.METERS_PER_INCH,
    "IndianFoot": 0.30479951 / OpenLayers.METERS_PER_INCH,
    "IndianFt37": 0.30479841 / OpenLayers.METERS_PER_INCH,
    "IndianFt62": 0.3047996 / OpenLayers.METERS_PER_INCH,
    "IndianFt75": 0.3047995 / OpenLayers.METERS_PER_INCH,
    "Mile": 1609.34721869443738887477 / OpenLayers.METERS_PER_INCH,
    "IYard": 0.91440000000000000000 / OpenLayers.METERS_PER_INCH,
    "IMile": 1609.34400000000000000000 / OpenLayers.METERS_PER_INCH,
    "NautM": 1852.00000000000000000000 / OpenLayers.METERS_PER_INCH,
    "Lat-66": 110943.316488932731 / OpenLayers.METERS_PER_INCH,
    "Lat-83": 110946.25736872234125 / OpenLayers.METERS_PER_INCH,
    "Decimeter": 0.10000000000000000000 / OpenLayers.METERS_PER_INCH,
    "Millimeter": 0.00100000000000000000 / OpenLayers.METERS_PER_INCH,
    "Dekameter": 10.00000000000000000000 / OpenLayers.METERS_PER_INCH,
    "Decameter": 10.00000000000000000000 / OpenLayers.METERS_PER_INCH,
    "Hectometer": 100.00000000000000000000 / OpenLayers.METERS_PER_INCH,
    "GermanMeter": 1.0000135965 / OpenLayers.METERS_PER_INCH,
    "CaGrid": 0.999738 / OpenLayers.METERS_PER_INCH,
    "ClarkeChain": 20.1166194976 / OpenLayers.METERS_PER_INCH,
    "GunterChain": 20.11684023368047 / OpenLayers.METERS_PER_INCH,
    "BenoitChain": 20.116782494375872 / OpenLayers.METERS_PER_INCH,
    "SearsChain": 20.11676512155 / OpenLayers.METERS_PER_INCH,
    "ClarkeLink": 0.201166194976 / OpenLayers.METERS_PER_INCH,
    "GunterLink": 0.2011684023368047 / OpenLayers.METERS_PER_INCH,
    "BenoitLink": 0.20116782494375872 / OpenLayers.METERS_PER_INCH,
    "SearsLink": 0.2011676512155 / OpenLayers.METERS_PER_INCH,
    "Rod": 5.02921005842012 / OpenLayers.METERS_PER_INCH,
    "IntnlChain": 20.1168 / OpenLayers.METERS_PER_INCH,
    "IntnlLink": 0.201168 / OpenLayers.METERS_PER_INCH,
    "Perch": 5.02921005842012 / OpenLayers.METERS_PER_INCH,
    "Pole": 5.02921005842012 / OpenLayers.METERS_PER_INCH,
    "Furlong": 201.1684023368046 / OpenLayers.METERS_PER_INCH,
    "Rood": 3.778266898 / OpenLayers.METERS_PER_INCH,
    "CapeFoot": 0.3047972615 / OpenLayers.METERS_PER_INCH,
    "Brealey": 375.00000000000000000000 / OpenLayers.METERS_PER_INCH,
    "ModAmFt": 0.304812252984505969011938 / OpenLayers.METERS_PER_INCH,
    "Fathom": 1.8288 / OpenLayers.METERS_PER_INCH,
    "NautM-UK": 1853.184 / OpenLayers.METERS_PER_INCH,
    "50kilometers": 50000.0 / OpenLayers.METERS_PER_INCH,
    "150kilometers": 150000.0 / OpenLayers.METERS_PER_INCH
});
OpenLayers.Util.extend(OpenLayers.INCHES_PER_UNIT, {
    "mm": OpenLayers.INCHES_PER_UNIT["Meter"] / 1000.0,
    "cm": OpenLayers.INCHES_PER_UNIT["Meter"] / 100.0,
    "dm": OpenLayers.INCHES_PER_UNIT["Meter"] * 100.0,
    "km": OpenLayers.INCHES_PER_UNIT["Meter"] * 1000.0,
    "kmi": OpenLayers.INCHES_PER_UNIT["nmi"],
    "fath": OpenLayers.INCHES_PER_UNIT["Fathom"],
    "ch": OpenLayers.INCHES_PER_UNIT["IntnlChain"],
    "link": OpenLayers.INCHES_PER_UNIT["IntnlLink"],
    "us-in": OpenLayers.INCHES_PER_UNIT["inches"],
    "us-ft": OpenLayers.INCHES_PER_UNIT["Foot"],
    "us-yd": OpenLayers.INCHES_PER_UNIT["Yard"],
    "us-ch": OpenLayers.INCHES_PER_UNIT["GunterChain"],
    "us-mi": OpenLayers.INCHES_PER_UNIT["Mile"],
    "ind-yd": OpenLayers.INCHES_PER_UNIT["IndianYd37"],
    "ind-ft": OpenLayers.INCHES_PER_UNIT["IndianFt37"],
    "ind-ch": 20.11669506 / OpenLayers.METERS_PER_INCH
});
OpenLayers.DOTS_PER_INCH = 72;
OpenLayers.Util.normalizeScale = function (scale) {
    var normScale = (scale > 1.0) ? (1.0 / scale) : scale;
    return normScale;
};
OpenLayers.Util.getResolutionFromScale = function (scale, units) {
    var resolution;
    if (scale) {
        if (units == null) {
            units = "degrees";
        }
        var normScale = OpenLayers.Util.normalizeScale(scale);
        resolution = 1 / (normScale * OpenLayers.INCHES_PER_UNIT[units] * OpenLayers.DOTS_PER_INCH);
    }
    return resolution;
};
OpenLayers.Util.getScaleFromResolution = function (resolution, units) {
    if (units == null) {
        units = "degrees";
    }
    var scale = resolution * OpenLayers.INCHES_PER_UNIT[units] * OpenLayers.DOTS_PER_INCH;
    return scale;
};
OpenLayers.Util.safeStopPropagation = function (evt) {
    OpenLayers.Event.stop(evt, true);
};
OpenLayers.Util.pagePosition = function (forElement) {
    var pos = [0, 0];
    var viewportElement = OpenLayers.Util.getViewportElement();
    if (!forElement || forElement == window || forElement == viewportElement) {
        return pos;
    }
    var BUGGY_GECKO_BOX_OBJECT = OpenLayers.IS_GECKO && document.getBoxObjectFor && OpenLayers.Element.getStyle(forElement, 'position') == 'absolute' && (forElement.style.top == '' || forElement.style.left == '');
    var parent = null;
    var box;
    if (forElement.getBoundingClientRect) {
        box = forElement.getBoundingClientRect();
        var scrollTop = viewportElement.scrollTop;
        var scrollLeft = viewportElement.scrollLeft;
        pos[0] = box.left + scrollLeft;
        pos[1] = box.top + scrollTop;
    } else if (document.getBoxObjectFor && !BUGGY_GECKO_BOX_OBJECT) {
        box = document.getBoxObjectFor(forElement);
        var vpBox = document.getBoxObjectFor(viewportElement);
        pos[0] = box.screenX - vpBox.screenX;
        pos[1] = box.screenY - vpBox.screenY;
    } else {
        pos[0] = forElement.offsetLeft;
        pos[1] = forElement.offsetTop;
        parent = forElement.offsetParent;
        if (parent != forElement) {
            while (parent) {
                pos[0] += parent.offsetLeft;
                pos[1] += parent.offsetTop;
                parent = parent.offsetParent;
            }
        }
        var browser = OpenLayers.BROWSER_NAME;
        if (browser == "opera" || (browser == "safari" && OpenLayers.Element.getStyle(forElement, 'position') == 'absolute')) {
            pos[1] -= document.body.offsetTop;
        }
        parent = forElement.offsetParent;
        while (parent && parent != document.body) {
            pos[0] -= parent.scrollLeft;
            if (browser != "opera" || parent.tagName != 'TR') {
                pos[1] -= parent.scrollTop;
            }
            parent = parent.offsetParent;
        }
    }
    return pos;
};
OpenLayers.Util.getViewportElement = function () {
    var viewportElement = arguments.callee.viewportElement;
    if (viewportElement == undefined) {
        viewportElement = (OpenLayers.BROWSER_NAME == "msie" && document.compatMode != 'CSS1Compat') ? document.body : document.documentElement;
        arguments.callee.viewportElement = viewportElement;
    }
    return viewportElement;
};
OpenLayers.Util.isEquivalentUrl = function (url1, url2, options) {
    options = options || {};
    OpenLayers.Util.applyDefaults(options, {
        ignoreCase: true,
        ignorePort80: true,
        ignoreHash: true
    });
    var urlObj1 = OpenLayers.Util.createUrlObject(url1, options);
    var urlObj2 = OpenLayers.Util.createUrlObject(url2, options);
    for (var key in urlObj1) {
        if (key !== "args") {
            if (urlObj1[key] != urlObj2[key]) {
                return false;
            }
        }
    }
    for (var key in urlObj1.args) {
        if (urlObj1.args[key] != urlObj2.args[key]) {
            return false;
        }
        delete urlObj2.args[key];
    }
    for (var key in urlObj2.args) {
        return false;
    }
    return true;
};
OpenLayers.Util.createUrlObject = function (url, options) {
    options = options || {};
    if (!(/^\w+:\/\//).test(url)) {
        var loc = window.location;
        var port = loc.port ? ":" + loc.port : "";
        var fullUrl = loc.protocol + "//" + loc.host.split(":").shift() + port;
        if (url.indexOf("/") === 0) {
            url = fullUrl + url;
        } else {
            var parts = loc.pathname.split("/");
            parts.pop();
            url = fullUrl + parts.join("/") + "/" + url;
        }
    }
    if (options.ignoreCase) {
        url = url.toLowerCase();
    }
    var a = document.createElement('a');
    a.href = url;
    var urlObject = {};
    urlObject.host = a.host.split(":").shift();
    urlObject.protocol = a.protocol;
    if (options.ignorePort80) {
        urlObject.port = (a.port == "80" || a.port == "0") ? "" : a.port;
    } else {
        urlObject.port = (a.port == "" || a.port == "0") ? "80" : a.port;
    }
    urlObject.hash = (options.ignoreHash || a.hash === "#") ? "" : a.hash;
    var queryString = a.search;
    if (!queryString) {
        var qMark = url.indexOf("?");
        queryString = (qMark != -1) ? url.substr(qMark) : "";
    }
    urlObject.args = OpenLayers.Util.getParameters(queryString);
    urlObject.pathname = (a.pathname.charAt(0) == "/") ? a.pathname : "/" + a.pathname;
    return urlObject;
};
OpenLayers.Util.removeTail = function (url) {
    var head = null;
    var qMark = url.indexOf("?");
    var hashMark = url.indexOf("#");
    if (qMark == -1) {
        head = (hashMark != -1) ? url.substr(0, hashMark) : url;
    } else {
        head = (hashMark != -1) ? url.substr(0, Math.min(qMark, hashMark)) : url.substr(0, qMark);
    }
    return head;
};
OpenLayers.IS_GECKO = (function () {
    var ua = navigator.userAgent.toLowerCase();
    return ua.indexOf("webkit") == -1 && ua.indexOf("gecko") != -1;
})();
OpenLayers.BROWSER_NAME = (function () {
    var name = "";
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf("opera") != -1) {
        name = "opera";
    } else if (ua.indexOf("msie") != -1) {
        name = "msie";
    } else if (ua.indexOf("safari") != -1) {
        name = "safari";
    } else if (ua.indexOf("mozilla") != -1) {
        if (ua.indexOf("firefox") != -1) {
            name = "firefox";
        } else {
            name = "mozilla";
        }
    }
    return name;
})();
OpenLayers.Util.getBrowserName = function () {
    return OpenLayers.BROWSER_NAME;
};
OpenLayers.Util.getRenderedDimensions = function (contentHTML, size, options) {
    var w, h;
    var container = document.createElement("div");
    container.style.visibility = "hidden";
    var containerElement = (options && options.containerElement) ? options.containerElement : document.body;
    if (size) {
        if (size.w) {
            w = size.w;
            container.style.width = w + "px";
        } else if (size.h) {
            h = size.h;
            container.style.height = h + "px";
        }
    }
    if (options && options.displayClass) {
        container.className = options.displayClass;
    }
    var content = document.createElement("div");
    content.innerHTML = contentHTML;
    content.style.overflow = "visible";
    if (content.childNodes) {
        for (var i = 0, l = content.childNodes.length; i < l; i++) {
            if (!content.childNodes[i].style) continue;
            content.childNodes[i].style.overflow = "visible";
        }
    }
    container.appendChild(content);
    containerElement.appendChild(container);
    var parentHasPositionAbsolute = false;
    var parent = container.parentNode;
    while (parent && parent.tagName.toLowerCase() != "body") {
        var parentPosition = OpenLayers.Element.getStyle(parent, "position");
        if (parentPosition == "absolute") {
            parentHasPositionAbsolute = true;
            break;
        } else if (parentPosition && parentPosition != "static") {
            break;
        }
        parent = parent.parentNode;
    }
    if (!parentHasPositionAbsolute) {
        container.style.position = "absolute";
    }
    if (!w) {
        w = parseInt(content.scrollWidth);
        container.style.width = w + "px";
    }
    if (!h) {
        h = parseInt(content.scrollHeight);
    }
    container.removeChild(content);
    containerElement.removeChild(container);
    return new OpenLayers.Size(w, h);
};
OpenLayers.Util.getScrollbarWidth = function () {
    var scrollbarWidth = OpenLayers.Util._scrollbarWidth;
    if (scrollbarWidth == null) {
        var scr = null;
        var inn = null;
        var wNoScroll = 0;
        var wScroll = 0;
        scr = document.createElement('div');
        scr.style.position = 'absolute';
        scr.style.top = '-1000px';
        scr.style.left = '-1000px';
        scr.style.width = '100px';
        scr.style.height = '50px';
        scr.style.overflow = 'hidden';
        inn = document.createElement('div');
        inn.style.width = '100%';
        inn.style.height = '200px';
        scr.appendChild(inn);
        document.body.appendChild(scr);
        wNoScroll = inn.offsetWidth;
        scr.style.overflow = 'scroll';
        wScroll = inn.offsetWidth;
        document.body.removeChild(document.body.lastChild);
        OpenLayers.Util._scrollbarWidth = (wNoScroll - wScroll);
        scrollbarWidth = OpenLayers.Util._scrollbarWidth;
    }
    return scrollbarWidth;
};
OpenLayers.Util.getFormattedLonLat = function (coordinate, axis, dmsOption) {
    if (!dmsOption) {
        dmsOption = 'dms';
    }
    coordinate = (coordinate + 540) % 360 - 180;
    var abscoordinate = Math.abs(coordinate);
    var coordinatedegrees = Math.floor(abscoordinate);
    var coordinateminutes = (abscoordinate - coordinatedegrees) / (1 / 60);
    var tempcoordinateminutes = coordinateminutes;
    coordinateminutes = Math.floor(coordinateminutes);
    var coordinateseconds = (tempcoordinateminutes - coordinateminutes) / (1 / 60);
    coordinateseconds = Math.round(coordinateseconds * 10);
    coordinateseconds /= 10;
    if (coordinateseconds >= 60) {
        coordinateseconds -= 60;
        coordinateminutes += 1;
        if (coordinateminutes >= 60) {
            coordinateminutes -= 60;
            coordinatedegrees += 1;
        }
    }
    if (coordinatedegrees < 10) {
        coordinatedegrees = "0" + coordinatedegrees;
    }
    var str = coordinatedegrees + "\u00B0";
    if (dmsOption.indexOf('dm') >= 0) {
        if (coordinateminutes < 10) {
            coordinateminutes = "0" + coordinateminutes;
        }
        str += coordinateminutes + "'";
        if (dmsOption.indexOf('dms') >= 0) {
            if (coordinateseconds < 10) {
                coordinateseconds = "0" + coordinateseconds;
            }
            str += coordinateseconds + '"';
        }
    }
    if (axis == "lon") {
        str += coordinate < 0 ? OpenLayers.i18n("W") : OpenLayers.i18n("E");
    } else {
        str += coordinate < 0 ? OpenLayers.i18n("S") : OpenLayers.i18n("N");
    }
    return str;
};
OpenLayers.Feature = OpenLayers.Class({
    layer: null,
    id: null,
    lonlat: null,
    data: null,
    marker: null,
    popupClass: null,
    popup: null,
    initialize: function (layer, lonlat, data) {
        this.layer = layer;
        this.lonlat = lonlat;
        this.data = (data != null) ? data : {};
        this.id = OpenLayers.Util.createUniqueID(this.CLASS_NAME + "_");
    },
    destroy: function () {
        if ((this.layer != null) && (this.layer.map != null)) {
            if (this.popup != null) {
                this.layer.map.removePopup(this.popup);
            }
        }
        if (this.layer != null && this.marker != null) {
            this.layer.removeMarker(this.marker);
        }
        this.layer = null;
        this.id = null;
        this.lonlat = null;
        this.data = null;
        if (this.marker != null) {
            this.destroyMarker(this.marker);
            this.marker = null;
        }
        if (this.popup != null) {
            this.destroyPopup(this.popup);
            this.popup = null;
        }
    },
    onScreen: function () {
        var onScreen = false;
        if ((this.layer != null) && (this.layer.map != null)) {
            var screenBounds = this.layer.map.getExtent();
            onScreen = screenBounds.containsLonLat(this.lonlat);
        }
        return onScreen;
    },
    createMarker: function () {
        if (this.lonlat != null) {
            this.marker = new OpenLayers.Marker(this.lonlat, this.data.icon);
        }
        return this.marker;
    },
    destroyMarker: function () {
        this.marker.destroy();
    },
    createPopup: function (closeBox) {
        if (this.lonlat != null) {
            if (!this.popup) {
                var anchor = (this.marker) ? this.marker.icon : null;
                var popupClass = this.popupClass ? this.popupClass : OpenLayers.Popup.AnchoredBubble;
                this.popup = new popupClass(this.id + "_popup", this.lonlat, this.data.popupSize, this.data.popupContentHTML, anchor, closeBox);
            }
            if (this.data.overflow != null) {
                this.popup.contentDiv.style.overflow = this.data.overflow;
            }
            this.popup.feature = this;
        }
        return this.popup;
    },
    destroyPopup: function () {
        if (this.popup) {
            this.popup.feature = null;
            this.popup.destroy();
            this.popup = null;
        }
    },
    CLASS_NAME: "OpenLayers.Feature"
});
OpenLayers.State = {
    UNKNOWN: 'Unknown',
    INSERT: 'Insert',
    UPDATE: 'Update',
    DELETE: 'Delete'
};
OpenLayers.Feature.Vector = OpenLayers.Class(OpenLayers.Feature, {
    fid: null,
    geometry: null,
    attributes: null,
    bounds: null,
    state: null,
    style: null,
    url: null,
    renderIntent: "default",
    modified: null,
    initialize: function (geometry, attributes, style) {
        OpenLayers.Feature.prototype.initialize.apply(this, [null, null, attributes]);
        this.lonlat = null;
        this.geometry = geometry ? geometry : null;
        this.state = null;
        this.attributes = {};
        if (attributes) {
            this.attributes = OpenLayers.Util.extend(this.attributes, attributes);
        }
        this.style = style ? style : null;
    },
    destroy: function () {
        if (this.layer) {
            this.layer.removeFeatures(this);
            this.layer = null;
        }
        this.geometry = null;
        this.modified = null;
        OpenLayers.Feature.prototype.destroy.apply(this, arguments);
    },
    clone: function () {
        return new OpenLayers.Feature.Vector(this.geometry ? this.geometry.clone() : null, this.attributes, this.style);
    },
    onScreen: function (boundsOnly) {
        var onScreen = false;
        if (this.layer && this.layer.map) {
            var screenBounds = this.layer.map.getExtent();
            if (boundsOnly) {
                var featureBounds = this.geometry.getBounds();
                onScreen = screenBounds.intersectsBounds(featureBounds);
            } else {
                var screenPoly = screenBounds.toGeometry();
                onScreen = screenPoly.intersects(this.geometry);
            }
        }
        return onScreen;
    },
    getVisibility: function () {
        return !(this.style && this.style.display == 'none' || !this.layer || this.layer && this.layer.styleMap && this.layer.styleMap.createSymbolizer(this, this.renderIntent).display == 'none' || this.layer && !this.layer.getVisibility());
    },
    createMarker: function () {
        return null;
    },
    destroyMarker: function () {},
    createPopup: function () {
        return null;
    },
    atPoint: function (lonlat, toleranceLon, toleranceLat) {
        var atPoint = false;
        if (this.geometry) {
            atPoint = this.geometry.atPoint(lonlat, toleranceLon, toleranceLat);
        }
        return atPoint;
    },
    destroyPopup: function () {},
    move: function (location) {
        if (!this.layer || !this.geometry.move) {
            return undefined;
        }
        var pixel;
        if (location.CLASS_NAME == "OpenLayers.LonLat") {
            pixel = this.layer.getViewPortPxFromLonLat(location);
        } else {
            pixel = location;
        }
        var lastPixel = this.layer.getViewPortPxFromLonLat(this.geometry.getBounds().getCenterLonLat());
        var res = this.layer.map.getResolution();
        this.geometry.move(res * (pixel.x - lastPixel.x), res * (lastPixel.y - pixel.y));
        this.layer.drawFeature(this);
        return lastPixel;
    },
    toState: function (state) {
        if (state == OpenLayers.State.UPDATE) {
            switch (this.state) {
            case OpenLayers.State.UNKNOWN:
            case OpenLayers.State.DELETE:
                this.state = state;
                break;
            case OpenLayers.State.UPDATE:
            case OpenLayers.State.INSERT:
                break;
            }
        } else if (state == OpenLayers.State.INSERT) {
            switch (this.state) {
            case OpenLayers.State.UNKNOWN:
                break;
            default:
                this.state = state;
                break;
            }
        } else if (state == OpenLayers.State.DELETE) {
            switch (this.state) {
            case OpenLayers.State.INSERT:
                break;
            case OpenLayers.State.DELETE:
                break;
            case OpenLayers.State.UNKNOWN:
            case OpenLayers.State.UPDATE:
                this.state = state;
                break;
            }
        } else if (state == OpenLayers.State.UNKNOWN) {
            this.state = state;
        }
    },
    CLASS_NAME: "OpenLayers.Feature.Vector"
});
OpenLayers.Feature.Vector.style = {
    'default': {
        fillColor: "#ee9900",
        fillOpacity: 0.4,
        hoverFillColor: "white",
        hoverFillOpacity: 0.8,
        strokeColor: "#ee9900",
        strokeOpacity: 1,
        strokeWidth: 1,
        strokeLinecap: "round",
        strokeDashstyle: "solid",
        hoverStrokeColor: "red",
        hoverStrokeOpacity: 1,
        hoverStrokeWidth: 0.2,
        pointRadius: 6,
        hoverPointRadius: 1,
        hoverPointUnit: "%",
        pointerEvents: "visiblePainted",
        cursor: "inherit"
    },
    'select': {
        fillColor: "blue",
        fillOpacity: 0.4,
        hoverFillColor: "white",
        hoverFillOpacity: 0.8,
        strokeColor: "blue",
        strokeOpacity: 1,
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeDashstyle: "solid",
        hoverStrokeColor: "red",
        hoverStrokeOpacity: 1,
        hoverStrokeWidth: 0.2,
        pointRadius: 6,
        hoverPointRadius: 1,
        hoverPointUnit: "%",
        pointerEvents: "visiblePainted",
        cursor: "pointer"
    },
    'temporary': {
        fillColor: "#66cccc",
        fillOpacity: 0.2,
        hoverFillColor: "white",
        hoverFillOpacity: 0.8,
        strokeColor: "#66cccc",
        strokeOpacity: 1,
        strokeLinecap: "round",
        strokeWidth: 2,
        strokeDashstyle: "solid",
        hoverStrokeColor: "red",
        hoverStrokeOpacity: 1,
        hoverStrokeWidth: 0.2,
        pointRadius: 6,
        hoverPointRadius: 1,
        hoverPointUnit: "%",
        pointerEvents: "visiblePainted",
        cursor: "inherit"
    },
    'delete': {
        display: "none"
    }
};
OpenLayers.Control = OpenLayers.Class({
    id: null,
    map: null,
    div: null,
    type: null,
    allowSelection: false,
    displayClass: "",
    title: "",
    autoActivate: false,
    active: null,
    handler: null,
    eventListeners: null,
    events: null,
    EVENT_TYPES: ["activate", "deactivate"],
    initialize: function (options) {
        this.displayClass = this.CLASS_NAME.replace("OpenLayers.", "ol").replace(/\./g, "");
        OpenLayers.Util.extend(this, options);
        this.events = new OpenLayers.Events(this, null, this.EVENT_TYPES);
        if (this.eventListeners instanceof Object) {
            this.events.on(this.eventListeners);
        }
        if (this.id == null) {
            this.id = OpenLayers.Util.createUniqueID(this.CLASS_NAME + "_");
        }
    },
    destroy: function () {
        if (this.events) {
            if (this.eventListeners) {
                this.events.un(this.eventListeners);
            }
            this.events.destroy();
            this.events = null;
        }
        this.eventListeners = null;
        if (this.handler) {
            this.handler.destroy();
            this.handler = null;
        }
        if (this.handlers) {
            for (var key in this.handlers) {
                if (this.handlers.hasOwnProperty(key) && typeof this.handlers[key].destroy == "function") {
                    this.handlers[key].destroy();
                }
            }
            this.handlers = null;
        }
        if (this.map) {
            this.map.removeControl(this);
            this.map = null;
        }
        this.div = null;
    },
    setMap: function (map) {
        this.map = map;
        if (this.handler) {
            this.handler.setMap(map);
        }
    },
    draw: function (px) {
        if (this.div == null) {
            this.div = OpenLayers.Util.createDiv(this.id);
            this.div.className = this.displayClass;
            if (!this.allowSelection) {
                this.div.className += " olControlNoSelect";
                this.div.setAttribute("unselectable", "on", 0);
                this.div.onselectstart = OpenLayers.Function.False;
            }
            if (this.title != "") {
                this.div.title = this.title;
            }
        }
        if (px != null) {
            this.position = px.clone();
        }
        this.moveTo(this.position);
        return this.div;
    },
    moveTo: function (px) {
        if ((px != null) && (this.div != null)) {
            this.div.style.left = px.x + "px";
            this.div.style.top = px.y + "px";
        }
    },
    activate: function () {
        if (this.active) {
            return false;
        }
        if (this.handler) {
            this.handler.activate();
        }
        this.active = true;
        if (this.map) {
            OpenLayers.Element.addClass(this.map.viewPortDiv, this.displayClass.replace(/ /g, "") + "Active");
        }
        this.events.triggerEvent("activate");
        return true;
    },
    deactivate: function () {
        if (this.active) {
            if (this.handler) {
                this.handler.deactivate();
            }
            this.active = false;
            if (this.map) {
                OpenLayers.Element.removeClass(this.map.viewPortDiv, this.displayClass.replace(/ /g, "") + "Active");
            }
            this.events.triggerEvent("deactivate");
            return true;
        }
        return false;
    },
    CLASS_NAME: "OpenLayers.Control"
});
OpenLayers.Control.TYPE_BUTTON = 1;
OpenLayers.Control.TYPE_TOGGLE = 2;
OpenLayers.Control.TYPE_TOOL = 3;
OpenLayers.Control.ZoomIn = OpenLayers.Class(OpenLayers.Control, {
    type: OpenLayers.Control.TYPE_BUTTON,
    trigger: function () {
        this.map.zoomIn();
    },
    CLASS_NAME: "OpenLayers.Control.ZoomIn"
});
OpenLayers.Event = {
    observers: false,
    KEY_BACKSPACE: 8,
    KEY_TAB: 9,
    KEY_RETURN: 13,
    KEY_ESC: 27,
    KEY_LEFT: 37,
    KEY_UP: 38,
    KEY_RIGHT: 39,
    KEY_DOWN: 40,
    KEY_DELETE: 46,
    element: function (event) {
        return event.target || event.srcElement;
    },
    isSingleTouch: function (event) {
        return event.touches && event.touches.length == 1;
    },
    isMultiTouch: function (event) {
        return event.touches && event.touches.length > 1;
    },
    isLeftClick: function (event) {
        return (((event.which) && (event.which == 1)) || ((event.button) && (event.button == 1)));
    },
    isRightClick: function (event) {
        return (((event.which) && (event.which == 3)) || ((event.button) && (event.button == 2)));
    },
    stop: function (event, allowDefault) {
        if (!allowDefault) {
            if (event.preventDefault) {
                event.preventDefault();
            } else {
                event.returnValue = false;
            }
        }
        if (event.stopPropagation) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    },
    findElement: function (event, tagName) {
        var element = OpenLayers.Event.element(event);
        while (element.parentNode && (!element.tagName || (element.tagName.toUpperCase() != tagName.toUpperCase()))) {
            element = element.parentNode;
        }
        return element;
    },
    observe: function (elementParam, name, observer, useCapture) {
        var element = OpenLayers.Util.getElement(elementParam);
        useCapture = useCapture || false;
        if (name == 'keypress' && (navigator.appVersion.match(/Konqueror|Safari|KHTML/) || element.attachEvent)) {
            name = 'keydown';
        }
        if (!this.observers) {
            this.observers = {};
        }
        if (!element._eventCacheID) {
            var idPrefix = "eventCacheID_";
            if (element.id) {
                idPrefix = element.id + "_" + idPrefix;
            }
            element._eventCacheID = OpenLayers.Util.createUniqueID(idPrefix);
        }
        var cacheID = element._eventCacheID;
        if (!this.observers[cacheID]) {
            this.observers[cacheID] = [];
        }
        this.observers[cacheID].push({
            'element': element,
            'name': name,
            'observer': observer,
            'useCapture': useCapture
        });
        if (element.addEventListener) {
            element.addEventListener(name, observer, useCapture);
        } else if (element.attachEvent) {
            element.attachEvent('on' + name, observer);
        }
    },
    stopObservingElement: function (elementParam) {
        var element = OpenLayers.Util.getElement(elementParam);
        var cacheID = element._eventCacheID;
        this._removeElementObservers(OpenLayers.Event.observers[cacheID]);
    },
    _removeElementObservers: function (elementObservers) {
        if (elementObservers) {
            for (var i = elementObservers.length - 1; i >= 0; i--) {
                var entry = elementObservers[i];
                var args = new Array(entry.element, entry.name, entry.observer, entry.useCapture);
                var removed = OpenLayers.Event.stopObserving.apply(this, args);
            }
        }
    },
    stopObserving: function (elementParam, name, observer, useCapture) {
        useCapture = useCapture || false;
        var element = OpenLayers.Util.getElement(elementParam);
        var cacheID = element._eventCacheID;
        if (name == 'keypress') {
            if (navigator.appVersion.match(/Konqueror|Safari|KHTML/) || element.detachEvent) {
                name = 'keydown';
            }
        }
        var foundEntry = false;
        var elementObservers = OpenLayers.Event.observers[cacheID];
        if (elementObservers) {
            var i = 0;
            while (!foundEntry && i < elementObservers.length) {
                var cacheEntry = elementObservers[i];
                if ((cacheEntry.name == name) && (cacheEntry.observer == observer) && (cacheEntry.useCapture == useCapture)) {
                    elementObservers.splice(i, 1);
                    if (elementObservers.length == 0) {
                        delete OpenLayers.Event.observers[cacheID];
                    }
                    foundEntry = true;
                    break;
                }
                i++;
            }
        }
        if (foundEntry) {
            if (element.removeEventListener) {
                element.removeEventListener(name, observer, useCapture);
            } else if (element && element.detachEvent) {
                element.detachEvent('on' + name, observer);
            }
        }
        return foundEntry;
    },
    unloadCache: function () {
        if (OpenLayers.Event && OpenLayers.Event.observers) {
            for (var cacheID in OpenLayers.Event.observers) {
                var elementObservers = OpenLayers.Event.observers[cacheID];
                OpenLayers.Event._removeElementObservers.apply(this, [elementObservers]);
            }
            OpenLayers.Event.observers = false;
        }
    },
    CLASS_NAME: "OpenLayers.Event"
};
OpenLayers.Event.observe(window, 'unload', OpenLayers.Event.unloadCache, false);
if (window.Event) {
    OpenLayers.Util.applyDefaults(window.Event, OpenLayers.Event);
} else {
    var Event = OpenLayers.Event;
}
OpenLayers.Events = OpenLayers.Class({
    BROWSER_EVENTS: ["mouseover", "mouseout", "mousedown", "mouseup", "mousemove", "click", "dblclick", "rightclick", "dblrightclick", "resize", "focus", "blur", "touchstart", "touchmove", "touchend"],
    listeners: null,
    object: null,
    element: null,
    eventTypes: null,
    eventHandler: null,
    fallThrough: null,
    includeXY: false,
    clearMouseListener: null,
    initialize: function (object, element, eventTypes, fallThrough, options) {
        OpenLayers.Util.extend(this, options);
        this.object = object;
        this.fallThrough = fallThrough;
        this.listeners = {};
        this.eventHandler = OpenLayers.Function.bindAsEventListener(this.handleBrowserEvent, this);
        this.clearMouseListener = OpenLayers.Function.bind(this.clearMouseCache, this);
        this.eventTypes = [];
        if (eventTypes != null) {
            for (var i = 0, len = eventTypes.length; i < len; i++) {
                this.addEventType(eventTypes[i]);
            }
        }
        if (element != null) {
            this.attachToElement(element);
        }
    },
    destroy: function () {
        if (this.element) {
            OpenLayers.Event.stopObservingElement(this.element);
            if (this.element.hasScrollEvent) {
                OpenLayers.Event.stopObserving(window, "scroll", this.clearMouseListener);
            }
        }
        this.element = null;
        this.listeners = null;
        this.object = null;
        this.eventTypes = null;
        this.fallThrough = null;
        this.eventHandler = null;
    },
    addEventType: function (eventName) {
        if (!this.listeners[eventName]) {
            this.eventTypes.push(eventName);
            this.listeners[eventName] = [];
        }
    },
    attachToElement: function (element) {
        if (this.element) {
            OpenLayers.Event.stopObservingElement(this.element);
        }
        this.element = element;
        for (var i = 0, len = this.BROWSER_EVENTS.length; i < len; i++) {
            var eventType = this.BROWSER_EVENTS[i];
            this.addEventType(eventType);
            OpenLayers.Event.observe(element, eventType, this.eventHandler);
        }
        OpenLayers.Event.observe(element, "dragstart", OpenLayers.Event.stop);
    },
    on: function (object) {
        for (var type in object) {
            if (type != "scope") {
                this.register(type, object.scope, object[type]);
            }
        }
    },
    register: function (type, obj, func) {
        if ((func != null) && (OpenLayers.Util.indexOf(this.eventTypes, type) != -1)) {
            if (obj == null) {
                obj = this.object;
            }
            var listeners = this.listeners[type];
            listeners.push({
                obj: obj,
                func: func
            });
        }
    },
    registerPriority: function (type, obj, func) {
        if (func != null) {
            if (obj == null) {
                obj = this.object;
            }
            var listeners = this.listeners[type];
            if (listeners != null) {
                listeners.unshift({
                    obj: obj,
                    func: func
                });
            }
        }
    },
    un: function (object) {
        for (var type in object) {
            if (type != "scope") {
                this.unregister(type, object.scope, object[type]);
            }
        }
    },
    unregister: function (type, obj, func) {
        if (obj == null) {
            obj = this.object;
        }
        var listeners = this.listeners[type];
        if (listeners != null) {
            for (var i = 0, len = listeners.length; i < len; i++) {
                if (listeners[i].obj == obj && listeners[i].func == func) {
                    listeners.splice(i, 1);
                    break;
                }
            }
        }
    },
    remove: function (type) {
        if (this.listeners[type] != null) {
            this.listeners[type] = [];
        }
    },
    triggerEvent: function (type, evt) {
        var listeners = this.listeners[type];
        if (!listeners || listeners.length == 0) {
            return undefined;
        }
        if (evt == null) {
            evt = {};
        }
        evt.object = this.object;
        evt.element = this.element;
        if (!evt.type) {
            evt.type = type;
        }
        listeners = listeners.slice();
        var continueChain;
        for (var i = 0, len = listeners.length; i < len; i++) {
            var callback = listeners[i];
            continueChain = callback.func.apply(callback.obj, [evt]);
            if ((continueChain != undefined) && (continueChain == false)) {
                break;
            }
        }
        if (!this.fallThrough) {
            OpenLayers.Event.stop(evt, true);
        }
        return continueChain;
    },
    handleBrowserEvent: function (evt) {
        var type = evt.type,
            listeners = this.listeners[type];
        if (!listeners || listeners.length == 0) {
            return;
        }
        var touches = evt.touches;
        if (touches && touches[0]) {
            var x = 0;
            var y = 0;
            var num = touches.length;
            var touch;
            for (var i = 0; i < num; ++i) {
                touch = touches[i];
                x += touch.clientX;
                y += touch.clientY;
            }
            evt.clientX = x / num;
            evt.clientY = y / num;
        }
        if (this.includeXY) {
            evt.xy = this.getMousePosition(evt);
        }
        this.triggerEvent(type, evt);
    },
    clearMouseCache: function () {
        this.element.scrolls = null;
        this.element.lefttop = null;
        var body = document.body;
        if (body && !((body.scrollTop != 0 || body.scrollLeft != 0) && navigator.userAgent.match(/iPhone/i))) {
            this.element.offsets = null;
        }
    },
    getMousePosition: function (evt) {
        if (!this.includeXY) {
            this.clearMouseCache();
        } else if (!this.element.hasScrollEvent) {
            OpenLayers.Event.observe(window, "scroll", this.clearMouseListener);
            this.element.hasScrollEvent = true;
        }
        if (!this.element.scrolls) {
            var viewportElement = OpenLayers.Util.getViewportElement();
            this.element.scrolls = [viewportElement.scrollLeft, viewportElement.scrollTop];
        }
        if (!this.element.lefttop) {
            this.element.lefttop = [(document.documentElement.clientLeft || 0), (document.documentElement.clientTop || 0)];
        }
        if (!this.element.offsets) {
            this.element.offsets = OpenLayers.Util.pagePosition(this.element);
        }
        return new OpenLayers.Pixel((evt.clientX + this.element.scrolls[0]) - this.element.offsets[0] - this.element.lefttop[0], (evt.clientY + this.element.scrolls[1]) - this.element.offsets[1] - this.element.lefttop[1]);
    },
    CLASS_NAME: "OpenLayers.Events"
});
OpenLayers.Handler = OpenLayers.Class({
    id: null,
    control: null,
    map: null,
    keyMask: null,
    active: false,
    evt: null,
    initialize: function (control, callbacks, options) {
        OpenLayers.Util.extend(this, options);
        this.control = control;
        this.callbacks = callbacks;
        var map = this.map || control.map;
        if (map) {
            this.setMap(map);
        }
        this.id = OpenLayers.Util.createUniqueID(this.CLASS_NAME + "_");
    },
    setMap: function (map) {
        this.map = map;
    },
    checkModifiers: function (evt) {
        if (this.keyMask == null) {
            return true;
        }
        var keyModifiers = (evt.shiftKey ? OpenLayers.Handler.MOD_SHIFT : 0) | (evt.ctrlKey ? OpenLayers.Handler.MOD_CTRL : 0) | (evt.altKey ? OpenLayers.Handler.MOD_ALT : 0);
        return (keyModifiers == this.keyMask);
    },
    activate: function () {
        if (this.active) {
            return false;
        }
        var events = OpenLayers.Events.prototype.BROWSER_EVENTS;
        for (var i = 0, len = events.length; i < len; i++) {
            if (this[events[i]]) {
                this.register(events[i], this[events[i]]);
            }
        }
        this.active = true;
        return true;
    },
    deactivate: function () {
        if (!this.active) {
            return false;
        }
        var events = OpenLayers.Events.prototype.BROWSER_EVENTS;
        for (var i = 0, len = events.length; i < len; i++) {
            if (this[events[i]]) {
                this.unregister(events[i], this[events[i]]);
            }
        }
        this.active = false;
        return true;
    },
    callback: function (name, args) {
        if (name && this.callbacks[name]) {
            this.callbacks[name].apply(this.control, args);
        }
    },
    register: function (name, method) {
        this.map.events.registerPriority(name, this, method);
        this.map.events.registerPriority(name, this, this.setEvent);
    },
    unregister: function (name, method) {
        this.map.events.unregister(name, this, method);
        this.map.events.unregister(name, this, this.setEvent);
    },
    setEvent: function (evt) {
        this.evt = evt;
        return true;
    },
    destroy: function () {
        this.deactivate();
        this.control = this.map = null;
    },
    CLASS_NAME: "OpenLayers.Handler"
});
OpenLayers.Handler.MOD_NONE = 0;
OpenLayers.Handler.MOD_SHIFT = 1;
OpenLayers.Handler.MOD_CTRL = 2;
OpenLayers.Handler.MOD_ALT = 4;
OpenLayers.Handler.Drag = OpenLayers.Class(OpenLayers.Handler, {
    started: false,
    stopDown: true,
    dragging: false,
    touch: false,
    last: null,
    start: null,
    lastMoveEvt: null,
    oldOnselectstart: null,
    interval: 0,
    timeoutId: null,
    documentDrag: false,
    documentEvents: null,
    initialize: function (control, callbacks, options) {
        OpenLayers.Handler.prototype.initialize.apply(this, arguments);
        if (this.documentDrag === true) {
            var me = this;
            this._docMove = function (evt) {
                me.mousemove({
                    xy: {
                        x: evt.clientX,
                        y: evt.clientY
                    },
                    element: document
                });
            };
            this._docUp = function (evt) {
                me.mouseup({
                    xy: {
                        x: evt.clientX,
                        y: evt.clientY
                    }
                });
            };
        }
    },
    dragstart: function (evt) {
        var propagate = true;
        this.dragging = false;
        if (this.checkModifiers(evt) && (OpenLayers.Event.isLeftClick(evt) || OpenLayers.Event.isSingleTouch(evt))) {
            this.started = true;
            this.start = evt.xy;
            this.last = evt.xy;
            OpenLayers.Element.addClass(this.map.viewPortDiv, "olDragDown");
            this.down(evt);
            this.callback("down", [evt.xy]);
            OpenLayers.Event.stop(evt);
            if (!this.oldOnselectstart) {
                this.oldOnselectstart = document.onselectstart ? document.onselectstart : OpenLayers.Function.True;
            }
            document.onselectstart = OpenLayers.Function.False;
            propagate = !this.stopDown;
        } else {
            this.started = false;
            this.start = null;
            this.last = null;
        }
        return propagate;
    },
    dragmove: function (evt) {
        this.lastMoveEvt = evt;
        if (this.started && !this.timeoutId && (evt.xy.x != this.last.x || evt.xy.y != this.last.y)) {
            if (this.documentDrag === true && this.documentEvents) {
                if (evt.element === document) {
                    this.adjustXY(evt);
                    this.setEvent(evt);
                } else {
                    this.removeDocumentEvents();
                }
            }
            if (this.interval > 0) {
                this.timeoutId = setTimeout(OpenLayers.Function.bind(this.removeTimeout, this), this.interval);
            }
            this.dragging = true;
            this.move(evt);
            this.callback("move", [evt.xy]);
            if (!this.oldOnselectstart) {
                this.oldOnselectstart = document.onselectstart;
                document.onselectstart = OpenLayers.Function.False;
            }
            this.last = evt.xy;
        }
        return true;
    },
    dragend: function (evt) {
        if (this.started) {
            if (this.documentDrag === true && this.documentEvents) {
                this.adjustXY(evt);
                this.removeDocumentEvents();
            }
            var dragged = (this.start != this.last);
            this.started = false;
            this.dragging = false;
            OpenLayers.Element.removeClass(this.map.viewPortDiv, "olDragDown");
            this.up(evt);
            this.callback("up", [evt.xy]);
            if (dragged) {
                this.callback("done", [evt.xy]);
            }
            document.onselectstart = this.oldOnselectstart;
        }
        return true;
    },
    down: function (evt) {},
    move: function (evt) {},
    up: function (evt) {},
    out: function (evt) {},
    mousedown: function (evt) {
        return this.dragstart(evt);
    },
    touchstart: function (evt) {
        if (!this.touch) {
            this.touch = true;
            this.map.events.un({
                mousedown: this.mousedown,
                mouseup: this.mouseup,
                mousemove: this.mousemove,
                click: this.click,
                scope: this
            });
        }
        return this.dragstart(evt);
    },
    mousemove: function (evt) {
        return this.dragmove(evt);
    },
    touchmove: function (evt) {
        return this.dragmove(evt);
    },
    removeTimeout: function () {
        this.timeoutId = null;
        if (this.dragging) {
            this.mousemove(this.lastMoveEvt);
        }
    },
    mouseup: function (evt) {
        return this.dragend(evt);
    },
    touchend: function (evt) {
        evt.xy = this.last;
        return this.dragend(evt);
    },
    mouseout: function (evt) {
        if (this.started && OpenLayers.Util.mouseLeft(evt, this.map.eventsDiv)) {
            if (this.documentDrag === true) {
                this.addDocumentEvents();
            } else {
                var dragged = (this.start != this.last);
                this.started = false;
                this.dragging = false;
                OpenLayers.Element.removeClass(this.map.viewPortDiv, "olDragDown");
                this.out(evt);
                this.callback("out", []);
                if (dragged) {
                    this.callback("done", [evt.xy]);
                }
                if (document.onselectstart) {
                    document.onselectstart = this.oldOnselectstart;
                }
            }
        }
        return true;
    },
    click: function (evt) {
        return (this.start == this.last);
    },
    activate: function () {
        var activated = false;
        if (OpenLayers.Handler.prototype.activate.apply(this, arguments)) {
            this.dragging = false;
            activated = true;
        }
        return activated;
    },
    deactivate: function () {
        var deactivated = false;
        if (OpenLayers.Handler.prototype.deactivate.apply(this, arguments)) {
            this.touch = false;
            this.started = false;
            this.dragging = false;
            this.start = null;
            this.last = null;
            deactivated = true;
            OpenLayers.Element.removeClass(this.map.viewPortDiv, "olDragDown");
        }
        return deactivated;
    },
    adjustXY: function (evt) {
        var pos = OpenLayers.Util.pagePosition(this.map.viewPortDiv);
        evt.xy.x -= pos[0];
        evt.xy.y -= pos[1];
    },
    addDocumentEvents: function () {
        OpenLayers.Element.addClass(document.body, "olDragDown");
        this.documentEvents = true;
        OpenLayers.Event.observe(document, "mousemove", this._docMove);
        OpenLayers.Event.observe(document, "mouseup", this._docUp);
    },
    removeDocumentEvents: function () {
        OpenLayers.Element.removeClass(document.body, "olDragDown");
        this.documentEvents = false;
        OpenLayers.Event.stopObserving(document, "mousemove", this._docMove);
        OpenLayers.Event.stopObserving(document, "mouseup", this._docUp);
    },
    CLASS_NAME: "OpenLayers.Handler.Drag"
});
OpenLayers.Control.DragPan = OpenLayers.Class(OpenLayers.Control, {
    type: OpenLayers.Control.TYPE_TOOL,
    panned: false,
    interval: 1,
    documentDrag: false,
    kinetic: null,
    enableKinetic: false,
    kineticInterval: 10,
    draw: function () {
        if (this.enableKinetic) {
            var config = {
                interval: this.kineticInterval
            };
            if (typeof this.enableKinetic === "object") {
                config = OpenLayers.Util.extend(config, this.enableKinetic);
            }
            this.kinetic = new OpenLayers.Kinetic(config);
        }
        this.handler = new OpenLayers.Handler.Drag(this, {
            "move": this.panMap,
            "done": this.panMapDone,
            "down": this.panMapStart
        }, {
            interval: this.interval,
            documentDrag: this.documentDrag
        });
    },
    panMapStart: function () {
        if (this.kinetic) {
            this.kinetic.begin();
        }
    },
    panMap: function (xy) {
        if (this.kinetic) {
            this.kinetic.update(xy);
        }
        this.panned = true;
        this.map.pan(this.handler.last.x - xy.x, this.handler.last.y - xy.y, {
            dragging: true,
            animate: false
        });
    },
    panMapDone: function (xy) {
        if (this.panned) {
            var res = null;
            if (this.kinetic) {
                res = this.kinetic.end(xy);
            }
            this.map.pan(this.handler.last.x - xy.x, this.handler.last.y - xy.y, {
                dragging: !! res,
                animate: false
            });
            if (res) {
                var self = this;
                this.kinetic.move(res, function (x, y, end) {
                    self.map.pan(x, y, {
                        dragging: !end,
                        animate: false
                    });
                });
            }
            this.panned = false;
        }
    },
    CLASS_NAME: "OpenLayers.Control.DragPan"
});
OpenLayers.Handler.Pinch = OpenLayers.Class(OpenLayers.Handler, {
    started: false,
    stopDown: false,
    pinching: false,
    last: null,
    start: null,
    initialize: function (control, callbacks, options) {
        OpenLayers.Handler.prototype.initialize.apply(this, arguments);
    },
    touchstart: function (evt) {
        var propagate = true;
        this.pinching = false;
        if (OpenLayers.Event.isMultiTouch(evt)) {
            this.started = true;
            this.last = this.start = {
                distance: this.getDistance(evt.touches),
                delta: 0,
                scale: 1
            };
            this.callback("start", [evt, this.start]);
            propagate = !this.stopDown;
        } else {
            this.started = false;
            this.start = null;
            this.last = null;
        }
        OpenLayers.Event.stop(evt);
        return propagate;
    },
    touchmove: function (evt) {
        if (this.started && OpenLayers.Event.isMultiTouch(evt)) {
            this.pinching = true;
            var current = this.getPinchData(evt);
            this.callback("move", [evt, current]);
            this.last = current;
            OpenLayers.Event.stop(evt);
        }
        return true;
    },
    touchend: function (evt) {
        if (this.started) {
            this.started = false;
            this.pinching = false;
            this.callback("done", [evt, this.start, this.last]);
            this.start = null;
            this.last = null;
        }
        return true;
    },
    activate: function () {
        var activated = false;
        if (OpenLayers.Handler.prototype.activate.apply(this, arguments)) {
            this.pinching = false;
            activated = true;
        }
        return activated;
    },
    deactivate: function () {
        var deactivated = false;
        if (OpenLayers.Handler.prototype.deactivate.apply(this, arguments)) {
            this.started = false;
            this.pinching = false;
            this.start = null;
            this.last = null;
            deactivated = true;
        }
        return deactivated;
    },
    getDistance: function (touches) {
        var t0 = touches[0];
        var t1 = touches[1];
        return Math.sqrt(Math.pow(t0.clientX - t1.clientX, 2) + Math.pow(t0.clientY - t1.clientY, 2));
    },
    getPinchData: function (evt) {
        var distance = this.getDistance(evt.touches);
        var scale = distance / this.start.distance;
        return {
            distance: distance,
            delta: this.last.distance - distance,
            scale: scale
        };
    },
    CLASS_NAME: "OpenLayers.Handler.Pinch"
});
OpenLayers.Control.PinchZoom = OpenLayers.Class(OpenLayers.Control, {
    type: OpenLayers.Control.TYPE_TOOL,
    containerOrigin: null,
    pinchOrigin: null,
    currentCenter: null,
    autoActivate: true,
    initialize: function (options) {
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
        this.handler = new OpenLayers.Handler.Pinch(this, {
            start: this.pinchStart,
            move: this.pinchMove,
            done: this.pinchDone
        }, this.handlerOptions);
    },
    activate: function () {
        var activated = OpenLayers.Control.prototype.activate.apply(this, arguments);
        if (activated) {
            this.map.events.on({
                moveend: this.updateContainerOrigin,
                scope: this
            });
            this.updateContainerOrigin();
        }
        return activated;
    },
    deactivate: function () {
        var deactivated = OpenLayers.Control.prototype.deactivate.apply(this, arguments);
        if (this.map && this.map.events) {
            this.map.events.un({
                moveend: this.updateContainerOrigin,
                scope: this
            });
        }
        return deactivated;
    },
    updateContainerOrigin: function () {
        var container = this.map.layerContainerDiv;
        this.containerOrigin = {
            x: parseInt(container.style.left, 10),
            y: parseInt(container.style.top, 10)
        };
    },
    pinchStart: function (evt, pinchData) {
        this.pinchOrigin = evt.xy;
        this.currentCenter = evt.xy;
    },
    pinchMove: function (evt, pinchData) {
        var scale = pinchData.scale;
        var containerOrigin = this.containerOrigin;
        var pinchOrigin = this.pinchOrigin;
        var current = evt.xy;
        var dx = Math.round((current.x - pinchOrigin.x) + (scale - 1) * (containerOrigin.x - pinchOrigin.x));
        var dy = Math.round((current.y - pinchOrigin.y) + (scale - 1) * (containerOrigin.y - pinchOrigin.y));
        this.applyTransform("translate(" + dx + "px, " + dy + "px) scale(" + scale + ")");
        this.currentCenter = current;
    },
    applyTransform: function (transform) {
        var style = this.map.layerContainerDiv.style;
        style['-webkit-transform'] = transform;
        style['-moz-transform'] = transform;
    },
    pinchDone: function (evt, start, last) {
        this.applyTransform("");
        var zoom = this.map.getZoomForResolution(this.map.getResolution() / last.scale, true);
        if (zoom !== this.map.getZoom() || !this.currentCenter.equals(this.pinchOrigin)) {
            var resolution = this.map.getResolutionForZoom(zoom);
            var location = this.map.getLonLatFromPixel(this.pinchOrigin);
            var zoomPixel = this.currentCenter;
            var size = this.map.getSize();
            location.lon += resolution * ((size.w / 2) - zoomPixel.x);
            location.lat -= resolution * ((size.h / 2) - zoomPixel.y);
            this.map.setCenter(location, zoom);
        }
    },
    CLASS_NAME: "OpenLayers.Control.PinchZoom"
});
OpenLayers.Handler.Click = OpenLayers.Class(OpenLayers.Handler, {
    delay: 300,
    single: true,
    'double': false,
    pixelTolerance: 0,
    dblclickTolerance: 13,
    stopSingle: false,
    stopDouble: false,
    timerId: null,
    touch: false,
    down: null,
    last: null,
    first: null,
    rightclickTimerId: null,
    initialize: function (control, callbacks, options) {
        OpenLayers.Handler.prototype.initialize.apply(this, arguments);
    },
    touchstart: function (evt) {
        if (!this.touch) {
            this.unregisterMouseListeners();
            this.touch = true;
        }
        this.down = this.getEventInfo(evt);
        this.last = this.getEventInfo(evt);
        return true;
    },
    touchmove: function (evt) {
        this.last = this.getEventInfo(evt);
        return true;
    },
    touchend: function (evt) {
        if (this.down) {
            evt.xy = this.last.xy;
            evt.lastTouches = this.last.touches;
            this.handleSingle(evt);
            this.down = null;
        }
        return true;
    },
    unregisterMouseListeners: function () {
        this.map.events.un({
            mousedown: this.mousedown,
            mouseup: this.mouseup,
            click: this.click,
            dblclick: this.dblclick,
            scope: this
        });
    },
    mousedown: function (evt) {
        this.down = this.getEventInfo(evt);
        this.last = this.getEventInfo(evt);
        return true;
    },
    mouseup: function (evt) {
        var propagate = true;
        if (this.checkModifiers(evt) && this.control.handleRightClicks && OpenLayers.Event.isRightClick(evt)) {
            propagate = this.rightclick(evt);
        }
        return propagate;
    },
    rightclick: function (evt) {
        if (this.passesTolerance(evt)) {
            if (this.rightclickTimerId != null) {
                this.clearTimer();
                this.callback('dblrightclick', [evt]);
                return !this.stopDouble;
            } else {
                var clickEvent = this['double'] ? OpenLayers.Util.extend({}, evt) : this.callback('rightclick', [evt]);
                var delayedRightCall = OpenLayers.Function.bind(this.delayedRightCall, this, clickEvent);
                this.rightclickTimerId = window.setTimeout(delayedRightCall, this.delay);
            }
        }
        return !this.stopSingle;
    },
    delayedRightCall: function (evt) {
        this.rightclickTimerId = null;
        if (evt) {
            this.callback('rightclick', [evt]);
        }
    },
    click: function (evt) {
        if (!this.last) {
            this.last = this.getEventInfo(evt);
        }
        this.handleSingle(evt);
        return !this.stopSingle;
    },
    dblclick: function (evt) {
        this.handleDouble(evt);
        return !this.stopDouble;
    },
    handleDouble: function (evt) {
        if (this["double"] && this.passesDblclickTolerance(evt)) {
            this.callback("dblclick", [evt]);
        }
    },
    handleSingle: function (evt) {
        if (this.passesTolerance(evt)) {
            if (this.timerId != null) {
                if (this.last.touches && this.last.touches.length === 1) {
                    if (this["double"]) {
                        OpenLayers.Event.stop(evt);
                    }
                    this.handleDouble(evt);
                }
                if (!this.last.touches || this.last.touches.length !== 2) {
                    this.clearTimer();
                }
            } else {
                this.first = this.getEventInfo(evt);
                var clickEvent = this.single ? OpenLayers.Util.extend({}, evt) : null;
                this.queuePotentialClick(clickEvent);
            }
        }
    },
    queuePotentialClick: function (evt) {
        this.timerId = window.setTimeout(OpenLayers.Function.bind(this.delayedCall, this, evt), this.delay);
    },
    passesTolerance: function (evt) {
        var passes = true;
        if (this.pixelTolerance != null && this.down && this.down.xy) {
            passes = this.pixelTolerance >= this.down.xy.distanceTo(evt.xy);
            if (passes && this.touch && this.down.touches.length === this.last.touches.length) {
                for (var i = 0, ii = this.down.touches.length; i < ii; ++i) {
                    if (this.getTouchDistance(this.down.touches[i], this.last.touches[i]) > this.pixelTolerance) {
                        passes = false;
                        break;
                    }
                }
            }
        }
        return passes;
    },
    getTouchDistance: function (from, to) {
        return Math.sqrt(Math.pow(from.clientX - to.clientX, 2) + Math.pow(from.clientY - to.clientY, 2));
    },
    passesDblclickTolerance: function (evt) {
        var passes = true;
        if (this.down && this.first) {
            passes = this.down.xy.distanceTo(this.first.xy) <= this.dblclickTolerance;
        }
        return passes;
    },
    clearTimer: function () {
        if (this.timerId != null) {
            window.clearTimeout(this.timerId);
            this.timerId = null;
        }
        if (this.rightclickTimerId != null) {
            window.clearTimeout(this.rightclickTimerId);
            this.rightclickTimerId = null;
        }
    },
    delayedCall: function (evt) {
        this.timerId = null;
        if (evt) {
            this.callback("click", [evt]);
        }
    },
    getEventInfo: function (evt) {
        var touches;
        if (evt.touches) {
            var len = evt.touches.length;
            touches = new Array(len);
            var touch;
            for (var i = 0; i < len; i++) {
                touch = evt.touches[i];
                touches[i] = {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                };
            }
        }
        return {
            xy: evt.xy,
            touches: touches
        };
    },
    deactivate: function () {
        var deactivated = false;
        if (OpenLayers.Handler.prototype.deactivate.apply(this, arguments)) {
            this.clearTimer();
            this.down = null;
            this.first = null;
            this.last = null;
            this.touch = false;
            deactivated = true;
        }
        return deactivated;
    },
    CLASS_NAME: "OpenLayers.Handler.Click"
});
OpenLayers.Control.TouchNavigation = OpenLayers.Class(OpenLayers.Control, {
    dragPan: null,
    dragPanOptions: null,
    pinchZoom: null,
    pinchZoomOptions: null,
    clickHandlerOptions: null,
    documentDrag: false,
    autoActivate: true,
    initialize: function (options) {
        this.handlers = {};
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
    },
    destroy: function () {
        this.deactivate();
        if (this.dragPan) {
            this.dragPan.destroy();
        }
        this.dragPan = null;
        if (this.pinchZoom) {
            this.pinchZoom.destroy();
            delete this.pinchZoom;
        }
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },
    activate: function () {
        if (OpenLayers.Control.prototype.activate.apply(this, arguments)) {
            this.dragPan.activate();
            this.handlers.click.activate();
            this.pinchZoom.activate();
            return true;
        }
        return false;
    },
    deactivate: function () {
        if (OpenLayers.Control.prototype.deactivate.apply(this, arguments)) {
            this.dragPan.deactivate();
            this.handlers.click.deactivate();
            this.pinchZoom.deactivate();
            return true;
        }
        return false;
    },
    draw: function () {
        var clickCallbacks = {
            click: this.defaultClick,
            dblclick: this.defaultDblClick
        };
        var clickOptions = OpenLayers.Util.extend({
            "double": true,
            stopDouble: true,
            pixelTolerance: 2
        }, this.clickHandlerOptions);
        this.handlers.click = new OpenLayers.Handler.Click(this, clickCallbacks, clickOptions);
        this.dragPan = new OpenLayers.Control.DragPan(OpenLayers.Util.extend({
            map: this.map,
            documentDrag: this.documentDrag
        }, this.dragPanOptions));
        this.dragPan.draw();
        this.pinchZoom = new OpenLayers.Control.PinchZoom(OpenLayers.Util.extend({
            map: this.map
        }, this.pinchZoomOptions));
    },
    defaultClick: function (evt) {
        if (evt.lastTouches && evt.lastTouches.length == 2) {
            this.map.zoomOut();
        }
    },
    defaultDblClick: function (evt) {
        var newCenter = this.map.getLonLatFromViewPortPx(evt.xy);
        this.map.setCenter(newCenter, this.map.zoom + 1);
    },
    CLASS_NAME: "OpenLayers.Control.TouchNavigation"
});
OpenLayers.Tween = OpenLayers.Class({
    INTERVAL: 10,
    easing: null,
    begin: null,
    finish: null,
    duration: null,
    callbacks: null,
    time: null,
    interval: null,
    playing: false,
    initialize: function (easing) {
        this.easing = (easing) ? easing : OpenLayers.Easing.Expo.easeOut;
    },
    start: function (begin, finish, duration, options) {
        this.playing = true;
        this.begin = begin;
        this.finish = finish;
        this.duration = duration;
        this.callbacks = options.callbacks;
        this.time = 0;
        if (this.interval) {
            window.clearInterval(this.interval);
            this.interval = null;
        }
        if (this.callbacks && this.callbacks.start) {
            this.callbacks.start.call(this, this.begin);
        }
        this.interval = window.setInterval(OpenLayers.Function.bind(this.play, this), this.INTERVAL);
    },
    stop: function () {
        if (!this.playing) {
            return;
        }
        if (this.callbacks && this.callbacks.done) {
            this.callbacks.done.call(this, this.finish);
        }
        window.clearInterval(this.interval);
        this.interval = null;
        this.playing = false;
    },
    play: function () {
        var value = {};
        for (var i in this.begin) {
            var b = this.begin[i];
            var f = this.finish[i];
            if (b == null || f == null || isNaN(b) || isNaN(f)) {
                OpenLayers.Console.error('invalid value for Tween');
            }
            var c = f - b;
            value[i] = this.easing.apply(this, [this.time, b, c, this.duration]);
        }
        this.time++;
        if (this.callbacks && this.callbacks.eachStep) {
            this.callbacks.eachStep.call(this, value);
        }
        if (this.time > this.duration) {
            this.stop();
        }
    },
    CLASS_NAME: "OpenLayers.Tween"
});
OpenLayers.Easing = {
    CLASS_NAME: "OpenLayers.Easing"
};
OpenLayers.Easing.Linear = {
    easeIn: function (t, b, c, d) {
        return c * t / d + b;
    },
    easeOut: function (t, b, c, d) {
        return c * t / d + b;
    },
    easeInOut: function (t, b, c, d) {
        return c * t / d + b;
    },
    CLASS_NAME: "OpenLayers.Easing.Linear"
};
OpenLayers.Easing.Expo = {
    easeIn: function (t, b, c, d) {
        return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
    },
    easeOut: function (t, b, c, d) {
        return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    },
    easeInOut: function (t, b, c, d) {
        if (t == 0) return b;
        if (t == d) return b + c;
        if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    CLASS_NAME: "OpenLayers.Easing.Expo"
};
OpenLayers.Easing.Quad = {
    easeIn: function (t, b, c, d) {
        return c * (t /= d) * t + b;
    },
    easeOut: function (t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    },
    easeInOut: function (t, b, c, d) {
        if ((t /= d / 2) < 1) return c / 2 * t * t + b;
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    },
    CLASS_NAME: "OpenLayers.Easing.Quad"
};
OpenLayers.Map = OpenLayers.Class({
    Z_INDEX_BASE: {
        BaseLayer: 100,
        Overlay: 325,
        Feature: 725,
        Popup: 750,
        Control: 1000
    },
    EVENT_TYPES: ["preaddlayer", "addlayer", "preremovelayer", "removelayer", "changelayer", "movestart", "move", "moveend", "zoomend", "popupopen", "popupclose", "addmarker", "removemarker", "clearmarkers", "mouseover", "mouseout", "mousemove", "dragstart", "drag", "dragend", "changebaselayer"],
    id: null,
    fractionalZoom: false,
    events: null,
    allOverlays: false,
    div: null,
    dragging: false,
    size: null,
    viewPortDiv: null,
    layerContainerOrigin: null,
    layerContainerDiv: null,
    layers: null,
    controls: null,
    popups: null,
    baseLayer: null,
    center: null,
    resolution: null,
    zoom: 0,
    panRatio: 1.5,
    viewRequestID: 0,
    tileSize: null,
    projection: "EPSG:4326",
    units: 'degrees',
    resolutions: null,
    maxResolution: 1.40625,
    minResolution: null,
    maxScale: null,
    minScale: null,
    maxExtent: null,
    minExtent: null,
    restrictedExtent: null,
    numZoomLevels: 16,
    theme: null,
    displayProjection: null,
    fallThrough: true,
    panTween: null,
    eventListeners: null,
    panMethod: OpenLayers.Easing.Expo.easeOut,
    panDuration: 50,
    paddingForPopups: null,
    minPx: null,
    maxPx: null,
    initialize: function (div, options) {
        if (arguments.length === 1 && typeof div === "object") {
            options = div;
            div = options && options.div;
        }
        this.tileSize = new OpenLayers.Size(OpenLayers.Map.TILE_WIDTH, OpenLayers.Map.TILE_HEIGHT);
        this.maxExtent = new OpenLayers.Bounds(-180, -90, 180, 90);
        this.paddingForPopups = new OpenLayers.Bounds(15, 15, 15, 15);
        this.theme = OpenLayers._getScriptLocation() + 'theme/default/style.css';
        OpenLayers.Util.extend(this, options);
        this.layers = [];
        this.id = OpenLayers.Util.createUniqueID("OpenLayers.Map_");
        this.div = OpenLayers.Util.getElement(div);
        if (!this.div) {
            this.div = document.createElement("div");
            this.div.style.height = "1px";
            this.div.style.width = "1px";
        }
        OpenLayers.Element.addClass(this.div, 'olMap');
        var id = this.id + "_OpenLayers_ViewPort";
        this.viewPortDiv = OpenLayers.Util.createDiv(id, null, null, null, "relative", null, "hidden");
        this.viewPortDiv.style.width = "100%";
        this.viewPortDiv.style.height = "100%";
        this.viewPortDiv.className = "olMapViewport";
        this.div.appendChild(this.viewPortDiv);
        var eventsDiv = document.createElement("div");
        eventsDiv.id = this.id + "_events";
        eventsDiv.style.position = "absolute";
        eventsDiv.style.width = "100%";
        eventsDiv.style.height = "100%";
        eventsDiv.style.zIndex = this.Z_INDEX_BASE.Control - 1;
        this.viewPortDiv.appendChild(eventsDiv);
        this.eventsDiv = eventsDiv;
        this.events = new OpenLayers.Events(this, this.eventsDiv, this.EVENT_TYPES, this.fallThrough, {
            includeXY: true
        });
        id = this.id + "_OpenLayers_Container";
        this.layerContainerDiv = OpenLayers.Util.createDiv(id);
        this.layerContainerDiv.style.zIndex = this.Z_INDEX_BASE['Popup'] - 1;
        this.eventsDiv.appendChild(this.layerContainerDiv);
        this.updateSize();
        if (this.eventListeners instanceof Object) {
            this.events.on(this.eventListeners);
        }
        this.events.register("movestart", this, this.updateSize);
        if (OpenLayers.String.contains(navigator.appName, "Microsoft")) {
            this.events.register("resize", this, this.updateSize);
        } else {
            this.updateSizeDestroy = OpenLayers.Function.bind(this.updateSize, this);
            OpenLayers.Event.observe(window, 'resize', this.updateSizeDestroy);
        }
        if (this.theme) {
            var addNode = true;
            var nodes = document.getElementsByTagName('link');
            for (var i = 0, len = nodes.length; i < len; ++i) {
                if (OpenLayers.Util.isEquivalentUrl(nodes.item(i).href, this.theme)) {
                    addNode = false;
                    break;
                }
            }
            if (addNode) {
                var cssNode = document.createElement('link');
                cssNode.setAttribute('rel', 'stylesheet');
                cssNode.setAttribute('type', 'text/css');
                cssNode.setAttribute('href', this.theme);
                document.getElementsByTagName('head')[0].appendChild(cssNode);
            }
        }
        if (this.controls == null) {
            if (OpenLayers.Control != null) {
                this.controls = [new OpenLayers.Control.Navigation(), new OpenLayers.Control.PanZoom(), new OpenLayers.Control.ArgParser(), new OpenLayers.Control.Attribution()];
            } else {
                this.controls = [];
            }
        }
        for (var i = 0, len = this.controls.length; i < len; i++) {
            this.addControlToMap(this.controls[i]);
        }
        this.popups = [];
        this.unloadDestroy = OpenLayers.Function.bind(this.destroy, this);
        OpenLayers.Event.observe(window, 'unload', this.unloadDestroy);
        if (options && options.layers) {
            delete this.center;
            this.addLayers(options.layers);
            if (options.center) {
                this.setCenter(options.center, options.zoom);
            }
        }
    },
    render: function (div) {
        this.div = OpenLayers.Util.getElement(div);
        OpenLayers.Element.addClass(this.div, 'olMap');
        this.viewPortDiv.parentNode.removeChild(this.viewPortDiv);
        this.div.appendChild(this.viewPortDiv);
        this.updateSize();
    },
    unloadDestroy: null,
    updateSizeDestroy: null,
    destroy: function () {
        if (!this.unloadDestroy) {
            return false;
        }
        if (this.panTween) {
            this.panTween.stop();
            this.panTween = null;
        }
        OpenLayers.Event.stopObserving(window, 'unload', this.unloadDestroy);
        this.unloadDestroy = null;
        if (this.updateSizeDestroy) {
            OpenLayers.Event.stopObserving(window, 'resize', this.updateSizeDestroy);
        } else {
            this.events.unregister("resize", this, this.updateSize);
        }
        this.paddingForPopups = null;
        if (this.controls != null) {
            for (var i = this.controls.length - 1; i >= 0; --i) {
                this.controls[i].destroy();
            }
            this.controls = null;
        }
        if (this.layers != null) {
            for (var i = this.layers.length - 1; i >= 0; --i) {
                this.layers[i].destroy(false);
            }
            this.layers = null;
        }
        if (this.viewPortDiv) {
            this.div.removeChild(this.viewPortDiv);
        }
        this.viewPortDiv = null;
        if (this.eventListeners) {
            this.events.un(this.eventListeners);
            this.eventListeners = null;
        }
        this.events.destroy();
        this.events = null;
    },
    setOptions: function (options) {
        var updatePxExtent = this.minPx && options.restrictedExtent != this.restrictedExtent;
        OpenLayers.Util.extend(this, options);
        updatePxExtent && this.moveTo(this.getCachedCenter(), this.zoom, {
            forceZoomChange: true
        });
    },
    getTileSize: function () {
        return this.tileSize;
    },
    getBy: function (array, property, match) {
        var test = (typeof match.test == "function");
        var found = OpenLayers.Array.filter(this[array], function (item) {
            return item[property] == match || (test && match.test(item[property]));
        });
        return found;
    },
    getLayersBy: function (property, match) {
        return this.getBy("layers", property, match);
    },
    getLayersByName: function (match) {
        return this.getLayersBy("name", match);
    },
    getLayersByClass: function (match) {
        return this.getLayersBy("CLASS_NAME", match);
    },
    getControlsBy: function (property, match) {
        return this.getBy("controls", property, match);
    },
    getControlsByClass: function (match) {
        return this.getControlsBy("CLASS_NAME", match);
    },
    getLayer: function (id) {
        var foundLayer = null;
        for (var i = 0, len = this.layers.length; i < len; i++) {
            var layer = this.layers[i];
            if (layer.id == id) {
                foundLayer = layer;
                break;
            }
        }
        return foundLayer;
    },
    setLayerZIndex: function (layer, zIdx) {
        layer.setZIndex(this.Z_INDEX_BASE[layer.isBaseLayer ? 'BaseLayer' : 'Overlay'] + zIdx * 5);
    },
    resetLayersZIndex: function () {
        for (var i = 0, len = this.layers.length; i < len; i++) {
            var layer = this.layers[i];
            this.setLayerZIndex(layer, i);
        }
    },
    addLayer: function (layer) {
        if (layer!=null) {
            for (var i = 0, len = this.layers.length; i < len; i++) {
                if (this.layers[i] == layer) {
                    var msg = OpenLayers.i18n('layerAlreadyAdded', {
                        'layerName': layer.name
                    });
                    OpenLayers.Console.warn(msg);
                    return false;
                }
            }
            if (this.events.triggerEvent("preaddlayer", {
                layer: layer
            }) === false) {
                return;
            }
            if (this.allOverlays) {
                layer.isBaseLayer = false;
            }

            layer.div.className = "olLayerDiv";
            layer.div.style.overflow = "";
            this.setLayerZIndex(layer, this.layers.length);
            if (layer.isFixed) {
                this.viewPortDiv.appendChild(layer.div);
            } else {
                this.layerContainerDiv.appendChild(layer.div);
            }
            this.layers.push(layer);
            layer.setMap(this);
            if (layer.isBaseLayer || (this.allOverlays && !this.baseLayer)) {
                if (this.baseLayer == null) {
                    this.setBaseLayer(layer);
                } else {
                    layer.setVisibility(false);
                }
            } else {
                layer.redraw();
            }
            this.events.triggerEvent("addlayer", {
                layer: layer
            });
            layer.events.triggerEvent("added", {
                map: this,
                layer: layer
            });
            layer.afterAdd();
        }
        
    },
    addLayers: function (layers) {
        for (var i = 0, len = layers.length; i < len; i++) {
            this.addLayer(layers[i]);
        }
    },
    removeLayer: function (layer, setNewBaseLayer) {
        if (this.events.triggerEvent("preremovelayer", {
            layer: layer
        }) === false) {
            return;
        }
        if (setNewBaseLayer == null) {
            setNewBaseLayer = true;
        }
        if (layer.isFixed) {
            this.viewPortDiv.removeChild(layer.div);
        } else {
            this.layerContainerDiv.removeChild(layer.div);
        }
        OpenLayers.Util.removeItem(this.layers, layer);
        layer.removeMap(this);
        layer.map = null;
        if (this.baseLayer == layer) {
            this.baseLayer = null;
            if (setNewBaseLayer) {
                for (var i = 0, len = this.layers.length; i < len; i++) {
                    var iLayer = this.layers[i];
                    if (iLayer.isBaseLayer || this.allOverlays) {
                        this.setBaseLayer(iLayer);
                        break;
                    }
                }
            }
        }
        this.resetLayersZIndex();
        this.events.triggerEvent("removelayer", {
            layer: layer
        });
        layer.events.triggerEvent("removed", {
            map: this,
            layer: layer
        });
    },
    getNumLayers: function () {
        return this.layers.length;
    },
    getLayerIndex: function (layer) {
        return OpenLayers.Util.indexOf(this.layers, layer);
    },
    setLayerIndex: function (layer, idx) {
        var base = this.getLayerIndex(layer);
        if (idx < 0) {
            idx = 0;
        } else if (idx > this.layers.length) {
            idx = this.layers.length;
        }
        if (base != idx) {
            this.layers.splice(base, 1);
            this.layers.splice(idx, 0, layer);
            for (var i = 0, len = this.layers.length; i < len; i++) {
                this.setLayerZIndex(this.layers[i], i);
            }
            this.events.triggerEvent("changelayer", {
                layer: layer,
                property: "order"
            });
            if (this.allOverlays) {
                if (idx === 0) {
                    this.setBaseLayer(layer);
                } else if (this.baseLayer !== this.layers[0]) {
                    this.setBaseLayer(this.layers[0]);
                }
            }
        }
    },
    raiseLayer: function (layer, delta) {
        var idx = this.getLayerIndex(layer) + delta;
        this.setLayerIndex(layer, idx);
    },
    setBaseLayer: function (newBaseLayer) {
        if (newBaseLayer != this.baseLayer) {
            if (OpenLayers.Util.indexOf(this.layers, newBaseLayer) != -1) {
                var center = this.getCachedCenter();
                var newResolution = OpenLayers.Util.getResolutionFromScale(this.getScale(), newBaseLayer.units);
                if (this.baseLayer != null && !this.allOverlays) {
                    this.baseLayer.setVisibility(false);
                }
                this.baseLayer = newBaseLayer;
                this.viewRequestID++;
                if (!this.allOverlays || this.baseLayer.visibility) {
                    this.baseLayer.setVisibility(true);
                }
                if (center != null) {
                    var newZoom = this.getZoomForResolution(newResolution || this.resolution, true);
                    this.setCenter(center, newZoom, false, true);
                }
                this.events.triggerEvent("changebaselayer", {
                    layer: this.baseLayer
                });
            }
        }
    },
    addControl: function (control, px) {
        this.controls.push(control);
        this.addControlToMap(control, px);
    },
    addControls: function (controls, pixels) {
        var pxs = (arguments.length === 1) ? [] : pixels;
        for (var i = 0, len = controls.length; i < len; i++) {
            var ctrl = controls[i];
            var px = (pxs[i]) ? pxs[i] : null;
            this.addControl(ctrl, px);
        }
    },
    addControlToMap: function (control, px) {
        control.outsideViewport = (control.div != null);
        if (this.displayProjection && !control.displayProjection) {
            control.displayProjection = this.displayProjection;
        }
        control.setMap(this);
        var div = control.draw(px);
        if (div) {
            if (!control.outsideViewport) {
                div.style.zIndex = this.Z_INDEX_BASE['Control'] + this.controls.length;
                this.viewPortDiv.appendChild(div);
            }
        }
        if (control.autoActivate) {
            control.activate();
        }
    },
    getControl: function (id) {
        var returnControl = null;
        for (var i = 0, len = this.controls.length; i < len; i++) {
            var control = this.controls[i];
            if (control.id == id) {
                returnControl = control;
                break;
            }
        }
        return returnControl;
    },
    removeControl: function (control) {
        if ((control) && (control == this.getControl(control.id))) {
            if (control.div && (control.div.parentNode == this.viewPortDiv)) {
                this.viewPortDiv.removeChild(control.div);
            }
            OpenLayers.Util.removeItem(this.controls, control);
        }
    },
    addPopup: function (popup, exclusive) {
        if (exclusive) {
            for (var i = this.popups.length - 1; i >= 0; --i) {
                this.removePopup(this.popups[i]);
            }
        }
        popup.map = this;
        this.popups.push(popup);
        var popupDiv = popup.draw();
        if (popupDiv) {
            popupDiv.style.zIndex = this.Z_INDEX_BASE['Popup'] + this.popups.length;
            this.layerContainerDiv.appendChild(popupDiv);
        }
    },
    removePopup: function (popup) {
        OpenLayers.Util.removeItem(this.popups, popup);
        if (popup.div) {
            try {
                this.layerContainerDiv.removeChild(popup.div);
            } catch (e) {}
        }
        popup.map = null;
    },
    getSize: function () {
        var size = null;
        if (this.size != null) {
            size = this.size.clone();
        }
        return size;
    },
    updateSize: function () {
        var newSize = this.getCurrentSize();
        if (newSize && !isNaN(newSize.h) && !isNaN(newSize.w)) {
            this.events.clearMouseCache();
            var oldSize = this.getSize();
            if (oldSize == null) {
                this.size = oldSize = newSize;
            }
            if (!newSize.equals(oldSize)) {
                this.size = newSize;
                for (var i = 0, len = this.layers.length; i < len; i++) {
                    this.layers[i].onMapResize();
                }
                var center = this.getCachedCenter();
                if (this.baseLayer != null && center != null) {
                    var zoom = this.getZoom();
                    this.zoom = null;
                    this.setCenter(center, zoom);
                }
            }
        }
    },
    getCurrentSize: function () {
        var size = new OpenLayers.Size(this.div.clientWidth, this.div.clientHeight);
        if (size.w == 0 && size.h == 0 || isNaN(size.w) && isNaN(size.h)) {
            size.w = this.div.offsetWidth;
            size.h = this.div.offsetHeight;
        }
        if (size.w == 0 && size.h == 0 || isNaN(size.w) && isNaN(size.h)) {
            size.w = parseInt(this.div.style.width);
            size.h = parseInt(this.div.style.height);
        }
        return size;
    },
    calculateBounds: function (center, resolution) {
        var extent = null;
        if (center == null) {
            center = this.getCachedCenter();
        }
        if (resolution == null) {
            resolution = this.getResolution();
        }
        if ((center != null) && (resolution != null)) {
            var size = this.getSize();
            var w_deg = size.w * resolution;
            var h_deg = size.h * resolution;
            extent = new OpenLayers.Bounds(center.lon - w_deg / 2, center.lat - h_deg / 2, center.lon + w_deg / 2, center.lat + h_deg / 2);
        }
        return extent;
    },
    getCenter: function () {
        var center = null;
        var cachedCenter = this.getCachedCenter();
        if (cachedCenter) {
            center = cachedCenter.clone();
        }
        return center;
    },
    getCachedCenter: function () {
        if (!this.center && this.size) {
            this.center = this.getLonLatFromViewPortPx(new OpenLayers.Pixel(this.size.w / 2, this.size.h / 2));
        }
        return this.center;
    },
    getZoom: function () {
        return this.zoom;
    },
    pan: function (dx, dy, options) {
        options = OpenLayers.Util.applyDefaults(options, {
            animate: true,
            dragging: false
        });
        if (options.dragging) {
            if (dx != 0 || dy != 0) {
                this.moveByPx(dx, dy);
            }
        } else {
            var centerPx = this.getViewPortPxFromLonLat(this.getCachedCenter());
            var newCenterPx = centerPx.add(dx, dy);
            if (this.dragging || !newCenterPx.equals(centerPx)) {
                var newCenterLonLat = this.getLonLatFromViewPortPx(newCenterPx);
                if (options.animate) {
                    this.panTo(newCenterLonLat);
                } else {
                    this.moveTo(newCenterLonLat);
                    this.dragging = false;
                    this.events.triggerEvent("moveend");
                }
            }
        }
    },
    panTo: function (lonlat) {
        if (this.panMethod && this.getExtent().scale(this.panRatio).containsLonLat(lonlat)) {
            if (!this.panTween) {
                this.panTween = new OpenLayers.Tween(this.panMethod);
            }
            var center = this.getCachedCenter();
            if (lonlat.equals(center)) {
                return;
            }
            var from = this.getPixelFromLonLat(center);
            var to = this.getPixelFromLonLat(lonlat);
            var vector = {
                x: to.x - from.x,
                y: to.y - from.y
            };
            var last = {
                x: 0,
                y: 0
            };
            this.panTween.start({
                x: 0,
                y: 0
            }, vector, this.panDuration, {
                callbacks: {
                    eachStep: OpenLayers.Function.bind(function (px) {
                        var x = px.x - last.x,
                            y = px.y - last.y;
                        this.moveByPx(x, y);
                        last.x = Math.round(px.x);
                        last.y = Math.round(px.y);
                    }, this),
                    done: OpenLayers.Function.bind(function (px) {
                        this.moveTo(lonlat);
                        this.dragging = false;
                        this.events.triggerEvent("moveend");
                    }, this)
                }
            });
        } else {
            this.setCenter(lonlat);
        }
    },
    setCenter: function (lonlat, zoom, dragging, forceZoomChange) {
        this.panTween && this.panTween.stop();
        this.moveTo(lonlat, zoom, {
            'dragging': dragging,
            'forceZoomChange': forceZoomChange
        });
    },
    moveByPx: function (dx, dy) {
        var hw = this.size.w / 2;
        var hh = this.size.h / 2;
        var x = hw + dx;
        var y = hh + dy;
        var wrapDateLine = this.baseLayer.wrapDateLine;
        var xRestriction = 0;
        var yRestriction = 0;
        if (this.restrictedExtent) {
            xRestriction = hw;
            yRestriction = hh;
            wrapDateLine = false;
        }
        dx = wrapDateLine || x <= this.maxPx.x - xRestriction && x >= this.minPx.x + xRestriction ? Math.round(dx) : 0;
        dy = y <= this.maxPx.y - yRestriction && y >= this.minPx.y + yRestriction ? Math.round(dy) : 0;
        var minX = this.minPx.x,
            maxX = this.maxPx.x;
        if (dx || dy) {
            if (!this.dragging) {
                this.dragging = true;
                this.events.triggerEvent("movestart");
            }
            this.center = null;
            if (dx) {
                this.layerContainerDiv.style.left = parseInt(this.layerContainerDiv.style.left) - dx + "px";
                this.minPx.x -= dx;
                this.maxPx.x -= dx;
                if (wrapDateLine) {
                    if (this.maxPx.x > maxX) {
                        this.maxPx.x -= (maxX - minX);
                    }
                    if (this.minPx.x < minX) {
                        this.minPx.x += (maxX - minX);
                    }
                }
            }
            if (dy) {
                this.layerContainerDiv.style.top = parseInt(this.layerContainerDiv.style.top) - dy + "px";
                this.minPx.y -= dy;
                this.maxPx.y -= dy;
            }
            var layer, i, len;
            for (i = 0, len = this.layers.length; i < len; ++i) {
                layer = this.layers[i];
                if (layer.visibility && (layer === this.baseLayer || layer.inRange)) {
                    layer.moveByPx(dx, dy);
                    layer.events.triggerEvent("move");
                }
            }
            this.events.triggerEvent("move");
        }
    },
    moveTo: function (lonlat, zoom, options) {
        if (!options) {
            options = {};
        }
        if (zoom != null) {
            zoom = parseFloat(zoom);
            if (!this.fractionalZoom) {
                zoom = Math.round(zoom);
            }
        }
        var dragging = options.dragging || this.dragging;
        var forceZoomChange = options.forceZoomChange;
        if (!this.getCachedCenter() && !this.isValidLonLat(lonlat)) {
            lonlat = this.maxExtent.getCenterLonLat();
            this.center = lonlat.clone();
        }
        if (this.restrictedExtent != null) {
            if (lonlat == null) {
                lonlat = this.center;
            }
            if (zoom == null) {
                zoom = this.getZoom();
            }
            var resolution = this.getResolutionForZoom(zoom);
            var extent = this.calculateBounds(lonlat, resolution);
            if (!this.restrictedExtent.containsBounds(extent)) {
                var maxCenter = this.restrictedExtent.getCenterLonLat();
                if (extent.getWidth() > this.restrictedExtent.getWidth()) {
                    lonlat = new OpenLayers.LonLat(maxCenter.lon, lonlat.lat);
                } else if (extent.left < this.restrictedExtent.left) {
                    lonlat = lonlat.add(this.restrictedExtent.left - extent.left, 0);
                } else if (extent.right > this.restrictedExtent.right) {
                    lonlat = lonlat.add(this.restrictedExtent.right - extent.right, 0);
                }
                if (extent.getHeight() > this.restrictedExtent.getHeight()) {
                    lonlat = new OpenLayers.LonLat(lonlat.lon, maxCenter.lat);
                } else if (extent.bottom < this.restrictedExtent.bottom) {
                    lonlat = lonlat.add(0, this.restrictedExtent.bottom - extent.bottom);
                } else if (extent.top > this.restrictedExtent.top) {
                    lonlat = lonlat.add(0, this.restrictedExtent.top - extent.top);
                }
            }
        }
        var zoomChanged = forceZoomChange || ((this.isValidZoomLevel(zoom)) && (zoom != this.getZoom()));
        var centerChanged = (this.isValidLonLat(lonlat)) && (!lonlat.equals(this.center));
        if (zoomChanged || centerChanged || dragging) {
            dragging || this.events.triggerEvent("movestart");
            if (centerChanged) {
                if (!zoomChanged && this.center) {
                    this.centerLayerContainer(lonlat);
                }
                this.center = lonlat.clone();
            }
            var res = zoomChanged ? this.getResolutionForZoom(zoom) : this.getResolution();
            if (zoomChanged || this.layerContainerOrigin == null) {
                this.layerContainerOrigin = this.getCachedCenter();
                this.layerContainerDiv.style.left = "0px";
                this.layerContainerDiv.style.top = "0px";
                var maxExtent = this.getMaxExtent({
                    restricted: true
                });
                var maxExtentCenter = maxExtent.getCenterLonLat();
                var lonDelta = this.center.lon - maxExtentCenter.lon;
                var latDelta = maxExtentCenter.lat - this.center.lat;
                var extentWidth = Math.round(maxExtent.getWidth() / res);
                var extentHeight = Math.round(maxExtent.getHeight() / res);
                var left = (this.size.w - extentWidth) / 2 - lonDelta / res;
                var top = (this.size.h - extentHeight) / 2 - latDelta / res;
                this.minPx = new OpenLayers.Pixel(left, top);
                this.maxPx = new OpenLayers.Pixel(left + extentWidth, top + extentHeight);
            }
            if (zoomChanged) {
                this.zoom = zoom;
                this.resolution = res;
                this.viewRequestID++;
            }
            var bounds = this.getExtent();
            if (this.baseLayer.visibility) {
                this.baseLayer.moveTo(bounds, zoomChanged, options.dragging);
                options.dragging || this.baseLayer.events.triggerEvent("moveend", {
                    zoomChanged: zoomChanged
                });
            }
            bounds = this.baseLayer.getExtent();
            for (var i = this.layers.length - 1; i >= 0; --i) {
                var layer = this.layers[i];
                if (layer !== this.baseLayer && !layer.isBaseLayer) {
                    var inRange = layer.calculateInRange();
                    if (layer.inRange != inRange) {
                        layer.inRange = inRange;
                        if (!inRange) {
                            layer.display(false);
                        }
                        this.events.triggerEvent("changelayer", {
                            layer: layer,
                            property: "visibility"
                        });
                    }
                    if (inRange && layer.visibility) {
                        layer.moveTo(bounds, zoomChanged, options.dragging);
                        options.dragging || layer.events.triggerEvent("moveend", {
                            zoomChanged: zoomChanged
                        });
                    }
                }
            }
            this.events.triggerEvent("move");
            dragging || this.events.triggerEvent("moveend");
            if (zoomChanged) {
                for (var i = 0, len = this.popups.length; i < len; i++) {
                    this.popups[i].updatePosition();
                }
                this.events.triggerEvent("zoomend");
            }
        }
    },
    centerLayerContainer: function (lonlat) {
        var originPx = this.getViewPortPxFromLonLat(this.layerContainerOrigin);
        var newPx = this.getViewPortPxFromLonLat(lonlat);
        if ((originPx != null) && (newPx != null)) {
            var oldLeft = parseInt(this.layerContainerDiv.style.left);
            var oldTop = parseInt(this.layerContainerDiv.style.top);
            var newLeft = Math.round(originPx.x - newPx.x);
            var newTop = Math.round(originPx.y - newPx.y);
            this.layerContainerDiv.style.left = newLeft + "px";
            this.layerContainerDiv.style.top = newTop + "px";
            var dx = oldLeft - newLeft;
            var dy = oldTop - newTop;
            this.minPx.x -= dx;
            this.maxPx.x -= dx;
            this.minPx.y -= dy;
            this.maxPx.y -= dy;
        }
    },
    isValidZoomLevel: function (zoomLevel) {
        return ((zoomLevel != null) && (zoomLevel >= 0) && (zoomLevel < this.getNumZoomLevels()));
    },
    isValidLonLat: function (lonlat) {
        var valid = false;
        if (lonlat != null) {
            var maxExtent = this.getMaxExtent();
            valid = maxExtent.containsLonLat(lonlat);
        }
        return valid;
    },
    getProjection: function () {
        var projection = this.getProjectionObject();
        return projection ? projection.getCode() : null;
    },
    getProjectionObject: function () {
        var projection = null;
        if (this.baseLayer != null) {
            projection = this.baseLayer.projection;
        }
        return projection;
    },
    getMaxResolution: function () {
        var maxResolution = null;
        if (this.baseLayer != null) {
            maxResolution = this.baseLayer.maxResolution;
        }
        return maxResolution;
    },
    getMaxExtent: function (options) {
        var maxExtent = null;
        if (options && options.restricted && this.restrictedExtent) {
            maxExtent = this.restrictedExtent;
        } else if (this.baseLayer != null) {
            maxExtent = this.baseLayer.maxExtent;
        }
        return maxExtent;
    },
    getNumZoomLevels: function () {
        var numZoomLevels = null;
        if (this.baseLayer != null) {
            numZoomLevels = this.baseLayer.numZoomLevels;
        }
        return numZoomLevels;
    },
    getExtent: function () {
        var extent = null;
        if (this.baseLayer != null) {
            extent = this.baseLayer.getExtent();
        }
        return extent;
    },
    getResolution: function () {
        var resolution = null;
        if (this.baseLayer != null) {
            resolution = this.baseLayer.getResolution();
        } else if (this.allOverlays === true && this.layers.length > 0) {
            resolution = this.layers[0].getResolution();
        }
        return resolution;
    },
    getUnits: function () {
        var units = null;
        if (this.baseLayer != null) {
            units = this.baseLayer.units;
        }
        return units;
    },
    getScale: function () {
        var scale = null;
        if (this.baseLayer != null) {
            var res = this.getResolution();
            var units = this.baseLayer.units;
            scale = OpenLayers.Util.getScaleFromResolution(res, units);
        }
        return scale;
    },
    getZoomForExtent: function (bounds, closest) {
        var zoom = null;
        if (this.baseLayer != null) {
            zoom = this.baseLayer.getZoomForExtent(bounds, closest);
        }
        return zoom;
    },
    getResolutionForZoom: function (zoom) {
        var resolution = null;
        if (this.baseLayer) {
            resolution = this.baseLayer.getResolutionForZoom(zoom);
        }
        return resolution;
    },
    getZoomForResolution: function (resolution, closest) {
        var zoom = null;
        if (this.baseLayer != null) {
            zoom = this.baseLayer.getZoomForResolution(resolution, closest);
        }
        return zoom;
    },
    zoomTo: function (zoom) {
        if (this.isValidZoomLevel(zoom)) {
            this.setCenter(null, zoom);
        }
    },
    zoomIn: function () {
        this.zoomTo(this.getZoom() + 1);
    },
    zoomOut: function () {
        this.zoomTo(this.getZoom() - 1);
    },
    zoomToExtent: function (bounds, closest) {
        var center = bounds.getCenterLonLat();
        if (this.baseLayer.wrapDateLine) {
            var maxExtent = this.getMaxExtent();
            bounds = bounds.clone();
            while (bounds.right < bounds.left) {
                bounds.right += maxExtent.getWidth();
            }
            center = bounds.getCenterLonLat().wrapDateLine(maxExtent);
        }
        this.setCenter(center, this.getZoomForExtent(bounds, closest));
    },
    zoomToMaxExtent: function (options) {
        var restricted = (options) ? options.restricted : true;
        var maxExtent = this.getMaxExtent({
            'restricted': restricted
        });
        this.zoomToExtent(maxExtent);
    },
    zoomToScale: function (scale, closest) {
        var res = OpenLayers.Util.getResolutionFromScale(scale, this.baseLayer.units);
        var size = this.getSize();
        var w_deg = size.w * res;
        var h_deg = size.h * res;
        var center = this.getCachedCenter();
        var extent = new OpenLayers.Bounds(center.lon - w_deg / 2, center.lat - h_deg / 2, center.lon + w_deg / 2, center.lat + h_deg / 2);
        this.zoomToExtent(extent, closest);
    },
    getLonLatFromViewPortPx: function (viewPortPx) {
        var lonlat = null;
        if (this.baseLayer != null) {
            lonlat = this.baseLayer.getLonLatFromViewPortPx(viewPortPx);
        }
        return lonlat;
    },
    getViewPortPxFromLonLat: function (lonlat) {
        var px = null;
        if (this.baseLayer != null) {
            px = this.baseLayer.getViewPortPxFromLonLat(lonlat);
        }
        return px;
    },
    getLonLatFromPixel: function (px) {
        return this.getLonLatFromViewPortPx(px);
    },
    getPixelFromLonLat: function (lonlat) {
        var px = this.getViewPortPxFromLonLat(lonlat);
        px.x = Math.round(px.x);
        px.y = Math.round(px.y);
        return px;
    },
    getGeodesicPixelSize: function (px) {
        var lonlat = px ? this.getLonLatFromPixel(px) : (this.getCachedCenter() || new OpenLayers.LonLat(0, 0));
        var res = this.getResolution();
        var left = lonlat.add(-res / 2, 0);
        var right = lonlat.add(res / 2, 0);
        var bottom = lonlat.add(0, -res / 2);
        var top = lonlat.add(0, res / 2);
        var dest = new OpenLayers.Projection("EPSG:4326");
        var source = this.getProjectionObject() || dest;
        if (!source.equals(dest)) {
            left.transform(source, dest);
            right.transform(source, dest);
            bottom.transform(source, dest);
            top.transform(source, dest);
        }
        return new OpenLayers.Size(OpenLayers.Util.distVincenty(left, right), OpenLayers.Util.distVincenty(bottom, top));
    },
    getViewPortPxFromLayerPx: function (layerPx) {
        var viewPortPx = null;
        if (layerPx != null) {
            var dX = parseInt(this.layerContainerDiv.style.left);
            var dY = parseInt(this.layerContainerDiv.style.top);
            viewPortPx = layerPx.add(dX, dY);
        }
        return viewPortPx;
    },
    getLayerPxFromViewPortPx: function (viewPortPx) {
        var layerPx = null;
        if (viewPortPx != null) {
            var dX = -parseInt(this.layerContainerDiv.style.left);
            var dY = -parseInt(this.layerContainerDiv.style.top);
            layerPx = viewPortPx.add(dX, dY);
            if (isNaN(layerPx.x) || isNaN(layerPx.y)) {
                layerPx = null;
            }
        }
        return layerPx;
    },
    getLonLatFromLayerPx: function (px) {
        px = this.getViewPortPxFromLayerPx(px);
        return this.getLonLatFromViewPortPx(px);
    },
    getLayerPxFromLonLat: function (lonlat) {
        var px = this.getPixelFromLonLat(lonlat);
        return this.getLayerPxFromViewPortPx(px);
    },
    CLASS_NAME: "OpenLayers.Map"
});
OpenLayers.Map.TILE_WIDTH = 256;
OpenLayers.Map.TILE_HEIGHT = 256;
OpenLayers.Projection = OpenLayers.Class({
    proj: null,
    projCode: null,
    titleRegEx: /\+title=[^\+]*/,
    initialize: function (projCode, options) {
        OpenLayers.Util.extend(this, options);
        this.projCode = projCode;
        if (window.Proj4js) {
            this.proj = new Proj4js.Proj(projCode);
        }
    },
    getCode: function () {
        return this.proj ? this.proj.srsCode : this.projCode;
    },
    getUnits: function () {
        return this.proj ? this.proj.units : null;
    },
    toString: function () {
        return this.getCode();
    },
    equals: function (projection) {
        var p = projection,
            equals = false;
        if (p) {
            if (window.Proj4js && this.proj.defData && p.proj.defData) {
                equals = this.proj.defData.replace(this.titleRegEx, "") == p.proj.defData.replace(this.titleRegEx, "");
            } else if (p.getCode) {
                var source = this.getCode(),
                    target = p.getCode();
                equals = source == target || !! OpenLayers.Projection.transforms[source] && OpenLayers.Projection.transforms[source][target] === OpenLayers.Projection.nullTransform;
            }
        }
        return equals;
    },
    destroy: function () {
        delete this.proj;
        delete this.projCode;
    },
    CLASS_NAME: "OpenLayers.Projection"
});
OpenLayers.Projection.transforms = {};
OpenLayers.Projection.addTransform = function (from, to, method) {
    if (!OpenLayers.Projection.transforms[from]) {
        OpenLayers.Projection.transforms[from] = {};
    }
    OpenLayers.Projection.transforms[from][to] = method;
};
OpenLayers.Projection.transform = function (point, source, dest) {
    if (source.proj && dest.proj) {
        point = Proj4js.transform(source.proj, dest.proj, point);
    } else if (source && dest && OpenLayers.Projection.transforms[source.getCode()] && OpenLayers.Projection.transforms[source.getCode()][dest.getCode()]) {
        OpenLayers.Projection.transforms[source.getCode()][dest.getCode()](point);
    }
    return point;
};
OpenLayers.Projection.nullTransform = function (point) {
    return point;
};
OpenLayers.Layer = OpenLayers.Class({
    id: null,
    name: null,
    div: null,
    opacity: null,
    alwaysInRange: null,
    EVENT_TYPES: ["loadstart", "loadend", "loadcancel", "visibilitychanged", "move", "moveend", "added", "removed"],
    RESOLUTION_PROPERTIES: ['scales', 'resolutions', 'maxScale', 'minScale', 'maxResolution', 'minResolution', 'numZoomLevels', 'maxZoomLevel'],
    events: null,
    map: null,
    isBaseLayer: false,
    alpha: false,
    displayInLayerSwitcher: true,
    visibility: true,
    attribution: null,
    inRange: false,
    imageSize: null,
    imageOffset: null,
    options: null,
    eventListeners: null,
    gutter: 0,
    projection: null,
    units: null,
    scales: null,
    resolutions: null,
    maxExtent: null,
    minExtent: null,
    maxResolution: null,
    minResolution: null,
    numZoomLevels: null,
    minScale: null,
    maxScale: null,
    displayOutsideMaxExtent: false,
    wrapDateLine: false,
    transitionEffect: null,
    SUPPORTED_TRANSITIONS: ['resize'],
    metadata: {},
    initialize: function (name, options) {
        this.addOptions(options);
        this.name = name;
        if (this.id == null) {
            this.id = OpenLayers.Util.createUniqueID(this.CLASS_NAME + "_");
            this.div = OpenLayers.Util.createDiv(this.id);
            this.div.style.width = "100%";
            this.div.style.height = "100%";
            this.div.dir = "ltr";
            this.events = new OpenLayers.Events(this, this.div, this.EVENT_TYPES);
            if (this.eventListeners instanceof Object) {
                this.events.on(this.eventListeners);
            }
        }
        if (this.wrapDateLine) {
            this.displayOutsideMaxExtent = true;
        }
    },
    destroy: function (setNewBaseLayer) {
        if (setNewBaseLayer == null) {
            setNewBaseLayer = true;
        }
        if (this.map != null) {
            this.map.removeLayer(this, setNewBaseLayer);
        }
        this.projection = null;
        this.map = null;
        this.name = null;
        this.div = null;
        this.options = null;
        if (this.events) {
            if (this.eventListeners) {
                this.events.un(this.eventListeners);
            }
            this.events.destroy();
        }
        this.eventListeners = null;
        this.events = null;
    },
    clone: function (obj) {
        if (obj == null) {
            obj = new OpenLayers.Layer(this.name, this.getOptions());
        }
        OpenLayers.Util.applyDefaults(obj, this);
        obj.map = null;
        return obj;
    },
    getOptions: function () {
        var options = {};
        for (var o in this.options) {
            options[o] = this[o];
        }
        return options;
    },
    setName: function (newName) {
        if (newName != this.name) {
            this.name = newName;
            if (this.map != null) {
                this.map.events.triggerEvent("changelayer", {
                    layer: this,
                    property: "name"
                });
            }
        }
    },
    addOptions: function (newOptions, reinitialize) {
        if (this.options == null) {
            this.options = {};
        }
        OpenLayers.Util.extend(this.options, newOptions);
        OpenLayers.Util.extend(this, newOptions);
        if (typeof this.projection == "string") {
            this.projection = new OpenLayers.Projection(this.projection);
        }
        if (this.projection && this.projection.getUnits()) {
            this.units = this.projection.getUnits();
        }
        if (this.map) {
            var resolution = this.map.getResolution();
            var properties = this.RESOLUTION_PROPERTIES.concat(["projection", "units", "minExtent", "maxExtent"]);
            for (var o in newOptions) {
                if (newOptions.hasOwnProperty(o) && OpenLayers.Util.indexOf(properties, o) >= 0) {
                    this.initResolutions();
                    if (reinitialize && this.map.baseLayer === this) {
                        this.map.setCenter(this.map.getCenter(), this.map.getZoomForResolution(resolution), false, true);
                        this.map.events.triggerEvent("changebaselayer", {
                            layer: this
                        });
                    }
                    break;
                }
            }
        }
    },
    onMapResize: function () {},
    redraw: function () {
        var redrawn = false;
        if (this.map) {
            this.inRange = this.calculateInRange();
            var extent = this.getExtent();
            if (extent && this.inRange && this.visibility) {
                var zoomChanged = true;
                this.moveTo(extent, zoomChanged, false);
                this.events.triggerEvent("moveend", {
                    "zoomChanged": zoomChanged
                });
                redrawn = true;
            }
        }
        return redrawn;
    },
    moveTo: function (bounds, zoomChanged, dragging) {
        var display = this.visibility;
        if (!this.isBaseLayer) {
            display = display && this.inRange;
        }
        this.display(display);
    },
    moveByPx: function (dx, dy) {},
    setMap: function (map) {
        if (this.map == null) {
            this.map = map;
            this.maxExtent = this.maxExtent || this.map.maxExtent;
            this.minExtent = this.minExtent || this.map.minExtent;
            this.projection = this.projection || this.map.projection;
            if (typeof this.projection == "string") {
                this.projection = new OpenLayers.Projection(this.projection);
            }
            this.units = this.projection.getUnits() || this.units || this.map.units;
            this.initResolutions();
            if (!this.isBaseLayer) {
                this.inRange = this.calculateInRange();
                var show = ((this.visibility) && (this.inRange));
                this.div.style.display = show ? "" : "none";
            }
            this.setTileSize();
        }
    },
    afterAdd: function () {},
    removeMap: function (map) {},
    getImageSize: function (bounds) {
        return (this.imageSize || this.tileSize);
    },
    setTileSize: function (size) {
        var tileSize = (size) ? size : ((this.tileSize) ? this.tileSize : this.map.getTileSize());
        this.tileSize = tileSize;
        if (this.gutter) {
            this.imageOffset = new OpenLayers.Pixel(-this.gutter, -this.gutter);
            this.imageSize = new OpenLayers.Size(tileSize.w + (2 * this.gutter), tileSize.h + (2 * this.gutter));
        }
    },
    getVisibility: function () {
        return this.visibility;
    },
    setVisibility: function (visibility) {
        if (visibility != this.visibility) {
            this.visibility = visibility;
            this.display(visibility);
            this.redraw();
            if (this.map != null) {
                this.map.events.triggerEvent("changelayer", {
                    layer: this,
                    property: "visibility"
                });
            }
            this.events.triggerEvent("visibilitychanged");
        }
    },
    display: function (display) {
        if (display != (this.div.style.display != "none")) {
            this.div.style.display = (display && this.calculateInRange()) ? "block" : "none";
        }
    },
    calculateInRange: function () {
        var inRange = false;
        if (this.alwaysInRange) {
            inRange = true;
        } else {
            if (this.map) {
                var resolution = this.map.getResolution();
                inRange = ((resolution >= this.minResolution) && (resolution <= this.maxResolution));
            }
        }
        return inRange;
    },
    setIsBaseLayer: function (isBaseLayer) {
        if (isBaseLayer != this.isBaseLayer) {
            this.isBaseLayer = isBaseLayer;
            if (this.map != null) {
                this.map.events.triggerEvent("changebaselayer", {
                    layer: this
                });
            }
        }
    },
    initResolutions: function () {
        var i, len, p;
        var props = {},
            alwaysInRange = true;
        for (i = 0, len = this.RESOLUTION_PROPERTIES.length; i < len; i++) {
            p = this.RESOLUTION_PROPERTIES[i];
            props[p] = this.options[p];
            if (alwaysInRange && this.options[p]) {
                alwaysInRange = false;
            }
        }
        if (this.alwaysInRange == null) {
            this.alwaysInRange = alwaysInRange;
        }
        if (props.resolutions == null) {
            props.resolutions = this.resolutionsFromScales(props.scales);
        }
        if (props.resolutions == null) {
            props.resolutions = this.calculateResolutions(props);
        }
        if (props.resolutions == null) {
            for (i = 0, len = this.RESOLUTION_PROPERTIES.length; i < len; i++) {
                p = this.RESOLUTION_PROPERTIES[i];
                props[p] = this.options[p] != null ? this.options[p] : this.map[p];
            }
            if (props.resolutions == null) {
                props.resolutions = this.resolutionsFromScales(props.scales);
            }
            if (props.resolutions == null) {
                props.resolutions = this.calculateResolutions(props);
            }
        }
        var maxResolution;
        if (this.options.maxResolution && this.options.maxResolution !== "auto") {
            maxResolution = this.options.maxResolution;
        }
        if (this.options.minScale) {
            maxResolution = OpenLayers.Util.getResolutionFromScale(this.options.minScale, this.units);
        }
        var minResolution;
        if (this.options.minResolution && this.options.minResolution !== "auto") {
            minResolution = this.options.minResolution;
        }
        if (this.options.maxScale) {
            minResolution = OpenLayers.Util.getResolutionFromScale(this.options.maxScale, this.units);
        }
        if (props.resolutions) {
            props.resolutions.sort(function (a, b) {
                return (b - a);
            });
            if (!maxResolution) {
                maxResolution = props.resolutions[0];
            }
            if (!minResolution) {
                var lastIdx = props.resolutions.length - 1;
                minResolution = props.resolutions[lastIdx];
            }
        }
        this.resolutions = props.resolutions;
        if (this.resolutions) {
            len = this.resolutions.length;
            this.scales = new Array(len);
            for (i = 0; i < len; i++) {
                this.scales[i] = OpenLayers.Util.getScaleFromResolution(this.resolutions[i], this.units);
            }
            this.numZoomLevels = len;
        }
        this.minResolution = minResolution;
        if (minResolution) {
            this.maxScale = OpenLayers.Util.getScaleFromResolution(minResolution, this.units);
        }
        this.maxResolution = maxResolution;
        if (maxResolution) {
            this.minScale = OpenLayers.Util.getScaleFromResolution(maxResolution, this.units);
        }
    },
    resolutionsFromScales: function (scales) {
        if (scales == null) {
            return;
        }
        var resolutions, i, len;
        len = scales.length;
        resolutions = new Array(len);
        for (i = 0; i < len; i++) {
            resolutions[i] = OpenLayers.Util.getResolutionFromScale(scales[i], this.units);
        }
        return resolutions;
    },
    calculateResolutions: function (props) {
        var viewSize, wRes, hRes;
        var maxResolution = props.maxResolution;
        if (props.minScale != null) {
            maxResolution = OpenLayers.Util.getResolutionFromScale(props.minScale, this.units);
        } else if (maxResolution == "auto" && this.maxExtent != null) {
            viewSize = this.map.getSize();
            wRes = this.maxExtent.getWidth() / viewSize.w;
            hRes = this.maxExtent.getHeight() / viewSize.h;
            maxResolution = Math.max(wRes, hRes);
        }
        var minResolution = props.minResolution;
        if (props.maxScale != null) {
            minResolution = OpenLayers.Util.getResolutionFromScale(props.maxScale, this.units);
        } else if (props.minResolution == "auto" && this.minExtent != null) {
            viewSize = this.map.getSize();
            wRes = this.minExtent.getWidth() / viewSize.w;
            hRes = this.minExtent.getHeight() / viewSize.h;
            minResolution = Math.max(wRes, hRes);
        }
        var maxZoomLevel = props.maxZoomLevel;
        var numZoomLevels = props.numZoomLevels;
        if (typeof minResolution === "number" && typeof maxResolution === "number" && numZoomLevels === undefined) {
            var ratio = maxResolution / minResolution;
            numZoomLevels = Math.floor(Math.log(ratio) / Math.log(2)) + 1;
        } else if (numZoomLevels === undefined && maxZoomLevel != null) {
            numZoomLevels = maxZoomLevel + 1;
        }
        if (typeof numZoomLevels !== "number" || numZoomLevels <= 0 || (typeof maxResolution !== "number" && typeof minResolution !== "number")) {
            return;
        }
        var resolutions = new Array(numZoomLevels);
        var base = 2;
        if (typeof minResolution == "number" && typeof maxResolution == "number") {
            base = Math.pow((maxResolution / minResolution), (1 / (numZoomLevels - 1)));
        }
        var i;
        if (typeof maxResolution === "number") {
            for (i = 0; i < numZoomLevels; i++) {
                resolutions[i] = maxResolution / Math.pow(base, i);
            }
        } else {
            for (i = 0; i < numZoomLevels; i++) {
                resolutions[numZoomLevels - 1 - i] = minResolution * Math.pow(base, i);
            }
        }
        return resolutions;
    },
    getResolution: function () {
        var zoom = this.map.getZoom();
        return this.getResolutionForZoom(zoom);
    },
    getExtent: function () {
        return this.map.calculateBounds();
    },
    getZoomForExtent: function (extent, closest) {
        var viewSize = this.map.getSize();
        var idealResolution = Math.max(extent.getWidth() / viewSize.w, extent.getHeight() / viewSize.h);
        return this.getZoomForResolution(idealResolution, closest);
    },
    getDataExtent: function () {},
    getResolutionForZoom: function (zoom) {
        zoom = Math.max(0, Math.min(zoom, this.resolutions.length - 1));
        var resolution;
        if (this.map.fractionalZoom) {
            var low = Math.floor(zoom);
            var high = Math.ceil(zoom);
            resolution = this.resolutions[low] - ((zoom - low) * (this.resolutions[low] - this.resolutions[high]));
        } else {
            resolution = this.resolutions[Math.round(zoom)];
        }
        return resolution;
    },
    getZoomForResolution: function (resolution, closest) {
        var zoom, i, len;
        if (this.map.fractionalZoom) {
            var lowZoom = 0;
            var highZoom = this.resolutions.length - 1;
            var highRes = this.resolutions[lowZoom];
            var lowRes = this.resolutions[highZoom];
            var res;
            for (i = 0, len = this.resolutions.length; i < len; ++i) {
                res = this.resolutions[i];
                if (res >= resolution) {
                    highRes = res;
                    lowZoom = i;
                }
                if (res <= resolution) {
                    lowRes = res;
                    highZoom = i;
                    break;
                }
            }
            var dRes = highRes - lowRes;
            if (dRes > 0) {
                zoom = lowZoom + ((highRes - resolution) / dRes);
            } else {
                zoom = lowZoom;
            }
        } else {
            var diff;
            var minDiff = Number.POSITIVE_INFINITY;
            for (i = 0, len = this.resolutions.length; i < len; i++) {
                if (closest) {
                    diff = Math.abs(this.resolutions[i] - resolution);
                    if (diff > minDiff) {
                        break;
                    }
                    minDiff = diff;
                } else {
                    if (this.resolutions[i] < resolution) {
                        break;
                    }
                }
            }
            zoom = Math.max(0, i - 1);
        }
        return zoom;
    },
    getLonLatFromViewPortPx: function (viewPortPx) {
        var lonlat = null;
        var map = this.map;
        if (viewPortPx != null && map.minPx) {
            var res = map.getResolution();
            var maxExtent = map.getMaxExtent({
                restricted: true
            });
            var lon = (viewPortPx.x - map.minPx.x) * res + maxExtent.left;
            var lat = (map.minPx.y - viewPortPx.y) * res + maxExtent.top;
            lonlat = new OpenLayers.LonLat(lon, lat);
            if (this.wrapDateLine) {
                lonlat = lonlat.wrapDateLine(this.maxExtent);
            }
        }
        return lonlat;
    },
    getViewPortPxFromLonLat: function (lonlat) {
        var px = null;
        if (lonlat != null) {
            var resolution = this.map.getResolution();
            var extent = this.map.getExtent();
            px = new OpenLayers.Pixel((1 / resolution * (lonlat.lon - extent.left)), (1 / resolution * (extent.top - lonlat.lat)));
        }
        return px;
    },
    setOpacity: function (opacity) {
        if (opacity != this.opacity) {
            this.opacity = opacity;
            for (var i = 0, len = this.div.childNodes.length; i < len; ++i) {
                var element = this.div.childNodes[i].firstChild;
                OpenLayers.Util.modifyDOMElement(element, null, null, null, null, null, null, opacity);
            }
            if (this.map != null) {
                this.map.events.triggerEvent("changelayer", {
                    layer: this,
                    property: "opacity"
                });
            }
        }
    },
    getZIndex: function () {
        return this.div.style.zIndex;
    },
    setZIndex: function (zIndex) {
        this.div.style.zIndex = zIndex;
    },
    adjustBounds: function (bounds) {
        if (this.gutter) {
            var mapGutter = this.gutter * this.map.getResolution();
            bounds = new OpenLayers.Bounds(bounds.left - mapGutter, bounds.bottom - mapGutter, bounds.right + mapGutter, bounds.top + mapGutter);
        }
        if (this.wrapDateLine) {
            var wrappingOptions = {
                'rightTolerance': this.getResolution(),
                'leftTolerance': this.getResolution()
            };
            bounds = bounds.wrapDateLine(this.maxExtent, wrappingOptions);
        }
        return bounds;
    },
    CLASS_NAME: "OpenLayers.Layer"
});
OpenLayers.Layer.SphericalMercator = {
    getExtent: function () {
        var extent = null;
        if (this.sphericalMercator) {
            extent = this.map.calculateBounds();
        } else {
            extent = OpenLayers.Layer.FixedZoomLevels.prototype.getExtent.apply(this);
        }
        return extent;
    },
    getLonLatFromViewPortPx: function (viewPortPx) {
        return OpenLayers.Layer.prototype.getLonLatFromViewPortPx.apply(this, arguments);
    },
    getViewPortPxFromLonLat: function (lonlat) {
        return OpenLayers.Layer.prototype.getViewPortPxFromLonLat.apply(this, arguments);
    },
    initMercatorParameters: function () {
        this.RESOLUTIONS = [];
        var maxResolution = 156543.03390625;
        for (var zoom = 0; zoom <= this.MAX_ZOOM_LEVEL; ++zoom) {
            this.RESOLUTIONS[zoom] = maxResolution / Math.pow(2, zoom);
        }
        this.units = "m";
        this.projection = this.projection || "EPSG:900913";
    },
    forwardMercator: function (lon, lat) {
        var x = lon * 20037508.34 / 180;
        var y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
        y = y * 20037508.34 / 180;
        return new OpenLayers.LonLat(x, y);
    },
    inverseMercator: function (x, y) {
        var lon = (x / 20037508.34) * 180;
        var lat = (y / 20037508.34) * 180;
        lat = 180 / Math.PI * (2 * Math.atan(Math.exp(lat * Math.PI / 180)) - Math.PI / 2);
        return new OpenLayers.LonLat(lon, lat);
    },
    projectForward: function (point) {
        var lonlat = OpenLayers.Layer.SphericalMercator.forwardMercator(point.x, point.y);
        point.x = lonlat.lon;
        point.y = lonlat.lat;
        return point;
    },
    projectInverse: function (point) {
        var lonlat = OpenLayers.Layer.SphericalMercator.inverseMercator(point.x, point.y);
        point.x = lonlat.lon;
        point.y = lonlat.lat;
        return point;
    }
};
(function () {
    var codes = ["EPSG:900913", "EPSG:3857", "EPSG:102113", "EPSG:102100"];
    var add = OpenLayers.Projection.addTransform;
    var merc = OpenLayers.Layer.SphericalMercator;
    var same = OpenLayers.Projection.nullTransform;
    var i, len, code, other, j;
    for (i = 0, len = codes.length; i < len; ++i) {
        code = codes[i];
        add("EPSG:4326", code, merc.projectForward);
        add(code, "EPSG:4326", merc.projectInverse);
        for (j = i + 1; j < len; ++j) {
            other = codes[j];
            add(code, other, same);
            add(other, code, same);
        }
    }
})();
OpenLayers.Layer.EventPane = OpenLayers.Class(OpenLayers.Layer, {
    smoothDragPan: true,
    isBaseLayer: true,
    isFixed: true,
    pane: null,
    mapObject: null,
    initialize: function (name, options) {
        OpenLayers.Layer.prototype.initialize.apply(this, arguments);
        if (this.pane == null) {
            this.pane = OpenLayers.Util.createDiv(this.div.id + "_EventPane");
        }
    },
    destroy: function () {
        this.mapObject = null;
        this.pane = null;
        OpenLayers.Layer.prototype.destroy.apply(this, arguments);
    },
    setMap: function (map) {
        OpenLayers.Layer.prototype.setMap.apply(this, arguments);
        this.pane.style.zIndex = parseInt(this.div.style.zIndex) + 1;
        this.pane.style.display = this.div.style.display;
        this.pane.style.width = "100%";
        this.pane.style.height = "100%";
        if (OpenLayers.BROWSER_NAME == "msie") {
            this.pane.style.background = "url(" + OpenLayers.Util.getImagesLocation() + "blank.gif)";
        }
        if (this.isFixed) {
            this.map.eventsDiv.appendChild(this.pane);
        } else {
            this.map.layerContainerDiv.appendChild(this.pane);
        }
        this.loadMapObject();
        if (this.mapObject == null) {
            this.loadWarningMessage();
        }
    },
    removeMap: function (map) {
        if (this.pane && this.pane.parentNode) {
            this.pane.parentNode.removeChild(this.pane);
        }
        OpenLayers.Layer.prototype.removeMap.apply(this, arguments);
    },
    loadWarningMessage: function () {
        this.div.style.backgroundColor = "darkblue";
        var viewSize = this.map.getSize();
        var msgW = Math.min(viewSize.w, 300);
        var msgH = Math.min(viewSize.h, 200);
        var size = new OpenLayers.Size(msgW, msgH);
        var centerPx = new OpenLayers.Pixel(viewSize.w / 2, viewSize.h / 2);
        var topLeft = centerPx.add(-size.w / 2, -size.h / 2);
        var div = OpenLayers.Util.createDiv(this.name + "_warning", topLeft, size, null, null, null, "auto");
        div.style.padding = "7px";
        div.style.backgroundColor = "yellow";
        div.innerHTML = this.getWarningHTML();
        this.div.appendChild(div);
    },
    getWarningHTML: function () {
        return "";
    },
    display: function (display) {
        OpenLayers.Layer.prototype.display.apply(this, arguments);
        this.pane.style.display = this.div.style.display;
    },
    setZIndex: function (zIndex) {
        OpenLayers.Layer.prototype.setZIndex.apply(this, arguments);
        this.pane.style.zIndex = parseInt(this.div.style.zIndex) + 1;
    },
    moveByPx: function (dx, dy) {
        OpenLayers.Layer.prototype.moveByPx.apply(this, arguments);
        if (this.dragPanMapObject) {
            this.dragPanMapObject(dx, -dy);
        } else {
            this.moveTo(this.map.getCachedCenter());
        }
    },
    moveTo: function (bounds, zoomChanged, dragging) {
        OpenLayers.Layer.prototype.moveTo.apply(this, arguments);
        if (this.mapObject != null) {
            var newCenter = this.map.getCenter();
            var newZoom = this.map.getZoom();
            if (newCenter != null) {
                var moOldCenter = this.getMapObjectCenter();
                var oldCenter = this.getOLLonLatFromMapObjectLonLat(moOldCenter);
                var moOldZoom = this.getMapObjectZoom();
                var oldZoom = this.getOLZoomFromMapObjectZoom(moOldZoom);
                if (!(newCenter.equals(oldCenter)) || !(newZoom == oldZoom)) {
                    if (!zoomChanged && oldCenter && this.dragPanMapObject && this.smoothDragPan) {
                        var oldPx = this.map.getViewPortPxFromLonLat(oldCenter);
                        var newPx = this.map.getViewPortPxFromLonLat(newCenter);
                        this.dragPanMapObject(newPx.x - oldPx.x, oldPx.y - newPx.y);
                    } else {
                        var center = this.getMapObjectLonLatFromOLLonLat(newCenter);
                        var zoom = this.getMapObjectZoomFromOLZoom(newZoom);
                        this.setMapObjectCenter(center, zoom, dragging);
                    }
                }
            }
        }
    },
    getLonLatFromViewPortPx: function (viewPortPx) {
        var lonlat = null;
        if ((this.mapObject != null) && (this.getMapObjectCenter() != null)) {
            var moPixel = this.getMapObjectPixelFromOLPixel(viewPortPx);
            var moLonLat = this.getMapObjectLonLatFromMapObjectPixel(moPixel);
            lonlat = this.getOLLonLatFromMapObjectLonLat(moLonLat);
        }
        return lonlat;
    },
    getViewPortPxFromLonLat: function (lonlat) {
        var viewPortPx = null;
        if ((this.mapObject != null) && (this.getMapObjectCenter() != null)) {
            var moLonLat = this.getMapObjectLonLatFromOLLonLat(lonlat);
            var moPixel = this.getMapObjectPixelFromMapObjectLonLat(moLonLat);
            viewPortPx = this.getOLPixelFromMapObjectPixel(moPixel);
        }
        return viewPortPx;
    },
    getOLLonLatFromMapObjectLonLat: function (moLonLat) {
        var olLonLat = null;
        if (moLonLat != null) {
            var lon = this.getLongitudeFromMapObjectLonLat(moLonLat);
            var lat = this.getLatitudeFromMapObjectLonLat(moLonLat);
            olLonLat = new OpenLayers.LonLat(lon, lat);
        }
        return olLonLat;
    },
    getMapObjectLonLatFromOLLonLat: function (olLonLat) {
        var moLatLng = null;
        if (olLonLat != null) {
            moLatLng = this.getMapObjectLonLatFromLonLat(olLonLat.lon, olLonLat.lat);
        }
        return moLatLng;
    },
    getOLPixelFromMapObjectPixel: function (moPixel) {
        var olPixel = null;
        if (moPixel != null) {
            var x = this.getXFromMapObjectPixel(moPixel);
            var y = this.getYFromMapObjectPixel(moPixel);
            olPixel = new OpenLayers.Pixel(x, y);
        }
        return olPixel;
    },
    getMapObjectPixelFromOLPixel: function (olPixel) {
        var moPixel = null;
        if (olPixel != null) {
            moPixel = this.getMapObjectPixelFromXY(olPixel.x, olPixel.y);
        }
        return moPixel;
    },
    CLASS_NAME: "OpenLayers.Layer.EventPane"
});
OpenLayers.Layer.FixedZoomLevels = OpenLayers.Class({
    initialize: function () {},
    initResolutions: function () {
        var props = new Array('minZoomLevel', 'maxZoomLevel', 'numZoomLevels');
        for (var i = 0, len = props.length; i < len; i++) {
            var property = props[i];
            this[property] = (this.options[property] != null) ? this.options[property] : this.map[property];
        }
        if ((this.minZoomLevel == null) || (this.minZoomLevel < this.MIN_ZOOM_LEVEL)) {
            this.minZoomLevel = this.MIN_ZOOM_LEVEL;
        }
        var desiredZoomLevels;
        var limitZoomLevels = this.MAX_ZOOM_LEVEL - this.minZoomLevel + 1;
        if (((this.options.numZoomLevels == null) && (this.options.maxZoomLevel != null)) || ((this.numZoomLevels == null) && (this.maxZoomLevel != null))) {
            desiredZoomLevels = this.maxZoomLevel - this.minZoomLevel + 1;
        } else {
            desiredZoomLevels = this.numZoomLevels;
        }
        if (desiredZoomLevels != null) {
            this.numZoomLevels = Math.min(desiredZoomLevels, limitZoomLevels);
        } else {
            this.numZoomLevels = limitZoomLevels;
        }
        this.maxZoomLevel = this.minZoomLevel + this.numZoomLevels - 1;
        if (this.RESOLUTIONS != null) {
            var resolutionsIndex = 0;
            this.resolutions = [];
            for (var i = this.minZoomLevel; i <= this.maxZoomLevel; i++) {
                this.resolutions[resolutionsIndex++] = this.RESOLUTIONS[i];
            }
            this.maxResolution = this.resolutions[0];
            this.minResolution = this.resolutions[this.resolutions.length - 1];
        }
    },
    getResolution: function () {
        if (this.resolutions != null) {
            return OpenLayers.Layer.prototype.getResolution.apply(this, arguments);
        } else {
            var resolution = null;
            var viewSize = this.map.getSize();
            var extent = this.getExtent();
            if ((viewSize != null) && (extent != null)) {
                resolution = Math.max(extent.getWidth() / viewSize.w, extent.getHeight() / viewSize.h);
            }
            return resolution;
        }
    },
    getExtent: function () {
        var extent = null;
        var size = this.map.getSize();
        var tlPx = new OpenLayers.Pixel(0, 0);
        var tlLL = this.getLonLatFromViewPortPx(tlPx);
        var brPx = new OpenLayers.Pixel(size.w, size.h);
        var brLL = this.getLonLatFromViewPortPx(brPx);
        if ((tlLL != null) && (brLL != null)) {
            extent = new OpenLayers.Bounds(tlLL.lon, brLL.lat, brLL.lon, tlLL.lat);
        }
        return extent;
    },
    getZoomForResolution: function (resolution) {
        if (this.resolutions != null) {
            return OpenLayers.Layer.prototype.getZoomForResolution.apply(this, arguments);
        } else {
            var extent = OpenLayers.Layer.prototype.getExtent.apply(this, []);
            return this.getZoomForExtent(extent);
        }
    },
    getOLZoomFromMapObjectZoom: function (moZoom) {
        var zoom = null;
        if (moZoom != null) {
            zoom = moZoom - this.minZoomLevel;
            if (this.map.baseLayer !== this) {
                zoom = this.map.baseLayer.getZoomForResolution(this.getResolutionForZoom(zoom))
            }
        }
        return zoom;
    },
    getMapObjectZoomFromOLZoom: function (olZoom) {
        var zoom = null;
        if (olZoom != null) {
            zoom = olZoom + this.minZoomLevel;
            if (this.map.baseLayer !== this) {
                zoom = this.getZoomForResolution(this.map.baseLayer.getResolutionForZoom(zoom));
            }
        }
        return zoom;
    },
    CLASS_NAME: "OpenLayers.Layer.FixedZoomLevels"
});
OpenLayers.Layer.Google = OpenLayers.Class(OpenLayers.Layer.EventPane, OpenLayers.Layer.FixedZoomLevels, {
    MIN_ZOOM_LEVEL: 0,
    MAX_ZOOM_LEVEL: 21,
    RESOLUTIONS: [1.40625, 0.703125, 0.3515625, 0.17578125, 0.087890625, 0.0439453125, 0.02197265625, 0.010986328125, 0.0054931640625, 0.00274658203125, 0.001373291015625, 0.0006866455078125, 0.00034332275390625, 0.000171661376953125, 0.0000858306884765625, 0.00004291534423828125, 0.00002145767211914062, 0.00001072883605957031, 0.00000536441802978515, 0.00000268220901489257, 0.0000013411045074462891, 0.00000067055225372314453],
    type: null,
    wrapDateLine: true,
    sphericalMercator: false,
    version: null,
    initialize: function (name, options) {
        options = options || {};
        if (!options.version) {
            options.version = typeof GMap2 === "function" ? "2" : "3";
        }
        var mixin = OpenLayers.Layer.Google["v" + options.version.replace(/\./g, "_")];
        if (mixin) {
            OpenLayers.Util.applyDefaults(options, mixin);
        } else {
            throw "Unsupported Google Maps API version: " + options.version;
        }
        OpenLayers.Util.applyDefaults(options, mixin.DEFAULTS);
        if (options.maxExtent) {
            options.maxExtent = options.maxExtent.clone();
        }
        OpenLayers.Layer.EventPane.prototype.initialize.apply(this, [name, options]);
        OpenLayers.Layer.FixedZoomLevels.prototype.initialize.apply(this, [name, options]);
        if (this.sphericalMercator) {
            OpenLayers.Util.extend(this, OpenLayers.Layer.SphericalMercator);
            this.initMercatorParameters();
        }
    },
    clone: function () {
        return new OpenLayers.Layer.Google(this.name, this.getOptions());
    },
    setVisibility: function (visible) {
        var opacity = this.opacity == null ? 1 : this.opacity;
        OpenLayers.Layer.EventPane.prototype.setVisibility.apply(this, arguments);
        this.setOpacity(opacity);
    },
    display: function (visible) {
        if (!this._dragging) {
            this.setGMapVisibility(visible);
        }
        OpenLayers.Layer.EventPane.prototype.display.apply(this, arguments);
    },
    moveTo: function (bounds, zoomChanged, dragging) {
        this._dragging = dragging;
        OpenLayers.Layer.EventPane.prototype.moveTo.apply(this, arguments);
        delete this._dragging;
    },
    setOpacity: function (opacity) {
        if (opacity !== this.opacity) {
            if (this.map != null) {
                this.map.events.triggerEvent("changelayer", {
                    layer: this,
                    property: "opacity"
                });
            }
            this.opacity = opacity;
        }
        if (this.getVisibility()) {
            var container = this.getMapContainer();
            OpenLayers.Util.modifyDOMElement(container, null, null, null, null, null, null, opacity);
        }
    },
    destroy: function () {
        if (this.map) {
            this.setGMapVisibility(false);
            var cache = OpenLayers.Layer.Google.cache[this.map.id];
            if (cache && cache.count <= 1) {
                this.removeGMapElements();
            }
        }
        OpenLayers.Layer.EventPane.prototype.destroy.apply(this, arguments);
    },
    removeGMapElements: function () {
        var cache = OpenLayers.Layer.Google.cache[this.map.id];
        if (cache) {
            var container = this.mapObject && this.getMapContainer();
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }
            var termsOfUse = cache.termsOfUse;
            if (termsOfUse && termsOfUse.parentNode) {
                termsOfUse.parentNode.removeChild(termsOfUse);
            }
            var poweredBy = cache.poweredBy;
            if (poweredBy && poweredBy.parentNode) {
                poweredBy.parentNode.removeChild(poweredBy);
            }
        }
    },
    removeMap: function (map) {
        if (this.visibility && this.mapObject) {
            this.setGMapVisibility(false);
        }
        var cache = OpenLayers.Layer.Google.cache[map.id];
        if (cache) {
            if (cache.count <= 1) {
                this.removeGMapElements();
                delete OpenLayers.Layer.Google.cache[map.id];
            } else {
                --cache.count;
            }
        }
        delete this.termsOfUse;
        delete this.poweredBy;
        delete this.mapObject;
        delete this.dragObject;
        OpenLayers.Layer.EventPane.prototype.removeMap.apply(this, arguments);
    },
    getOLBoundsFromMapObjectBounds: function (moBounds) {
        var olBounds = null;
        if (moBounds != null) {
            var sw = moBounds.getSouthWest();
            var ne = moBounds.getNorthEast();
            if (this.sphericalMercator) {
                sw = this.forwardMercator(sw.lng(), sw.lat());
                ne = this.forwardMercator(ne.lng(), ne.lat());
            } else {
                sw = new OpenLayers.LonLat(sw.lng(), sw.lat());
                ne = new OpenLayers.LonLat(ne.lng(), ne.lat());
            }
            olBounds = new OpenLayers.Bounds(sw.lon, sw.lat, ne.lon, ne.lat);
        }
        return olBounds;
    },
    getWarningHTML: function () {
        return OpenLayers.i18n("googleWarning");
    },
    getMapObjectCenter: function () {
        return this.mapObject.getCenter();
    },
    getMapObjectZoom: function () {
        return this.mapObject.getZoom();
    },
    getLongitudeFromMapObjectLonLat: function (moLonLat) {
        return this.sphericalMercator ? this.forwardMercator(moLonLat.lng(), moLonLat.lat()).lon : moLonLat.lng();
    },
    getLatitudeFromMapObjectLonLat: function (moLonLat) {
        var lat = this.sphericalMercator ? this.forwardMercator(moLonLat.lng(), moLonLat.lat()).lat : moLonLat.lat();
        return lat;
    },
    getXFromMapObjectPixel: function (moPixel) {
        return moPixel.x;
    },
    getYFromMapObjectPixel: function (moPixel) {
        return moPixel.y;
    },
    CLASS_NAME: "OpenLayers.Layer.Google"
});
OpenLayers.Layer.Google.cache = {};
OpenLayers.Layer.Google.v2 = {
    termsOfUse: null,
    poweredBy: null,
    dragObject: null,
    loadMapObject: function () {
        if (!this.type) {
            this.type = G_NORMAL_MAP;
        }
        var mapObject, termsOfUse, poweredBy;
        var cache = OpenLayers.Layer.Google.cache[this.map.id];
        if (cache) {
            mapObject = cache.mapObject;
            termsOfUse = cache.termsOfUse;
            poweredBy = cache.poweredBy;
            ++cache.count;
        } else {
            var container = this.map.viewPortDiv;
            var div = document.createElement("div");
            div.id = this.map.id + "_GMap2Container";
            div.style.position = "absolute";
            div.style.width = "100%";
            div.style.height = "100%";
            container.appendChild(div);
            try {
                mapObject = new GMap2(div);
                termsOfUse = div.lastChild;
                container.appendChild(termsOfUse);
                termsOfUse.style.zIndex = "1100";
                termsOfUse.style.right = "";
                termsOfUse.style.bottom = "";
                termsOfUse.className = "olLayerGoogleCopyright";
                poweredBy = div.lastChild;
                container.appendChild(poweredBy);
                poweredBy.style.zIndex = "1100";
                poweredBy.style.right = "";
                poweredBy.style.bottom = "";
                poweredBy.className = "olLayerGooglePoweredBy gmnoprint";
            } catch (e) {
                throw (e);
            }
            OpenLayers.Layer.Google.cache[this.map.id] = {
                mapObject: mapObject,
                termsOfUse: termsOfUse,
                poweredBy: poweredBy,
                count: 1
            };
        }
        this.mapObject = mapObject;
        this.termsOfUse = termsOfUse;
        this.poweredBy = poweredBy;
        if (OpenLayers.Util.indexOf(this.mapObject.getMapTypes(), this.type) === -1) {
            this.mapObject.addMapType(this.type);
        }
        if (typeof mapObject.getDragObject == "function") {
            this.dragObject = mapObject.getDragObject();
        } else {
            this.dragPanMapObject = null;
        }
        if (this.isBaseLayer === false) {
            this.setGMapVisibility(this.div.style.display !== "none");
        }
    },
    onMapResize: function () {
        if (this.visibility && this.mapObject.isLoaded()) {
            this.mapObject.checkResize();
        } else {
            if (!this._resized) {
                var layer = this;
                var handle = GEvent.addListener(this.mapObject, "load", function () {
                    GEvent.removeListener(handle);
                    delete layer._resized;
                    layer.mapObject.checkResize();
                    layer.moveTo(layer.map.getCenter(), layer.map.getZoom());
                });
            }
            this._resized = true;
        }
    },
    setGMapVisibility: function (visible) {
        var cache = OpenLayers.Layer.Google.cache[this.map.id];
        if (cache) {
            var container = this.mapObject.getContainer();
            if (visible === true) {
                this.mapObject.setMapType(this.type);
                container.style.display = "";
                this.termsOfUse.style.left = "";
                this.termsOfUse.style.display = "";
                this.poweredBy.style.display = "";
                cache.displayed = this.id;
            } else {
                if (cache.displayed === this.id) {
                    delete cache.displayed;
                }
                if (!cache.displayed) {
                    container.style.display = "none";
                    this.termsOfUse.style.display = "none";
                    this.termsOfUse.style.left = "-9999px";
                    this.poweredBy.style.display = "none";
                }
            }
        }
    },
    getMapContainer: function () {
        return this.mapObject.getContainer();
    },
    getMapObjectBoundsFromOLBounds: function (olBounds) {
        var moBounds = null;
        if (olBounds != null) {
            var sw = this.sphericalMercator ? this.inverseMercator(olBounds.bottom, olBounds.left) : new OpenLayers.LonLat(olBounds.bottom, olBounds.left);
            var ne = this.sphericalMercator ? this.inverseMercator(olBounds.top, olBounds.right) : new OpenLayers.LonLat(olBounds.top, olBounds.right);
            moBounds = new GLatLngBounds(new GLatLng(sw.lat, sw.lon), new GLatLng(ne.lat, ne.lon));
        }
        return moBounds;
    },
    setMapObjectCenter: function (center, zoom) {
        this.mapObject.setCenter(center, zoom);
    },
    dragPanMapObject: function (dX, dY) {
        this.dragObject.moveBy(new GSize(-dX, dY));
    },
    getMapObjectLonLatFromMapObjectPixel: function (moPixel) {
        return this.mapObject.fromContainerPixelToLatLng(moPixel);
    },
    getMapObjectPixelFromMapObjectLonLat: function (moLonLat) {
        return this.mapObject.fromLatLngToContainerPixel(moLonLat);
    },
    getMapObjectZoomFromMapObjectBounds: function (moBounds) {
        return this.mapObject.getBoundsZoomLevel(moBounds);
    },
    getMapObjectLonLatFromLonLat: function (lon, lat) {
        var gLatLng;
        if (this.sphericalMercator) {
            var lonlat = this.inverseMercator(lon, lat);
            gLatLng = new GLatLng(lonlat.lat, lonlat.lon);
        } else {
            gLatLng = new GLatLng(lat, lon);
        }
        return gLatLng;
    },
    getMapObjectPixelFromXY: function (x, y) {
        return new GPoint(x, y);
    }
};
OpenLayers.Layer.Google.v3 = {
    DEFAULTS: {
        maxExtent: new OpenLayers.Bounds(-128 * 156543.03390625, -128 * 156543.03390625, 128 * 156543.03390625, 128 * 156543.03390625),
        sphericalMercator: true,
        maxResolution: 156543.03390625,
        units: "m",
        projection: "EPSG:900913"
    },
    animationEnabled: true,
    loadMapObject: function () {
        if (!this.type) {
            this.type = google.maps.MapTypeId.ROADMAP;
        }
        var mapObject;
        var cache = OpenLayers.Layer.Google.cache[this.map.id];
        if (cache) {
            mapObject = cache.mapObject;
            ++cache.count;
        } else {
            var container = this.map.viewPortDiv;
            var div = document.createElement("div");
            div.id = this.map.id + "_GMapContainer";
            div.style.position = "absolute";
            div.style.width = "100%";
            div.style.height = "100%";
            container.appendChild(div);
            var center = this.map.getCenter();
            mapObject = new google.maps.Map(div, {
                center: center ? new google.maps.LatLng(center.lat, center.lon) : new google.maps.LatLng(0, 0),
                zoom: this.map.getZoom() || 0,
                mapTypeId: this.type,
                disableDefaultUI: true,
                keyboardShortcuts: false,
                draggable: false,
                disableDoubleClickZoom: true,
                scrollwheel: false,
                streetViewControl: false
            });
            cache = {
                mapObject: mapObject,
                count: 1
            };
            OpenLayers.Layer.Google.cache[this.map.id] = cache;
            this.repositionListener = google.maps.event.addListenerOnce(mapObject, "center_changed", OpenLayers.Function.bind(this.repositionMapElements, this));
        }
        this.mapObject = mapObject;
        this.setGMapVisibility(this.visibility);
    },
    repositionMapElements: function () {
        google.maps.event.trigger(this.mapObject, "resize");
        var div = this.mapObject.getDiv().firstChild;
        if (!div || div.childNodes.length < 3) {
            this.repositionTimer = window.setTimeout(OpenLayers.Function.bind(this.repositionMapElements, this), 250);
            return false;
        }
        var cache = OpenLayers.Layer.Google.cache[this.map.id];
        var container = this.map.viewPortDiv;
        while (div.lastChild.style.display == "none") {
            container.appendChild(div.lastChild);
        }
        var termsOfUse = div.lastChild;
        container.appendChild(termsOfUse);
        termsOfUse.style.zIndex = "1100";
        termsOfUse.style.bottom = "";
        termsOfUse.className = "olLayerGoogleCopyright olLayerGoogleV3";
        termsOfUse.style.display = "";
        cache.termsOfUse = termsOfUse;
        var poweredBy = div.lastChild;
        container.appendChild(poweredBy);
        poweredBy.style.zIndex = "1100";
        poweredBy.style.bottom = "";
        poweredBy.className = "olLayerGooglePoweredBy olLayerGoogleV3 gmnoprint";
        poweredBy.style.display = "";
        cache.poweredBy = poweredBy;
        this.setGMapVisibility(this.visibility);
    },
    onMapResize: function () {
        if (this.visibility) {
            google.maps.event.trigger(this.mapObject, "resize");
        } else {
            var cache = OpenLayers.Layer.Google.cache[this.map.id];
            if (!cache.resized) {
                var layer = this;
                google.maps.event.addListenerOnce(this.mapObject, "tilesloaded", function () {
                    google.maps.event.trigger(layer.mapObject, "resize");
                    layer.moveTo(layer.map.getCenter(), layer.map.getZoom());
                    delete cache.resized;
                });
            }
            cache.resized = true;
        }
    },
    setGMapVisibility: function (visible) {
        var cache = OpenLayers.Layer.Google.cache[this.map.id];
        if (cache) {
            var type = this.type;
            var layers = this.map.layers;
            var layer;
            for (var i = layers.length - 1; i >= 0; --i) {
                layer = layers[i];
                if (layer instanceof OpenLayers.Layer.Google && layer.visibility === true && layer.inRange === true) {
                    type = layer.type;
                    visible = true;
                    break;
                }
            }
            var container = this.mapObject.getDiv();
            if (visible === true) {
                this.mapObject.setMapTypeId(type);
                container.style.left = "";
                if (cache.termsOfUse && cache.termsOfUse.style) {
                    cache.termsOfUse.style.left = "";
                    cache.termsOfUse.style.display = "";
                    cache.poweredBy.style.display = "";
                }
                cache.displayed = this.id;
            } else {
                delete cache.displayed;
                container.style.left = "-9999px";
                if (cache.termsOfUse && cache.termsOfUse.style) {
                    cache.termsOfUse.style.display = "none";
                    cache.termsOfUse.style.left = "-9999px";
                    cache.poweredBy.style.display = "none";
                }
            }
        }
    },
    getMapContainer: function () {
        return this.mapObject.getDiv();
    },
    getMapObjectBoundsFromOLBounds: function (olBounds) {
        var moBounds = null;
        if (olBounds != null) {
            var sw = this.sphericalMercator ? this.inverseMercator(olBounds.bottom, olBounds.left) : new OpenLayers.LonLat(olBounds.bottom, olBounds.left);
            var ne = this.sphericalMercator ? this.inverseMercator(olBounds.top, olBounds.right) : new OpenLayers.LonLat(olBounds.top, olBounds.right);
            moBounds = new google.maps.LatLngBounds(new google.maps.LatLng(sw.lat, sw.lon), new google.maps.LatLng(ne.lat, ne.lon));
        }
        return moBounds;
    },
    getMapObjectLonLatFromMapObjectPixel: function (moPixel) {
        var size = this.map.getSize();
        var lon = this.getLongitudeFromMapObjectLonLat(this.mapObject.center);
        var lat = this.getLatitudeFromMapObjectLonLat(this.mapObject.center);
        var res = this.map.getResolution();
        var delta_x = moPixel.x - (size.w / 2);
        var delta_y = moPixel.y - (size.h / 2);
        var lonlat = new OpenLayers.LonLat(lon + delta_x * res, lat - delta_y * res);
        if (this.wrapDateLine) {
            lonlat = lonlat.wrapDateLine(this.maxExtent);
        }
        return this.getMapObjectLonLatFromLonLat(lonlat.lon, lonlat.lat);
    },
    getMapObjectPixelFromMapObjectLonLat: function (moLonLat) {
        var lon = this.getLongitudeFromMapObjectLonLat(moLonLat);
        var lat = this.getLatitudeFromMapObjectLonLat(moLonLat);
        var res = this.map.getResolution();
        var extent = this.map.getExtent();
        var px = new OpenLayers.Pixel((1 / res * (lon - extent.left)), (1 / res * (extent.top - lat)));
        return this.getMapObjectPixelFromXY(px.x, px.y);
    },
    setMapObjectCenter: function (center, zoom) {
        if (this.animationEnabled === false && zoom != this.mapObject.zoom) {
            var mapContainer = this.getMapContainer();
            google.maps.event.addListenerOnce(this.mapObject, "idle", function () {
                mapContainer.style.visibility = "";
            });
            mapContainer.style.visibility = "hidden";
        }
        this.mapObject.setOptions({
            center: center,
            zoom: zoom
        });
    },
    getMapObjectZoomFromMapObjectBounds: function (moBounds) {
        return this.mapObject.getBoundsZoomLevel(moBounds);
    },
    getMapObjectLonLatFromLonLat: function (lon, lat) {
        var gLatLng;
        if (this.sphericalMercator) {
            var lonlat = this.inverseMercator(lon, lat);
            gLatLng = new google.maps.LatLng(lonlat.lat, lonlat.lon);
        } else {
            gLatLng = new google.maps.LatLng(lat, lon);
        }
        return gLatLng;
    },
    getMapObjectPixelFromXY: function (x, y) {
        return new google.maps.Point(x, y);
    },
    destroy: function () {
        if (this.repositionListener) {
            google.maps.event.removeListener(this.repositionListener);
        }
        if (this.repositionTimer) {
            window.clearTimeout(this.repositionTimer);
        }
        OpenLayers.Layer.Google.prototype.destroy.apply(this, arguments);
    }
};
OpenLayers.Format = OpenLayers.Class({
    options: null,
    externalProjection: null,
    internalProjection: null,
    data: null,
    keepData: false,
    initialize: function (options) {
        OpenLayers.Util.extend(this, options);
        this.options = options;
    },
    destroy: function () {},
    read: function (data) {
        OpenLayers.Console.userError(OpenLayers.i18n("readNotImplemented"));
    },
    write: function (object) {
        OpenLayers.Console.userError(OpenLayers.i18n("writeNotImplemented"));
    },
    CLASS_NAME: "OpenLayers.Format"
});
OpenLayers.Format.WKT = OpenLayers.Class(OpenLayers.Format, {
    initialize: function (options) {
        this.regExes = {
            'typeStr': /^\s*(\w+)\s*\(\s*(.*)\s*\)\s*$/,
            'spaces': /\s+/,
            'parenComma': /\)\s*,\s*\(/,
            'doubleParenComma': /\)\s*\)\s*,\s*\(\s*\(/,
            'trimParens': /^\s*\(?(.*?)\)?\s*$/
        };
        OpenLayers.Format.prototype.initialize.apply(this, [options]);
    },
    read: function (wkt) {
        var features, type, str;
        wkt = wkt.replace(/[\n\r]/g, " ");
        var matches = this.regExes.typeStr.exec(wkt);
        if (matches) {
            type = matches[1].toLowerCase();
            str = matches[2];
            if (this.parse[type]) {
                features = this.parse[type].apply(this, [str]);
            }
            if (this.internalProjection && this.externalProjection) {
                if (features && features.CLASS_NAME == "OpenLayers.Feature.Vector") {
                    features.geometry.transform(this.externalProjection, this.internalProjection);
                } else if (features && type != "geometrycollection" && typeof features == "object") {
                    for (var i = 0, len = features.length; i < len; i++) {
                        var component = features[i];
                        component.geometry.transform(this.externalProjection, this.internalProjection);
                    }
                }
            }
        }
        return features;
    },
    write: function (features) {
        var collection, geometry, type, data, isCollection;
        if (features.constructor == Array) {
            collection = features;
            isCollection = true;
        } else {
            collection = [features];
            isCollection = false;
        }
        var pieces = [];
        if (isCollection) {
            pieces.push('GEOMETRYCOLLECTION(');
        }
        for (var i = 0, len = collection.length; i < len; ++i) {
            if (isCollection && i > 0) {
                pieces.push(',');
            }
            geometry = collection[i].geometry;
            pieces.push(this.extractGeometry(geometry));
        }
        if (isCollection) {
            pieces.push(')');
        }
        return pieces.join('');
    },
    extractGeometry: function (geometry) {
        var type = geometry.CLASS_NAME.split('.')[2].toLowerCase();
        if (!this.extract[type]) {
            return null;
        }
        if (this.internalProjection && this.externalProjection) {
            geometry = geometry.clone();
            geometry.transform(this.internalProjection, this.externalProjection);
        }
        var wktType = type == 'collection' ? 'GEOMETRYCOLLECTION' : type.toUpperCase();
        var data = wktType + '(' + this.extract[type].apply(this, [geometry]) + ')';
        return data;
    },
    extract: {
        'point': function (point) {
            return point.x + ' ' + point.y;
        },
        'multipoint': function (multipoint) {
            var array = [];
            for (var i = 0, len = multipoint.components.length; i < len; ++i) {
                array.push('(' + this.extract.point.apply(this, [multipoint.components[i]]) + ')');
            }
            return array.join(',');
        },
        'linestring': function (linestring) {
            var array = [];
            for (var i = 0, len = linestring.components.length; i < len; ++i) {
                array.push(this.extract.point.apply(this, [linestring.components[i]]));
            }
            return array.join(',');
        },
        'multilinestring': function (multilinestring) {
            var array = [];
            for (var i = 0, len = multilinestring.components.length; i < len; ++i) {
                array.push('(' + this.extract.linestring.apply(this, [multilinestring.components[i]]) + ')');
            }
            return array.join(',');
        },
        'polygon': function (polygon) {
            var array = [];
            for (var i = 0, len = polygon.components.length; i < len; ++i) {
                array.push('(' + this.extract.linestring.apply(this, [polygon.components[i]]) + ')');
            }
            return array.join(',');
        },
        'multipolygon': function (multipolygon) {
            var array = [];
            for (var i = 0, len = multipolygon.components.length; i < len; ++i) {
                array.push('(' + this.extract.polygon.apply(this, [multipolygon.components[i]]) + ')');
            }
            return array.join(',');
        },
        'collection': function (collection) {
            var array = [];
            for (var i = 0, len = collection.components.length; i < len; ++i) {
                array.push(this.extractGeometry.apply(this, [collection.components[i]]));
            }
            return array.join(',');
        }
    },
    parse: {
        'point': function (str) {
            var coords = OpenLayers.String.trim(str).split(this.regExes.spaces);
            return new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(coords[0], coords[1]));
        },
        'multipoint': function (str) {
            var point;
            var points = OpenLayers.String.trim(str).split(',');
            var components = [];
            for (var i = 0, len = points.length; i < len; ++i) {
                point = points[i].replace(this.regExes.trimParens, '$1');
                components.push(this.parse.point.apply(this, [point]).geometry);
            }
            return new OpenLayers.Feature.Vector(new OpenLayers.Geometry.MultiPoint(components));
        },
        'linestring': function (str) {
            var points = OpenLayers.String.trim(str).split(',');
            var components = [];
            for (var i = 0, len = points.length; i < len; ++i) {
                components.push(this.parse.point.apply(this, [points[i]]).geometry);
            }
            return new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString(components));
        },
        'multilinestring': function (str) {
            var line;
            var lines = OpenLayers.String.trim(str).split(this.regExes.parenComma);
            var components = [];
            for (var i = 0, len = lines.length; i < len; ++i) {
                line = lines[i].replace(this.regExes.trimParens, '$1');
                components.push(this.parse.linestring.apply(this, [line]).geometry);
            }
            return new OpenLayers.Feature.Vector(new OpenLayers.Geometry.MultiLineString(components));
        },
        'polygon': function (str) {
            var ring, linestring, linearring;
            var rings = OpenLayers.String.trim(str).split(this.regExes.parenComma);
            var components = [];
            for (var i = 0, len = rings.length; i < len; ++i) {
                ring = rings[i].replace(this.regExes.trimParens, '$1');
                linestring = this.parse.linestring.apply(this, [ring]).geometry;
                linearring = new OpenLayers.Geometry.LinearRing(linestring.components);
                components.push(linearring);
            }
            return new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Polygon(components));
        },
        'multipolygon': function (str) {
            var polygon;
            var polygons = OpenLayers.String.trim(str).split(this.regExes.doubleParenComma);
            var components = [];
            for (var i = 0, len = polygons.length; i < len; ++i) {
                polygon = polygons[i].replace(this.regExes.trimParens, '$1');
                components.push(this.parse.polygon.apply(this, [polygon]).geometry);
            }
            return new OpenLayers.Feature.Vector(new OpenLayers.Geometry.MultiPolygon(components));
        },
        'geometrycollection': function (str) {
            str = str.replace(/,\s*([A-Za-z])/g, '|$1');
            var wktArray = OpenLayers.String.trim(str).split('|');
            var components = [];
            for (var i = 0, len = wktArray.length; i < len; ++i) {
                components.push(OpenLayers.Format.WKT.prototype.read.apply(this, [wktArray[i]]));
            }
            return components;
        }
    },
    CLASS_NAME: "OpenLayers.Format.WKT"
});
OpenLayers.Geometry = OpenLayers.Class({
    id: null,
    parent: null,
    bounds: null,
    initialize: function () {
        this.id = OpenLayers.Util.createUniqueID(this.CLASS_NAME + "_");
    },
    destroy: function () {
        this.id = null;
        this.bounds = null;
    },
    clone: function () {
        return new OpenLayers.Geometry();
    },
    setBounds: function (bounds) {
        if (bounds) {
            this.bounds = bounds.clone();
        }
    },
    clearBounds: function () {
        this.bounds = null;
        if (this.parent) {
            this.parent.clearBounds();
        }
    },
    extendBounds: function (newBounds) {
        var bounds = this.getBounds();
        if (!bounds) {
            this.setBounds(newBounds);
        } else {
            this.bounds.extend(newBounds);
        }
    },
    getBounds: function () {
        if (this.bounds == null) {
            this.calculateBounds();
        }
        return this.bounds;
    },
    calculateBounds: function () {},
    distanceTo: function (geometry, options) {},
    getVertices: function (nodes) {},
    atPoint: function (lonlat, toleranceLon, toleranceLat) {
        var atPoint = false;
        var bounds = this.getBounds();
        if ((bounds != null) && (lonlat != null)) {
            var dX = (toleranceLon != null) ? toleranceLon : 0;
            var dY = (toleranceLat != null) ? toleranceLat : 0;
            var toleranceBounds = new OpenLayers.Bounds(this.bounds.left - dX, this.bounds.bottom - dY, this.bounds.right + dX, this.bounds.top + dY);
            atPoint = toleranceBounds.containsLonLat(lonlat);
        }
        return atPoint;
    },
    getLength: function () {
        return 0.0;
    },
    getArea: function () {
        return 0.0;
    },
    getCentroid: function () {
        return null;
    },
    toString: function () {
        return OpenLayers.Format.WKT.prototype.write(new OpenLayers.Feature.Vector(this));
    },
    CLASS_NAME: "OpenLayers.Geometry"
});
OpenLayers.Geometry.fromWKT = function (wkt) {
    var format = arguments.callee.format;
    if (!format) {
        format = new OpenLayers.Format.WKT();
        arguments.callee.format = format;
    }
    var geom;
    var result = format.read(wkt);
    if (result instanceof OpenLayers.Feature.Vector) {
        geom = result.geometry;
    } else if (OpenLayers.Util.isArray(result)) {
        var len = result.length;
        var components = new Array(len);
        for (var i = 0; i < len; ++i) {
            components[i] = result[i].geometry;
        }
        geom = new OpenLayers.Geometry.Collection(components);
    }
    return geom;
};
OpenLayers.Geometry.segmentsIntersect = function (seg1, seg2, options) {
    var point = options && options.point;
    var tolerance = options && options.tolerance;
    var intersection = false;
    var x11_21 = seg1.x1 - seg2.x1;
    var y11_21 = seg1.y1 - seg2.y1;
    var x12_11 = seg1.x2 - seg1.x1;
    var y12_11 = seg1.y2 - seg1.y1;
    var y22_21 = seg2.y2 - seg2.y1;
    var x22_21 = seg2.x2 - seg2.x1;
    var d = (y22_21 * x12_11) - (x22_21 * y12_11);
    var n1 = (x22_21 * y11_21) - (y22_21 * x11_21);
    var n2 = (x12_11 * y11_21) - (y12_11 * x11_21);
    if (d == 0) {
        if (n1 == 0 && n2 == 0) {
            intersection = true;
        }
    } else {
        var along1 = n1 / d;
        var along2 = n2 / d;
        if (along1 >= 0 && along1 <= 1 && along2 >= 0 && along2 <= 1) {
            if (!point) {
                intersection = true;
            } else {
                var x = seg1.x1 + (along1 * x12_11);
                var y = seg1.y1 + (along1 * y12_11);
                intersection = new OpenLayers.Geometry.Point(x, y);
            }
        }
    }
    if (tolerance) {
        var dist;
        if (intersection) {
            if (point) {
                var segs = [seg1, seg2];
                var seg, x, y;
                outer: for (var i = 0; i < 2; ++i) {
                    seg = segs[i];
                    for (var j = 1; j < 3; ++j) {
                        x = seg["x" + j];
                        y = seg["y" + j];
                        dist = Math.sqrt(Math.pow(x - intersection.x, 2) + Math.pow(y - intersection.y, 2));
                        if (dist < tolerance) {
                            intersection.x = x;
                            intersection.y = y;
                            break outer;
                        }
                    }
                }
            }
        } else {
            var segs = [seg1, seg2];
            var source, target, x, y, p, result;
            outer: for (var i = 0; i < 2; ++i) {
                source = segs[i];
                target = segs[(i + 1) % 2];
                for (var j = 1; j < 3; ++j) {
                    p = {
                        x: source["x" + j],
                        y: source["y" + j]
                    };
                    result = OpenLayers.Geometry.distanceToSegment(p, target);
                    if (result.distance < tolerance) {
                        if (point) {
                            intersection = new OpenLayers.Geometry.Point(p.x, p.y);
                        } else {
                            intersection = true;
                        }
                        break outer;
                    }
                }
            }
        }
    }
    return intersection;
};
OpenLayers.Geometry.distanceToSegment = function (point, segment) {
    var x0 = point.x;
    var y0 = point.y;
    var x1 = segment.x1;
    var y1 = segment.y1;
    var x2 = segment.x2;
    var y2 = segment.y2;
    var dx = x2 - x1;
    var dy = y2 - y1;
    var along = ((dx * (x0 - x1)) + (dy * (y0 - y1))) / (Math.pow(dx, 2) + Math.pow(dy, 2));
    var x, y;
    if (along <= 0.0) {
        x = x1;
        y = y1;
    } else if (along >= 1.0) {
        x = x2;
        y = y2;
    } else {
        x = x1 + along * dx;
        y = y1 + along * dy;
    }
    return {
        distance: Math.sqrt(Math.pow(x - x0, 2) + Math.pow(y - y0, 2)),
        x: x,
        y: y
    };
};
OpenLayers.Geometry.Collection = OpenLayers.Class(OpenLayers.Geometry, {
    components: null,
    componentTypes: null,
    initialize: function (components) {
        OpenLayers.Geometry.prototype.initialize.apply(this, arguments);
        this.components = [];
        if (components != null) {
            this.addComponents(components);
        }
    },
    destroy: function () {
        this.components.length = 0;
        this.components = null;
        OpenLayers.Geometry.prototype.destroy.apply(this, arguments);
    },
    clone: function () {
        var geometry = eval("new " + this.CLASS_NAME + "()");
        for (var i = 0, len = this.components.length; i < len; i++) {
            geometry.addComponent(this.components[i].clone());
        }
        OpenLayers.Util.applyDefaults(geometry, this);
        return geometry;
    },
    getComponentsString: function () {
        var strings = [];
        for (var i = 0, len = this.components.length; i < len; i++) {
            strings.push(this.components[i].toShortString());
        }
        return strings.join(",");
    },
    calculateBounds: function () {
        this.bounds = null;
        var bounds = new OpenLayers.Bounds();
        var components = this.components;
        if (components) {
            for (var i = 0, len = components.length; i < len; i++) {
                bounds.extend(components[i].getBounds());
            }
        }
        if (bounds.left != null && bounds.bottom != null && bounds.right != null && bounds.top != null) {
            this.setBounds(bounds);
        }
    },
    addComponents: function (components) {
        if (!(OpenLayers.Util.isArray(components))) {
            components = [components];
        }
        for (var i = 0, len = components.length; i < len; i++) {
            this.addComponent(components[i]);
        }
    },
    addComponent: function (component, index) {
        var added = false;
        if (component) {
            if (this.componentTypes == null || (OpenLayers.Util.indexOf(this.componentTypes, component.CLASS_NAME) > -1)) {
                if (index != null && (index < this.components.length)) {
                    var components1 = this.components.slice(0, index);
                    var components2 = this.components.slice(index, this.components.length);
                    components1.push(component);
                    this.components = components1.concat(components2);
                } else {
                    this.components.push(component);
                }
                component.parent = this;
                this.clearBounds();
                added = true;
            }
        }
        return added;
    },
    removeComponents: function (components) {
        var removed = false;
        if (!(OpenLayers.Util.isArray(components))) {
            components = [components];
        }
        for (var i = components.length - 1; i >= 0; --i) {
            removed = this.removeComponent(components[i]) || removed;
        }
        return removed;
    },
    removeComponent: function (component) {
        OpenLayers.Util.removeItem(this.components, component);
        this.clearBounds();
        return true;
    },
    getLength: function () {
        var length = 0.0;
        for (var i = 0, len = this.components.length; i < len; i++) {
            length += this.components[i].getLength();
        }
        return length;
    },
    getArea: function () {
        var area = 0.0;
        for (var i = 0, len = this.components.length; i < len; i++) {
            area += this.components[i].getArea();
        }
        return area;
    },
    getGeodesicArea: function (projection) {
        var area = 0.0;
        for (var i = 0, len = this.components.length; i < len; i++) {
            area += this.components[i].getGeodesicArea(projection);
        }
        return area;
    },
    getCentroid: function (weighted) {
        if (!weighted) {
            return this.components.length && this.components[0].getCentroid();
        }
        var len = this.components.length;
        if (!len) {
            return false;
        }
        var areas = [];
        var centroids = [];
        var areaSum = 0;
        var minArea = Number.MAX_VALUE;
        var component;
        for (var i = 0; i < len; ++i) {
            component = this.components[i];
            var area = component.getArea();
            var centroid = component.getCentroid(true);
            if (isNaN(area) || isNaN(centroid.x) || isNaN(centroid.y)) {
                continue;
            }
            areas.push(area);
            areaSum += area;
            minArea = (area < minArea && area > 0) ? area : minArea;
            centroids.push(centroid);
        }
        len = areas.length;
        if (areaSum === 0) {
            for (var i = 0; i < len; ++i) {
                areas[i] = 1;
            }
            areaSum = areas.length;
        } else {
            for (var i = 0; i < len; ++i) {
                areas[i] /= minArea;
            }
            areaSum /= minArea;
        }
        var xSum = 0,
            ySum = 0,
            centroid, area;
        for (var i = 0; i < len; ++i) {
            centroid = centroids[i];
            area = areas[i];
            xSum += centroid.x * area;
            ySum += centroid.y * area;
        }
        return new OpenLayers.Geometry.Point(xSum / areaSum, ySum / areaSum);
    },
    getGeodesicLength: function (projection) {
        var length = 0.0;
        for (var i = 0, len = this.components.length; i < len; i++) {
            length += this.components[i].getGeodesicLength(projection);
        }
        return length;
    },
    move: function (x, y) {
        for (var i = 0, len = this.components.length; i < len; i++) {
            this.components[i].move(x, y);
        }
    },
    rotate: function (angle, origin) {
        for (var i = 0, len = this.components.length; i < len; ++i) {
            this.components[i].rotate(angle, origin);
        }
    },
    resize: function (scale, origin, ratio) {
        for (var i = 0; i < this.components.length; ++i) {
            this.components[i].resize(scale, origin, ratio);
        }
        return this;
    },
    distanceTo: function (geometry, options) {
        var edge = !(options && options.edge === false);
        var details = edge && options && options.details;
        var result, best, distance;
        var min = Number.POSITIVE_INFINITY;
        for (var i = 0, len = this.components.length; i < len; ++i) {
            result = this.components[i].distanceTo(geometry, options);
            distance = details ? result.distance : result;
            if (distance < min) {
                min = distance;
                best = result;
                if (min == 0) {
                    break;
                }
            }
        }
        return best;
    },
    equals: function (geometry) {
        var equivalent = true;
        if (!geometry || !geometry.CLASS_NAME || (this.CLASS_NAME != geometry.CLASS_NAME)) {
            equivalent = false;
        } else if (!(OpenLayers.Util.isArray(geometry.components)) || (geometry.components.length != this.components.length)) {
            equivalent = false;
        } else {
            for (var i = 0, len = this.components.length; i < len; ++i) {
                if (!this.components[i].equals(geometry.components[i])) {
                    equivalent = false;
                    break;
                }
            }
        }
        return equivalent;
    },
    transform: function (source, dest) {
        if (source && dest) {
            for (var i = 0, len = this.components.length; i < len; i++) {
                var component = this.components[i];
                component.transform(source, dest);
            }
            this.bounds = null;
        }
        return this;
    },
    intersects: function (geometry) {
        var intersect = false;
        for (var i = 0, len = this.components.length; i < len; ++i) {
            intersect = geometry.intersects(this.components[i]);
            if (intersect) {
                break;
            }
        }
        return intersect;
    },
    getVertices: function (nodes) {
        var vertices = [];
        for (var i = 0, len = this.components.length; i < len; ++i) {
            Array.prototype.push.apply(vertices, this.components[i].getVertices(nodes));
        }
        return vertices;
    },
    CLASS_NAME: "OpenLayers.Geometry.Collection"
});
OpenLayers.Geometry.Point = OpenLayers.Class(OpenLayers.Geometry, {
    x: null,
    y: null,
    initialize: function (x, y) {
        OpenLayers.Geometry.prototype.initialize.apply(this, arguments);
        this.x = parseFloat(x);
        this.y = parseFloat(y);
    },
    clone: function (obj) {
        if (obj == null) {
            obj = new OpenLayers.Geometry.Point(this.x, this.y);
        }
        OpenLayers.Util.applyDefaults(obj, this);
        return obj;
    },
    calculateBounds: function () {
        this.bounds = new OpenLayers.Bounds(this.x, this.y, this.x, this.y);
    },
    distanceTo: function (geometry, options) {
        var edge = !(options && options.edge === false);
        var details = edge && options && options.details;
        var distance, x0, y0, x1, y1, result;
        if (geometry instanceof OpenLayers.Geometry.Point) {
            x0 = this.x;
            y0 = this.y;
            x1 = geometry.x;
            y1 = geometry.y;
            distance = Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));
            result = !details ? distance : {
                x0: x0,
                y0: y0,
                x1: x1,
                y1: y1,
                distance: distance
            };
        } else {
            result = geometry.distanceTo(this, options);
            if (details) {
                result = {
                    x0: result.x1,
                    y0: result.y1,
                    x1: result.x0,
                    y1: result.y0,
                    distance: result.distance
                };
            }
        }
        return result;
    },
    equals: function (geom) {
        var equals = false;
        if (geom != null) {
            equals = ((this.x == geom.x && this.y == geom.y) || (isNaN(this.x) && isNaN(this.y) && isNaN(geom.x) && isNaN(geom.y)));
        }
        return equals;
    },
    toShortString: function () {
        return (this.x + ", " + this.y);
    },
    move: function (x, y) {
        this.x = this.x + x;
        this.y = this.y + y;
        this.clearBounds();
    },
    rotate: function (angle, origin) {
        angle *= Math.PI / 180;
        var radius = this.distanceTo(origin);
        var theta = angle + Math.atan2(this.y - origin.y, this.x - origin.x);
        this.x = origin.x + (radius * Math.cos(theta));
        this.y = origin.y + (radius * Math.sin(theta));
        this.clearBounds();
    },
    getCentroid: function () {
        return new OpenLayers.Geometry.Point(this.x, this.y);
    },
    resize: function (scale, origin, ratio) {
        ratio = (ratio == undefined) ? 1 : ratio;
        this.x = origin.x + (scale * ratio * (this.x - origin.x));
        this.y = origin.y + (scale * (this.y - origin.y));
        this.clearBounds();
        return this;
    },
    intersects: function (geometry) {
        var intersect = false;
        if (geometry.CLASS_NAME == "OpenLayers.Geometry.Point") {
            intersect = this.equals(geometry);
        } else {
            intersect = geometry.intersects(this);
        }
        return intersect;
    },
    transform: function (source, dest) {
        if ((source && dest)) {
            OpenLayers.Projection.transform(this, source, dest);
            this.bounds = null;
        }
        return this;
    },
    getVertices: function (nodes) {
        return [this];
    },
    CLASS_NAME: "OpenLayers.Geometry.Point"
});
OpenLayers.Geometry.MultiPoint = OpenLayers.Class(OpenLayers.Geometry.Collection, {
    componentTypes: ["OpenLayers.Geometry.Point"],
    initialize: function (components) {
        OpenLayers.Geometry.Collection.prototype.initialize.apply(this, arguments);
    },
    addPoint: function (point, index) {
        this.addComponent(point, index);
    },
    removePoint: function (point) {
        this.removeComponent(point);
    },
    CLASS_NAME: "OpenLayers.Geometry.MultiPoint"
});
OpenLayers.Geometry.Curve = OpenLayers.Class(OpenLayers.Geometry.MultiPoint, {
    componentTypes: ["OpenLayers.Geometry.Point"],
    initialize: function (points) {
        OpenLayers.Geometry.MultiPoint.prototype.initialize.apply(this, arguments);
    },
    getLength: function () {
        var length = 0.0;
        if (this.components && (this.components.length > 1)) {
            for (var i = 1, len = this.components.length; i < len; i++) {
                length += this.components[i - 1].distanceTo(this.components[i]);
            }
        }
        return length;
    },
    getGeodesicLength: function (projection) {
        var geom = this;
        if (projection) {
            var gg = new OpenLayers.Projection("EPSG:4326");
            if (!gg.equals(projection)) {
                geom = this.clone().transform(projection, gg);
            }
        }
        var length = 0.0;
        if (geom.components && (geom.components.length > 1)) {
            var p1, p2;
            for (var i = 1, len = geom.components.length; i < len; i++) {
                p1 = geom.components[i - 1];
                p2 = geom.components[i];
                length += OpenLayers.Util.distVincenty({
                    lon: p1.x,
                    lat: p1.y
                }, {
                    lon: p2.x,
                    lat: p2.y
                });
            }
        }
        return length * 1000;
    },
    CLASS_NAME: "OpenLayers.Geometry.Curve"
});
OpenLayers.Geometry.LineString = OpenLayers.Class(OpenLayers.Geometry.Curve, {
    initialize: function (points) {
        OpenLayers.Geometry.Curve.prototype.initialize.apply(this, arguments);
    },
    removeComponent: function (point) {
        var removed = this.components && (this.components.length > 2);
        if (removed) {
            OpenLayers.Geometry.Collection.prototype.removeComponent.apply(this, arguments);
        }
        return removed;
    },
    intersects: function (geometry) {
        var intersect = false;
        var type = geometry.CLASS_NAME;
        if (type == "OpenLayers.Geometry.LineString" || type == "OpenLayers.Geometry.LinearRing" || type == "OpenLayers.Geometry.Point") {
            var segs1 = this.getSortedSegments();
            var segs2;
            if (type == "OpenLayers.Geometry.Point") {
                segs2 = [{
                    x1: geometry.x,
                    y1: geometry.y,
                    x2: geometry.x,
                    y2: geometry.y
                }];
            } else {
                segs2 = geometry.getSortedSegments();
            }
            var seg1, seg1x1, seg1x2, seg1y1, seg1y2, seg2, seg2y1, seg2y2;
            outer: for (var i = 0, len = segs1.length; i < len; ++i) {
                seg1 = segs1[i];
                seg1x1 = seg1.x1;
                seg1x2 = seg1.x2;
                seg1y1 = seg1.y1;
                seg1y2 = seg1.y2;
                inner: for (var j = 0, jlen = segs2.length; j < jlen; ++j) {
                    seg2 = segs2[j];
                    if (seg2.x1 > seg1x2) {
                        break;
                    }
                    if (seg2.x2 < seg1x1) {
                        continue;
                    }
                    seg2y1 = seg2.y1;
                    seg2y2 = seg2.y2;
                    if (Math.min(seg2y1, seg2y2) > Math.max(seg1y1, seg1y2)) {
                        continue;
                    }
                    if (Math.max(seg2y1, seg2y2) < Math.min(seg1y1, seg1y2)) {
                        continue;
                    }
                    if (OpenLayers.Geometry.segmentsIntersect(seg1, seg2)) {
                        intersect = true;
                        break outer;
                    }
                }
            }
        } else {
            intersect = geometry.intersects(this);
        }
        return intersect;
    },
    getSortedSegments: function () {
        var numSeg = this.components.length - 1;
        var segments = new Array(numSeg),
            point1, point2;
        for (var i = 0; i < numSeg; ++i) {
            point1 = this.components[i];
            point2 = this.components[i + 1];
            if (point1.x < point2.x) {
                segments[i] = {
                    x1: point1.x,
                    y1: point1.y,
                    x2: point2.x,
                    y2: point2.y
                };
            } else {
                segments[i] = {
                    x1: point2.x,
                    y1: point2.y,
                    x2: point1.x,
                    y2: point1.y
                };
            }
        }

        function byX1(seg1, seg2) {
            return seg1.x1 - seg2.x1;
        }
        return segments.sort(byX1);
    },
    splitWithSegment: function (seg, options) {
        var edge = !(options && options.edge === false);
        var tolerance = options && options.tolerance;
        var lines = [];
        var verts = this.getVertices();
        var points = [];
        var intersections = [];
        var split = false;
        var vert1, vert2, point;
        var node, vertex, target;
        var interOptions = {
            point: true,
            tolerance: tolerance
        };
        var result = null;
        for (var i = 0, stop = verts.length - 2; i <= stop; ++i) {
            vert1 = verts[i];
            points.push(vert1.clone());
            vert2 = verts[i + 1];
            target = {
                x1: vert1.x,
                y1: vert1.y,
                x2: vert2.x,
                y2: vert2.y
            };
            point = OpenLayers.Geometry.segmentsIntersect(seg, target, interOptions);
            if (point instanceof OpenLayers.Geometry.Point) {
                if ((point.x === seg.x1 && point.y === seg.y1) || (point.x === seg.x2 && point.y === seg.y2) || point.equals(vert1) || point.equals(vert2)) {
                    vertex = true;
                } else {
                    vertex = false;
                }
                if (vertex || edge) {
                    if (!point.equals(intersections[intersections.length - 1])) {
                        intersections.push(point.clone());
                    }
                    if (i === 0) {
                        if (point.equals(vert1)) {
                            continue;
                        }
                    }
                    if (point.equals(vert2)) {
                        continue;
                    }
                    split = true;
                    if (!point.equals(vert1)) {
                        points.push(point);
                    }
                    lines.push(new OpenLayers.Geometry.LineString(points));
                    points = [point.clone()];
                }
            }
        }
        if (split) {
            points.push(vert2.clone());
            lines.push(new OpenLayers.Geometry.LineString(points));
        }
        if (intersections.length > 0) {
            var xDir = seg.x1 < seg.x2 ? 1 : -1;
            var yDir = seg.y1 < seg.y2 ? 1 : -1;
            result = {
                lines: lines,
                points: intersections.sort(function (p1, p2) {
                    return (xDir * p1.x - xDir * p2.x) || (yDir * p1.y - yDir * p2.y);
                })
            };
        }
        return result;
    },
    split: function (target, options) {
        var results = null;
        var mutual = options && options.mutual;
        var sourceSplit, targetSplit, sourceParts, targetParts;
        if (target instanceof OpenLayers.Geometry.LineString) {
            var verts = this.getVertices();
            var vert1, vert2, seg, splits, lines, point;
            var points = [];
            sourceParts = [];
            for (var i = 0, stop = verts.length - 2; i <= stop; ++i) {
                vert1 = verts[i];
                vert2 = verts[i + 1];
                seg = {
                    x1: vert1.x,
                    y1: vert1.y,
                    x2: vert2.x,
                    y2: vert2.y
                };
                targetParts = targetParts || [target];
                if (mutual) {
                    points.push(vert1.clone());
                }
                for (var j = 0; j < targetParts.length; ++j) {
                    splits = targetParts[j].splitWithSegment(seg, options);
                    if (splits) {
                        lines = splits.lines;
                        if (lines.length > 0) {
                            lines.unshift(j, 1);
                            Array.prototype.splice.apply(targetParts, lines);
                            j += lines.length - 2;
                        }
                        if (mutual) {
                            for (var k = 0, len = splits.points.length; k < len; ++k) {
                                point = splits.points[k];
                                if (!point.equals(vert1)) {
                                    points.push(point);
                                    sourceParts.push(new OpenLayers.Geometry.LineString(points));
                                    if (point.equals(vert2)) {
                                        points = [];
                                    } else {
                                        points = [point.clone()];
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (mutual && sourceParts.length > 0 && points.length > 0) {
                points.push(vert2.clone());
                sourceParts.push(new OpenLayers.Geometry.LineString(points));
            }
        } else {
            results = target.splitWith(this, options);
        }
        if (targetParts && targetParts.length > 1) {
            targetSplit = true;
        } else {
            targetParts = [];
        }
        if (sourceParts && sourceParts.length > 1) {
            sourceSplit = true;
        } else {
            sourceParts = [];
        }
        if (targetSplit || sourceSplit) {
            if (mutual) {
                results = [sourceParts, targetParts];
            } else {
                results = targetParts;
            }
        }
        return results;
    },
    splitWith: function (geometry, options) {
        return geometry.split(this, options);
    },
    getVertices: function (nodes) {
        var vertices;
        if (nodes === true) {
            vertices = [this.components[0], this.components[this.components.length - 1]];
        } else if (nodes === false) {
            vertices = this.components.slice(1, this.components.length - 1);
        } else {
            vertices = this.components.slice();
        }
        return vertices;
    },
    distanceTo: function (geometry, options) {
        var edge = !(options && options.edge === false);
        var details = edge && options && options.details;
        var result, best = {};
        var min = Number.POSITIVE_INFINITY;
        if (geometry instanceof OpenLayers.Geometry.Point) {
            var segs = this.getSortedSegments();
            var x = geometry.x;
            var y = geometry.y;
            var seg;
            for (var i = 0, len = segs.length; i < len; ++i) {
                seg = segs[i];
                result = OpenLayers.Geometry.distanceToSegment(geometry, seg);
                if (result.distance < min) {
                    min = result.distance;
                    best = result;
                    if (min === 0) {
                        break;
                    }
                } else {
                    if (seg.x2 > x && ((y > seg.y1 && y < seg.y2) || (y < seg.y1 && y > seg.y2))) {
                        break;
                    }
                }
            }
            if (details) {
                best = {
                    distance: best.distance,
                    x0: best.x,
                    y0: best.y,
                    x1: x,
                    y1: y
                };
            } else {
                best = best.distance;
            }
        } else if (geometry instanceof OpenLayers.Geometry.LineString) {
            var segs0 = this.getSortedSegments();
            var segs1 = geometry.getSortedSegments();
            var seg0, seg1, intersection, x0, y0;
            var len1 = segs1.length;
            var interOptions = {
                point: true
            };
            outer: for (var i = 0, len = segs0.length; i < len; ++i) {
                seg0 = segs0[i];
                x0 = seg0.x1;
                y0 = seg0.y1;
                for (var j = 0; j < len1; ++j) {
                    seg1 = segs1[j];
                    intersection = OpenLayers.Geometry.segmentsIntersect(seg0, seg1, interOptions);
                    if (intersection) {
                        min = 0;
                        best = {
                            distance: 0,
                            x0: intersection.x,
                            y0: intersection.y,
                            x1: intersection.x,
                            y1: intersection.y
                        };
                        break outer;
                    } else {
                        result = OpenLayers.Geometry.distanceToSegment({
                            x: x0,
                            y: y0
                        }, seg1);
                        if (result.distance < min) {
                            min = result.distance;
                            best = {
                                distance: min,
                                x0: x0,
                                y0: y0,
                                x1: result.x,
                                y1: result.y
                            };
                        }
                    }
                }
            }
            if (!details) {
                best = best.distance;
            }
            if (min !== 0) {
                if (seg0) {
                    result = geometry.distanceTo(new OpenLayers.Geometry.Point(seg0.x2, seg0.y2), options);
                    var dist = details ? result.distance : result;
                    if (dist < min) {
                        if (details) {
                            best = {
                                distance: min,
                                x0: result.x1,
                                y0: result.y1,
                                x1: result.x0,
                                y1: result.y0
                            };
                        } else {
                            best = dist;
                        }
                    }
                }
            }
        } else {
            best = geometry.distanceTo(this, options);
            if (details) {
                best = {
                    distance: best.distance,
                    x0: best.x1,
                    y0: best.y1,
                    x1: best.x0,
                    y1: best.y0
                };
            }
        }
        return best;
    },
    simplify: function (tolerance) {
        if (this && this !== null) {
            var points = this.getVertices();
            if (points.length < 3) {
                return this;
            }
            var compareNumbers = function (a, b) {
                    return (a - b);
                };
            var douglasPeuckerReduction = function (points, firstPoint, lastPoint, tolerance) {
                    var maxDistance = 0;
                    var indexFarthest = 0;
                    for (var index = firstPoint, distance; index < lastPoint; index++) {
                        distance = perpendicularDistance(points[firstPoint], points[lastPoint], points[index]);
                        if (distance > maxDistance) {
                            maxDistance = distance;
                            indexFarthest = index;
                        }
                    }
                    if (maxDistance > tolerance && indexFarthest != firstPoint) {
                        pointIndexsToKeep.push(indexFarthest);
                        douglasPeuckerReduction(points, firstPoint, indexFarthest, tolerance);
                        douglasPeuckerReduction(points, indexFarthest, lastPoint, tolerance);
                    }
                };
            var perpendicularDistance = function (point1, point2, point) {
                    var area = Math.abs(0.5 * (point1.x * point2.y + point2.x * point.y + point.x * point1.y - point2.x * point1.y - point.x * point2.y - point1.x * point.y));
                    var bottom = Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
                    var height = area / bottom * 2;
                    return height;
                };
            var firstPoint = 0;
            var lastPoint = points.length - 1;
            var pointIndexsToKeep = [];
            pointIndexsToKeep.push(firstPoint);
            pointIndexsToKeep.push(lastPoint);
            while (points[firstPoint].equals(points[lastPoint])) {
                lastPoint--;
                pointIndexsToKeep.push(lastPoint);
            }
            douglasPeuckerReduction(points, firstPoint, lastPoint, tolerance);
            var returnPoints = [];
            pointIndexsToKeep.sort(compareNumbers);
            for (var index = 0; index < pointIndexsToKeep.length; index++) {
                returnPoints.push(points[pointIndexsToKeep[index]]);
            }
            return new OpenLayers.Geometry.LineString(returnPoints);
        } else {
            return this;
        }
    },
    CLASS_NAME: "OpenLayers.Geometry.LineString"
});
OpenLayers.Geometry.LinearRing = OpenLayers.Class(OpenLayers.Geometry.LineString, {
    componentTypes: ["OpenLayers.Geometry.Point"],
    initialize: function (points) {
        OpenLayers.Geometry.LineString.prototype.initialize.apply(this, arguments);
    },
    addComponent: function (point, index) {
        var added = false;
        var lastPoint = this.components.pop();
        if (index != null || !point.equals(lastPoint)) {
            added = OpenLayers.Geometry.Collection.prototype.addComponent.apply(this, arguments);
        }
        var firstPoint = this.components[0];
        OpenLayers.Geometry.Collection.prototype.addComponent.apply(this, [firstPoint]);
        return added;
    },
    removeComponent: function (point) {
        var removed = this.components && (this.components.length > 3);
        if (removed) {
            this.components.pop();
            OpenLayers.Geometry.Collection.prototype.removeComponent.apply(this, arguments);
            var firstPoint = this.components[0];
            OpenLayers.Geometry.Collection.prototype.addComponent.apply(this, [firstPoint]);
        }
        return removed;
    },
    move: function (x, y) {
        for (var i = 0, len = this.components.length; i < len - 1; i++) {
            this.components[i].move(x, y);
        }
    },
    rotate: function (angle, origin) {
        for (var i = 0, len = this.components.length; i < len - 1; ++i) {
            this.components[i].rotate(angle, origin);
        }
    },
    resize: function (scale, origin, ratio) {
        for (var i = 0, len = this.components.length; i < len - 1; ++i) {
            this.components[i].resize(scale, origin, ratio);
        }
        return this;
    },
    transform: function (source, dest) {
        if (source && dest) {
            for (var i = 0, len = this.components.length; i < len - 1; i++) {
                var component = this.components[i];
                component.transform(source, dest);
            }
            this.bounds = null;
        }
        return this;
    },
    getCentroid: function () {
        if (this.components && (this.components.length > 2)) {
            var sumX = 0.0;
            var sumY = 0.0;
            for (var i = 0; i < this.components.length - 1; i++) {
                var b = this.components[i];
                var c = this.components[i + 1];
                sumX += (b.x + c.x) * (b.x * c.y - c.x * b.y);
                sumY += (b.y + c.y) * (b.x * c.y - c.x * b.y);
            }
            var area = -1 * this.getArea();
            var x = sumX / (6 * area);
            var y = sumY / (6 * area);
            return new OpenLayers.Geometry.Point(x, y);
        } else {
            return null;
        }
    },
    getArea: function () {
        var area = 0.0;
        if (this.components && (this.components.length > 2)) {
            var sum = 0.0;
            for (var i = 0, len = this.components.length; i < len - 1; i++) {
                var b = this.components[i];
                var c = this.components[i + 1];
                sum += (b.x + c.x) * (c.y - b.y);
            }
            area = -sum / 2.0;
        }
        return area;
    },
    getGeodesicArea: function (projection) {
        var ring = this;
        if (projection) {
            var gg = new OpenLayers.Projection("EPSG:4326");
            if (!gg.equals(projection)) {
                ring = this.clone().transform(projection, gg);
            }
        }
        var area = 0.0;
        var len = ring.components && ring.components.length;
        if (len > 2) {
            var p1, p2;
            for (var i = 0; i < len - 1; i++) {
                p1 = ring.components[i];
                p2 = ring.components[i + 1];
                area += OpenLayers.Util.rad(p2.x - p1.x) * (2 + Math.sin(OpenLayers.Util.rad(p1.y)) + Math.sin(OpenLayers.Util.rad(p2.y)));
            }
            area = area * 6378137.0 * 6378137.0 / 2.0;
        }
        return area;
    },
    containsPoint: function (point) {
        var approx = OpenLayers.Number.limitSigDigs;
        var digs = 14;
        var px = approx(point.x, digs);
        var py = approx(point.y, digs);

        function getX(y, x1, y1, x2, y2) {
            return (((x1 - x2) * y) + ((x2 * y1) - (x1 * y2))) / (y1 - y2);
        }
        var numSeg = this.components.length - 1;
        var start, end, x1, y1, x2, y2, cx, cy;
        var crosses = 0;
        for (var i = 0; i < numSeg; ++i) {
            start = this.components[i];
            x1 = approx(start.x, digs);
            y1 = approx(start.y, digs);
            end = this.components[i + 1];
            x2 = approx(end.x, digs);
            y2 = approx(end.y, digs);
            if (y1 == y2) {
                if (py == y1) {
                    if (x1 <= x2 && (px >= x1 && px <= x2) || x1 >= x2 && (px <= x1 && px >= x2)) {
                        crosses = -1;
                        break;
                    }
                }
                continue;
            }
            cx = approx(getX(py, x1, y1, x2, y2), digs);
            if (cx == px) {
                if (y1 < y2 && (py >= y1 && py <= y2) || y1 > y2 && (py <= y1 && py >= y2)) {
                    crosses = -1;
                    break;
                }
            }
            if (cx <= px) {
                continue;
            }
            if (x1 != x2 && (cx < Math.min(x1, x2) || cx > Math.max(x1, x2))) {
                continue;
            }
            if (y1 < y2 && (py >= y1 && py < y2) || y1 > y2 && (py < y1 && py >= y2)) {
                ++crosses;
            }
        }
        var contained = (crosses == -1) ? 1 : !! (crosses & 1);
        return contained;
    },
    intersects: function (geometry) {
        var intersect = false;
        if (geometry.CLASS_NAME == "OpenLayers.Geometry.Point") {
            intersect = this.containsPoint(geometry);
        } else if (geometry.CLASS_NAME == "OpenLayers.Geometry.LineString") {
            intersect = geometry.intersects(this);
        } else if (geometry.CLASS_NAME == "OpenLayers.Geometry.LinearRing") {
            intersect = OpenLayers.Geometry.LineString.prototype.intersects.apply(this, [geometry]);
        } else {
            for (var i = 0, len = geometry.components.length; i < len; ++i) {
                intersect = geometry.components[i].intersects(this);
                if (intersect) {
                    break;
                }
            }
        }
        return intersect;
    },
    getVertices: function (nodes) {
        return (nodes === true) ? [] : this.components.slice(0, this.components.length - 1);
    },
    CLASS_NAME: "OpenLayers.Geometry.LinearRing"
});
OpenLayers.Layer.VirtualEarth = OpenLayers.Class(OpenLayers.Layer.EventPane, OpenLayers.Layer.FixedZoomLevels, {
    MIN_ZOOM_LEVEL: 1,
    MAX_ZOOM_LEVEL: 19,
    RESOLUTIONS: [1.40625, 0.703125, 0.3515625, 0.17578125, 0.087890625, 0.0439453125, 0.02197265625, 0.010986328125, 0.0054931640625, 0.00274658203125, 0.001373291015625, 0.0006866455078125, 0.00034332275390625, 0.000171661376953125, 0.0000858306884765625, 0.00004291534423828125, 0.00002145767211914062, 0.00001072883605957031, 0.00000536441802978515],
    type: null,
    wrapDateLine: true,
    sphericalMercator: false,
    animationEnabled: true,
    initialize: function (name, options) {
        OpenLayers.Layer.EventPane.prototype.initialize.apply(this, arguments);
        OpenLayers.Layer.FixedZoomLevels.prototype.initialize.apply(this, arguments);
        if (this.sphericalMercator) {
            OpenLayers.Util.extend(this, OpenLayers.Layer.SphericalMercator);
            this.initMercatorParameters();
        }
    },
    loadMapObject: function () {
        var veDiv = OpenLayers.Util.createDiv(this.name);
        var sz = this.map.getSize();
        veDiv.style.width = sz.w + "px";
        veDiv.style.height = sz.h + "px";
        this.div.appendChild(veDiv);
        try {
            this.mapObject = new VEMap(this.name);
        } catch (e) {}
        if (this.mapObject != null) {
            try {
                this.mapObject.LoadMap(null, null, this.type, true);
                this.mapObject.AttachEvent("onmousedown", OpenLayers.Function.True);
            } catch (e) {}
            this.mapObject.HideDashboard();
            if (typeof this.mapObject.SetAnimationEnabled == "function") {
                this.mapObject.SetAnimationEnabled(this.animationEnabled);
            }
        }
        if (!this.mapObject || !this.mapObject.vemapcontrol || !this.mapObject.vemapcontrol.PanMap || (typeof this.mapObject.vemapcontrol.PanMap != "function")) {
            this.dragPanMapObject = null;
        }
    },
    onMapResize: function () {
        this.mapObject.Resize(this.map.size.w, this.map.size.h);
    },
    getWarningHTML: function () {
        return OpenLayers.i18n("getLayerWarning", {
            'layerType': 'VE',
            'layerLib': 'VirtualEarth'
        });
    },
    setMapObjectCenter: function (center, zoom) {
        this.mapObject.SetCenterAndZoom(center, zoom);
    },
    getMapObjectCenter: function () {
        return this.mapObject.GetCenter();
    },
    dragPanMapObject: function (dX, dY) {
        this.mapObject.vemapcontrol.PanMap(dX, -dY);
    },
    getMapObjectZoom: function () {
        return this.mapObject.GetZoomLevel();
    },
    getMapObjectLonLatFromMapObjectPixel: function (moPixel) {
        return (typeof VEPixel != 'undefined') ? this.mapObject.PixelToLatLong(moPixel) : this.mapObject.PixelToLatLong(moPixel.x, moPixel.y);
    },
    getMapObjectPixelFromMapObjectLonLat: function (moLonLat) {
        return this.mapObject.LatLongToPixel(moLonLat);
    },
    getLongitudeFromMapObjectLonLat: function (moLonLat) {
        return this.sphericalMercator ? this.forwardMercator(moLonLat.Longitude, moLonLat.Latitude).lon : moLonLat.Longitude;
    },
    getLatitudeFromMapObjectLonLat: function (moLonLat) {
        return this.sphericalMercator ? this.forwardMercator(moLonLat.Longitude, moLonLat.Latitude).lat : moLonLat.Latitude;
    },
    getMapObjectLonLatFromLonLat: function (lon, lat) {
        var veLatLong;
        if (this.sphericalMercator) {
            var lonlat = this.inverseMercator(lon, lat);
            veLatLong = new VELatLong(lonlat.lat, lonlat.lon);
        } else {
            veLatLong = new VELatLong(lat, lon);
        }
        return veLatLong;
    },
    getXFromMapObjectPixel: function (moPixel) {
        return moPixel.x;
    },
    getYFromMapObjectPixel: function (moPixel) {
        return moPixel.y;
    },
    getMapObjectPixelFromXY: function (x, y) {
        return (typeof VEPixel != 'undefined') ? new VEPixel(x, y) : new Msn.VE.Pixel(x, y);
    },
    CLASS_NAME: "OpenLayers.Layer.VirtualEarth"
});
OpenLayers.Renderer = OpenLayers.Class({
    container: null,
    root: null,
    extent: null,
    locked: false,
    size: null,
    resolution: null,
    map: null,
    initialize: function (containerID, options) {
        this.container = OpenLayers.Util.getElement(containerID);
        OpenLayers.Util.extend(this, options);
    },
    destroy: function () {
        this.container = null;
        this.extent = null;
        this.size = null;
        this.resolution = null;
        this.map = null;
    },
    supported: function () {
        return false;
    },
    setExtent: function (extent, resolutionChanged) {
        this.extent = extent.clone();
        if (resolutionChanged) {
            this.resolution = null;
        }
    },
    setSize: function (size) {
        this.size = size.clone();
        this.resolution = null;
    },
    getResolution: function () {
        this.resolution = this.resolution || this.map.getResolution();
        return this.resolution;
    },
    drawFeature: function (feature, style) {
        if (style == null) {
            style = feature.style;
        }
        if (feature.geometry) {
            var bounds = feature.geometry.getBounds();
            if (bounds) {
                if (!bounds.intersectsBounds(this.extent)) {
                    style = {
                        display: "none"
                    };
                }
                var rendered = this.drawGeometry(feature.geometry, style, feature.id);
                if (style.display != "none" && style.label && rendered !== false) {
                    var location = feature.geometry.getCentroid();
                    if (style.labelXOffset || style.labelYOffset) {
                        var xOffset = isNaN(style.labelXOffset) ? 0 : style.labelXOffset;
                        var yOffset = isNaN(style.labelYOffset) ? 0 : style.labelYOffset;
                        var res = this.getResolution();
                        location.move(xOffset * res, yOffset * res);
                    }
                    this.drawText(feature.id, style, location);
                } else {
                    this.removeText(feature.id);
                }
                return rendered;
            }
        }
    },
    drawGeometry: function (geometry, style, featureId) {},
    drawText: function (featureId, style, location) {},
    removeText: function (featureId) {},
    clear: function () {},
    getFeatureIdFromEvent: function (evt) {},
    eraseFeatures: function (features) {
        if (!(OpenLayers.Util.isArray(features))) {
            features = [features];
        }
        for (var i = 0, len = features.length; i < len; ++i) {
            var feature = features[i];
            this.eraseGeometry(feature.geometry, feature.id);
            this.removeText(feature.id);
        }
    },
    eraseGeometry: function (geometry, featureId) {},
    moveRoot: function (renderer) {},
    getRenderLayerId: function () {
        return this.container.id;
    },
    applyDefaultSymbolizer: function (symbolizer) {
        var result = OpenLayers.Util.extend({}, OpenLayers.Renderer.defaultSymbolizer);
        if (symbolizer.stroke === false) {
            delete result.strokeWidth;
            delete result.strokeColor;
        }
        if (symbolizer.fill === false) {
            delete result.fillColor;
        }
        OpenLayers.Util.extend(result, symbolizer);
        return result;
    },
    CLASS_NAME: "OpenLayers.Renderer"
});
OpenLayers.Renderer.defaultSymbolizer = {
    fillColor: "#000000",
    strokeColor: "#000000",
    strokeWidth: 2,
    fillOpacity: 1,
    strokeOpacity: 1,
    pointRadius: 0
};
OpenLayers.ElementsIndexer = OpenLayers.Class({
    maxZIndex: null,
    order: null,
    indices: null,
    compare: null,
    initialize: function (yOrdering) {
        this.compare = yOrdering ? OpenLayers.ElementsIndexer.IndexingMethods.Z_ORDER_Y_ORDER : OpenLayers.ElementsIndexer.IndexingMethods.Z_ORDER_DRAWING_ORDER;
        this.clear();
    },
    insert: function (newNode) {
        if (this.exists(newNode)) {
            this.remove(newNode);
        }
        var nodeId = newNode.id;
        this.determineZIndex(newNode);
        var leftIndex = -1;
        var rightIndex = this.order.length;
        var middle;
        while (rightIndex - leftIndex > 1) {
            middle = parseInt((leftIndex + rightIndex) / 2);
            var placement = this.compare(this, newNode, OpenLayers.Util.getElement(this.order[middle]));
            if (placement > 0) {
                leftIndex = middle;
            } else {
                rightIndex = middle;
            }
        }
        this.order.splice(rightIndex, 0, nodeId);
        this.indices[nodeId] = this.getZIndex(newNode);
        return this.getNextElement(rightIndex);
    },
    remove: function (node) {
        var nodeId = node.id;
        var arrayIndex = OpenLayers.Util.indexOf(this.order, nodeId);
        if (arrayIndex >= 0) {
            this.order.splice(arrayIndex, 1);
            delete this.indices[nodeId];
            if (this.order.length > 0) {
                var lastId = this.order[this.order.length - 1];
                this.maxZIndex = this.indices[lastId];
            } else {
                this.maxZIndex = 0;
            }
        }
    },
    clear: function () {
        this.order = [];
        this.indices = {};
        this.maxZIndex = 0;
    },
    exists: function (node) {
        return (this.indices[node.id] != null);
    },
    getZIndex: function (node) {
        return node._style.graphicZIndex;
    },
    determineZIndex: function (node) {
        var zIndex = node._style.graphicZIndex;
        if (zIndex == null) {
            zIndex = this.maxZIndex;
            node._style.graphicZIndex = zIndex;
        } else if (zIndex > this.maxZIndex) {
            this.maxZIndex = zIndex;
        }
    },
    getNextElement: function (index) {
        var nextIndex = index + 1;
        if (nextIndex < this.order.length) {
            var nextElement = OpenLayers.Util.getElement(this.order[nextIndex]);
            if (nextElement == undefined) {
                nextElement = this.getNextElement(nextIndex);
            }
            return nextElement;
        } else {
            return null;
        }
    },
    CLASS_NAME: "OpenLayers.ElementsIndexer"
});
OpenLayers.ElementsIndexer.IndexingMethods = {
    Z_ORDER: function (indexer, newNode, nextNode) {
        var newZIndex = indexer.getZIndex(newNode);
        var returnVal = 0;
        if (nextNode) {
            var nextZIndex = indexer.getZIndex(nextNode);
            returnVal = newZIndex - nextZIndex;
        }
        return returnVal;
    },
    Z_ORDER_DRAWING_ORDER: function (indexer, newNode, nextNode) {
        var returnVal = OpenLayers.ElementsIndexer.IndexingMethods.Z_ORDER(indexer, newNode, nextNode);
        if (nextNode && returnVal == 0) {
            returnVal = 1;
        }
        return returnVal;
    },
    Z_ORDER_Y_ORDER: function (indexer, newNode, nextNode) {
        var returnVal = OpenLayers.ElementsIndexer.IndexingMethods.Z_ORDER(indexer, newNode, nextNode);
        if (nextNode && returnVal === 0) {
            var result = nextNode._boundsBottom - newNode._boundsBottom;
            returnVal = (result === 0) ? 1 : result;
        }
        return returnVal;
    }
};
OpenLayers.Renderer.Elements = OpenLayers.Class(OpenLayers.Renderer, {
    rendererRoot: null,
    root: null,
    vectorRoot: null,
    textRoot: null,
    xmlns: null,
    indexer: null,
    BACKGROUND_ID_SUFFIX: "_background",
    LABEL_ID_SUFFIX: "_label",
    initialize: function (containerID, options) {
        OpenLayers.Renderer.prototype.initialize.apply(this, arguments);
        this.rendererRoot = this.createRenderRoot();
        this.root = this.createRoot("_root");
        this.vectorRoot = this.createRoot("_vroot");
        this.textRoot = this.createRoot("_troot");
        this.root.appendChild(this.vectorRoot);
        this.root.appendChild(this.textRoot);
        this.rendererRoot.appendChild(this.root);
        this.container.appendChild(this.rendererRoot);
        if (options && (options.zIndexing || options.yOrdering)) {
            this.indexer = new OpenLayers.ElementsIndexer(options.yOrdering);
        }
    },
    destroy: function () {
        this.clear();
        this.rendererRoot = null;
        this.root = null;
        this.xmlns = null;
        OpenLayers.Renderer.prototype.destroy.apply(this, arguments);
    },
    clear: function () {
        var child;
        var root = this.vectorRoot;
        if (root) {
            while (child = root.firstChild) {
                root.removeChild(child);
            }
        }
        root = this.textRoot;
        if (root) {
            while (child = root.firstChild) {
                root.removeChild(child);
            }
        }
        if (this.indexer) {
            this.indexer.clear();
        }
    },
    getNodeType: function (geometry, style) {},
    drawGeometry: function (geometry, style, featureId) {
        var className = geometry.CLASS_NAME;
        var rendered = true;
        if ((className == "OpenLayers.Geometry.Collection") || (className == "OpenLayers.Geometry.MultiPoint") || (className == "OpenLayers.Geometry.MultiLineString") || (className == "OpenLayers.Geometry.MultiPolygon")) {
            for (var i = 0, len = geometry.components.length; i < len; i++) {
                rendered = this.drawGeometry(geometry.components[i], style, featureId) && rendered;
            }
            return rendered;
        };
        rendered = false;
        var removeBackground = false;
        if (style.display != "none") {
            if (style.backgroundGraphic) {
                this.redrawBackgroundNode(geometry.id, geometry, style, featureId);
            } else {
                removeBackground = true;
            }
            rendered = this.redrawNode(geometry.id, geometry, style, featureId);
        }
        if (rendered == false) {
            var node = document.getElementById(geometry.id);
            if (node) {
                if (node._style.backgroundGraphic) {
                    removeBackground = true;
                }
                node.parentNode.removeChild(node);
            }
        }
        if (removeBackground) {
            var node = document.getElementById(geometry.id + this.BACKGROUND_ID_SUFFIX);
            if (node) {
                node.parentNode.removeChild(node);
            }
        }
        return rendered;
    },
    redrawNode: function (id, geometry, style, featureId) {
        style = this.applyDefaultSymbolizer(style);
        var node = this.nodeFactory(id, this.getNodeType(geometry, style));
        node._featureId = featureId;
        node._boundsBottom = geometry.getBounds().bottom;
        node._geometryClass = geometry.CLASS_NAME;
        node._style = style;
        var drawResult = this.drawGeometryNode(node, geometry, style);
        if (drawResult === false) {
            return false;
        }
        node = drawResult.node;
        if (this.indexer) {
            var insert = this.indexer.insert(node);
            if (insert) {
                this.vectorRoot.insertBefore(node, insert);
            } else {
                this.vectorRoot.appendChild(node);
            }
        } else {
            if (node.parentNode !== this.vectorRoot) {
                this.vectorRoot.appendChild(node);
            }
        }
        this.postDraw(node);
        return drawResult.complete;
    },
    redrawBackgroundNode: function (id, geometry, style, featureId) {
        var backgroundStyle = OpenLayers.Util.extend({}, style);
        backgroundStyle.externalGraphic = backgroundStyle.backgroundGraphic;
        backgroundStyle.graphicXOffset = backgroundStyle.backgroundXOffset;
        backgroundStyle.graphicYOffset = backgroundStyle.backgroundYOffset;
        backgroundStyle.graphicZIndex = backgroundStyle.backgroundGraphicZIndex;
        backgroundStyle.graphicWidth = backgroundStyle.backgroundWidth || backgroundStyle.graphicWidth;
        backgroundStyle.graphicHeight = backgroundStyle.backgroundHeight || backgroundStyle.graphicHeight;
        backgroundStyle.backgroundGraphic = null;
        backgroundStyle.backgroundXOffset = null;
        backgroundStyle.backgroundYOffset = null;
        backgroundStyle.backgroundGraphicZIndex = null;
        return this.redrawNode(id + this.BACKGROUND_ID_SUFFIX, geometry, backgroundStyle, null);
    },
    drawGeometryNode: function (node, geometry, style) {
        style = style || node._style;
        var options = {
            'isFilled': style.fill === undefined ? true : style.fill,
            'isStroked': style.stroke === undefined ? !! style.strokeWidth : style.stroke
        };
        var drawn;
        switch (geometry.CLASS_NAME) {
        case "OpenLayers.Geometry.Point":
            if (style.graphic === false) {
                options.isFilled = false;
                options.isStroked = false;
            }
            drawn = this.drawPoint(node, geometry);
            break;
        case "OpenLayers.Geometry.LineString":
            options.isFilled = false;
            drawn = this.drawLineString(node, geometry);
            break;
        case "OpenLayers.Geometry.LinearRing":
            drawn = this.drawLinearRing(node, geometry);
            break;
        case "OpenLayers.Geometry.Polygon":
            drawn = this.drawPolygon(node, geometry);
            break;
        case "OpenLayers.Geometry.Surface":
            drawn = this.drawSurface(node, geometry);
            break;
        case "OpenLayers.Geometry.Rectangle":
            drawn = this.drawRectangle(node, geometry);
            break;
        default:
            break;
        }
        node._options = options;
        if (drawn != false) {
            return {
                node: this.setStyle(node, style, options, geometry),
                complete: drawn
            };
        } else {
            return false;
        }
    },
    postDraw: function (node) {},
    drawPoint: function (node, geometry) {},
    drawLineString: function (node, geometry) {},
    drawLinearRing: function (node, geometry) {},
    drawPolygon: function (node, geometry) {},
    drawRectangle: function (node, geometry) {},
    drawCircle: function (node, geometry) {},
    drawSurface: function (node, geometry) {},
    removeText: function (featureId) {
        var label = document.getElementById(featureId + this.LABEL_ID_SUFFIX);
        if (label) {
            this.textRoot.removeChild(label);
        }
    },
    getFeatureIdFromEvent: function (evt) {
        var target = evt.target;
        var useElement = target && target.correspondingUseElement;
        var node = useElement ? useElement : (target || evt.srcElement);
        var featureId = node._featureId;
        return featureId;
    },
    eraseGeometry: function (geometry, featureId) {
        if ((geometry.CLASS_NAME == "OpenLayers.Geometry.MultiPoint") || (geometry.CLASS_NAME == "OpenLayers.Geometry.MultiLineString") || (geometry.CLASS_NAME == "OpenLayers.Geometry.MultiPolygon") || (geometry.CLASS_NAME == "OpenLayers.Geometry.Collection")) {
            for (var i = 0, len = geometry.components.length; i < len; i++) {
                this.eraseGeometry(geometry.components[i], featureId);
            }
        } else {
            var element = OpenLayers.Util.getElement(geometry.id);
            if (element && element.parentNode) {
                if (element.geometry) {
                    element.geometry.destroy();
                    element.geometry = null;
                }
                element.parentNode.removeChild(element);
                if (this.indexer) {
                    this.indexer.remove(element);
                }
                if (element._style.backgroundGraphic) {
                    var backgroundId = geometry.id + this.BACKGROUND_ID_SUFFIX;
                    var bElem = OpenLayers.Util.getElement(backgroundId);
                    if (bElem && bElem.parentNode) {
                        bElem.parentNode.removeChild(bElem);
                    }
                }
            }
        }
    },
    nodeFactory: function (id, type) {
        var node = OpenLayers.Util.getElement(id);
        if (node) {
            if (!this.nodeTypeCompare(node, type)) {
                node.parentNode.removeChild(node);
                node = this.nodeFactory(id, type);
            }
        } else {
            node = this.createNode(type, id);
        }
        return node;
    },
    nodeTypeCompare: function (node, type) {},
    createNode: function (type, id) {},
    moveRoot: function (renderer) {
        var root = this.root;
        if (renderer.root.parentNode == this.rendererRoot) {
            root = renderer.root;
        }
        root.parentNode.removeChild(root);
        renderer.rendererRoot.appendChild(root);
    },
    getRenderLayerId: function () {
        return this.root.parentNode.parentNode.id;
    },
    isComplexSymbol: function (graphicName) {
        return (graphicName != "circle") && !! graphicName;
    },
    CLASS_NAME: "OpenLayers.Renderer.Elements"
});
OpenLayers.Renderer.symbol = {
    "star": [350, 75, 379, 161, 469, 161, 397, 215, 423, 301, 350, 250, 277, 301, 303, 215, 231, 161, 321, 161, 350, 75],
    "cross": [4, 0, 6, 0, 6, 4, 10, 4, 10, 6, 6, 6, 6, 10, 4, 10, 4, 6, 0, 6, 0, 4, 4, 4, 4, 0],
    "x": [0, 0, 25, 0, 50, 35, 75, 0, 100, 0, 65, 50, 100, 100, 75, 100, 50, 65, 25, 100, 0, 100, 35, 50, 0, 0],
    "square": [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
    "triangle": [0, 10, 10, 10, 5, 0, 0, 10]
};
OpenLayers.Renderer.SVG = OpenLayers.Class(OpenLayers.Renderer.Elements, {
    xmlns: "http://www.w3.org/2000/svg",
    xlinkns: "http://www.w3.org/1999/xlink",
    MAX_PIXEL: 15000,
    translationParameters: null,
    symbolMetrics: null,
    initialize: function (containerID) {
        if (!this.supported()) {
            return;
        }
        OpenLayers.Renderer.Elements.prototype.initialize.apply(this, arguments);
        this.translationParameters = {
            x: 0,
            y: 0
        };
        this.symbolMetrics = {};
    },
    supported: function () {
        var svgFeature = "http://www.w3.org/TR/SVG11/feature#";
        return (document.implementation && (document.implementation.hasFeature("org.w3c.svg", "1.0") || document.implementation.hasFeature(svgFeature + "SVG", "1.1") || document.implementation.hasFeature(svgFeature + "BasicStructure", "1.1")));
    },
    inValidRange: function (x, y, xyOnly) {
        var left = x + (xyOnly ? 0 : this.translationParameters.x);
        var top = y + (xyOnly ? 0 : this.translationParameters.y);
        return (left >= -this.MAX_PIXEL && left <= this.MAX_PIXEL && top >= -this.MAX_PIXEL && top <= this.MAX_PIXEL);
    },
    setExtent: function (extent, resolutionChanged) {
        OpenLayers.Renderer.Elements.prototype.setExtent.apply(this, arguments);
        var resolution = this.getResolution();
        var left = -extent.left / resolution;
        var top = extent.top / resolution;
        if (resolutionChanged) {
            this.left = left;
            this.top = top;
            var extentString = "0 0 " + this.size.w + " " + this.size.h;
            this.rendererRoot.setAttributeNS(null, "viewBox", extentString);
            this.translate(0, 0);
            return true;
        } else {
            var inRange = this.translate(left - this.left, top - this.top);
            if (!inRange) {
                this.setExtent(extent, true);
            }
            return inRange;
        }
    },
    translate: function (x, y) {
        if (!this.inValidRange(x, y, true)) {
            return false;
        } else {
            var transformString = "";
            if (x || y) {
                transformString = "translate(" + x + "," + y + ")";
            }
            this.root.setAttributeNS(null, "transform", transformString);
            this.translationParameters = {
                x: x,
                y: y
            };
            return true;
        }
    },
    setSize: function (size) {
        OpenLayers.Renderer.prototype.setSize.apply(this, arguments);
        this.rendererRoot.setAttributeNS(null, "width", this.size.w);
        this.rendererRoot.setAttributeNS(null, "height", this.size.h);
    },
    getNodeType: function (geometry, style) {
        var nodeType = null;
        switch (geometry.CLASS_NAME) {
        case "OpenLayers.Geometry.Point":
            if (style.externalGraphic) {
                nodeType = "image";
            } else if (this.isComplexSymbol(style.graphicName)) {
                nodeType = "svg";
            } else {
                nodeType = "circle";
            }
            break;
        case "OpenLayers.Geometry.Rectangle":
            nodeType = "rect";
            break;
        case "OpenLayers.Geometry.LineString":
            nodeType = "polyline";
            break;
        case "OpenLayers.Geometry.LinearRing":
            nodeType = "polygon";
            break;
        case "OpenLayers.Geometry.Polygon":
        case "OpenLayers.Geometry.Curve":
        case "OpenLayers.Geometry.Surface":
            nodeType = "path";
            break;
        default:
            break;
        }
        return nodeType;
    },
    setStyle: function (node, style, options) {
        style = style || node._style;
        options = options || node._options;
        var r = parseFloat(node.getAttributeNS(null, "r"));
        var widthFactor = 1;
        var pos;
        if (node._geometryClass == "OpenLayers.Geometry.Point" && r) {
            node.style.visibility = "";
            if (style.graphic === false) {
                node.style.visibility = "hidden";
            } else if (style.externalGraphic) {
                pos = this.getPosition(node);
                if (style.graphicTitle) {
                    node.setAttributeNS(null, "title", style.graphicTitle);
                    var label = this.nodeFactory(null, "title");
                    label.textContent = style.graphicTitle;
                    node.appendChild(label);
                }
                if (style.graphicWidth && style.graphicHeight) {
                    node.setAttributeNS(null, "preserveAspectRatio", "none");
                }
                var width = style.graphicWidth || style.graphicHeight;
                var height = style.graphicHeight || style.graphicWidth;
                width = width ? width : style.pointRadius * 2;
                height = height ? height : style.pointRadius * 2;
                var xOffset = (style.graphicXOffset != undefined) ? style.graphicXOffset : -(0.5 * width);
                var yOffset = (style.graphicYOffset != undefined) ? style.graphicYOffset : -(0.5 * height);
                var opacity = style.graphicOpacity || style.fillOpacity;
                node.setAttributeNS(null, "x", (pos.x + xOffset).toFixed());
                node.setAttributeNS(null, "y", (pos.y + yOffset).toFixed());
                node.setAttributeNS(null, "width", width);
                node.setAttributeNS(null, "height", height);
                node.setAttributeNS(this.xlinkns, "href", style.externalGraphic);
                node.setAttributeNS(null, "style", "opacity: " + opacity);
                node.onclick = OpenLayers.Renderer.SVG.preventDefault;
            } else if (this.isComplexSymbol(style.graphicName)) {
                var offset = style.pointRadius * 3;
                var size = offset * 2;
                var src = this.importSymbol(style.graphicName);
                pos = this.getPosition(node);
                widthFactor = this.symbolMetrics[src.id][0] * 3 / size;
                var parent = node.parentNode;
                var nextSibling = node.nextSibling;
                if (parent) {
                    parent.removeChild(node);
                }
                node.firstChild && node.removeChild(node.firstChild);
                node.appendChild(src.firstChild.cloneNode(true));
                node.setAttributeNS(null, "viewBox", src.getAttributeNS(null, "viewBox"));
                node.setAttributeNS(null, "width", size);
                node.setAttributeNS(null, "height", size);
                node.setAttributeNS(null, "x", pos.x - offset);
                node.setAttributeNS(null, "y", pos.y - offset);
                if (nextSibling) {
                    parent.insertBefore(node, nextSibling);
                } else if (parent) {
                    parent.appendChild(node);
                }
            } else {
                node.setAttributeNS(null, "r", style.pointRadius);
            }
            var rotation = style.rotation;
            if ((rotation !== undefined || node._rotation !== undefined) && pos) {
                node._rotation = rotation;
                rotation |= 0;
                if (node.nodeName !== "svg") {
                    node.setAttributeNS(null, "transform", "rotate(" + rotation + " " + pos.x + " " + pos.y + ")");
                } else {
                    var metrics = this.symbolMetrics[src.id];
                    node.firstChild.setAttributeNS(null, "transform", "rotate(" + rotation + " " + metrics[1] + " " + metrics[2] + ")");
                }
            }
        }
        if (options.isFilled) {
            node.setAttributeNS(null, "fill", style.fillColor);
            node.setAttributeNS(null, "fill-opacity", style.fillOpacity);
        } else {
            node.setAttributeNS(null, "fill", "none");
        }
        if (options.isStroked) {
            node.setAttributeNS(null, "stroke", style.strokeColor);
            node.setAttributeNS(null, "stroke-opacity", style.strokeOpacity);
            node.setAttributeNS(null, "stroke-width", style.strokeWidth * widthFactor);
            node.setAttributeNS(null, "stroke-linecap", style.strokeLinecap || "round");
            node.setAttributeNS(null, "stroke-linejoin", "round");
            style.strokeDashstyle && node.setAttributeNS(null, "stroke-dasharray", this.dashStyle(style, widthFactor));
        } else {
            node.setAttributeNS(null, "stroke", "none");
        }
        if (style.pointerEvents) {
            node.setAttributeNS(null, "pointer-events", style.pointerEvents);
        }
        if (style.cursor != null) {
            node.setAttributeNS(null, "cursor", style.cursor);
        }
        return node;
    },
    dashStyle: function (style, widthFactor) {
        var w = style.strokeWidth * widthFactor;
        var str = style.strokeDashstyle;
        switch (str) {
        case 'solid':
            return 'none';
        case 'dot':
            return [1, 4 * w].join();
        case 'dash':
            return [4 * w, 4 * w].join();
        case 'dashdot':
            return [4 * w, 4 * w, 1, 4 * w].join();
        case 'longdash':
            return [8 * w, 4 * w].join();
        case 'longdashdot':
            return [8 * w, 4 * w, 1, 4 * w].join();
        default:
            return OpenLayers.String.trim(str).replace(/\s+/g, ",");
        }
    },
    createNode: function (type, id) {
        var node = document.createElementNS(this.xmlns, type);
        if (id) {
            node.setAttributeNS(null, "id", id);
        }
        return node;
    },
    nodeTypeCompare: function (node, type) {
        return (type == node.nodeName);
    },
    createRenderRoot: function () {
        return this.nodeFactory(this.container.id + "_svgRoot", "svg");
    },
    createRoot: function (suffix) {
        return this.nodeFactory(this.container.id + suffix, "g");
    },
    createDefs: function () {
        var defs = this.nodeFactory(this.container.id + "_defs", "defs");
        this.rendererRoot.appendChild(defs);
        return defs;
    },
    drawPoint: function (node, geometry) {
        return this.drawCircle(node, geometry, 1);
    },
    drawCircle: function (node, geometry, radius) {
        var resolution = this.getResolution();
        var x = (geometry.x / resolution + this.left);
        var y = (this.top - geometry.y / resolution);
        if (this.inValidRange(x, y)) {
            node.setAttributeNS(null, "cx", x);
            node.setAttributeNS(null, "cy", y);
            node.setAttributeNS(null, "r", radius);
            return node;
        } else {
            return false;
        }
    },
    drawLineString: function (node, geometry) {
        var componentsResult = this.getComponentsString(geometry.components);
        if (componentsResult.path) {
            node.setAttributeNS(null, "points", componentsResult.path);
            return (componentsResult.complete ? node : null);
        } else {
            return false;
        }
    },
    drawLinearRing: function (node, geometry) {
        var componentsResult = this.getComponentsString(geometry.components);
        if (componentsResult.path) {
            node.setAttributeNS(null, "points", componentsResult.path);
            return (componentsResult.complete ? node : null);
        } else {
            return false;
        }
    },
    drawPolygon: function (node, geometry) {
        var d = "";
        var draw = true;
        var complete = true;
        var linearRingResult, path;
        for (var j = 0, len = geometry.components.length; j < len; j++) {
            d += " M";
            linearRingResult = this.getComponentsString(geometry.components[j].components, " ");
            path = linearRingResult.path;
            if (path) {
                d += " " + path;
                complete = linearRingResult.complete && complete;
            } else {
                draw = false;
            }
        }
        d += " z";
        if (draw) {
            node.setAttributeNS(null, "d", d);
            node.setAttributeNS(null, "fill-rule", "evenodd");
            return complete ? node : null;
        } else {
            return false;
        }
    },
    drawRectangle: function (node, geometry) {
        var resolution = this.getResolution();
        var x = (geometry.x / resolution + this.left);
        var y = (this.top - geometry.y / resolution);
        if (this.inValidRange(x, y)) {
            node.setAttributeNS(null, "x", x);
            node.setAttributeNS(null, "y", y);
            node.setAttributeNS(null, "width", geometry.width / resolution);
            node.setAttributeNS(null, "height", geometry.height / resolution);
            return node;
        } else {
            return false;
        }
    },
    drawSurface: function (node, geometry) {
        var d = null;
        var draw = true;
        for (var i = 0, len = geometry.components.length; i < len; i++) {
            if ((i % 3) == 0 && (i / 3) == 0) {
                var component = this.getShortString(geometry.components[i]);
                if (!component) {
                    draw = false;
                }
                d = "M " + component;
            } else if ((i % 3) == 1) {
                var component = this.getShortString(geometry.components[i]);
                if (!component) {
                    draw = false;
                }
                d += " C " + component;
            } else {
                var component = this.getShortString(geometry.components[i]);
                if (!component) {
                    draw = false;
                }
                d += " " + component;
            }
        }
        d += " Z";
        if (draw) {
            node.setAttributeNS(null, "d", d);
            return node;
        } else {
            return false;
        }
    },
    drawText: function (featureId, style, location) {
        var resolution = this.getResolution();
        var x = (location.x / resolution + this.left);
        var y = (location.y / resolution - this.top);
        var label = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX, "text");
        label.setAttributeNS(null, "x", x);
        label.setAttributeNS(null, "y", -y);
        if (style.fontColor) {
            label.setAttributeNS(null, "fill", style.fontColor);
        }
        if (style.fontOpacity) {
            label.setAttributeNS(null, "opacity", style.fontOpacity);
        }
        if (style.fontFamily) {
            label.setAttributeNS(null, "font-family", style.fontFamily);
        }
        if (style.fontSize) {
            label.setAttributeNS(null, "font-size", style.fontSize);
        }
        if (style.fontWeight) {
            label.setAttributeNS(null, "font-weight", style.fontWeight);
        }
        if (style.fontStyle) {
            label.setAttributeNS(null, "font-style", style.fontStyle);
        }
        if (style.labelSelect === true) {
            label.setAttributeNS(null, "pointer-events", "visible");
            label._featureId = featureId;
        } else {
            label.setAttributeNS(null, "pointer-events", "none");
        }
        var align = style.labelAlign || "cm";
        label.setAttributeNS(null, "text-anchor", OpenLayers.Renderer.SVG.LABEL_ALIGN[align[0]] || "middle");
        if (OpenLayers.IS_GECKO === true) {
            label.setAttributeNS(null, "dominant-baseline", OpenLayers.Renderer.SVG.LABEL_ALIGN[align[1]] || "central");
        }
        var labelRows = style.label.split('\n');
        var numRows = labelRows.length;
        while (label.childNodes.length > numRows) {
            label.removeChild(label.lastChild);
        }
        for (var i = 0; i < numRows; i++) {
            var tspan = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX + "_tspan_" + i, "tspan");
            if (style.labelSelect === true) {
                tspan._featureId = featureId;
                tspan._geometry = location;
                tspan._geometryClass = location.CLASS_NAME;
            }
            if (OpenLayers.IS_GECKO === false) {
                tspan.setAttributeNS(null, "baseline-shift", OpenLayers.Renderer.SVG.LABEL_VSHIFT[align[1]] || "-35%");
            }
            tspan.setAttribute("x", x);
            if (i == 0) {
                var vfactor = OpenLayers.Renderer.SVG.LABEL_VFACTOR[align[1]];
                if (vfactor == null) {
                    vfactor = -.5;
                }
                tspan.setAttribute("dy", (vfactor * (numRows - 1)) + "em");
            } else {
                tspan.setAttribute("dy", "1em");
            }
            tspan.textContent = (labelRows[i] === '') ? ' ' : labelRows[i];
            if (!tspan.parentNode) {
                label.appendChild(tspan);
            }
        }
        if (!label.parentNode) {
            this.textRoot.appendChild(label);
        }
    },
    getComponentsString: function (components, separator) {
        var renderCmp = [];
        var complete = true;
        var len = components.length;
        var strings = [];
        var str, component;
        for (var i = 0; i < len; i++) {
            component = components[i];
            renderCmp.push(component);
            str = this.getShortString(component);
            if (str) {
                strings.push(str);
            } else {
                if (i > 0) {
                    if (this.getShortString(components[i - 1])) {
                        strings.push(this.clipLine(components[i], components[i - 1]));
                    }
                }
                if (i < len - 1) {
                    if (this.getShortString(components[i + 1])) {
                        strings.push(this.clipLine(components[i], components[i + 1]));
                    }
                }
                complete = false;
            }
        }
        return {
            path: strings.join(separator || ","),
            complete: complete
        };
    },
    clipLine: function (badComponent, goodComponent) {
        if (goodComponent.equals(badComponent)) {
            return "";
        }
        var resolution = this.getResolution();
        var maxX = this.MAX_PIXEL - this.translationParameters.x;
        var maxY = this.MAX_PIXEL - this.translationParameters.y;
        var x1 = goodComponent.x / resolution + this.left;
        var y1 = this.top - goodComponent.y / resolution;
        var x2 = badComponent.x / resolution + this.left;
        var y2 = this.top - badComponent.y / resolution;
        var k;
        if (x2 < -maxX || x2 > maxX) {
            k = (y2 - y1) / (x2 - x1);
            x2 = x2 < 0 ? -maxX : maxX;
            y2 = y1 + (x2 - x1) * k;
        }
        if (y2 < -maxY || y2 > maxY) {
            k = (x2 - x1) / (y2 - y1);
            y2 = y2 < 0 ? -maxY : maxY;
            x2 = x1 + (y2 - y1) * k;
        }
        return x2 + "," + y2;
    },
    getShortString: function (point) {
        var resolution = this.getResolution();
        var x = (point.x / resolution + this.left);
        var y = (this.top - point.y / resolution);
        if (this.inValidRange(x, y)) {
            return x + "," + y;
        } else {
            return false;
        }
    },
    getPosition: function (node) {
        return ({
            x: parseFloat(node.getAttributeNS(null, "cx")),
            y: parseFloat(node.getAttributeNS(null, "cy"))
        });
    },
    importSymbol: function (graphicName) {
        if (!this.defs) {
            this.defs = this.createDefs();
        }
        var id = this.container.id + "-" + graphicName;
        var existing = document.getElementById(id)
        if (existing != null) {
            return existing;
        }
        var symbol = OpenLayers.Renderer.symbol[graphicName];
        if (!symbol) {
            throw new Error(graphicName + ' is not a valid symbol name');
        }
        var symbolNode = this.nodeFactory(id, "symbol");
        var node = this.nodeFactory(null, "polygon");
        symbolNode.appendChild(node);
        var symbolExtent = new OpenLayers.Bounds(Number.MAX_VALUE, Number.MAX_VALUE, 0, 0);
        var points = [];
        var x, y;
        for (var i = 0; i < symbol.length; i = i + 2) {
            x = symbol[i];
            y = symbol[i + 1];
            symbolExtent.left = Math.min(symbolExtent.left, x);
            symbolExtent.bottom = Math.min(symbolExtent.bottom, y);
            symbolExtent.right = Math.max(symbolExtent.right, x);
            symbolExtent.top = Math.max(symbolExtent.top, y);
            points.push(x, ",", y);
        }
        node.setAttributeNS(null, "points", points.join(" "));
        var width = symbolExtent.getWidth();
        var height = symbolExtent.getHeight();
        var viewBox = [symbolExtent.left - width, symbolExtent.bottom - height, width * 3, height * 3];
        symbolNode.setAttributeNS(null, "viewBox", viewBox.join(" "));
        this.symbolMetrics[id] = [Math.max(width, height), symbolExtent.getCenterLonLat().lon, symbolExtent.getCenterLonLat().lat];
        this.defs.appendChild(symbolNode);
        return symbolNode;
    },
    getFeatureIdFromEvent: function (evt) {
        var featureId = OpenLayers.Renderer.Elements.prototype.getFeatureIdFromEvent.apply(this, arguments);
        if (!featureId) {
            var target = evt.target;
            featureId = target.parentNode && target != this.rendererRoot && target.parentNode._featureId;
        }
        return featureId;
    },
    CLASS_NAME: "OpenLayers.Renderer.SVG"
});
OpenLayers.Renderer.SVG.LABEL_ALIGN = {
    "l": "start",
    "r": "end",
    "b": "bottom",
    "t": "hanging"
};
OpenLayers.Renderer.SVG.LABEL_VSHIFT = {
    "t": "-70%",
    "b": "0"
};
OpenLayers.Renderer.SVG.LABEL_VFACTOR = {
    "t": 0,
    "b": -1
};
OpenLayers.Renderer.SVG.preventDefault = function (e) {
    e.preventDefault && e.preventDefault();
};
OpenLayers.Control.Attribution = OpenLayers.Class(OpenLayers.Control, {
    separator: ", ",
    destroy: function () {
        this.map.events.un({
            "removelayer": this.updateAttribution,
            "addlayer": this.updateAttribution,
            "changelayer": this.updateAttribution,
            "changebaselayer": this.updateAttribution,
            scope: this
        });
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },
    draw: function () {
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        this.map.events.on({
            'changebaselayer': this.updateAttribution,
            'changelayer': this.updateAttribution,
            'addlayer': this.updateAttribution,
            'removelayer': this.updateAttribution,
            scope: this
        });
        this.updateAttribution();
        return this.div;
    },
    updateAttribution: function () {
        var attributions = [];
        if (this.map && this.map.layers) {
            for (var i = 0, len = this.map.layers.length; i < len; i++) {
                var layer = this.map.layers[i];
                if (layer.attribution && layer.getVisibility()) {
                    if (OpenLayers.Util.indexOf(attributions, layer.attribution) === -1) {
                        attributions.push(layer.attribution);
                    }
                }
            }
            this.div.innerHTML = attributions.join(this.separator);
        }
    },
    CLASS_NAME: "OpenLayers.Control.Attribution"
});
OpenLayers.Style = OpenLayers.Class({
    id: null,
    name: null,
    title: null,
    description: null,
    layerName: null,
    isDefault: false,
    rules: null,
    context: null,
    defaultStyle: null,
    defaultsPerSymbolizer: false,
    propertyStyles: null,
    initialize: function (style, options) {
        OpenLayers.Util.extend(this, options);
        this.rules = [];
        if (options && options.rules) {
            this.addRules(options.rules);
        }
        this.setDefaultStyle(style || OpenLayers.Feature.Vector.style["default"]);
        this.id = OpenLayers.Util.createUniqueID(this.CLASS_NAME + "_");
    },
    destroy: function () {
        for (var i = 0, len = this.rules.length; i < len; i++) {
            this.rules[i].destroy();
            this.rules[i] = null;
        }
        this.rules = null;
        this.defaultStyle = null;
    },
    createSymbolizer: function (feature) {
        var style = this.defaultsPerSymbolizer ? {} : this.createLiterals(OpenLayers.Util.extend({}, this.defaultStyle), feature);
        var rules = this.rules;
        var rule, context;
        var elseRules = [];
        var appliedRules = false;
        for (var i = 0, len = rules.length; i < len; i++) {
            rule = rules[i];
            var applies = rule.evaluate(feature);
            if (applies) {
                if (rule instanceof OpenLayers.Rule && rule.elseFilter) {
                    elseRules.push(rule);
                } else {
                    appliedRules = true;
                    this.applySymbolizer(rule, style, feature);
                }
            }
        }
        if (appliedRules == false && elseRules.length > 0) {
            appliedRules = true;
            for (var i = 0, len = elseRules.length; i < len; i++) {
                this.applySymbolizer(elseRules[i], style, feature);
            }
        }
        if (rules.length > 0 && appliedRules == false) {
            style.display = "none";
        }
        if (style.label && typeof style.label !== "string") {
            style.label = String(style.label);
        }
        return style;
    },
    applySymbolizer: function (rule, style, feature) {
        var symbolizerPrefix = feature.geometry ? this.getSymbolizerPrefix(feature.geometry) : OpenLayers.Style.SYMBOLIZER_PREFIXES[0];
        var symbolizer = rule.symbolizer[symbolizerPrefix] || rule.symbolizer;
        if (this.defaultsPerSymbolizer === true) {
            var defaults = this.defaultStyle;
            OpenLayers.Util.applyDefaults(symbolizer, {
                pointRadius: defaults.pointRadius
            });
            if (symbolizer.stroke === true || symbolizer.graphic === true) {
                OpenLayers.Util.applyDefaults(symbolizer, {
                    strokeWidth: defaults.strokeWidth,
                    strokeColor: defaults.strokeColor,
                    strokeOpacity: defaults.strokeOpacity,
                    strokeDashstyle: defaults.strokeDashstyle,
                    strokeLinecap: defaults.strokeLinecap
                });
            }
            if (symbolizer.fill === true || symbolizer.graphic === true) {
                OpenLayers.Util.applyDefaults(symbolizer, {
                    fillColor: defaults.fillColor,
                    fillOpacity: defaults.fillOpacity
                });
            }
            if (symbolizer.graphic === true) {
                OpenLayers.Util.applyDefaults(symbolizer, {
                    pointRadius: this.defaultStyle.pointRadius,
                    externalGraphic: this.defaultStyle.externalGraphic,
                    graphicName: this.defaultStyle.graphicName,
                    graphicOpacity: this.defaultStyle.graphicOpacity,
                    graphicWidth: this.defaultStyle.graphicWidth,
                    graphicHeight: this.defaultStyle.graphicHeight,
                    graphicXOffset: this.defaultStyle.graphicXOffset,
                    graphicYOffset: this.defaultStyle.graphicYOffset
                });
            }
        }
        return this.createLiterals(OpenLayers.Util.extend(style, symbolizer), feature);
    },
    createLiterals: function (style, feature) {
        var context = OpenLayers.Util.extend({}, feature.attributes || feature.data);
        OpenLayers.Util.extend(context, this.context);
        for (var i in this.propertyStyles) {
            style[i] = OpenLayers.Style.createLiteral(style[i], context, feature, i);
        }
        return style;
    },
    findPropertyStyles: function () {
        var propertyStyles = {};
        var style = this.defaultStyle;
        this.addPropertyStyles(propertyStyles, style);
        var rules = this.rules;
        var symbolizer, value;
        for (var i = 0, len = rules.length; i < len; i++) {
            symbolizer = rules[i].symbolizer;
            for (var key in symbolizer) {
                value = symbolizer[key];
                if (typeof value == "object") {
                    this.addPropertyStyles(propertyStyles, value);
                } else {
                    this.addPropertyStyles(propertyStyles, symbolizer);
                    break;
                }
            }
        }
        return propertyStyles;
    },
    addPropertyStyles: function (propertyStyles, symbolizer) {
        var property;
        for (var key in symbolizer) {
            property = symbolizer[key];
            if (typeof property == "string" && property.match(/\$\{\w+\}/)) {
                propertyStyles[key] = true;
            }
        }
        return propertyStyles;
    },
    addRules: function (rules) {
        Array.prototype.push.apply(this.rules, rules);
        this.propertyStyles = this.findPropertyStyles();
    },
    setDefaultStyle: function (style) {
        this.defaultStyle = style;
        this.propertyStyles = this.findPropertyStyles();
    },
    getSymbolizerPrefix: function (geometry) {
        var prefixes = OpenLayers.Style.SYMBOLIZER_PREFIXES;
        for (var i = 0, len = prefixes.length; i < len; i++) {
            if (geometry.CLASS_NAME.indexOf(prefixes[i]) != -1) {
                return prefixes[i];
            }
        }
    },
    clone: function () {
        var options = OpenLayers.Util.extend({}, this);
        if (this.rules) {
            options.rules = [];
            for (var i = 0, len = this.rules.length; i < len; ++i) {
                options.rules.push(this.rules[i].clone());
            }
        }
        options.context = this.context && OpenLayers.Util.extend({}, this.context);
        var defaultStyle = OpenLayers.Util.extend({}, this.defaultStyle);
        return new OpenLayers.Style(defaultStyle, options);
    },
    CLASS_NAME: "OpenLayers.Style"
});
OpenLayers.Style.createLiteral = function (value, context, feature, property) {
    if (typeof value == "string" && value.indexOf("${") != -1) {
        value = OpenLayers.String.format(value, context, [feature, property]);
        value = (isNaN(value) || !value) ? value : parseFloat(value);
    }
    return value;
};
OpenLayers.Style.SYMBOLIZER_PREFIXES = ['Point', 'Line', 'Polygon', 'Text', 'Raster'];
OpenLayers.Filter = OpenLayers.Class({
    initialize: function (options) {
        OpenLayers.Util.extend(this, options);
    },
    destroy: function () {},
    evaluate: function (context) {
        return true;
    },
    clone: function () {
        return null;
    },
    CLASS_NAME: "OpenLayers.Filter"
});
OpenLayers.Filter.Logical = OpenLayers.Class(OpenLayers.Filter, {
    filters: null,
    type: null,
    initialize: function (options) {
        this.filters = [];
        OpenLayers.Filter.prototype.initialize.apply(this, [options]);
    },
    destroy: function () {
        this.filters = null;
        OpenLayers.Filter.prototype.destroy.apply(this);
    },
    evaluate: function (context) {
        var i, len;
        switch (this.type) {
        case OpenLayers.Filter.Logical.AND:
            for (i = 0, len = this.filters.length; i < len; i++) {
                if (this.filters[i].evaluate(context) == false) {
                    return false;
                }
            }
            return true;
        case OpenLayers.Filter.Logical.OR:
            for (i = 0, len = this.filters.length; i < len; i++) {
                if (this.filters[i].evaluate(context) == true) {
                    return true;
                }
            }
            return false;
        case OpenLayers.Filter.Logical.NOT:
            return (!this.filters[0].evaluate(context));
        }
        return undefined;
    },
    clone: function () {
        var filters = [];
        for (var i = 0, len = this.filters.length; i < len; ++i) {
            filters.push(this.filters[i].clone());
        }
        return new OpenLayers.Filter.Logical({
            type: this.type,
            filters: filters
        });
    },
    CLASS_NAME: "OpenLayers.Filter.Logical"
});
OpenLayers.Filter.Logical.AND = "&&";
OpenLayers.Filter.Logical.OR = "||";
OpenLayers.Filter.Logical.NOT = "!";
OpenLayers.Renderer.Canvas = OpenLayers.Class(OpenLayers.Renderer, {
    hitDetection: true,
    hitOverflow: 0,
    canvas: null,
    features: null,
    pendingRedraw: false,
    initialize: function (containerID, options) {
        OpenLayers.Renderer.prototype.initialize.apply(this, arguments);
        this.root = document.createElement("canvas");
        this.container.appendChild(this.root);
        this.canvas = this.root.getContext("2d");
        this.features = {};
        if (this.hitDetection) {
            this.hitCanvas = document.createElement("canvas");
            this.hitContext = this.hitCanvas.getContext("2d");
        }
    },
    eraseGeometry: function (geometry, featureId) {
        this.eraseFeatures(this.features[featureId][0]);
    },
    supported: function () {
        var canvas = document.createElement("canvas");
        return !!canvas.getContext;
    },
    setSize: function (size) {
        this.size = size.clone();
        var root = this.root;
        root.style.width = size.w + "px";
        root.style.height = size.h + "px";
        root.width = size.w;
        root.height = size.h;
        this.resolution = null;
        if (this.hitDetection) {
            var hitCanvas = this.hitCanvas;
            hitCanvas.style.width = size.w + "px";
            hitCanvas.style.height = size.h + "px";
            hitCanvas.width = size.w;
            hitCanvas.height = size.h;
        }
    },
    drawFeature: function (feature, style) {
        var rendered;
        if (feature.geometry) {
            style = this.applyDefaultSymbolizer(style || feature.style);
            var bounds = feature.geometry.getBounds();
            rendered = (style.display !== "none") && !! bounds && bounds.intersectsBounds(this.extent);
            if (rendered) {
                this.features[feature.id] = [feature, style];
            } else {
                delete(this.features[feature.id]);
            }
            this.pendingRedraw = true;
        }
        if (this.pendingRedraw && !this.locked) {
            this.redraw();
            this.pendingRedraw = false;
        }
        return rendered;
    },
    drawGeometry: function (geometry, style, featureId) {
        var className = geometry.CLASS_NAME;
        if ((className == "OpenLayers.Geometry.Collection") || (className == "OpenLayers.Geometry.MultiPoint") || (className == "OpenLayers.Geometry.MultiLineString") || (className == "OpenLayers.Geometry.MultiPolygon")) {
            for (var i = 0; i < geometry.components.length; i++) {
                this.drawGeometry(geometry.components[i], style, featureId);
            }
            return;
        }
        switch (geometry.CLASS_NAME) {
        case "OpenLayers.Geometry.Point":
            this.drawPoint(geometry, style, featureId);
            break;
        case "OpenLayers.Geometry.LineString":
            this.drawLineString(geometry, style, featureId);
            break;
        case "OpenLayers.Geometry.LinearRing":
            this.drawLinearRing(geometry, style, featureId);
            break;
        case "OpenLayers.Geometry.Polygon":
            this.drawPolygon(geometry, style, featureId);
            break;
        default:
            break;
        }
    },
    drawExternalGraphic: function (geometry, style, featureId) {
        var img = new Image();
        if (style.graphicTitle) {
            img.title = style.graphicTitle;
        }
        var width = style.graphicWidth || style.graphicHeight;
        var height = style.graphicHeight || style.graphicWidth;
        width = width ? width : style.pointRadius * 2;
        height = height ? height : style.pointRadius * 2;
        var xOffset = (style.graphicXOffset != undefined) ? style.graphicXOffset : -(0.5 * width);
        var yOffset = (style.graphicYOffset != undefined) ? style.graphicYOffset : -(0.5 * height);
        var opacity = style.graphicOpacity || style.fillOpacity;
        var onLoad = function () {
                if (!this.features[featureId]) {
                    return;
                }
                var pt = this.getLocalXY(geometry);
                var p0 = pt[0];
                var p1 = pt[1];
                if (!isNaN(p0) && !isNaN(p1)) {
                    var x = (p0 + xOffset) | 0;
                    var y = (p1 + yOffset) | 0;
                    var canvas = this.canvas;
                    canvas.globalAlpha = opacity;
                    var factor = OpenLayers.Renderer.Canvas.drawImageScaleFactor || (OpenLayers.Renderer.Canvas.drawImageScaleFactor = /android 2.1/.test(navigator.userAgent.toLowerCase()) ? 320 / window.screen.width : 1);
                    canvas.drawImage(img, x * factor, y * factor, width * factor, height * factor);
                    if (this.hitDetection) {
                        this.setHitContextStyle("fill", featureId);
                        this.hitContext.fillRect(x, y, width, height);
                    }
                }
            };
        img.onload = OpenLayers.Function.bind(onLoad, this);
        img.src = style.externalGraphic;
    },
    setCanvasStyle: function (type, style) {
        if (type === "fill") {
            this.canvas.globalAlpha = style['fillOpacity'];
            this.canvas.fillStyle = style['fillColor'];
        } else if (type === "stroke") {
            this.canvas.globalAlpha = style['strokeOpacity'];
            this.canvas.strokeStyle = style['strokeColor'];
            this.canvas.lineWidth = style['strokeWidth'];
        } else {
            this.canvas.globalAlpha = 0;
            this.canvas.lineWidth = 1;
        }
    },
    featureIdToHex: function (featureId) {
        var id = Number(featureId.split("_").pop()) + 1;
        if (id >= 16777216) {
            this.hitOverflow = id - 16777215;
            id = id % 16777216 + 1;
        }
        var hex = "000000" + id.toString(16);
        var len = hex.length;
        hex = "#" + hex.substring(len - 6, len);
        return hex;
    },
    setHitContextStyle: function (type, featureId, symbolizer) {
        var hex = this.featureIdToHex(featureId);
        if (type == "fill") {
            this.hitContext.globalAlpha = 1.0;
            this.hitContext.fillStyle = hex;
        } else if (type == "stroke") {
            this.hitContext.globalAlpha = 1.0;
            this.hitContext.strokeStyle = hex;
            this.hitContext.lineWidth = symbolizer.strokeWidth + 2;
        } else {
            this.hitContext.globalAlpha = 0;
            this.hitContext.lineWidth = 1;
        }
    },
    drawPoint: function (geometry, style, featureId) {
        if (style.graphic !== false) {
            if (style.externalGraphic) {
                this.drawExternalGraphic(geometry, style, featureId);
            } else {
                var pt = this.getLocalXY(geometry);
                var p0 = pt[0];
                var p1 = pt[1];
                if (!isNaN(p0) && !isNaN(p1)) {
                    var twoPi = Math.PI * 2;
                    var radius = style.pointRadius;
                    if (style.fill !== false) {
                        this.setCanvasStyle("fill", style);
                        this.canvas.beginPath();
                        this.canvas.arc(p0, p1, radius, 0, twoPi, true);
                        this.canvas.fill();
                        if (this.hitDetection) {
                            this.setHitContextStyle("fill", featureId, style);
                            this.hitContext.beginPath();
                            this.hitContext.arc(p0, p1, radius, 0, twoPi, true);
                            this.hitContext.fill();
                        }
                    }
                    if (style.stroke !== false) {
                        this.setCanvasStyle("stroke", style);
                        this.canvas.beginPath();
                        this.canvas.arc(p0, p1, radius, 0, twoPi, true);
                        this.canvas.stroke();
                        if (this.hitDetection) {
                            this.setHitContextStyle("stroke", featureId, style);
                            this.hitContext.beginPath();
                            this.hitContext.arc(p0, p1, radius, 0, twoPi, true);
                            this.hitContext.stroke();
                        }
                        this.setCanvasStyle("reset");
                    }
                }
            }
        }
    },
    drawLineString: function (geometry, style, featureId) {
        style = OpenLayers.Util.applyDefaults({
            fill: false
        }, style);
        this.drawLinearRing(geometry, style, featureId);
    },
    drawLinearRing: function (geometry, style, featureId) {
        if (style.fill !== false) {
            this.setCanvasStyle("fill", style);
            this.renderPath(this.canvas, geometry, style, featureId, "fill");
            if (this.hitDetection) {
                this.setHitContextStyle("fill", featureId, style);
                this.renderPath(this.hitContext, geometry, style, featureId, "fill");
            }
        }
        if (style.stroke !== false) {
            this.setCanvasStyle("stroke", style);
            this.renderPath(this.canvas, geometry, style, featureId, "stroke");
            if (this.hitDetection) {
                this.setHitContextStyle("stroke", featureId, style);
                this.renderPath(this.hitContext, geometry, style, featureId, "stroke");
            }
        }
        this.setCanvasStyle("reset");
    },
    renderPath: function (context, geometry, style, featureId, type) {
        var components = geometry.components;
        var len = components.length;
        context.beginPath();
        var start = this.getLocalXY(components[0]);
        var x = start[0];
        var y = start[1];
        if (!isNaN(x) && !isNaN(y)) {
            context.moveTo(start[0], start[1]);
            for (var i = 1; i < len; ++i) {
                var pt = this.getLocalXY(components[i]);
                context.lineTo(pt[0], pt[1]);
            }
            if (type === "fill") {
                context.fill();
            } else {
                context.stroke();
            }
        }
    },
    drawPolygon: function (geometry, style, featureId) {
        var components = geometry.components;
        var len = components.length;
        this.drawLinearRing(components[0], style, featureId);
        for (var i = 1; i < len; ++i) {
            this.canvas.globalCompositeOperation = "destination-out";
            if (this.hitDetection) {
                this.hitContext.globalCompositeOperation = "destination-out";
            }
            this.drawLinearRing(components[i], OpenLayers.Util.applyDefaults({
                stroke: false,
                fillOpacity: 1.0
            }, style), featureId);
            this.canvas.globalCompositeOperation = "source-over";
            if (this.hitDetection) {
                this.hitContext.globalCompositeOperation = "source-over";
            }
            this.drawLinearRing(components[i], OpenLayers.Util.applyDefaults({
                fill: false
            }, style), featureId);
        }
    },
    drawText: function (location, style) {
        style = OpenLayers.Util.extend({
            fontColor: "#000000",
            labelAlign: "cm"
        }, style);
        var pt = this.getLocalXY(location);
        this.setCanvasStyle("reset");
        this.canvas.fillStyle = style.fontColor;
        this.canvas.globalAlpha = style.fontOpacity || 1.0;
        var fontStyle = [style.fontStyle ? style.fontStyle : "normal", "normal", style.fontWeight ? style.fontWeight : "normal", style.fontSize ? style.fontSize : "1em", style.fontFamily ? style.fontFamily : "sans-serif"].join(" ");
        var labelRows = style.label.split('\n');
        var numRows = labelRows.length;
        if (this.canvas.fillText) {
            this.canvas.font = fontStyle;
            this.canvas.textAlign = OpenLayers.Renderer.Canvas.LABEL_ALIGN[style.labelAlign[0]] || "center";
            this.canvas.textBaseline = OpenLayers.Renderer.Canvas.LABEL_ALIGN[style.labelAlign[1]] || "middle";
            var vfactor = OpenLayers.Renderer.Canvas.LABEL_FACTOR[style.labelAlign[1]];
            if (vfactor == null) {
                vfactor = -.5;
            }
            var lineHeight = this.canvas.measureText('Mg').height || this.canvas.measureText('xx').width;
            pt[1] += lineHeight * vfactor * (numRows - 1);
            for (var i = 0; i < numRows; i++) {
                this.canvas.fillText(labelRows[i], pt[0], pt[1] + (lineHeight * i));
            }
        } else if (this.canvas.mozDrawText) {
            this.canvas.mozTextStyle = fontStyle;
            var hfactor = OpenLayers.Renderer.Canvas.LABEL_FACTOR[style.labelAlign[0]];
            if (hfactor == null) {
                hfactor = -.5;
            }
            var vfactor = OpenLayers.Renderer.Canvas.LABEL_FACTOR[style.labelAlign[1]];
            if (vfactor == null) {
                vfactor = -.5;
            }
            var lineHeight = this.canvas.mozMeasureText('xx');
            pt[1] += lineHeight * (1 + (vfactor * numRows));
            for (var i = 0; i < numRows; i++) {
                var x = pt[0] + (hfactor * this.canvas.mozMeasureText(labelRows[i]));
                var y = pt[1] + (i * lineHeight);
                this.canvas.translate(x, y);
                this.canvas.mozDrawText(labelRows[i]);
                this.canvas.translate(-x, -y);
            }
        }
        this.setCanvasStyle("reset");
    },
    getLocalXY: function (point) {
        var resolution = this.getResolution();
        var extent = this.extent;
        var x = (point.x / resolution + (-extent.left / resolution));
        var y = ((extent.top / resolution) - point.y / resolution);
        return [x, y];
    },
    clear: function () {
        var height = this.root.height;
        var width = this.root.width;
        this.canvas.clearRect(0, 0, width, height);
        this.features = {};
        if (this.hitDetection) {
            this.hitContext.clearRect(0, 0, width, height);
        }
    },
    getFeatureIdFromEvent: function (evt) {
        var feature = null;
        if (this.hitDetection) {
            if (!this.map.dragging) {
                var xy = evt.xy;
                var x = xy.x | 0;
                var y = xy.y | 0;
                var data = this.hitContext.getImageData(x, y, 1, 1).data;
                if (data[3] === 255) {
                    var id = data[2] + (256 * (data[1] + (256 * data[0])));
                    if (id) {
                        try {
                            feature = this.features["OpenLayers.Feature.Vector_" + (id - 1 + this.hitOverflow)][0];
                        } catch (e) {
                            feature = this.features["Korem.Feature.VMaker_" + (id - 1 + this.hitOverflow)][0];
                        }
                    }
                }
            }
        }
        return feature;
    },
    eraseFeatures: function (features) {
        if (!(OpenLayers.Util.isArray(features))) {
            features = [features];
        }
        for (var i = 0; i < features.length; ++i) {
            delete this.features[features[i].id];
        }
        this.redraw();
    },
    redraw: function () {
        if (!this.locked) {
            var height = this.root.height;
            var width = this.root.width;
            this.canvas.clearRect(0, 0, width, height);
            if (this.hitDetection) {
                this.hitContext.clearRect(0, 0, width, height);
            }
            var labelMap = [];
            var feature, style;
            for (var id in this.features) {
                if (!this.features.hasOwnProperty(id)) {
                    continue;
                }
                feature = this.features[id][0];
                style = this.features[id][1];
                this.drawGeometry(feature.geometry, style, feature.id);
                if (style.label) {
                    labelMap.push([feature, style]);
                }
            }
            var item;
            for (var i = 0, len = labelMap.length; i < len; ++i) {
                item = labelMap[i];
                this.drawText(item[0].geometry.getCentroid(), item[1]);
            }
        }
    },
    CLASS_NAME: "OpenLayers.Renderer.Canvas"
});
OpenLayers.Renderer.Canvas.LABEL_ALIGN = {
    "l": "left",
    "r": "right",
    "t": "top",
    "b": "bottom"
};
OpenLayers.Renderer.Canvas.LABEL_FACTOR = {
    "l": 0,
    "r": -1,
    "t": 0,
    "b": -1
};
OpenLayers.Renderer.Canvas.drawImageScaleFactor = null;
OpenLayers.Filter.Comparison = OpenLayers.Class(OpenLayers.Filter, {
    type: null,
    property: null,
    value: null,
    matchCase: true,
    lowerBoundary: null,
    upperBoundary: null,
    initialize: function (options) {
        OpenLayers.Filter.prototype.initialize.apply(this, [options]);
        if (this.type === OpenLayers.Filter.Comparison.LIKE && options.matchCase === undefined) {
            this.matchCase = null;
        }
    },
    evaluate: function (context) {
        if (context instanceof OpenLayers.Feature.Vector) {
            context = context.attributes;
        }
        var result = false;
        var got = context[this.property];
        var exp;
        switch (this.type) {
        case OpenLayers.Filter.Comparison.EQUAL_TO:
            exp = this.value;
            if (!this.matchCase && typeof got == "string" && typeof exp == "string") {
                result = (got.toUpperCase() == exp.toUpperCase());
            } else {
                result = (got == exp);
            }
            break;
        case OpenLayers.Filter.Comparison.NOT_EQUAL_TO:
            exp = this.value;
            if (!this.matchCase && typeof got == "string" && typeof exp == "string") {
                result = (got.toUpperCase() != exp.toUpperCase());
            } else {
                result = (got != exp);
            }
            break;
        case OpenLayers.Filter.Comparison.LESS_THAN:
            result = got < this.value;
            break;
        case OpenLayers.Filter.Comparison.GREATER_THAN:
            result = got > this.value;
            break;
        case OpenLayers.Filter.Comparison.LESS_THAN_OR_EQUAL_TO:
            result = got <= this.value;
            break;
        case OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO:
            result = got >= this.value;
            break;
        case OpenLayers.Filter.Comparison.BETWEEN:
            result = (got >= this.lowerBoundary) && (got <= this.upperBoundary);
            break;
        case OpenLayers.Filter.Comparison.LIKE:
            var regexp = new RegExp(this.value, "gi");
            result = regexp.test(got);
            break;
        }
        return result;
    },
    value2regex: function (wildCard, singleChar, escapeChar) {
        if (wildCard == ".") {
            var msg = "'.' is an unsupported wildCard character for " + "OpenLayers.Filter.Comparison";
            OpenLayers.Console.error(msg);
            return null;
        }
        wildCard = wildCard ? wildCard : "*";
        singleChar = singleChar ? singleChar : ".";
        escapeChar = escapeChar ? escapeChar : "!";
        this.value = this.value.replace(new RegExp("\\" + escapeChar + "(.|$)", "g"), "\\$1");
        this.value = this.value.replace(new RegExp("\\" + singleChar, "g"), ".");
        this.value = this.value.replace(new RegExp("\\" + wildCard, "g"), ".*");
        this.value = this.value.replace(new RegExp("\\\\.\\*", "g"), "\\" + wildCard);
        this.value = this.value.replace(new RegExp("\\\\\\.", "g"), "\\" + singleChar);
        return this.value;
    },
    regex2value: function () {
        var value = this.value;
        value = value.replace(/!/g, "!!");
        value = value.replace(/(\\)?\\\./g, function ($0, $1) {
            return $1 ? $0 : "!.";
        });
        value = value.replace(/(\\)?\\\*/g, function ($0, $1) {
            return $1 ? $0 : "!*";
        });
        value = value.replace(/\\\\/g, "\\");
        value = value.replace(/\.\*/g, "*");
        return value;
    },
    clone: function () {
        return OpenLayers.Util.extend(new OpenLayers.Filter.Comparison(), this);
    },
    CLASS_NAME: "OpenLayers.Filter.Comparison"
});
OpenLayers.Filter.Comparison.EQUAL_TO = "==";
OpenLayers.Filter.Comparison.NOT_EQUAL_TO = "!=";
OpenLayers.Filter.Comparison.LESS_THAN = "<";
OpenLayers.Filter.Comparison.GREATER_THAN = ">";
OpenLayers.Filter.Comparison.LESS_THAN_OR_EQUAL_TO = "<=";
OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO = ">=";
OpenLayers.Filter.Comparison.BETWEEN = "..";
OpenLayers.Filter.Comparison.LIKE = "~";
OpenLayers.Format.QueryStringFilter = (function () {
    var cmpToStr = {};
    cmpToStr[OpenLayers.Filter.Comparison.EQUAL_TO] = "eq";
    cmpToStr[OpenLayers.Filter.Comparison.NOT_EQUAL_TO] = "ne";
    cmpToStr[OpenLayers.Filter.Comparison.LESS_THAN] = "lt";
    cmpToStr[OpenLayers.Filter.Comparison.LESS_THAN_OR_EQUAL_TO] = "lte";
    cmpToStr[OpenLayers.Filter.Comparison.GREATER_THAN] = "gt";
    cmpToStr[OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO] = "gte";
    cmpToStr[OpenLayers.Filter.Comparison.LIKE] = "ilike";

    function regex2value(value) {
        value = value.replace(/%/g, "\\%");
        value = value.replace(/\\\\\.(\*)?/g, function ($0, $1) {
            return $1 ? $0 : "\\\\_";
        });
        value = value.replace(/\\\\\.\*/g, "\\\\%");
        value = value.replace(/(\\)?\.(\*)?/g, function ($0, $1, $2) {
            return $1 || $2 ? $0 : "_";
        });
        value = value.replace(/(\\)?\.\*/g, function ($0, $1) {
            return $1 ? $0 : "%";
        });
        value = value.replace(/\\\./g, ".");
        value = value.replace(/(\\)?\\\*/g, function ($0, $1) {
            return $1 ? $0 : "*";
        });
        return value;
    }
    return OpenLayers.Class(OpenLayers.Format, {
        wildcarded: false,
        srsInBBOX: false,
        write: function (filter, params) {
            params = params || {};
            var className = filter.CLASS_NAME;
            var filterType = className.substring(className.lastIndexOf(".") + 1);
            switch (filterType) {
            case "Spatial":
                switch (filter.type) {
                case OpenLayers.Filter.Spatial.BBOX:
                    params.bbox = filter.value.toArray();
                    if (this.srsInBBOX && filter.projection) {
                        params.bbox.push(filter.projection.getCode());
                    }
                    break;
                case OpenLayers.Filter.Spatial.DWITHIN:
                    params.tolerance = filter.distance;
                case OpenLayers.Filter.Spatial.WITHIN:
                    params.lon = filter.value.x;
                    params.lat = filter.value.y;
                    break;
                default:
                    OpenLayers.Console.warn("Unknown spatial filter type " + filter.type);
                }
                break;
            case "Comparison":
                var op = cmpToStr[filter.type];
                if (op !== undefined) {
                    var value = filter.value;
                    if (filter.type == OpenLayers.Filter.Comparison.LIKE) {
                        value = regex2value(value);
                        if (this.wildcarded) {
                            value = "%" + value + "%";
                        }
                    }
                    params[filter.property + "__" + op] = value;
                    params.queryable = params.queryable || [];
                    params.queryable.push(filter.property);
                } else {
                    OpenLayers.Console.warn("Unknown comparison filter type " + filter.type);
                }
                break;
            case "Logical":
                if (filter.type === OpenLayers.Filter.Logical.AND) {
                    for (var i = 0, len = filter.filters.length; i < len; i++) {
                        params = this.write(filter.filters[i], params);
                    }
                } else {
                    OpenLayers.Console.warn("Unsupported logical filter type " + filter.type);
                }
                break;
            default:
                OpenLayers.Console.warn("Unknown filter type " + filterType);
            }
            return params;
        },
        CLASS_NAME: "OpenLayers.Format.QueryStringFilter"
    });
})();
OpenLayers.Layer.HTTPRequest = OpenLayers.Class(OpenLayers.Layer, {
    URL_HASH_FACTOR: (Math.sqrt(5) - 1) / 2,
    url: null,
    params: null,
    reproject: false,
    initialize: function (name, url, params, options) {
        OpenLayers.Layer.prototype.initialize.apply(this, [name, options]);
        this.url = url;
        this.params = OpenLayers.Util.extend({}, params);
    },
    destroy: function () {
        this.url = null;
        this.params = null;
        OpenLayers.Layer.prototype.destroy.apply(this, arguments);
    },
    clone: function (obj) {
        if (obj == null) {
            obj = new OpenLayers.Layer.HTTPRequest(this.name, this.url, this.params, this.getOptions());
        }
        obj = OpenLayers.Layer.prototype.clone.apply(this, [obj]);
        return obj;
    },
    setUrl: function (newUrl) {
        this.url = newUrl;
    },
    mergeNewParams: function (newParams) {
        this.params = OpenLayers.Util.extend(this.params, newParams);
        var ret = this.redraw();
        if (this.map != null) {
            this.map.events.triggerEvent("changelayer", {
                layer: this,
                property: "params"
            });
        }
        return ret;
    },
    redraw: function (force) {
        if (force) {
            return this.mergeNewParams({
                "_olSalt": Math.random()
            });
        } else {
            return OpenLayers.Layer.prototype.redraw.apply(this, []);
        }
    },
    selectUrl: function (paramString, urls) {
        var product = 1;
        for (var i = 0, len = paramString.length; i < len; i++) {
            product *= paramString.charCodeAt(i) * this.URL_HASH_FACTOR;
            product -= Math.floor(product);
        }
        return urls[Math.floor(product * urls.length)];
    },
    getFullRequestString: function (newParams, altUrl) {
        var url = altUrl || this.url;
        var allParams = OpenLayers.Util.extend({}, this.params);
        allParams = OpenLayers.Util.extend(allParams, newParams);
        var paramsString = OpenLayers.Util.getParameterString(allParams);
        if (OpenLayers.Util.isArray(url)) {
            url = this.selectUrl(paramsString, url);
        }
        var urlParams = OpenLayers.Util.upperCaseObject(OpenLayers.Util.getParameters(url));
        for (var key in allParams) {
            if (key.toUpperCase() in urlParams) {
                delete allParams[key];
            }
        }
        paramsString = OpenLayers.Util.getParameterString(allParams);
        return OpenLayers.Util.urlAppend(url, paramsString);
    },
    CLASS_NAME: "OpenLayers.Layer.HTTPRequest"
});
OpenLayers.Strategy = OpenLayers.Class({
    layer: null,
    options: null,
    active: null,
    autoActivate: true,
    autoDestroy: true,
    initialize: function (options) {
        OpenLayers.Util.extend(this, options);
        this.options = options;
        this.active = false;
    },
    destroy: function () {
        this.deactivate();
        this.layer = null;
        this.options = null;
    },
    setLayer: function (layer) {
        this.layer = layer;
    },
    activate: function () {
        if (!this.active) {
            this.active = true;
            return true;
        }
        return false;
    },
    deactivate: function () {
        if (this.active) {
            this.active = false;
            return true;
        }
        return false;
    },
    CLASS_NAME: "OpenLayers.Strategy"
});
OpenLayers.Strategy.Fixed = OpenLayers.Class(OpenLayers.Strategy, {
    preload: false,
    activate: function () {
        if (OpenLayers.Strategy.prototype.activate.apply(this, arguments)) {
            this.layer.events.on({
                "refresh": this.load,
                scope: this
            });
            if (this.layer.visibility == true || this.preload) {
                this.load();
            } else {
                this.layer.events.on({
                    "visibilitychanged": this.load,
                    scope: this
                });
            }
            return true;
        }
        return false;
    },
    deactivate: function () {
        var deactivated = OpenLayers.Strategy.prototype.deactivate.call(this);
        if (deactivated) {
            this.layer.events.un({
                "refresh": this.load,
                "visibilitychanged": this.load,
                scope: this
            });
        }
        return deactivated;
    },
    load: function (options) {
        var layer = this.layer;
        layer.events.triggerEvent("loadstart");
        layer.protocol.read(OpenLayers.Util.applyDefaults({
            callback: OpenLayers.Function.bind(this.merge, this, layer.map.getProjectionObject()),
            filter: layer.filter
        }, options));
        layer.events.un({
            "visibilitychanged": this.load,
            scope: this
        });
    },
    merge: function (mapProjection, resp) {
        var layer = this.layer;
        layer.destroyFeatures();
        var features = resp.features;
        if (features && features.length > 0) {
            if (!mapProjection.equals(layer.projection)) {
                var geom;
                for (var i = 0, len = features.length; i < len; ++i) {
                    geom = features[i].geometry;
                    if (geom) {
                        geom.transform(layer.projection, mapProjection);
                    }
                }
            }
            layer.addFeatures(features);
        }
        layer.events.triggerEvent("loadend");
    },
    CLASS_NAME: "OpenLayers.Strategy.Fixed"
});
OpenLayers.Protocol = OpenLayers.Class({
    format: null,
    options: null,
    autoDestroy: true,
    defaultFilter: null,
    initialize: function (options) {
        options = options || {};
        OpenLayers.Util.extend(this, options);
        this.options = options;
    },
    mergeWithDefaultFilter: function (filter) {
        var merged;
        if (filter && this.defaultFilter) {
            merged = new OpenLayers.Filter.Logical({
                type: OpenLayers.Filter.Logical.AND,
                filters: [this.defaultFilter, filter]
            });
        } else {
            merged = filter || this.defaultFilter || undefined;
        }
        return merged;
    },
    destroy: function () {
        this.options = null;
        this.format = null;
    },
    read: function (options) {
        options = options || {};
        options.filter = this.mergeWithDefaultFilter(options.filter);
    },
    create: function () {},
    update: function () {},
    "delete": function () {},
    commit: function () {},
    abort: function (response) {},
    createCallback: function (method, response, options) {
        return OpenLayers.Function.bind(function () {
            method.apply(this, [response, options]);
        }, this);
    },
    CLASS_NAME: "OpenLayers.Protocol"
});
OpenLayers.Protocol.Response = OpenLayers.Class({
    code: null,
    requestType: null,
    last: true,
    features: null,
    reqFeatures: null,
    priv: null,
    error: null,
    initialize: function (options) {
        OpenLayers.Util.extend(this, options);
    },
    success: function () {
        return this.code > 0;
    },
    CLASS_NAME: "OpenLayers.Protocol.Response"
});
OpenLayers.Protocol.Response.SUCCESS = 1;
OpenLayers.Protocol.Response.FAILURE = 0;
OpenLayers.Geometry.Polygon = OpenLayers.Class(OpenLayers.Geometry.Collection, {
    componentTypes: ["OpenLayers.Geometry.LinearRing"],
    initialize: function (components) {
        OpenLayers.Geometry.Collection.prototype.initialize.apply(this, arguments);
    },
    getArea: function () {
        var area = 0.0;
        if (this.components && (this.components.length > 0)) {
            area += Math.abs(this.components[0].getArea());
            for (var i = 1, len = this.components.length; i < len; i++) {
                area -= Math.abs(this.components[i].getArea());
            }
        }
        return area;
    },
    getGeodesicArea: function (projection) {
        var area = 0.0;
        if (this.components && (this.components.length > 0)) {
            area += Math.abs(this.components[0].getGeodesicArea(projection));
            for (var i = 1, len = this.components.length; i < len; i++) {
                area -= Math.abs(this.components[i].getGeodesicArea(projection));
            }
        }
        return area;
    },
    containsPoint: function (point) {
        var numRings = this.components.length;
        var contained = false;
        if (numRings > 0) {
            contained = this.components[0].containsPoint(point);
            if (contained !== 1) {
                if (contained && numRings > 1) {
                    var hole;
                    for (var i = 1; i < numRings; ++i) {
                        hole = this.components[i].containsPoint(point);
                        if (hole) {
                            if (hole === 1) {
                                contained = 1;
                            } else {
                                contained = false;
                            }
                            break;
                        }
                    }
                }
            }
        }
        return contained;
    },
    intersects: function (geometry) {
        var intersect = false;
        var i, len;
        if (geometry.CLASS_NAME == "OpenLayers.Geometry.Point") {
            intersect = this.containsPoint(geometry);
        } else if (geometry.CLASS_NAME == "OpenLayers.Geometry.LineString" || geometry.CLASS_NAME == "OpenLayers.Geometry.LinearRing") {
            for (i = 0, len = this.components.length; i < len; ++i) {
                intersect = geometry.intersects(this.components[i]);
                if (intersect) {
                    break;
                }
            }
            if (!intersect) {
                for (i = 0, len = geometry.components.length; i < len; ++i) {
                    intersect = this.containsPoint(geometry.components[i]);
                    if (intersect) {
                        break;
                    }
                }
            }
        } else {
            for (i = 0, len = geometry.components.length; i < len; ++i) {
                intersect = this.intersects(geometry.components[i]);
                if (intersect) {
                    break;
                }
            }
        }
        if (!intersect && geometry.CLASS_NAME == "OpenLayers.Geometry.Polygon") {
            var ring = this.components[0];
            for (i = 0, len = ring.components.length; i < len; ++i) {
                intersect = geometry.containsPoint(ring.components[i]);
                if (intersect) {
                    break;
                }
            }
        }
        return intersect;
    },
    distanceTo: function (geometry, options) {
        var edge = !(options && options.edge === false);
        var result;
        if (!edge && this.intersects(geometry)) {
            result = 0;
        } else {
            result = OpenLayers.Geometry.Collection.prototype.distanceTo.apply(this, [geometry, options]);
        }
        return result;
    },
    CLASS_NAME: "OpenLayers.Geometry.Polygon"
});
OpenLayers.Geometry.Polygon.createRegularPolygon = function (origin, radius, sides, rotation) {
    var angle = Math.PI * ((1 / sides) - (1 / 2));
    if (rotation) {
        angle += (rotation / 180) * Math.PI;
    }
    var rotatedAngle, x, y;
    var points = [];
    for (var i = 0; i < sides; ++i) {
        rotatedAngle = angle + (i * 2 * Math.PI / sides);
        x = origin.x + (radius * Math.cos(rotatedAngle));
        y = origin.y + (radius * Math.sin(rotatedAngle));
        points.push(new OpenLayers.Geometry.Point(x, y));
    }
    var ring = new OpenLayers.Geometry.LinearRing(points);
    return new OpenLayers.Geometry.Polygon([ring]);
};
OpenLayers.Control.ZoomToMaxExtent = OpenLayers.Class(OpenLayers.Control, {
    type: OpenLayers.Control.TYPE_BUTTON,
    trigger: function () {
        if (this.map) {
            this.map.zoomToMaxExtent();
        }
    },
    CLASS_NAME: "OpenLayers.Control.ZoomToMaxExtent"
});
OpenLayers.Layer.Grid = OpenLayers.Class(OpenLayers.Layer.HTTPRequest, {
    tileSize: null,
    tileOriginCorner: "bl",
    tileOrigin: null,
    tileOptions: null,
    grid: null,
    singleTile: false,
    ratio: 1.5,
    buffer: 0,
    numLoadingTiles: 0,
    tileLoadingDelay: 100,
    timerId: null,
    initialize: function (name, url, params, options) {
        OpenLayers.Layer.HTTPRequest.prototype.initialize.apply(this, arguments);
        this.events.addEventType("tileloaded");
        this.grid = [];
        this._moveGriddedTiles = OpenLayers.Function.bind(this.moveGriddedTiles, this);
    },
    removeMap: function (map) {
        if (this.timerId != null) {
            window.clearTimeout(this.timerId);
            this.timerId = null;
        }
    },
    destroy: function () {
        this.clearGrid();
        this.grid = null;
        this.tileSize = null;
        OpenLayers.Layer.HTTPRequest.prototype.destroy.apply(this, arguments);
    },
    clearGrid: function () {
        if (this.grid) {
            for (var iRow = 0, len = this.grid.length; iRow < len; iRow++) {
                var row = this.grid[iRow];
                for (var iCol = 0, clen = row.length; iCol < clen; iCol++) {
                    var tile = row[iCol];
                    this.removeTileMonitoringHooks(tile);
                    tile.destroy();
                }
            }
            this.grid = [];
        }
    },
    clone: function (obj) {
        if (obj == null) {
            obj = new OpenLayers.Layer.Grid(this.name, this.url, this.params, this.getOptions());
        }
        obj = OpenLayers.Layer.HTTPRequest.prototype.clone.apply(this, [obj]);
        if (this.tileSize != null) {
            obj.tileSize = this.tileSize.clone();
        }
        obj.grid = [];
        return obj;
    },
    moveTo: function (bounds, zoomChanged, dragging) {
        OpenLayers.Layer.HTTPRequest.prototype.moveTo.apply(this, arguments);
        bounds = bounds || this.map.getExtent();
        if (bounds != null) {
            var forceReTile = !this.grid.length || zoomChanged;
            var tilesBounds = this.getTilesBounds();
            if (this.singleTile) {
                if (forceReTile || (!dragging && !tilesBounds.containsBounds(bounds))) {
                    this.initSingleTile(bounds);
                }
            } else {
                if (forceReTile || !tilesBounds.containsBounds(bounds, true)) {
                    this.initGriddedTiles(bounds);
                } else {
                    this.scheduleMoveGriddedTiles();
                }
            }
        }
    },
    moveByPx: function (dx, dy) {
        if (!this.singleTile) {
            this.scheduleMoveGriddedTiles();
        }
    },
    scheduleMoveGriddedTiles: function () {
        if (this.timerId != null) {
            window.clearTimeout(this.timerId);
        }
        this.timerId = window.setTimeout(this._moveGriddedTiles, this.tileLoadingDelay);
    },
    setTileSize: function (size) {
        if (this.singleTile) {
            size = this.map.getSize();
            size.h = parseInt(size.h * this.ratio);
            size.w = parseInt(size.w * this.ratio);
        }
        OpenLayers.Layer.HTTPRequest.prototype.setTileSize.apply(this, [size]);
    },
    getGridBounds: function () {
        var msg = "The getGridBounds() function is deprecated. It will be " + "removed in 3.0. Please use getTilesBounds() instead.";
        OpenLayers.Console.warn(msg);
        return this.getTilesBounds();
    },
    getTilesBounds: function () {
        var bounds = null;
        if (this.grid.length) {
            var bottom = this.grid.length - 1;
            var bottomLeftTile = this.grid[bottom][0];
            var right = this.grid[0].length - 1;
            var topRightTile = this.grid[0][right];
            bounds = new OpenLayers.Bounds(bottomLeftTile.bounds.left, bottomLeftTile.bounds.bottom, topRightTile.bounds.right, topRightTile.bounds.top);
        }
        return bounds;
    },
    initSingleTile: function (bounds) {
        var center = bounds.getCenterLonLat();
        var tileWidth = bounds.getWidth() * this.ratio;
        var tileHeight = bounds.getHeight() * this.ratio;
        var tileBounds = new OpenLayers.Bounds(center.lon - (tileWidth / 2), center.lat - (tileHeight / 2), center.lon + (tileWidth / 2), center.lat + (tileHeight / 2));
        var ul = new OpenLayers.LonLat(tileBounds.left, tileBounds.top);
        var px = this.map.getLayerPxFromLonLat(ul);
        if (!this.grid.length) {
            this.grid[0] = [];
        }
        var tile = this.grid[0][0];
        if (!tile) {
            tile = this.addTile(tileBounds, px);
            this.addTileMonitoringHooks(tile);
            tile.draw();
            this.grid[0][0] = tile;
        } else {
            tile.moveTo(tileBounds, px);
        }
        this.removeExcessTiles(1, 1);
    },
    calculateGridLayout: function (bounds, origin, resolution) {
        var tilelon = resolution * this.tileSize.w;
        var tilelat = resolution * this.tileSize.h;
        var offsetlon = bounds.left - origin.lon;
        var tilecol = Math.floor(offsetlon / tilelon) - this.buffer;
        var tilecolremain = offsetlon / tilelon - tilecol;
        var tileoffsetx = -tilecolremain * this.tileSize.w;
        var tileoffsetlon = origin.lon + tilecol * tilelon;
        var offsetlat = bounds.top - (origin.lat + tilelat);
        var tilerow = Math.ceil(offsetlat / tilelat) + this.buffer;
        var tilerowremain = tilerow - offsetlat / tilelat;
        var tileoffsety = -tilerowremain * this.tileSize.h;
        var tileoffsetlat = origin.lat + tilerow * tilelat;
        return {
            tilelon: tilelon,
            tilelat: tilelat,
            tileoffsetlon: tileoffsetlon,
            tileoffsetlat: tileoffsetlat,
            tileoffsetx: tileoffsetx,
            tileoffsety: tileoffsety
        };
    },
    getTileOrigin: function () {
        var origin = this.tileOrigin;
        if (!origin) {
            var extent = this.getMaxExtent();
            var edges = ({
                "tl": ["left", "top"],
                "tr": ["right", "top"],
                "bl": ["left", "bottom"],
                "br": ["right", "bottom"]
            })[this.tileOriginCorner];
            origin = new OpenLayers.LonLat(extent[edges[0]], extent[edges[1]]);
        }
        return origin;
    },
    initGriddedTiles: function (bounds) {
        var viewSize = this.map.getSize();
        var minRows = Math.ceil(viewSize.h / this.tileSize.h) + Math.max(1, 2 * this.buffer);
        var minCols = Math.ceil(viewSize.w / this.tileSize.w) + Math.max(1, 2 * this.buffer);
        var origin = this.getTileOrigin();
        var resolution = this.map.getResolution();
        var tileLayout = this.calculateGridLayout(bounds, origin, resolution);
        var tileoffsetx = Math.round(tileLayout.tileoffsetx);
        var tileoffsety = Math.round(tileLayout.tileoffsety);
        var tileoffsetlon = tileLayout.tileoffsetlon;
        var tileoffsetlat = tileLayout.tileoffsetlat;
        var tilelon = tileLayout.tilelon;
        var tilelat = tileLayout.tilelat;
        this.origin = new OpenLayers.Pixel(tileoffsetx, tileoffsety);
        var startX = tileoffsetx;
        var startLon = tileoffsetlon;
        var rowidx = 0;
        var layerContainerDivLeft = parseInt(this.map.layerContainerDiv.style.left);
        var layerContainerDivTop = parseInt(this.map.layerContainerDiv.style.top);
        do {
            var row = this.grid[rowidx++];
            if (!row) {
                row = [];
                this.grid.push(row);
            }
            tileoffsetlon = startLon;
            tileoffsetx = startX;
            var colidx = 0;
            do {
                var tileBounds = new OpenLayers.Bounds(tileoffsetlon, tileoffsetlat, tileoffsetlon + tilelon, tileoffsetlat + tilelat);
                var x = tileoffsetx;
                x -= layerContainerDivLeft;
                var y = tileoffsety;
                y -= layerContainerDivTop;
                var px = new OpenLayers.Pixel(x, y);
                var tile = row[colidx++];
                if (!tile) {
                    tile = this.addTile(tileBounds, px);
                    this.addTileMonitoringHooks(tile);
                    row.push(tile);
                } else {
                    tile.moveTo(tileBounds, px, false);
                }
                tileoffsetlon += tilelon;
                tileoffsetx += this.tileSize.w;
            } while ((tileoffsetlon <= bounds.right + tilelon * this.buffer) || colidx < minCols);
            tileoffsetlat -= tilelat;
            tileoffsety += this.tileSize.h;
        } while ((tileoffsetlat >= bounds.bottom - tilelat * this.buffer) || rowidx < minRows);
        this.removeExcessTiles(rowidx, colidx);
        this.spiralTileLoad();
    },
    getMaxExtent: function () {
        return this.maxExtent;
    },
    spiralTileLoad: function () {
        var tileQueue = [];
        var directions = ["right", "down", "left", "up"];
        var iRow = 0;
        var iCell = -1;
        var direction = OpenLayers.Util.indexOf(directions, "right");
        var directionsTried = 0;
        while (directionsTried < directions.length) {
            var testRow = iRow;
            var testCell = iCell;
            switch (directions[direction]) {
            case "right":
                testCell++;
                break;
            case "down":
                testRow++;
                break;
            case "left":
                testCell--;
                break;
            case "up":
                testRow--;
                break;
            }
            var tile = null;
            if ((testRow < this.grid.length) && (testRow >= 0) && (testCell < this.grid[0].length) && (testCell >= 0)) {
                tile = this.grid[testRow][testCell];
            }
            if ((tile != null) && (!tile.queued)) {
                tileQueue.unshift(tile);
                tile.queued = true;
                directionsTried = 0;
                iRow = testRow;
                iCell = testCell;
            } else {
                direction = (direction + 1) % 4;
                directionsTried++;
            }
        }
        for (var i = 0, len = tileQueue.length; i < len; i++) {
            var tile = tileQueue[i];
            tile.draw();
            tile.queued = false;
        }
    },
    addTile: function (bounds, position) {
        return new OpenLayers.Tile.Image(this, position, bounds, null, this.tileSize, this.tileOptions);
    },
    addTileMonitoringHooks: function (tile) {
        tile.onLoadStart = function () {
            if (this.numLoadingTiles == 0) {
                this.events.triggerEvent("loadstart");
            }
            this.numLoadingTiles++;
        };
        tile.events.register("loadstart", this, tile.onLoadStart);
        tile.onLoadEnd = function () {
            this.numLoadingTiles--;
            this.events.triggerEvent("tileloaded");
            if (this.numLoadingTiles == 0) {
                this.events.triggerEvent("loadend");
            }
        };
        tile.events.register("loadend", this, tile.onLoadEnd);
        tile.events.register("unload", this, tile.onLoadEnd);
    },
    removeTileMonitoringHooks: function (tile) {
        tile.unload();
        tile.events.un({
            "loadstart": tile.onLoadStart,
            "loadend": tile.onLoadEnd,
            "unload": tile.onLoadEnd,
            scope: this
        });
    },
    moveGriddedTiles: function () {
        var shifted = true;
        var buffer = this.buffer || 1;
        var tlLayer = this.grid[0][0].position;
        var offsetX = parseInt(this.map.layerContainerDiv.style.left);
        var offsetY = parseInt(this.map.layerContainerDiv.style.top);
        var tlViewPort = tlLayer.add(offsetX, offsetY);
        if (tlViewPort.x > -this.tileSize.w * (buffer - 1)) {
            this.shiftColumn(true);
        } else if (tlViewPort.x < -this.tileSize.w * buffer) {
            this.shiftColumn(false);
        } else if (tlViewPort.y > -this.tileSize.h * (buffer - 1)) {
            this.shiftRow(true);
        } else if (tlViewPort.y < -this.tileSize.h * buffer) {
            this.shiftRow(false);
        } else {
            shifted = false;
        }
        if (shifted) {
            this.timerId = window.setTimeout(this._moveGriddedTiles, 0);
        }
    },
    shiftRow: function (prepend) {
        var modelRowIndex = (prepend) ? 0 : (this.grid.length - 1);
        var grid = this.grid;
        var modelRow = grid[modelRowIndex];
        var resolution = this.map.getResolution();
        var deltaY = (prepend) ? -this.tileSize.h : this.tileSize.h;
        var deltaLat = resolution * -deltaY;
        var row = (prepend) ? grid.pop() : grid.shift();
        for (var i = 0, len = modelRow.length; i < len; i++) {
            var modelTile = modelRow[i];
            var bounds = modelTile.bounds.clone();
            var position = modelTile.position.clone();
            bounds.bottom = bounds.bottom + deltaLat;
            bounds.top = bounds.top + deltaLat;
            position.y = position.y + deltaY;
            row[i].moveTo(bounds, position);
        }
        if (prepend) {
            grid.unshift(row);
        } else {
            grid.push(row);
        }
    },
    shiftColumn: function (prepend) {
        var deltaX = (prepend) ? -this.tileSize.w : this.tileSize.w;
        var resolution = this.map.getResolution();
        var deltaLon = resolution * deltaX;
        for (var i = 0, len = this.grid.length; i < len; i++) {
            var row = this.grid[i];
            var modelTileIndex = (prepend) ? 0 : (row.length - 1);
            var modelTile = row[modelTileIndex];
            var bounds = modelTile.bounds.clone();
            var position = modelTile.position.clone();
            bounds.left = bounds.left + deltaLon;
            bounds.right = bounds.right + deltaLon;
            position.x = position.x + deltaX;
            var tile = prepend ? this.grid[i].pop() : this.grid[i].shift();
            tile.moveTo(bounds, position);
            if (prepend) {
                row.unshift(tile);
            } else {
                row.push(tile);
            }
        }
    },
    removeExcessTiles: function (rows, columns) {
        while (this.grid.length > rows) {
            var row = this.grid.pop();
            for (var i = 0, l = row.length; i < l; i++) {
                var tile = row[i];
                this.removeTileMonitoringHooks(tile);
                tile.destroy();
            }
        }
        while (this.grid[0].length > columns) {
            for (var i = 0, l = this.grid.length; i < l; i++) {
                var row = this.grid[i];
                var tile = row.pop();
                this.removeTileMonitoringHooks(tile);
                tile.destroy();
            }
        }
    },
    onMapResize: function () {
        if (this.singleTile) {
            this.clearGrid();
            this.setTileSize();
        }
    },
    getTileBounds: function (viewPortPx) {
        var maxExtent = this.maxExtent;
        var resolution = this.getResolution();
        var tileMapWidth = resolution * this.tileSize.w;
        var tileMapHeight = resolution * this.tileSize.h;
        var mapPoint = this.getLonLatFromViewPortPx(viewPortPx);
        var tileLeft = maxExtent.left + (tileMapWidth * Math.floor((mapPoint.lon - maxExtent.left) / tileMapWidth));
        var tileBottom = maxExtent.bottom + (tileMapHeight * Math.floor((mapPoint.lat - maxExtent.bottom) / tileMapHeight));
        return new OpenLayers.Bounds(tileLeft, tileBottom, tileLeft + tileMapWidth, tileBottom + tileMapHeight);
    },
    CLASS_NAME: "OpenLayers.Layer.Grid"
});
OpenLayers.Tile = OpenLayers.Class({
    EVENT_TYPES: ["loadstart", "loadend", "reload", "unload"],
    events: null,
    id: null,
    layer: null,
    url: null,
    bounds: null,
    size: null,
    position: null,
    isLoading: false,
    initialize: function (layer, position, bounds, url, size, options) {
        this.layer = layer;
        this.position = position.clone();
        this.bounds = bounds.clone();
        this.url = url;
        if (size) {
            this.size = size.clone();
        }
        this.id = OpenLayers.Util.createUniqueID("Tile_");
        this.events = new OpenLayers.Events(this, null, this.EVENT_TYPES);
        OpenLayers.Util.extend(this, options);
    },
    unload: function () {
        if (this.isLoading) {
            this.isLoading = false;
            this.events.triggerEvent("unload");
        }
    },
    destroy: function () {
        this.layer = null;
        this.bounds = null;
        this.size = null;
        this.position = null;
        this.events.destroy();
        this.events = null;
    },
    clone: function (obj) {
        if (obj == null) {
            obj = new OpenLayers.Tile(this.layer, this.position, this.bounds, this.url, this.size);
        }
        OpenLayers.Util.applyDefaults(obj, this);
        return obj;
    },
    draw: function () {
        var maxExtent = this.layer.maxExtent;
        var withinMaxExtent = (maxExtent && this.bounds.intersectsBounds(maxExtent, false));
        this.shouldDraw = (withinMaxExtent || this.layer.displayOutsideMaxExtent);
        this.clear();
        return this.shouldDraw;
    },
    moveTo: function (bounds, position, redraw) {
        if (redraw == null) {
            redraw = true;
        }
        this.bounds = bounds.clone();
        this.position = position.clone();
        if (redraw) {
            this.draw();
        }
    },
    clear: function () {},
    getBoundsFromBaseLayer: function (position) {
        var msg = OpenLayers.i18n('reprojectDeprecated', {
            'layerName': this.layer.name
        });
        OpenLayers.Console.warn(msg);
        var topLeft = this.layer.map.getLonLatFromLayerPx(position);
        var bottomRightPx = position.clone();
        bottomRightPx.x += this.size.w;
        bottomRightPx.y += this.size.h;
        var bottomRight = this.layer.map.getLonLatFromLayerPx(bottomRightPx);
        if (topLeft.lon > bottomRight.lon) {
            if (topLeft.lon < 0) {
                topLeft.lon = -180 - (topLeft.lon + 180);
            } else {
                bottomRight.lon = 180 + bottomRight.lon + 180;
            }
        }
        var bounds = new OpenLayers.Bounds(topLeft.lon, bottomRight.lat, bottomRight.lon, topLeft.lat);
        return bounds;
    },
    showTile: function () {
        if (this.shouldDraw) {
            this.show();
        }
    },
    show: function () {},
    hide: function () {},
    CLASS_NAME: "OpenLayers.Tile"
});
OpenLayers.Tile.Image = OpenLayers.Class(OpenLayers.Tile, {
    url: null,
    imgDiv: null,
    frame: null,
    layerAlphaHack: null,
    isBackBuffer: false,
    isFirstDraw: true,
    backBufferTile: null,
    maxGetUrlLength: null,
    initialize: function (layer, position, bounds, url, size, options) {
        OpenLayers.Tile.prototype.initialize.apply(this, arguments);
        if (this.maxGetUrlLength != null) {
            OpenLayers.Util.extend(this, OpenLayers.Tile.Image.IFrame);
        }
        this.url = url;
        this.frame = document.createElement('div');
        this.frame.style.overflow = 'hidden';
        this.frame.style.position = 'absolute';
        this.layerAlphaHack = this.layer.alpha && OpenLayers.Util.alphaHack();
    },
    destroy: function () {
        if (this.imgDiv != null) {
            this.removeImgDiv();
        }
        this.imgDiv = null;
        if ((this.frame != null) && (this.frame.parentNode == this.layer.div)) {
            this.layer.div.removeChild(this.frame);
        }
        this.frame = null;
        if (this.backBufferTile) {
            this.backBufferTile.destroy();
            this.backBufferTile = null;
        }
        this.layer.events.unregister("loadend", this, this.resetBackBuffer);
        OpenLayers.Tile.prototype.destroy.apply(this, arguments);
    },
    clone: function (obj) {
        if (obj == null) {
            obj = new OpenLayers.Tile.Image(this.layer, this.position, this.bounds, this.url, this.size);
        }
        obj = OpenLayers.Tile.prototype.clone.apply(this, [obj]);
        obj.imgDiv = null;
        return obj;
    },
    draw: function () {
        if (this.layer != this.layer.map.baseLayer && this.layer.reproject) {
            this.bounds = this.getBoundsFromBaseLayer(this.position);
        }
        var drawTile = OpenLayers.Tile.prototype.draw.apply(this, arguments);
        if ((OpenLayers.Util.indexOf(this.layer.SUPPORTED_TRANSITIONS, this.layer.transitionEffect) != -1) || this.layer.singleTile) {
            if (drawTile) {
                if (!this.backBufferTile) {
                    this.backBufferTile = this.clone();
                    this.backBufferTile.hide();
                    this.backBufferTile.isBackBuffer = true;
                    this.events.register('loadend', this, this.resetBackBuffer);
                    this.layer.events.register("loadend", this, this.resetBackBuffer);
                }
                this.startTransition();
            } else {
                if (this.backBufferTile) {
                    this.backBufferTile.clear();
                }
            }
        } else {
            if (drawTile && this.isFirstDraw) {
                this.events.register('loadend', this, this.showTile);
                this.isFirstDraw = false;
            }
        }
        if (!drawTile) {
            return false;
        }
        if (this.isLoading) {
            this.events.triggerEvent("reload");
        } else {
            this.isLoading = true;
            this.events.triggerEvent("loadstart");
        }
        return this.renderTile();
    },
    resetBackBuffer: function () {
        this.showTile();
        if (this.backBufferTile && (this.isFirstDraw || !this.layer.numLoadingTiles)) {
            this.isFirstDraw = false;
            var maxExtent = this.layer.maxExtent;
            var withinMaxExtent = (maxExtent && this.bounds.intersectsBounds(maxExtent, false));
            if (withinMaxExtent) {
                this.backBufferTile.position = this.position;
                this.backBufferTile.bounds = this.bounds;
                this.backBufferTile.size = this.size;
                this.backBufferTile.imageSize = this.layer.getImageSize(this.bounds) || this.size;
                this.backBufferTile.imageOffset = this.layer.imageOffset;
                this.backBufferTile.resolution = this.layer.getResolution();
                this.backBufferTile.renderTile();
            }
            this.backBufferTile.hide();
        }
    },
    renderTile: function () {
        if (this.layer.async) {
            this.initImgDiv();
            this.layer.getURLasync(this.bounds, this, "url", this.positionImage);
        } else {
            this.url = this.layer.getURL(this.bounds);
            this.initImgDiv();
            this.positionImage();
        }
        return true;
    },
    positionImage: function () {
        if (this.layer === null) {
            return;
        }
        OpenLayers.Util.modifyDOMElement(this.frame, null, this.position, this.size);
        var imageSize = this.layer.getImageSize(this.bounds);
        if (this.layerAlphaHack) {
            OpenLayers.Util.modifyAlphaImageDiv(this.imgDiv, null, null, imageSize, this.url);
        } else {
            OpenLayers.Util.modifyDOMElement(this.imgDiv, null, null, imageSize);
            this.imgDiv.src = this.url;
        }
    },
    clear: function () {
        if (this.imgDiv) {
            this.hide();
            if (OpenLayers.Tile.Image.useBlankTile) {
                this.imgDiv.src = OpenLayers.Util.getImagesLocation() + "blank.gif";
            }
        }
    },
    initImgDiv: function () {
        if (this.imgDiv == null) {
            var offset = this.layer.imageOffset;
            var size = this.layer.getImageSize(this.bounds);
            if (this.layerAlphaHack) {
                this.imgDiv = OpenLayers.Util.createAlphaImageDiv(null, offset, size, null, "relative", null, null, null, true);
            } else {
                this.imgDiv = OpenLayers.Util.createImage(null, offset, size, null, "relative", null, null, true);
            }
            if (OpenLayers.Util.isArray(this.layer.url)) {
                this.imgDiv.urls = this.layer.url.slice();
            }
            this.imgDiv.className = 'olTileImage';
            this.frame.style.zIndex = this.isBackBuffer ? 0 : 1;
            this.frame.appendChild(this.imgDiv);
            this.layer.div.appendChild(this.frame);
            if (this.layer.opacity != null) {
                OpenLayers.Util.modifyDOMElement(this.imgDiv, null, null, null, null, null, null, this.layer.opacity);
            }
            this.imgDiv.map = this.layer.map;
            var onload = function () {
                    if (this.isLoading) {
                        this.isLoading = false;
                        this.events.triggerEvent("loadend");
                    }
                };
            if (this.layerAlphaHack) {
                OpenLayers.Event.observe(this.imgDiv.childNodes[0], 'load', OpenLayers.Function.bind(onload, this));
            } else {
                OpenLayers.Event.observe(this.imgDiv, 'load', OpenLayers.Function.bind(onload, this));
            }
            var onerror = function () {
                    if (this.imgDiv._attempts > OpenLayers.IMAGE_RELOAD_ATTEMPTS) {
                        onload.call(this);
                    }
                };
            OpenLayers.Event.observe(this.imgDiv, "error", OpenLayers.Function.bind(onerror, this));
        }
        this.imgDiv.viewRequestID = this.layer.map.viewRequestID;
    },
    removeImgDiv: function () {
        OpenLayers.Event.stopObservingElement(this.imgDiv);
        if (this.imgDiv.parentNode == this.frame) {
            this.frame.removeChild(this.imgDiv);
            this.imgDiv.map = null;
        }
        this.imgDiv.urls = null;
        var child = this.imgDiv.firstChild;
        if (child) {
            OpenLayers.Event.stopObservingElement(child);
            this.imgDiv.removeChild(child);
            delete child;
        } else {
            this.imgDiv.src = OpenLayers.Util.getImagesLocation() + "blank.gif";
        }
    },
    checkImgURL: function () {
        if (this.layer) {
            var loaded = this.layerAlphaHack ? this.imgDiv.firstChild.src : this.imgDiv.src;
            if (!OpenLayers.Util.isEquivalentUrl(loaded, this.url)) {
                this.hide();
            }
        }
    },
    startTransition: function () {
        if (!this.backBufferTile || !this.backBufferTile.imgDiv) {
            return;
        }
        var ratio = 1;
        if (this.backBufferTile.resolution) {
            ratio = this.backBufferTile.resolution / this.layer.getResolution();
        }
        if (ratio != 1) {
            if (this.layer.transitionEffect == 'resize') {
                var upperLeft = new OpenLayers.LonLat(this.backBufferTile.bounds.left, this.backBufferTile.bounds.top);
                var size = new OpenLayers.Size(this.backBufferTile.size.w * ratio, this.backBufferTile.size.h * ratio);
                var px = this.layer.map.getLayerPxFromLonLat(upperLeft);
                OpenLayers.Util.modifyDOMElement(this.backBufferTile.frame, null, px, size);
                var imageSize = this.backBufferTile.imageSize;
                imageSize = new OpenLayers.Size(imageSize.w * ratio, imageSize.h * ratio);
                var imageOffset = this.backBufferTile.imageOffset;
                if (imageOffset) {
                    imageOffset = new OpenLayers.Pixel(imageOffset.x * ratio, imageOffset.y * ratio);
                }
                OpenLayers.Util.modifyDOMElement(this.backBufferTile.imgDiv, null, imageOffset, imageSize);
                this.backBufferTile.show();
            }
        } else {
            if (this.layer.singleTile) {
                this.backBufferTile.show();
            } else {
                this.backBufferTile.hide();
            }
        }
    },
    show: function () {
        this.frame.style.display = '';
        if (OpenLayers.Util.indexOf(this.layer.SUPPORTED_TRANSITIONS, this.layer.transitionEffect) != -1) {
            if (OpenLayers.IS_GECKO === true) {
                this.frame.scrollLeft = this.frame.scrollLeft;
            }
        }
    },
    hide: function () {
        this.frame.style.display = 'none';
    },
    CLASS_NAME: "OpenLayers.Tile.Image"
});
OpenLayers.Tile.Image.useBlankTile = (OpenLayers.BROWSER_NAME == "safari" || OpenLayers.BROWSER_NAME == "opera");
OpenLayers.Layer.XYZ = OpenLayers.Class(OpenLayers.Layer.Grid, {
    isBaseLayer: true,
    sphericalMercator: false,
    zoomOffset: 0,
    serverResolutions: null,
    initialize: function (name, url, options) {
        if (options && options.sphericalMercator || this.sphericalMercator) {
            options = OpenLayers.Util.extend({
                maxExtent: new OpenLayers.Bounds(-128 * 156543.03390625, -128 * 156543.03390625, 128 * 156543.03390625, 128 * 156543.03390625),
                maxResolution: 156543.03390625,
                numZoomLevels: 19,
                units: "m",
                projection: "EPSG:900913"
            }, options);
        }
        url = url || this.url;
        name = name || this.name;
        var newArguments = [name, url,
        {},
        options];
        OpenLayers.Layer.Grid.prototype.initialize.apply(this, newArguments);
    },
    clone: function (obj) {
        if (obj == null) {
            obj = new OpenLayers.Layer.XYZ(this.name, this.url, this.getOptions());
        }
        obj = OpenLayers.Layer.Grid.prototype.clone.apply(this, [obj]);
        return obj;
    },
    getURL: function (bounds) {
        var xyz = this.getXYZ(bounds);
        var url = this.url;
        if (OpenLayers.Util.isArray(url)) {
            var s = '' + xyz.x + xyz.y + xyz.z;
            url = this.selectUrl(s, url);
        }
        return OpenLayers.String.format(url, xyz);
    },
    getXYZ: function (bounds) {
        var res = this.map.getResolution();
        var x = Math.round((bounds.left - this.maxExtent.left) / (res * this.tileSize.w));
        var y = Math.round((this.maxExtent.top - bounds.top) / (res * this.tileSize.h));
        var z = this.serverResolutions != null ? OpenLayers.Util.indexOf(this.serverResolutions, res) : this.map.getZoom() + this.zoomOffset;
        var limit = Math.pow(2, z);
        if (this.wrapDateLine) {
            x = ((x % limit) + limit) % limit;
        }
        return {
            'x': x,
            'y': y,
            'z': z
        };
    },
    setMap: function (map) {
        OpenLayers.Layer.Grid.prototype.setMap.apply(this, arguments);
        if (!this.tileOrigin) {
            this.tileOrigin = new OpenLayers.LonLat(this.maxExtent.left, this.maxExtent.bottom);
        }
    },
    CLASS_NAME: "OpenLayers.Layer.XYZ"
});
OpenLayers.Layer.OSM = OpenLayers.Class(OpenLayers.Layer.XYZ, {
    name: "OpenStreetMap",
    attribution: "Data CC-By-SA by <a href='http://openstreetmap.org/'>OpenStreetMap</a>",
    sphericalMercator: true,
    url: 'http://tile.openstreetmap.org/${z}/${x}/${y}.png',
    clone: function (obj) {
        if (obj == null) {
            obj = new OpenLayers.Layer.OSM(this.name, this.url, this.getOptions());
        }
        obj = OpenLayers.Layer.XYZ.prototype.clone.apply(this, [obj]);
        return obj;
    },
    wrapDateLine: true,
    CLASS_NAME: "OpenLayers.Layer.OSM"
});
OpenLayers.Kinetic = OpenLayers.Class({
    threshold: 0,
    interval: 10,
    deceleration: 0.0035,
    nbPoints: 100,
    delay: 200,
    points: undefined,
    timerId: undefined,
    initialize: function (options) {
        OpenLayers.Util.extend(this, options);
    },
    begin: function () {
        clearInterval(this.timerId);
        this.timerId = undefined;
        this.points = [];
    },
    update: function (xy) {
        this.points.unshift({
            xy: xy,
            tick: new Date().getTime()
        });
        if (this.points.length > this.nbPoints) {
            this.points.pop();
        }
    },
    end: function (xy) {
        var last, now = new Date().getTime();
        for (var i = 0, l = this.points.length, point; i < l; i++) {
            point = this.points[i];
            if (now - point.tick > this.delay) {
                break;
            }
            last = point;
        }
        if (!last) {
            return;
        }
        var time = new Date().getTime() - last.tick;
        var dist = Math.sqrt(Math.pow(xy.x - last.xy.x, 2) + Math.pow(xy.y - last.xy.y, 2));
        var speed = dist / time;
        if (speed == 0 || speed < this.threshold) {
            return;
        }
        var theta = Math.asin((xy.y - last.xy.y) / dist);
        if (last.xy.x <= xy.x) {
            theta = Math.PI - theta;
        }
        return {
            speed: speed,
            theta: theta
        };
    },
    move: function (info, callback) {
        var v0 = info.speed;
        var fx = Math.cos(info.theta);
        var fy = -Math.sin(info.theta);
        var time = 0;
        var initialTime = new Date().getTime();
        var lastX = 0;
        var lastY = 0;
        var timerCallback = function () {
                if (this.timerId == null) {
                    return;
                }
                time += this.interval;
                var realTime = new Date().getTime() - initialTime;
                var t = (time + realTime) / 2.0;
                var p = (-this.deceleration * Math.pow(t, 2)) / 2.0 + v0 * t;
                var x = p * fx;
                var y = p * fy;
                var args = {};
                args.end = false;
                var v = -this.deceleration * t + v0;
                if (v <= 0) {
                    clearInterval(this.timerId);
                    this.timerId = null;
                    args.end = true;
                }
                args.x = x - lastX;
                args.y = y - lastY;
                lastX = x;
                lastY = y;
                callback(args.x, args.y, args.end);
            };
        this.timerId = window.setInterval(OpenLayers.Function.bind(timerCallback, this), this.interval);
    },
    CLASS_NAME: "OpenLayers.Kinetic"
});
OpenLayers.Request = {
    DEFAULT_CONFIG: {
        method: "GET",
        url: window.location.href,
        async: true,
        user: undefined,
        password: undefined,
        params: null,
        proxy: OpenLayers.ProxyHost,
        headers: {},
        data: null,
        callback: function () {},
        success: null,
        failure: null,
        scope: null
    },
    URL_SPLIT_REGEX: /([^:]*:)\/\/([^:]*:?[^@]*@)?([^:\/\?]*):?([^\/\?]*)/,
    events: new OpenLayers.Events(this, null, ["complete", "success", "failure"]),
    issue: function (config) {
        var defaultConfig = OpenLayers.Util.extend(this.DEFAULT_CONFIG, {
            proxy: OpenLayers.ProxyHost
        });
        config = OpenLayers.Util.applyDefaults(config, defaultConfig);
        var request = new OpenLayers.Request.XMLHttpRequest();
        var url = OpenLayers.Util.urlAppend(config.url, OpenLayers.Util.getParameterString(config.params || {}));
        var sameOrigin = !(url.indexOf("http") == 0);
        var urlParts = !sameOrigin && url.match(this.URL_SPLIT_REGEX);
        if (urlParts) {
            var location = window.location;
            sameOrigin = urlParts[1] == location.protocol && urlParts[3] == location.hostname;
            var uPort = urlParts[4],
                lPort = location.port;
            if (uPort != 80 && uPort != "" || lPort != "80" && lPort != "") {
                sameOrigin = sameOrigin && uPort == lPort;
            }
        }
        if (!sameOrigin) {
            if (config.proxy) {
                if (typeof config.proxy == "function") {
                    url = config.proxy(url);
                } else {
                    url = config.proxy + encodeURIComponent(url);
                }
            } else {
                OpenLayers.Console.warn(OpenLayers.i18n("proxyNeeded"), {
                    url: url
                });
            }
        }
        request.open(config.method, url, config.async, config.user, config.password);
        for (var header in config.headers) {
            request.setRequestHeader(header, config.headers[header]);
        }
        var events = this.events;
        var self = this;
        request.onreadystatechange = function () {
            if (request.readyState == OpenLayers.Request.XMLHttpRequest.DONE) {
                var proceed = events.triggerEvent("complete", {
                    request: request,
                    config: config,
                    requestUrl: url
                });
                if (proceed !== false) {
                    self.runCallbacks({
                        request: request,
                        config: config,
                        requestUrl: url
                    });
                }
            }
        };
        if (config.async === false) {
            request.send(config.data);
        } else {
            window.setTimeout(function () {
                if (request.readyState !== 0) {
                    request.send(config.data);
                }
            }, 0);
        }
        return request;
    },
    runCallbacks: function (options) {
        var request = options.request;
        var config = options.config;
        var complete = (config.scope) ? OpenLayers.Function.bind(config.callback, config.scope) : config.callback;
        var success;
        if (config.success) {
            success = (config.scope) ? OpenLayers.Function.bind(config.success, config.scope) : config.success;
        }
        var failure;
        if (config.failure) {
            failure = (config.scope) ? OpenLayers.Function.bind(config.failure, config.scope) : config.failure;
        }
        if (OpenLayers.Util.createUrlObject(config.url).protocol == "file:" && request.responseText) {
            request.status = 200;
        }
        complete(request);
        if (!request.status || (request.status >= 200 && request.status < 300)) {
            this.events.triggerEvent("success", options);
            if (success) {
                success(request);
            }
        }
        if (request.status && (request.status < 200 || request.status >= 300)) {
            this.events.triggerEvent("failure", options);
            if (failure) {
                failure(request);
            }
        }
    },
    GET: function (config) {
        config = OpenLayers.Util.extend(config, {
            method: "GET"
        });
        return OpenLayers.Request.issue(config);
    },
    POST: function (config) {
        config = OpenLayers.Util.extend(config, {
            method: "POST"
        });
        config.headers = config.headers ? config.headers : {};
        if (!("CONTENT-TYPE" in OpenLayers.Util.upperCaseObject(config.headers))) {
            config.headers["Content-Type"] = "application/xml";
        }
        return OpenLayers.Request.issue(config);
    },
    PUT: function (config) {
        config = OpenLayers.Util.extend(config, {
            method: "PUT"
        });
        config.headers = config.headers ? config.headers : {};
        if (!("CONTENT-TYPE" in OpenLayers.Util.upperCaseObject(config.headers))) {
            config.headers["Content-Type"] = "application/xml";
        }
        return OpenLayers.Request.issue(config);
    },
    DELETE: function (config) {
        config = OpenLayers.Util.extend(config, {
            method: "DELETE"
        });
        return OpenLayers.Request.issue(config);
    },
    HEAD: function (config) {
        config = OpenLayers.Util.extend(config, {
            method: "HEAD"
        });
        return OpenLayers.Request.issue(config);
    },
    OPTIONS: function (config) {
        config = OpenLayers.Util.extend(config, {
            method: "OPTIONS"
        });
        return OpenLayers.Request.issue(config);
    }
};
(function () {
    var oXMLHttpRequest = window.XMLHttpRequest;
    var bGecko = !! window.controllers,
        bIE = window.document.all && !window.opera,
        bIE7 = bIE && window.navigator.userAgent.match(/MSIE 7.0/);

    function fXMLHttpRequest() {
        this._object = oXMLHttpRequest && !bIE7 ? new oXMLHttpRequest : new window.ActiveXObject("Microsoft.XMLHTTP");
        this._listeners = [];
    };

    function cXMLHttpRequest() {
        return new fXMLHttpRequest;
    };
    cXMLHttpRequest.prototype = fXMLHttpRequest.prototype;
    if (bGecko && oXMLHttpRequest.wrapped) cXMLHttpRequest.wrapped = oXMLHttpRequest.wrapped;
    cXMLHttpRequest.UNSENT = 0;
    cXMLHttpRequest.OPENED = 1;
    cXMLHttpRequest.HEADERS_RECEIVED = 2;
    cXMLHttpRequest.LOADING = 3;
    cXMLHttpRequest.DONE = 4;
    cXMLHttpRequest.prototype.readyState = cXMLHttpRequest.UNSENT;
    cXMLHttpRequest.prototype.responseText = '';
    cXMLHttpRequest.prototype.responseXML = null;
    cXMLHttpRequest.prototype.status = 0;
    cXMLHttpRequest.prototype.statusText = '';
    cXMLHttpRequest.prototype.priority = "NORMAL";
    cXMLHttpRequest.prototype.onreadystatechange = null;
    cXMLHttpRequest.onreadystatechange = null;
    cXMLHttpRequest.onopen = null;
    cXMLHttpRequest.onsend = null;
    cXMLHttpRequest.onabort = null;
    cXMLHttpRequest.prototype.open = function (sMethod, sUrl, bAsync, sUser, sPassword) {
        delete this._headers;
        if (arguments.length < 3) bAsync = true;
        this._async = bAsync;
        var oRequest = this,
            nState = this.readyState,
            fOnUnload;
        if (bIE && bAsync) {
            fOnUnload = function () {
                if (nState != cXMLHttpRequest.DONE) {
                    fCleanTransport(oRequest);
                    oRequest.abort();
                }
            };
            window.attachEvent("onunload", fOnUnload);
        }
        if (cXMLHttpRequest.onopen) cXMLHttpRequest.onopen.apply(this, arguments);
        if (arguments.length > 4) this._object.open(sMethod, sUrl, bAsync, sUser, sPassword);
        else if (arguments.length > 3) this._object.open(sMethod, sUrl, bAsync, sUser);
        else this._object.open(sMethod, sUrl, bAsync);
        this.readyState = cXMLHttpRequest.OPENED;
        fReadyStateChange(this);
        this._object.onreadystatechange = function () {
            if (bGecko && !bAsync) return;
            oRequest.readyState = oRequest._object.readyState;
            fSynchronizeValues(oRequest);
            if (oRequest._aborted) {
                oRequest.readyState = cXMLHttpRequest.UNSENT;
                return;
            }
            if (oRequest.readyState == cXMLHttpRequest.DONE) {
                delete oRequest._data;
                fCleanTransport(oRequest);
                if (bIE && bAsync) window.detachEvent("onunload", fOnUnload);
            }
            if (nState != oRequest.readyState) fReadyStateChange(oRequest);
            nState = oRequest.readyState;
        }
    };

    function fXMLHttpRequest_send(oRequest) {
        oRequest._object.send(oRequest._data);
        if (bGecko && !oRequest._async) {
            oRequest.readyState = cXMLHttpRequest.OPENED;
            fSynchronizeValues(oRequest);
            while (oRequest.readyState < cXMLHttpRequest.DONE) {
                oRequest.readyState++;
                fReadyStateChange(oRequest);
                if (oRequest._aborted) return;
            }
        }
    };
    cXMLHttpRequest.prototype.send = function (vData) {
        if (cXMLHttpRequest.onsend) cXMLHttpRequest.onsend.apply(this, arguments);
        if (!arguments.length) vData = null;
        if (vData && vData.nodeType) {
            vData = window.XMLSerializer ? new window.XMLSerializer().serializeToString(vData) : vData.xml;
            if (!oRequest._headers["Content-Type"]) oRequest._object.setRequestHeader("Content-Type", "application/xml");
        }
        this._data = vData;
        fXMLHttpRequest_send(this);
    };
    cXMLHttpRequest.prototype.abort = function () {
        if (cXMLHttpRequest.onabort) cXMLHttpRequest.onabort.apply(this, arguments);
        if (this.readyState > cXMLHttpRequest.UNSENT) this._aborted = true;
        this._object.abort();
        fCleanTransport(this);
        this.readyState = cXMLHttpRequest.UNSENT;
        delete this._data;
    };
    cXMLHttpRequest.prototype.getAllResponseHeaders = function () {
        return this._object.getAllResponseHeaders();
    };
    cXMLHttpRequest.prototype.getResponseHeader = function (sName) {
        return this._object.getResponseHeader(sName);
    };
    cXMLHttpRequest.prototype.setRequestHeader = function (sName, sValue) {
        if (!this._headers) this._headers = {};
        this._headers[sName] = sValue;
        return this._object.setRequestHeader(sName, sValue);
    };
    cXMLHttpRequest.prototype.addEventListener = function (sName, fHandler, bUseCapture) {
        for (var nIndex = 0, oListener; oListener = this._listeners[nIndex]; nIndex++)
        if (oListener[0] == sName && oListener[1] == fHandler && oListener[2] == bUseCapture) return;
        this._listeners.push([sName, fHandler, bUseCapture]);
    };
    cXMLHttpRequest.prototype.removeEventListener = function (sName, fHandler, bUseCapture) {
        for (var nIndex = 0, oListener; oListener = this._listeners[nIndex]; nIndex++)
        if (oListener[0] == sName && oListener[1] == fHandler && oListener[2] == bUseCapture) break;
        if (oListener) this._listeners.splice(nIndex, 1);
    };
    cXMLHttpRequest.prototype.dispatchEvent = function (oEvent) {
        var oEventPseudo = {
            'type': oEvent.type,
            'target': this,
            'currentTarget': this,
            'eventPhase': 2,
            'bubbles': oEvent.bubbles,
            'cancelable': oEvent.cancelable,
            'timeStamp': oEvent.timeStamp,
            'stopPropagation': function () {},
            'preventDefault': function () {},
            'initEvent': function () {}
        };
        if (oEventPseudo.type == "readystatechange" && this.onreadystatechange)(this.onreadystatechange.handleEvent || this.onreadystatechange).apply(this, [oEventPseudo]);
        for (var nIndex = 0, oListener; oListener = this._listeners[nIndex]; nIndex++)
        if (oListener[0] == oEventPseudo.type && !oListener[2])(oListener[1].handleEvent || oListener[1]).apply(this, [oEventPseudo]);
    };
    cXMLHttpRequest.prototype.toString = function () {
        return '[' + "object" + ' ' + "XMLHttpRequest" + ']';
    };
    cXMLHttpRequest.toString = function () {
        return '[' + "XMLHttpRequest" + ']';
    };

    function fReadyStateChange(oRequest) {
        if (cXMLHttpRequest.onreadystatechange) cXMLHttpRequest.onreadystatechange.apply(oRequest);
        oRequest.dispatchEvent({
            'type': "readystatechange",
            'bubbles': false,
            'cancelable': false,
            'timeStamp': new Date + 0
        });
    };

    function fGetDocument(oRequest) {
        var oDocument = oRequest.responseXML,
            sResponse = oRequest.responseText;
        if (bIE && sResponse && oDocument && !oDocument.documentElement && oRequest.getResponseHeader("Content-Type").match(/[^\/]+\/[^\+]+\+xml/)) {
            oDocument = new window.ActiveXObject("Microsoft.XMLDOM");
            oDocument.async = false;
            oDocument.validateOnParse = false;
            oDocument.loadXML(sResponse);
        }
        if (oDocument) if ((bIE && oDocument.parseError != 0) || !oDocument.documentElement || (oDocument.documentElement && oDocument.documentElement.tagName == "parsererror")) return null;
        return oDocument;
    };

    function fSynchronizeValues(oRequest) {
        try {
            oRequest.responseText = oRequest._object.responseText;
        } catch (e) {}
        try {
            oRequest.responseXML = fGetDocument(oRequest._object);
        } catch (e) {}
        try {
            oRequest.status = oRequest._object.status;
        } catch (e) {}
        try {
            oRequest.statusText = oRequest._object.statusText;
        } catch (e) {}
    };

    function fCleanTransport(oRequest) {
        oRequest._object.onreadystatechange = new window.Function;
    };
    if (!window.Function.prototype.apply) {
        window.Function.prototype.apply = function (oRequest, oArguments) {
            if (!oArguments) oArguments = [];
            oRequest.__func = this;
            oRequest.__func(oArguments[0], oArguments[1], oArguments[2], oArguments[3], oArguments[4]);
            delete oRequest.__func;
        };
    };
    OpenLayers.Request.XMLHttpRequest = cXMLHttpRequest;
})();
OpenLayers.Control.Panel = OpenLayers.Class(OpenLayers.Control, {
    controls: null,
    autoActivate: true,
    defaultControl: null,
    saveState: false,
    allowDepress: false,
    activeState: null,
    initialize: function (options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.controls = [];
        this.activeState = {};
    },
    destroy: function () {
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
        for (var ctl, i = this.controls.length - 1; i >= 0; i--) {
            ctl = this.controls[i];
            if (ctl.events) {
                ctl.events.un({
                    activate: this.iconOn,
                    deactivate: this.iconOff
                });
            }
            OpenLayers.Event.stopObservingElement(ctl.panel_div);
            ctl.panel_div = null;
        }
        this.activeState = null;
    },
    activate: function () {
        if (OpenLayers.Control.prototype.activate.apply(this, arguments)) {
            var control;
            for (var i = 0, len = this.controls.length; i < len; i++) {
                control = this.controls[i];
                if (control === this.defaultControl || (this.saveState && this.activeState[control.id])) {
                    control.activate();
                }
            }
            if (this.saveState === true) {
                this.defaultControl = null;
            }
            this.redraw();
            return true;
        } else {
            return false;
        }
    },
    deactivate: function () {
        if (OpenLayers.Control.prototype.deactivate.apply(this, arguments)) {
            var control;
            for (var i = 0, len = this.controls.length; i < len; i++) {
                control = this.controls[i];
                this.activeState[control.id] = control.deactivate();
            }
            this.redraw();
            return true;
        } else {
            return false;
        }
    },
    draw: function () {
        OpenLayers.Control.prototype.draw.apply(this, arguments);
        this.addControlsToMap(this.controls);
        return this.div;
    },
    redraw: function () {
        for (var l = this.div.childNodes.length, i = l - 1; i >= 0; i--) {
            this.div.removeChild(this.div.childNodes[i]);
        }
        this.div.innerHTML = "";
        if (this.active) {
            for (var i = 0, len = this.controls.length; i < len; i++) {
                this.div.appendChild(this.controls[i].panel_div);
            }
        }
    },
    activateControl: function (control) {
        if (!this.active) {
            return false;
        }
        if (control.type == OpenLayers.Control.TYPE_BUTTON) {
            control.trigger();
            return;
        }
        if (control.type == OpenLayers.Control.TYPE_TOGGLE) {
            if (control.active) {
                control.deactivate();
            } else {
                control.activate();
            }
            return;
        }
        if (this.allowDepress && control.active) {
            control.deactivate();
        } else {
            var c;
            for (var i = 0, len = this.controls.length; i < len; i++) {
                c = this.controls[i];
                if (c != control && (c.type === OpenLayers.Control.TYPE_TOOL || c.type == null)) {
                    c.deactivate();
                }
            }
            control.activate();
        }
    },
    addControls: function (controls) {
        if (!(OpenLayers.Util.isArray(controls))) {
            controls = [controls];
        }
        this.controls = this.controls.concat(controls);
        for (var i = 0, len = controls.length; i < len; i++) {
            var element = document.createElement("div");
            element.className = controls[i].displayClass + "ItemInactive";
            controls[i].panel_div = element;
            if (controls[i].title != "") {
                controls[i].panel_div.title = controls[i].title;
            }
            OpenLayers.Event.observe(controls[i].panel_div, "click", OpenLayers.Function.bind(this.onClick, this, controls[i]));
            OpenLayers.Event.observe(controls[i].panel_div, "dblclick", OpenLayers.Function.bind(this.onDoubleClick, this, controls[i]));
            OpenLayers.Event.observe(controls[i].panel_div, "mousedown", OpenLayers.Function.bindAsEventListener(OpenLayers.Event.stop));
        }
        if (this.map) {
            this.addControlsToMap(controls);
            this.redraw();
        }
    },
    addControlsToMap: function (controls) {
        var control;
        for (var i = 0, len = controls.length; i < len; i++) {
            control = controls[i];
            if (control.autoActivate === true) {
                control.autoActivate = false;
                this.map.addControl(control);
                control.autoActivate = true;
            } else {
                this.map.addControl(control);
                control.deactivate();
            }
            control.events.on({
                activate: this.iconOn,
                deactivate: this.iconOff
            });
        }
    },
    iconOn: function () {
        var d = this.panel_div;
        d.className = d.className.replace(/ItemInactive$/, "ItemActive");
    },
    iconOff: function () {
        var d = this.panel_div;
        d.className = d.className.replace(/ItemActive$/, "ItemInactive");
    },
    onClick: function (ctrl, evt) {
        OpenLayers.Event.stop(evt ? evt : window.event);
        this.activateControl(ctrl);
    },
    onDoubleClick: function (ctrl, evt) {
        OpenLayers.Event.stop(evt ? evt : window.event);
    },
    getControlsBy: function (property, match) {
        var test = (typeof match.test == "function");
        var found = OpenLayers.Array.filter(this.controls, function (item) {
            return item[property] == match || (test && match.test(item[property]));
        });
        return found;
    },
    getControlsByName: function (match) {
        return this.getControlsBy("name", match);
    },
    getControlsByClass: function (match) {
        return this.getControlsBy("CLASS_NAME", match);
    },
    CLASS_NAME: "OpenLayers.Control.Panel"
});
OpenLayers.Renderer.VML = OpenLayers.Class(OpenLayers.Renderer.Elements, {
    xmlns: "urn:schemas-microsoft-com:vml",
    symbolCache: {},
    offset: null,
    initialize: function (containerID) {
        if (!this.supported()) {
            return;
        }
        if (!document.namespaces.olv) {
            document.namespaces.add("olv", this.xmlns);
            var style = document.createStyleSheet();
            var shapes = ['shape', 'rect', 'oval', 'fill', 'stroke', 'imagedata', 'group', 'textbox'];
            for (var i = 0, len = shapes.length; i < len; i++) {
                style.addRule('olv\\:' + shapes[i], "behavior: url(#default#VML); " + "position: absolute; display: inline-block;");
            }
        }
        OpenLayers.Renderer.Elements.prototype.initialize.apply(this, arguments);
    },
    supported: function () {
        return !!(document.namespaces);
    },
    setExtent: function (extent, resolutionChanged) {
        OpenLayers.Renderer.Elements.prototype.setExtent.apply(this, arguments);
        var resolution = this.getResolution();
        var left = (extent.left / resolution) | 0;
        var top = (extent.top / resolution - this.size.h) | 0;
        if (resolutionChanged || !this.offset) {
            this.offset = {
                x: left,
                y: top
            };
            left = 0;
            top = 0;
        } else {
            left = left - this.offset.x;
            top = top - this.offset.y;
        }
        var org = left + " " + top;
        this.root.coordorigin = org;
        var roots = [this.root, this.vectorRoot, this.textRoot];
        var root;
        for (var i = 0, len = roots.length; i < len; ++i) {
            root = roots[i];
            var size = this.size.w + " " + this.size.h;
            root.coordsize = size;
        }
        this.root.style.flip = "y";
        return true;
    },
    setSize: function (size) {
        OpenLayers.Renderer.prototype.setSize.apply(this, arguments);
        var roots = [this.rendererRoot, this.root, this.vectorRoot, this.textRoot];
        var w = this.size.w + "px";
        var h = this.size.h + "px";
        var root;
        for (var i = 0, len = roots.length; i < len; ++i) {
            root = roots[i];
            root.style.width = w;
            root.style.height = h;
        }
    },
    getNodeType: function (geometry, style) {
        var nodeType = null;
        switch (geometry.CLASS_NAME) {
        case "OpenLayers.Geometry.Point":
            if (style.externalGraphic) {
                nodeType = "olv:rect";
            } else if (this.isComplexSymbol(style.graphicName)) {
                nodeType = "olv:shape";
            } else {
                nodeType = "olv:oval";
            }
            break;
        case "OpenLayers.Geometry.Rectangle":
            nodeType = "olv:rect";
            break;
        case "OpenLayers.Geometry.LineString":
        case "OpenLayers.Geometry.LinearRing":
        case "OpenLayers.Geometry.Polygon":
        case "OpenLayers.Geometry.Curve":
        case "OpenLayers.Geometry.Surface":
            nodeType = "olv:shape";
            break;
        default:
            break;
        }
        return nodeType;
    },
    setStyle: function (node, style, options, geometry) {
        style = style || node._style;
        options = options || node._options;
        var fillColor = style.fillColor;
        if (node._geometryClass === "OpenLayers.Geometry.Point") {
            if (style.externalGraphic) {
                options.isFilled = true;
                if (style.graphicTitle) {
                    node.title = style.graphicTitle;
                }
                var width = style.graphicWidth || style.graphicHeight;
                var height = style.graphicHeight || style.graphicWidth;
                width = width ? width : style.pointRadius * 2;
                height = height ? height : style.pointRadius * 2;
                var resolution = this.getResolution();
                var xOffset = (style.graphicXOffset != undefined) ? style.graphicXOffset : -(0.5 * width);
                var yOffset = (style.graphicYOffset != undefined) ? style.graphicYOffset : -(0.5 * height);
                node.style.left = (((geometry.x / resolution - this.offset.x) + xOffset) | 0) + "px";
                node.style.top = (((geometry.y / resolution - this.offset.y) - (yOffset + height)) | 0) + "px";
                node.style.width = width + "px";
                node.style.height = height + "px";
                node.style.flip = "y";
                fillColor = "none";
                options.isStroked = false;
            } else if (this.isComplexSymbol(style.graphicName)) {
                var cache = this.importSymbol(style.graphicName);
                node.path = cache.path;
                node.coordorigin = cache.left + "," + cache.bottom;
                var size = cache.size;
                node.coordsize = size + "," + size;
                this.drawCircle(node, geometry, style.pointRadius);
                node.style.flip = "y";
            } else {
                this.drawCircle(node, geometry, style.pointRadius);
            }
        }
        if (options.isFilled) {
            node.fillcolor = fillColor;
        } else {
            node.filled = "false";
        }
        var fills = node.getElementsByTagName("fill");
        var fill = (fills.length == 0) ? null : fills[0];
        if (!options.isFilled) {
            if (fill) {
                node.removeChild(fill);
            }
        } else {
            if (!fill) {
                fill = this.createNode('olv:fill', node.id + "_fill");
            }
            fill.opacity = style.fillOpacity;
            if (node._geometryClass === "OpenLayers.Geometry.Point" && style.externalGraphic) {
                if (style.graphicOpacity) {
                    fill.opacity = style.graphicOpacity;
                }
                fill.src = style.externalGraphic;
                fill.type = "frame";
                if (!(style.graphicWidth && style.graphicHeight)) {
                    fill.aspect = "atmost";
                }
            }
            if (fill.parentNode != node) {
                node.appendChild(fill);
            }
        }
        var rotation = style.rotation;
        if ((rotation !== undefined || node._rotation !== undefined)) {
            node._rotation = rotation;
            if (style.externalGraphic) {
                this.graphicRotate(node, xOffset, yOffset, style);
                fill.opacity = 0;
            } else if (node._geometryClass === "OpenLayers.Geometry.Point") {
                node.style.rotation = rotation || 0;
            }
        }
        var strokes = node.getElementsByTagName("stroke");
        var stroke = (strokes.length == 0) ? null : strokes[0];
        if (!options.isStroked) {
            node.stroked = false;
            if (stroke) {
                stroke.on = false;
            }
        } else {
            if (!stroke) {
                stroke = this.createNode('olv:stroke', node.id + "_stroke");
                node.appendChild(stroke);
            }
            stroke.on = true;
            stroke.color = style.strokeColor;
            stroke.weight = style.strokeWidth + "px";
            stroke.opacity = style.strokeOpacity;
            stroke.endcap = style.strokeLinecap == 'butt' ? 'flat' : (style.strokeLinecap || 'round');
            if (style.strokeDashstyle) {
                stroke.dashstyle = this.dashStyle(style);
            }
        }
        if (style.cursor != "inherit" && style.cursor != null) {
            node.style.cursor = style.cursor;
        }
        return node;
    },
    graphicRotate: function (node, xOffset, yOffset, style) {
        var style = style || node._style;
        var rotation = style.rotation || 0;
        var aspectRatio, size;
        if (!(style.graphicWidth && style.graphicHeight)) {
            var img = new Image();
            img.onreadystatechange = OpenLayers.Function.bind(function () {
                if (img.readyState == "complete" || img.readyState == "interactive") {
                    aspectRatio = img.width / img.height;
                    size = Math.max(style.pointRadius * 2, style.graphicWidth || 0, style.graphicHeight || 0);
                    xOffset = xOffset * aspectRatio;
                    style.graphicWidth = size * aspectRatio;
                    style.graphicHeight = size;
                    this.graphicRotate(node, xOffset, yOffset, style);
                }
            }, this);
            img.src = style.externalGraphic;
            return;
        } else {
            size = Math.max(style.graphicWidth, style.graphicHeight);
            aspectRatio = style.graphicWidth / style.graphicHeight;
        }
        var width = Math.round(style.graphicWidth || size * aspectRatio);
        var height = Math.round(style.graphicHeight || size);
        node.style.width = width + "px";
        node.style.height = height + "px";
        var image = document.getElementById(node.id + "_image");
        if (!image) {
            image = this.createNode("olv:imagedata", node.id + "_image");
            node.appendChild(image);
        }
        image.style.width = width + "px";
        image.style.height = height + "px";
        image.src = style.externalGraphic;
        image.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(" + "src='', sizingMethod='scale')";
        var rot = rotation * Math.PI / 180;
        var sintheta = Math.sin(rot);
        var costheta = Math.cos(rot);
        var filter = "progid:DXImageTransform.Microsoft.Matrix(M11=" + costheta + ",M12=" + (-sintheta) + ",M21=" + sintheta + ",M22=" + costheta + ",SizingMethod='auto expand')\n";
        var opacity = style.graphicOpacity || style.fillOpacity;
        if (opacity && opacity != 1) {
            filter += "progid:DXImageTransform.Microsoft.BasicImage(opacity=" + opacity + ")\n";
        }
        node.style.filter = filter;
        var centerPoint = new OpenLayers.Geometry.Point(-xOffset, -yOffset);
        var imgBox = new OpenLayers.Bounds(0, 0, width, height).toGeometry();
        imgBox.rotate(style.rotation, centerPoint);
        var imgBounds = imgBox.getBounds();
        node.style.left = Math.round(parseInt(node.style.left) + imgBounds.left) + "px";
        node.style.top = Math.round(parseInt(node.style.top) - imgBounds.bottom) + "px";
    },
    postDraw: function (node) {
        node.style.visibility = "visible";
        var fillColor = node._style.fillColor;
        var strokeColor = node._style.strokeColor;
        if (fillColor == "none" && node.fillcolor != fillColor) {
            node.fillcolor = fillColor;
        }
        if (strokeColor == "none" && node.strokecolor != strokeColor) {
            node.strokecolor = strokeColor;
        }
    },
    setNodeDimension: function (node, geometry) {
        var bbox = geometry.getBounds();
        if (bbox) {
            var resolution = this.getResolution();
            var scaledBox = new OpenLayers.Bounds((bbox.left / resolution - this.offset.x) | 0, (bbox.bottom / resolution - this.offset.y) | 0, (bbox.right / resolution - this.offset.x) | 0, (bbox.top / resolution - this.offset.y) | 0);
            node.style.left = scaledBox.left + "px";
            node.style.top = scaledBox.top + "px";
            node.style.width = scaledBox.getWidth() + "px";
            node.style.height = scaledBox.getHeight() + "px";
            node.coordorigin = scaledBox.left + " " + scaledBox.top;
            node.coordsize = scaledBox.getWidth() + " " + scaledBox.getHeight();
        }
    },
    dashStyle: function (style) {
        var dash = style.strokeDashstyle;
        switch (dash) {
        case 'solid':
        case 'dot':
        case 'dash':
        case 'dashdot':
        case 'longdash':
        case 'longdashdot':
            return dash;
        default:
            var parts = dash.split(/[ ,]/);
            if (parts.length == 2) {
                if (1 * parts[0] >= 2 * parts[1]) {
                    return "longdash";
                }
                return (parts[0] == 1 || parts[1] == 1) ? "dot" : "dash";
            } else if (parts.length == 4) {
                return (1 * parts[0] >= 2 * parts[1]) ? "longdashdot" : "dashdot";
            }
            return "solid";
        }
    },
    createNode: function (type, id) {
        var node = document.createElement(type);
        if (id) {
            node.id = id;
        }
        node.unselectable = 'on';
        node.onselectstart = OpenLayers.Function.False;
        return node;
    },
    nodeTypeCompare: function (node, type) {
        var subType = type;
        var splitIndex = subType.indexOf(":");
        if (splitIndex != -1) {
            subType = subType.substr(splitIndex + 1);
        }
        var nodeName = node.nodeName;
        splitIndex = nodeName.indexOf(":");
        if (splitIndex != -1) {
            nodeName = nodeName.substr(splitIndex + 1);
        }
        return (subType == nodeName);
    },
    createRenderRoot: function () {
        return this.nodeFactory(this.container.id + "_vmlRoot", "div");
    },
    createRoot: function (suffix) {
        return this.nodeFactory(this.container.id + suffix, "olv:group");
    },
    drawPoint: function (node, geometry) {
        return this.drawCircle(node, geometry, 1);
    },
    drawCircle: function (node, geometry, radius) {
        if (!isNaN(geometry.x) && !isNaN(geometry.y)) {
            var resolution = this.getResolution();
            node.style.left = (((geometry.x / resolution - this.offset.x) | 0) - radius) + "px";
            node.style.top = (((geometry.y / resolution - this.offset.y) | 0) - radius) + "px";
            var diameter = radius * 2;
            node.style.width = diameter + "px";
            node.style.height = diameter + "px";
            return node;
        }
        return false;
    },
    drawLineString: function (node, geometry) {
        return this.drawLine(node, geometry, false);
    },
    drawLinearRing: function (node, geometry) {
        return this.drawLine(node, geometry, true);
    },
    drawLine: function (node, geometry, closeLine) {
        this.setNodeDimension(node, geometry);
        var resolution = this.getResolution();
        var numComponents = geometry.components.length;
        var parts = new Array(numComponents);
        var comp, x, y;
        for (var i = 0; i < numComponents; i++) {
            comp = geometry.components[i];
            x = (comp.x / resolution - this.offset.x) | 0;
            y = (comp.y / resolution - this.offset.y) | 0;
            parts[i] = " " + x + "," + y + " l ";
        }
        var end = (closeLine) ? " x e" : " e";
        node.path = "m" + parts.join("") + end;
        return node;
    },
    drawPolygon: function (node, geometry) {
        this.setNodeDimension(node, geometry);
        var resolution = this.getResolution();
        var path = [];
        var j, jj, points, area, first, second, i, ii, comp, pathComp, x, y;
        for (j = 0, jj = geometry.components.length; j < jj; j++) {
            path.push("m");
            points = geometry.components[j].components;
            area = (j === 0);
            first = null;
            second = null;
            for (i = 0, ii = points.length; i < ii; i++) {
                comp = points[i];
                x = (comp.x / resolution - this.offset.x) | 0;
                y = (comp.y / resolution - this.offset.y) | 0;
                pathComp = " " + x + "," + y;
                path.push(pathComp);
                if (i == 0) {
                    path.push(" l");
                }
                if (!area) {
                    if (!first) {
                        first = pathComp;
                    } else if (first != pathComp) {
                        if (!second) {
                            second = pathComp;
                        } else if (second != pathComp) {
                            area = true;
                        }
                    }
                }
            }
            path.push(area ? " x " : " ");
        }
        path.push("e");
        node.path = path.join("");
        return node;
    },
    drawRectangle: function (node, geometry) {
        var resolution = this.getResolution();
        node.style.left = ((geometry.x / resolution - this.offset.x) | 0) + "px";
        node.style.top = ((geometry.y / resolution - this.offset.y) | 0) + "px";
        node.style.width = ((geometry.width / resolution) | 0) + "px";
        node.style.height = ((geometry.height / resolution) | 0) + "px";
        return node;
    },
    drawText: function (featureId, style, location) {
        var label = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX, "olv:rect");
        var textbox = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX + "_textbox", "olv:textbox");
        var resolution = this.getResolution();
        label.style.left = ((location.x / resolution - this.offset.x) | 0) + "px";
        label.style.top = ((location.y / resolution - this.offset.y) | 0) + "px";
        label.style.flip = "y";
        textbox.innerText = style.label;
        if (style.cursor != "inherit" && style.cursor != null) {
            textbox.style.cursor = style.cursor;
        }
        if (style.fontColor) {
            textbox.style.color = style.fontColor;
        }
        if (style.fontOpacity) {
            textbox.style.filter = 'alpha(opacity=' + (style.fontOpacity * 100) + ')';
        }
        if (style.fontFamily) {
            textbox.style.fontFamily = style.fontFamily;
        }
        if (style.fontSize) {
            textbox.style.fontSize = style.fontSize;
        }
        if (style.fontWeight) {
            textbox.style.fontWeight = style.fontWeight;
        }
        if (style.fontStyle) {
            textbox.style.fontStyle = style.fontStyle;
        }
        if (style.labelSelect === true) {
            label._featureId = featureId;
            textbox._featureId = featureId;
            textbox._geometry = location;
            textbox._geometryClass = location.CLASS_NAME;
        }
        textbox.style.whiteSpace = "nowrap";
        textbox.inset = "1px,0px,0px,0px";
        if (!label.parentNode) {
            label.appendChild(textbox);
            this.textRoot.appendChild(label);
        }
        var align = style.labelAlign || "cm";
        if (align.length == 1) {
            align += "m";
        }
        var xshift = textbox.clientWidth * (OpenLayers.Renderer.VML.LABEL_SHIFT[align.substr(0, 1)]);
        var yshift = textbox.clientHeight * (OpenLayers.Renderer.VML.LABEL_SHIFT[align.substr(1, 1)]);
        label.style.left = parseInt(label.style.left) - xshift - 1 + "px";
        label.style.top = parseInt(label.style.top) + yshift + "px";
    },
    drawSurface: function (node, geometry) {
        this.setNodeDimension(node, geometry);
        var resolution = this.getResolution();
        var path = [];
        var comp, x, y;
        for (var i = 0, len = geometry.components.length; i < len; i++) {
            comp = geometry.components[i];
            x = (comp.x / resolution - this.offset.x) | 0;
            y = (comp.y / resolution - this.offset.y) | 0;
            if ((i % 3) == 0 && (i / 3) == 0) {
                path.push("m");
            } else if ((i % 3) == 1) {
                path.push(" c");
            }
            path.push(" " + x + "," + y);
        }
        path.push(" x e");
        node.path = path.join("");
        return node;
    },
    moveRoot: function (renderer) {
        var layer = this.map.getLayer(renderer.container.id);
        if (layer instanceof OpenLayers.Layer.Vector.RootContainer) {
            layer = this.map.getLayer(this.container.id);
        }
        layer && layer.renderer.clear();
        OpenLayers.Renderer.Elements.prototype.moveRoot.apply(this, arguments);
        layer && layer.redraw();
    },
    importSymbol: function (graphicName) {
        var id = this.container.id + "-" + graphicName;
        var cache = this.symbolCache[id];
        if (cache) {
            return cache;
        }
        var symbol = OpenLayers.Renderer.symbol[graphicName];
        if (!symbol) {
            throw new Error(graphicName + ' is not a valid symbol name');
        }
        var symbolExtent = new OpenLayers.Bounds(Number.MAX_VALUE, Number.MAX_VALUE, 0, 0);
        var pathitems = ["m"];
        for (var i = 0; i < symbol.length; i = i + 2) {
            var x = symbol[i];
            var y = symbol[i + 1];
            symbolExtent.left = Math.min(symbolExtent.left, x);
            symbolExtent.bottom = Math.min(symbolExtent.bottom, y);
            symbolExtent.right = Math.max(symbolExtent.right, x);
            symbolExtent.top = Math.max(symbolExtent.top, y);
            pathitems.push(x);
            pathitems.push(y);
            if (i == 0) {
                pathitems.push("l");
            }
        }
        pathitems.push("x e");
        var path = pathitems.join(" ");
        var diff = (symbolExtent.getWidth() - symbolExtent.getHeight()) / 2;
        if (diff > 0) {
            symbolExtent.bottom = symbolExtent.bottom - diff;
            symbolExtent.top = symbolExtent.top + diff;
        } else {
            symbolExtent.left = symbolExtent.left + diff;
            symbolExtent.right = symbolExtent.right - diff;
        }
        cache = {
            path: path,
            size: symbolExtent.getWidth(),
            left: symbolExtent.left,
            bottom: symbolExtent.bottom
        };
        this.symbolCache[id] = cache;
        return cache;
    },
    CLASS_NAME: "OpenLayers.Renderer.VML"
});
OpenLayers.Renderer.VML.LABEL_SHIFT = {
    "l": 0,
    "c": .5,
    "r": 1,
    "t": 0,
    "m": .5,
    "b": 1
};
OpenLayers.Control.Geolocate = OpenLayers.Class(OpenLayers.Control, {
    EVENT_TYPES: ["locationupdated", "locationfailed", "locationuncapable"],
    geolocation: navigator.geolocation,
    bind: true,
    watch: false,
    geolocationOptions: null,
    initialize: function (options) {
        this.EVENT_TYPES = OpenLayers.Control.Geolocate.prototype.EVENT_TYPES.concat(OpenLayers.Control.prototype.EVENT_TYPES);
        this.geolocationOptions = {};
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
    },
    destroy: function () {
        this.deactivate();
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },
    activate: function () {
        if (!this.geolocation) {
            this.events.triggerEvent("locationuncapable");
            return false;
        }
        if (OpenLayers.Control.prototype.activate.apply(this, arguments)) {
            if (this.watch) {
                this.watchId = this.geolocation.watchPosition(OpenLayers.Function.bind(this.geolocate, this), OpenLayers.Function.bind(this.failure, this), this.geolocationOptions);
            } else {
                this.getCurrentLocation();
            }
            return true;
        }
        return false;
    },
    deactivate: function () {
        if (this.active && this.watchId !== null) {
            this.geolocation.clearWatch(this.watchId);
        }
        return OpenLayers.Control.prototype.deactivate.apply(this, arguments);
    },
    geolocate: function (position) {
        var center = new OpenLayers.LonLat(position.coords.longitude, position.coords.latitude).transform(new OpenLayers.Projection("EPSG:4326"), this.map.getProjectionObject());
        if (this.bind) {
            this.map.setCenter(center);
        }
        this.events.triggerEvent("locationupdated", {
            position: position,
            point: new OpenLayers.Geometry.Point(center.lon, center.lat)
        });
    },
    getCurrentLocation: function () {
        if (!this.active || this.watch) {
            return false;
        }
        this.geolocation.getCurrentPosition(OpenLayers.Function.bind(this.geolocate, this), OpenLayers.Function.bind(this.failure, this), this.geolocationOptions);
        return true;
    },
    failure: function (error) {
        this.events.triggerEvent("locationfailed", {
            error: error
        });
    },
    CLASS_NAME: "OpenLayers.Control.Geolocate"
});
OpenLayers.Filter.Spatial = OpenLayers.Class(OpenLayers.Filter, {
    type: null,
    property: null,
    value: null,
    distance: null,
    distanceUnits: null,
    initialize: function (options) {
        OpenLayers.Filter.prototype.initialize.apply(this, [options]);
    },
    evaluate: function (feature) {
        var intersect = false;
        switch (this.type) {
        case OpenLayers.Filter.Spatial.BBOX:
        case OpenLayers.Filter.Spatial.INTERSECTS:
            if (feature.geometry) {
                var geom = this.value;
                if (this.value.CLASS_NAME == "OpenLayers.Bounds") {
                    geom = this.value.toGeometry();
                }
                if (feature.geometry.intersects(geom)) {
                    intersect = true;
                }
            }
            break;
        default:
            OpenLayers.Console.error(OpenLayers.i18n("filterEvaluateNotImplemented"));
            break;
        }
        return intersect;
    },
    clone: function () {
        var options = OpenLayers.Util.applyDefaults({
            value: this.value && this.value.clone && this.value.clone()
        }, this);
        return new OpenLayers.Filter.Spatial(options);
    },
    CLASS_NAME: "OpenLayers.Filter.Spatial"
});
OpenLayers.Filter.Spatial.BBOX = "BBOX";
OpenLayers.Filter.Spatial.INTERSECTS = "INTERSECTS";
OpenLayers.Filter.Spatial.DWITHIN = "DWITHIN";
OpenLayers.Filter.Spatial.WITHIN = "WITHIN";
OpenLayers.Filter.Spatial.CONTAINS = "CONTAINS";
OpenLayers.Control.ZoomOut = OpenLayers.Class(OpenLayers.Control, {
    type: OpenLayers.Control.TYPE_BUTTON,
    trigger: function () {
        this.map.zoomOut();
    },
    CLASS_NAME: "OpenLayers.Control.ZoomOut"
});
OpenLayers.Control.ZoomPanel = OpenLayers.Class(OpenLayers.Control.Panel, {
    initialize: function (options) {
        OpenLayers.Control.Panel.prototype.initialize.apply(this, [options]);
        this.addControls([new OpenLayers.Control.ZoomIn(), new OpenLayers.Control.ZoomToMaxExtent(), new OpenLayers.Control.ZoomOut()]);
    },
    CLASS_NAME: "OpenLayers.Control.ZoomPanel"
});
OpenLayers.StyleMap = OpenLayers.Class({
    styles: null,
    extendDefault: true,
    initialize: function (style, options) {
        this.styles = {
            "default": new OpenLayers.Style(OpenLayers.Feature.Vector.style["default"]),
            "select": new OpenLayers.Style(OpenLayers.Feature.Vector.style["select"]),
            "temporary": new OpenLayers.Style(OpenLayers.Feature.Vector.style["temporary"]),
            "delete": new OpenLayers.Style(OpenLayers.Feature.Vector.style["delete"])
        };
        if (style instanceof OpenLayers.Style) {
            this.styles["default"] = style;
            this.styles["select"] = style;
            this.styles["temporary"] = style;
            this.styles["delete"] = style;
        } else if (typeof style == "object") {
            for (var key in style) {
                if (style[key] instanceof OpenLayers.Style) {
                    this.styles[key] = style[key];
                } else if (typeof style[key] == "object") {
                    this.styles[key] = new OpenLayers.Style(style[key]);
                } else {
                    this.styles["default"] = new OpenLayers.Style(style);
                    this.styles["select"] = new OpenLayers.Style(style);
                    this.styles["temporary"] = new OpenLayers.Style(style);
                    this.styles["delete"] = new OpenLayers.Style(style);
                    break;
                }
            }
        }
        OpenLayers.Util.extend(this, options);
    },
    destroy: function () {
        for (var key in this.styles) {
            this.styles[key].destroy();
        }
        this.styles = null;
    },
    createSymbolizer: function (feature, intent) {
        if (!feature) {
            feature = new OpenLayers.Feature.Vector();
        }
        if (!this.styles[intent]) {
            intent = "default";
        }
        feature.renderIntent = intent;
        var defaultSymbolizer = {};
        if (this.extendDefault && intent != "default") {
            defaultSymbolizer = this.styles["default"].createSymbolizer(feature);
        }
        return OpenLayers.Util.extend(defaultSymbolizer, this.styles[intent].createSymbolizer(feature));
    },
    addUniqueValueRules: function (renderIntent, property, symbolizers, context) {
        var rules = [];
        for (var value in symbolizers) {
            rules.push(new OpenLayers.Rule({
                symbolizer: symbolizers[value],
                context: context,
                filter: new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.EQUAL_TO,
                    property: property,
                    value: value
                })
            }));
        }
        this.styles[renderIntent].addRules(rules);
    },
    CLASS_NAME: "OpenLayers.StyleMap"
});
OpenLayers.Layer.Vector = OpenLayers.Class(OpenLayers.Layer, {
    EVENT_TYPES: ["beforefeatureadded", "beforefeaturesadded", "featureadded", "featuresadded", "beforefeatureremoved", "beforefeaturesremoved", "featureremoved", "featuresremoved", "beforefeatureselected", "featureselected", "featureunselected", "beforefeaturemodified", "featuremodified", "afterfeaturemodified", "vertexmodified", "vertexremoved", "sketchstarted", "sketchmodified", "sketchcomplete", "refresh"],
    isBaseLayer: false,
    isFixed: false,
    features: null,
    filter: null,
    selectedFeatures: null,
    unrenderedFeatures: null,
    reportError: true,
    style: null,
    styleMap: null,
    strategies: null,
    protocol: null,
    renderers: ['SVG', 'VML', 'Canvas'],
    renderer: null,
    rendererOptions: null,
    geometryType: null,
    drawn: false,
    initialize: function (name, options) {
        this.EVENT_TYPES = OpenLayers.Layer.Vector.prototype.EVENT_TYPES.concat(OpenLayers.Layer.prototype.EVENT_TYPES);
        OpenLayers.Layer.prototype.initialize.apply(this, arguments);
        if (!this.renderer || !this.renderer.supported()) {
            this.assignRenderer();
        }
        if (!this.renderer || !this.renderer.supported()) {
            this.renderer = null;
            this.displayError();
        }
        if (!this.styleMap) {
            this.styleMap = new OpenLayers.StyleMap();
        }
        this.features = [];
        this.selectedFeatures = [];
        this.unrenderedFeatures = {};
        if (this.strategies) {
            for (var i = 0, len = this.strategies.length; i < len; i++) {
                this.strategies[i].setLayer(this);
            }
        }
    },
    destroy: function () {
        if (this.strategies) {
            var strategy, i, len;
            for (i = 0, len = this.strategies.length; i < len; i++) {
                strategy = this.strategies[i];
                if (strategy.autoDestroy) {
                    strategy.destroy();
                }
            }
            this.strategies = null;
        }
        if (this.protocol) {
            if (this.protocol.autoDestroy) {
                this.protocol.destroy();
            }
            this.protocol = null;
        }
        this.destroyFeatures();
        this.features = null;
        this.selectedFeatures = null;
        this.unrenderedFeatures = null;
        if (this.renderer) {
            this.renderer.destroy();
        }
        this.renderer = null;
        this.geometryType = null;
        this.drawn = null;
        OpenLayers.Layer.prototype.destroy.apply(this, arguments);
    },
    clone: function (obj) {
        if (obj == null) {
            obj = new OpenLayers.Layer.Vector(this.name, this.getOptions());
        }
        obj = OpenLayers.Layer.prototype.clone.apply(this, [obj]);
        var features = this.features;
        var len = features.length;
        var clonedFeatures = new Array(len);
        for (var i = 0; i < len; ++i) {
            clonedFeatures[i] = features[i].clone();
        }
        obj.features = clonedFeatures;
        return obj;
    },
    refresh: function (obj) {
        if (this.calculateInRange() && this.visibility) {
            this.events.triggerEvent("refresh", obj);
        }
    },
    assignRenderer: function () {
        for (var i = 0, len = this.renderers.length; i < len; i++) {
            var rendererClass = this.renderers[i];
            var renderer = (typeof rendererClass == "function") ? rendererClass : OpenLayers.Renderer[rendererClass];
            if (renderer && renderer.prototype.supported()) {
                this.renderer = new renderer(this.div, this.rendererOptions);
                break;
            }
        }
    },
    displayError: function () {
        if (this.reportError) {
            OpenLayers.Console.userError(OpenLayers.i18n("browserNotSupported", {
                'renderers': this.renderers.join("\n")
            }));
        }
    },
    setMap: function (map) {
        OpenLayers.Layer.prototype.setMap.apply(this, arguments);
        if (!this.renderer) {
            this.map.removeLayer(this);
        } else {
            this.renderer.map = this.map;
            this.renderer.setSize(this.map.getSize());
        }
    },
    afterAdd: function () {
        if (this.strategies) {
            var strategy, i, len;
            for (i = 0, len = this.strategies.length; i < len; i++) {
                strategy = this.strategies[i];
                if (strategy.autoActivate) {
                    strategy.activate();
                }
            }
        }
    },
    removeMap: function (map) {
        this.drawn = false;
        if (this.strategies) {
            var strategy, i, len;
            for (i = 0, len = this.strategies.length; i < len; i++) {
                strategy = this.strategies[i];
                if (strategy.autoActivate) {
                    strategy.deactivate();
                }
            }
        }
    },
    onMapResize: function () {
        OpenLayers.Layer.prototype.onMapResize.apply(this, arguments);
        this.renderer.setSize(this.map.getSize());
    },
    moveTo: function (bounds, zoomChanged, dragging) {
        OpenLayers.Layer.prototype.moveTo.apply(this, arguments);
        var ng = (OpenLayers.Renderer.NG && this.renderer instanceof OpenLayers.Renderer.NG);
        if (ng) {
            dragging || this.renderer.updateDimensions(zoomChanged);
        } else {
            var coordSysUnchanged = true;
            if (!dragging) {
                this.renderer.root.style.visibility = "hidden";
                this.div.style.left = -parseInt(this.map.layerContainerDiv.style.left) + "px";
                this.div.style.top = -parseInt(this.map.layerContainerDiv.style.top) + "px";
                var extent = this.map.getExtent();
                coordSysUnchanged = this.renderer.setExtent(extent, zoomChanged);
                this.renderer.root.style.visibility = "visible";
                if (OpenLayers.IS_GECKO === true) {
                    this.div.scrollLeft = this.div.scrollLeft;
                }
                if (!zoomChanged && coordSysUnchanged) {
                    for (var i in this.unrenderedFeatures) {
                        var feature = this.unrenderedFeatures[i];
                        this.drawFeature(feature);
                    }
                }
            }
        }
        if (!this.drawn || (!ng && (zoomChanged || !coordSysUnchanged))) {
            this.drawn = true;
            var feature;
            for (var i = 0, len = this.features.length; i < len; i++) {
                this.renderer.locked = (i !== (len - 1));
                feature = this.features[i];
                this.drawFeature(feature);
            }
        }
    },
    redraw: function () {
        if (OpenLayers.Renderer.NG && this.renderer instanceof OpenLayers.Renderer.NG) {
            this.drawn = false;
        }
        return OpenLayers.Layer.prototype.redraw.apply(this, arguments);
    },
    display: function (display) {
        OpenLayers.Layer.prototype.display.apply(this, arguments);
        var currentDisplay = this.div.style.display;
        if (currentDisplay != this.renderer.root.style.display) {
            this.renderer.root.style.display = currentDisplay;
        }
    },
    addFeatures: function (features, options) {
        if (!(OpenLayers.Util.isArray(features))) {
            features = [features];
        }
        var notify = !options || !options.silent;
        if (notify) {
            var event = {
                features: features
            };
            var ret = this.events.triggerEvent("beforefeaturesadded", event);
            if (ret === false) {
                return;
            }
            features = event.features;
        }
        var featuresAdded = [];
        for (var i = 0, len = features.length; i < len; i++) {
            if (i != (features.length - 1)) {
                this.renderer.locked = true;
            } else {
                this.renderer.locked = false;
            }
            var feature = features[i];
            if (this.geometryType && !(feature.geometry instanceof this.geometryType)) {
                var throwStr = OpenLayers.i18n('componentShouldBe', {
                    'geomType': this.geometryType.prototype.CLASS_NAME
                });
                throw throwStr;
            }
            feature.layer = this;
            if (!feature.style && this.style) {
                feature.style = OpenLayers.Util.extend({}, this.style);
            }
            if (notify) {
                if (this.events.triggerEvent("beforefeatureadded", {
                    feature: feature
                }) === false) {
                    continue;
                }
                this.preFeatureInsert(feature);
            }
            featuresAdded.push(feature);
            this.features.push(feature);
            this.drawFeature(feature);
            if (notify) {
                this.events.triggerEvent("featureadded", {
                    feature: feature
                });
                this.onFeatureInsert(feature);
            }
        }
        if (notify) {
            this.events.triggerEvent("featuresadded", {
                features: featuresAdded
            });
        }
    },
    removeFeatures: function (features, options) {
        if (!features || features.length === 0) {
            return;
        }
        if (features === this.features) {
            return this.removeAllFeatures(options);
        }
        if (!(OpenLayers.Util.isArray(features))) {
            features = [features];
        }
        if (features === this.selectedFeatures) {
            features = features.slice();
        }
        var notify = !options || !options.silent;
        if (notify) {
            this.events.triggerEvent("beforefeaturesremoved", {
                features: features
            });
        }
        for (var i = features.length - 1; i >= 0; i--) {
            if (i != 0 && features[i - 1].geometry) {
                this.renderer.locked = true;
            } else {
                this.renderer.locked = false;
            }
            var feature = features[i];
            delete this.unrenderedFeatures[feature.id];
            if (notify) {
                this.events.triggerEvent("beforefeatureremoved", {
                    feature: feature
                });
            }
            this.features = OpenLayers.Util.removeItem(this.features, feature);
            feature.layer = null;
            if (feature.geometry) {
                this.renderer.eraseFeatures(feature);
            }
            if (OpenLayers.Util.indexOf(this.selectedFeatures, feature) != -1) {
                OpenLayers.Util.removeItem(this.selectedFeatures, feature);
            }
            if (notify) {
                this.events.triggerEvent("featureremoved", {
                    feature: feature
                });
            }
        }
        if (notify) {
            this.events.triggerEvent("featuresremoved", {
                features: features
            });
        }
    },
    removeAllFeatures: function (options) {
        var notify = !options || !options.silent;
        var features = this.features;
        if (notify) {
            this.events.triggerEvent("beforefeaturesremoved", {
                features: features
            });
        }
        var feature;
        for (var i = features.length - 1; i >= 0; i--) {
            feature = features[i];
            if (notify) {
                this.events.triggerEvent("beforefeatureremoved", {
                    feature: feature
                });
            }
            feature.layer = null;
            if (notify) {
                this.events.triggerEvent("featureremoved", {
                    feature: feature
                });
            }
        }
        this.renderer.clear();
        this.features = [];
        this.unrenderedFeatures = {};
        this.selectedFeatures = [];
        if (notify) {
            this.events.triggerEvent("featuresremoved", {
                features: features
            });
        }
    },
    destroyFeatures: function (features, options) {
        var all = (features == undefined);
        if (all) {
            features = this.features;
        }
        if (features) {
            this.removeFeatures(features, options);
            for (var i = features.length - 1; i >= 0; i--) {
                features[i].destroy();
            }
        }
    },
    drawFeature: function (feature, style) {
        if (!this.drawn) {
            return;
        }
        if (typeof style != "object") {
            if (!style && feature.state === OpenLayers.State.DELETE) {
                style = "delete";
            }
            var renderIntent = style || feature.renderIntent;
            style = feature.style || this.style;
            if (!style) {
                style = this.styleMap.createSymbolizer(feature, renderIntent);
            }
        }
        var drawn = this.renderer.drawFeature(feature, style);
        if (drawn === false || drawn === null) {
            this.unrenderedFeatures[feature.id] = feature;
        } else {
            delete this.unrenderedFeatures[feature.id];
        }
    },
    eraseFeatures: function (features) {
        this.renderer.eraseFeatures(features);
    },
    getFeatureFromEvent: function (evt) {
        if (!this.renderer) {
            OpenLayers.Console.error(OpenLayers.i18n("getFeatureError"));
            return null;
        }
        var feature = null;
        var featureId = this.renderer.getFeatureIdFromEvent(evt);
        if (featureId) {
            if (typeof featureId === "string") {
                feature = this.getFeatureById(featureId);
            } else {
                feature = featureId;
            }
        }
        return feature;
    },
    getFeatureBy: function (property, value) {
        var feature = null;
        for (var i = 0, len = this.features.length; i < len; ++i) {
            if (this.features[i][property] == value) {
                feature = this.features[i];
                break;
            }
        }
        return feature;
    },
    getFeatureById: function (featureId) {
        return this.getFeatureBy('id', featureId);
    },
    getFeatureByFid: function (featureFid) {
        return this.getFeatureBy('fid', featureFid);
    },
    getFeaturesByAttribute: function (attrName, attrValue) {
        var i, feature, len = this.features.length,
            foundFeatures = [];
        for (i = 0; i < len; i++) {
            feature = this.features[i];
            if (feature && feature.attributes) {
                if (feature.attributes[attrName] === attrValue) {
                    foundFeatures.push(feature);
                }
            }
        }
        return foundFeatures;
    },
    onFeatureInsert: function (feature) {},
    preFeatureInsert: function (feature) {},
    getDataExtent: function () {
        var maxExtent = null;
        var features = this.features;
        if (features && (features.length > 0)) {
            var geometry = null;
            for (var i = 0, len = features.length; i < len; i++) {
                geometry = features[i].geometry;
                if (geometry) {
                    if (maxExtent === null) {
                        maxExtent = new OpenLayers.Bounds();
                    }
                    maxExtent.extend(geometry.getBounds());
                }
            }
        }
        return maxExtent;
    },
    CLASS_NAME: "OpenLayers.Layer.Vector"
});
OpenLayers.Protocol.HTTP = OpenLayers.Class(OpenLayers.Protocol, {
    url: null,
    headers: null,
    params: null,
    callback: null,
    scope: null,
    readWithPOST: false,
    wildcarded: false,
    srsInBBOX: false,
    initialize: function (options) {
        options = options || {};
        this.params = {};
        this.headers = {};
        OpenLayers.Protocol.prototype.initialize.apply(this, arguments);
        if (!this.filterToParams && OpenLayers.Format.QueryStringFilter) {
            var format = new OpenLayers.Format.QueryStringFilter({
                wildcarded: this.wildcarded,
                srsInBBOX: this.srsInBBOX
            });
            this.filterToParams = function (filter, params) {
                return format.write(filter, params);
            }
        }
    },
    destroy: function () {
        this.params = null;
        this.headers = null;
        OpenLayers.Protocol.prototype.destroy.apply(this);
    },
    read: function (options) {
        OpenLayers.Protocol.prototype.read.apply(this, arguments);
        options = options || {};
        options.params = OpenLayers.Util.applyDefaults(options.params, this.options.params);
        options = OpenLayers.Util.applyDefaults(options, this.options);
        if (options.filter && this.filterToParams) {
            options.params = this.filterToParams(options.filter, options.params);
        }
        var readWithPOST = (options.readWithPOST !== undefined) ? options.readWithPOST : this.readWithPOST;
        var resp = new OpenLayers.Protocol.Response({
            requestType: "read"
        });
        if (readWithPOST) {
            resp.priv = OpenLayers.Request.POST({
                url: options.url,
                callback: this.createCallback(this.handleRead, resp, options),
                data: OpenLayers.Util.getParameterString(options.params),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            });
        } else {
            resp.priv = OpenLayers.Request.GET({
                url: options.url,
                callback: this.createCallback(this.handleRead, resp, options),
                params: options.params,
                headers: options.headers
            });
        }
        return resp;
    },
    handleRead: function (resp, options) {
        this.handleResponse(resp, options);
    },
    create: function (features, options) {
        options = OpenLayers.Util.applyDefaults(options, this.options);
        var resp = new OpenLayers.Protocol.Response({
            reqFeatures: features,
            requestType: "create"
        });
        resp.priv = OpenLayers.Request.POST({
            url: options.url,
            callback: this.createCallback(this.handleCreate, resp, options),
            headers: options.headers,
            data: this.format.write(features)
        });
        return resp;
    },
    handleCreate: function (resp, options) {
        this.handleResponse(resp, options);
    },
    update: function (feature, options) {
        options = options || {};
        var url = options.url || feature.url || this.options.url + "/" + feature.fid;
        options = OpenLayers.Util.applyDefaults(options, this.options);
        var resp = new OpenLayers.Protocol.Response({
            reqFeatures: feature,
            requestType: "update"
        });
        resp.priv = OpenLayers.Request.PUT({
            url: url,
            callback: this.createCallback(this.handleUpdate, resp, options),
            headers: options.headers,
            data: this.format.write(feature)
        });
        return resp;
    },
    handleUpdate: function (resp, options) {
        this.handleResponse(resp, options);
    },
    "delete": function (feature, options) {
        options = options || {};
        var url = options.url || feature.url || this.options.url + "/" + feature.fid;
        options = OpenLayers.Util.applyDefaults(options, this.options);
        var resp = new OpenLayers.Protocol.Response({
            reqFeatures: feature,
            requestType: "delete"
        });
        resp.priv = OpenLayers.Request.DELETE({
            url: url,
            callback: this.createCallback(this.handleDelete, resp, options),
            headers: options.headers
        });
        return resp;
    },
    handleDelete: function (resp, options) {
        this.handleResponse(resp, options);
    },
    handleResponse: function (resp, options) {
        var request = resp.priv;
        if (options.callback) {
            if (request.status >= 200 && request.status < 300) {
                if (resp.requestType != "delete") {
                    resp.features = this.parseFeatures(request);
                }
                resp.code = OpenLayers.Protocol.Response.SUCCESS;
            } else {
                resp.code = OpenLayers.Protocol.Response.FAILURE;
            }
            options.callback.call(options.scope, resp);
        }
    },
    parseFeatures: function (request) {
        var doc = request.responseXML;
        if (!doc || !doc.documentElement) {
            doc = request.responseText;
        }
        if (!doc || doc.length <= 0) {
            return null;
        }
        return this.format.read(doc);
    },
    commit: function (features, options) {
        options = OpenLayers.Util.applyDefaults(options, this.options);
        var resp = [],
            nResponses = 0;
        var types = {};
        types[OpenLayers.State.INSERT] = [];
        types[OpenLayers.State.UPDATE] = [];
        types[OpenLayers.State.DELETE] = [];
        var feature, list, requestFeatures = [];
        for (var i = 0, len = features.length; i < len; ++i) {
            feature = features[i];
            list = types[feature.state];
            if (list) {
                list.push(feature);
                requestFeatures.push(feature);
            }
        }
        var nRequests = (types[OpenLayers.State.INSERT].length > 0 ? 1 : 0) + types[OpenLayers.State.UPDATE].length + types[OpenLayers.State.DELETE].length;
        var success = true;
        var finalResponse = new OpenLayers.Protocol.Response({
            reqFeatures: requestFeatures
        });

        function insertCallback(response) {
            var len = response.features ? response.features.length : 0;
            var fids = new Array(len);
            for (var i = 0; i < len; ++i) {
                fids[i] = response.features[i].fid;
            }
            finalResponse.insertIds = fids;
            callback.apply(this, [response]);
        }

        function callback(response) {
            this.callUserCallback(response, options);
            success = success && response.success();
            nResponses++;
            if (nResponses >= nRequests) {
                if (options.callback) {
                    finalResponse.code = success ? OpenLayers.Protocol.Response.SUCCESS : OpenLayers.Protocol.Response.FAILURE;
                    options.callback.apply(options.scope, [finalResponse]);
                }
            }
        }
        var queue = types[OpenLayers.State.INSERT];
        if (queue.length > 0) {
            resp.push(this.create(queue, OpenLayers.Util.applyDefaults({
                callback: insertCallback,
                scope: this
            }, options.create)));
        }
        queue = types[OpenLayers.State.UPDATE];
        for (var i = queue.length - 1; i >= 0; --i) {
            resp.push(this.update(queue[i], OpenLayers.Util.applyDefaults({
                callback: callback,
                scope: this
            }, options.update)));
        }
        queue = types[OpenLayers.State.DELETE];
        for (var i = queue.length - 1; i >= 0; --i) {
            resp.push(this["delete"](queue[i], OpenLayers.Util.applyDefaults({
                callback: callback,
                scope: this
            }, options["delete"])));
        }
        return resp;
    },
    abort: function (response) {
        if (response) {
            response.priv.abort();
        }
    },
    callUserCallback: function (resp, options) {
        var opt = options[resp.requestType];
        if (opt && opt.callback) {
            opt.callback.call(opt.scope, resp);
        }
    },
    CLASS_NAME: "OpenLayers.Protocol.HTTP"
});
OpenLayers.Layer.WMS = OpenLayers.Class(OpenLayers.Layer.Grid, {
    DEFAULT_PARAMS: {
        service: "WMS",
        version: "1.1.1",
        request: "GetMap",
        styles: "",
        format: "image/jpeg"
    },
    reproject: false,
    isBaseLayer: true,
    encodeBBOX: false,
    noMagic: false,
    yx: {
        'EPSG:4326': true
    },
    initialize: function (name, url, params, options) {
        var newArguments = [];
        params = OpenLayers.Util.upperCaseObject(params);
        if (parseFloat(params.VERSION) >= 1.3 && !params.EXCEPTIONS) {
            params.EXCEPTIONS = "INIMAGE";
        }
        newArguments.push(name, url, params, options);
        OpenLayers.Layer.Grid.prototype.initialize.apply(this, newArguments);
        OpenLayers.Util.applyDefaults(this.params, OpenLayers.Util.upperCaseObject(this.DEFAULT_PARAMS));
        if (!this.noMagic && this.params.TRANSPARENT && this.params.TRANSPARENT.toString().toLowerCase() == "true") {
            if ((options == null) || (!options.isBaseLayer)) {
                this.isBaseLayer = false;
            }
            if (this.params.FORMAT == "image/jpeg") {
                this.params.FORMAT = OpenLayers.Util.alphaHack() ? "image/gif" : "image/png";
            }
        }
    },
    destroy: function () {
        OpenLayers.Layer.Grid.prototype.destroy.apply(this, arguments);
    },
    clone: function (obj) {
        if (obj == null) {
            obj = new OpenLayers.Layer.WMS(this.name, this.url, this.params, this.getOptions());
        }
        obj = OpenLayers.Layer.Grid.prototype.clone.apply(this, [obj]);
        return obj;
    },
    reverseAxisOrder: function () {
        return (parseFloat(this.params.VERSION) >= 1.3 && !! this.yx[this.map.getProjectionObject().getCode()]);
    },
    getURL: function (bounds) {
        bounds = this.adjustBounds(bounds);
        var imageSize = this.getImageSize();
        var newParams = {};
        var reverseAxisOrder = this.reverseAxisOrder();
        newParams.BBOX = this.encodeBBOX ? bounds.toBBOX(null, reverseAxisOrder) : bounds.toArray(reverseAxisOrder);
        newParams.WIDTH = imageSize.w;
        newParams.HEIGHT = imageSize.h;
        var requestString = this.getFullRequestString(newParams);
        return requestString;
    },
    mergeNewParams: function (newParams) {
        var upperParams = OpenLayers.Util.upperCaseObject(newParams);
        var newArguments = [upperParams];
        return OpenLayers.Layer.Grid.prototype.mergeNewParams.apply(this, newArguments);
    },
    getFullRequestString: function (newParams, altUrl) {
        var mapProjection = this.map.getProjectionObject();
        var projectionCode = this.projection && this.projection.equals(mapProjection) ? this.projection.getCode() : mapProjection.getCode();
        var value = (projectionCode == "none") ? null : projectionCode;
        if (parseFloat(this.params.VERSION) >= 1.3) {
            this.params.CRS = value;
        } else {
            this.params.SRS = value;
        }
        if (typeof this.params.TRANSPARENT == "boolean") {
            newParams.TRANSPARENT = this.params.TRANSPARENT ? "TRUE" : "FALSE";
        }
        return OpenLayers.Layer.Grid.prototype.getFullRequestString.apply(this, arguments);
    },
    CLASS_NAME: "OpenLayers.Layer.WMS"
});
OpenLayers.Layer.OSM.TYPE_MAPNIK = "mapnik";
OpenLayers.Layer.OSM.TYPE_OSMARENDER = "osmarenderer";
OpenLayers.Layer.OSM.TYPE_CYCLEMAP = "cycle";
OpenLayers.Layer.OSM.TYPE_KOREM = "korem";
OpenLayers.Layer.OSM.TYPE_MAPQUEST = "mapquest";
OpenLayers.Layer.OSM.OpenStreetMap = OpenLayers.Class(OpenLayers.Layer.OSM, {
    initialize: function (name, options) {
        this.url_mapnik = ["http://a.tile.openstreetmap.org/${z}/${x}/${y}.png", "http://b.tile.openstreetmap.org/${z}/${x}/${y}.png", "http://c.tile.openstreetmap.org/${z}/${x}/${y}.png"];
        this.url_osmarender = ["http://a.tah.openstreetmap.org/Tiles/tile/${z}/${x}/${y}.png", "http://b.tah.openstreetmap.org/Tiles/tile/${z}/${x}/${y}.png", "http://c.tah.openstreetmap.org/Tiles/tile/${z}/${x}/${y}.png"];
        this.url_cyclemap = ["http://a.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png", "http://b.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png", "http://c.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png"];
        this.url_korem = ["http://192.168.93.230/osm_tiles2/${z}/${x}/${y}.png", "http://192.168.93.230/osm_tiles2/${z}/${x}/${y}.png", "http://192.168.93.230/osm_tiles2/${z}/${x}/${y}.png"];
        this.url_mapquest = ["http://otile1.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png", "http://otile2.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png", "http://otile3.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png", "http://otile4.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png"];
        this.setMapType(options.type);
        this.attributionMapquest = "";
        if (options.attributionMapquest) {
            this.attributionMapquest = options.attributionMapquest;
        }
        this.attributionOSM = this.attribution;
        options = OpenLayers.Util.extend({
            numZoomLevels: 19,
            buffer: 0,
            transitionEffect: "resize"
        }, options);
        var newArguments = [name, this.url, options];
        OpenLayers.Layer.OSM.prototype.initialize.apply(this, newArguments);
    },
    setMapType: function (type) {
        this.type = type;
        if (this.attributionOSM) {
            this.attribution = this.attributionOSM;
        }
        if (type == OpenLayers.Layer.OSM.TYPE_MAPNIK) {
            this.url = this.url_mapnik;
        } else if (type == OpenLayers.Layer.OSM.TYPE_OSMARENDER) {
            this.url = this.url_osmarender;
        } else if (type == OpenLayers.Layer.OSM.TYPE_CYCLEMAP) {
            this.url = this.url_cyclemap;
        } else if (type == OpenLayers.Layer.OSM.TYPE_KOREM) {
            this.url = this.url_korem;
        } else if (type == OpenLayers.Layer.OSM.TYPE_MAPQUEST) {
            this.url = this.url_mapquest;
            if (this.attributionMapquest) {
                this.attribution = this.attributionOSM + ", " + this.attributionMapquest;
            }
        }
        this.setUrl(this.url);
        this.updateAttribution();
    },
    updateAttribution: function (text) {
        if (!this.map) {
            return;
        }
        var ctrlAttribution = this.map.getControl("attributionCtrl");
        ctrlAttribution.updateAttribution();
    },
    setMap: function (map) {
        OpenLayers.Layer.OSM.prototype.setMap.apply(this, arguments);
        map.events.register("changebaselayer", this, this.updateAttribution);
    },
    CLASS_NAME: "OpenLayers.Layer.OSM.OpenStreetMap"
});
OpenLayers.Layer.WMS.prototype.getFullRequestString = function (newParams, altUrl) {
    var projectionCode = this.map.getProjection();
    var value = (projectionCode == "none") ? null : projectionCode;
    if (parseFloat(this.params.VERSION) >= 1.3) {
        this.params.CRS = value;
    } else {
        if (projectionCode.toLowerCase() == 'epsg:3785') {
            value = 'epsg:900913';
        }
        this.params.SRS = value;
    }
    var sReturn = OpenLayers.Layer.Grid.prototype.getFullRequestString.apply(this, arguments);
    return sReturn;
}
OpenLayers.Layer.WMS.Geogratis = OpenLayers.Class(OpenLayers.Layer.WMS, {
    initialize: function (name, options) {
        var url = OpenLayers.Layer.WMS.Geogratis.URL_EN;
        if (options && options.lang) {
            if (options.lang.toLowerCase() == 'en') {
                url = OpenLayers.Layer.WMS.Geogratis.URL_EN;
            } else if (options.lang.toLowerCase() == 'fr') {
                url = OpenLayers.Layer.WMS.Geogratis.URL_FR;
            }
        }
        var layers = OpenLayers.Layer.WMS.Geogratis.LAYERS_EN;
        if (options && options.lang) {
            if (options.lang.toLowerCase() == 'en') {
                layers = OpenLayers.Layer.WMS.Geogratis.LAYERS_EN;
            } else if (options.lang.toLowerCase() == 'fr') {
                layers = OpenLayers.Layer.WMS.Geogratis.LAYERS_FR;
            }
        }
        if (options && options.layers) {
            layers = options.layers;
        }
        var newLayers = layers.split(',');
        var newArguments = [name, url + "?",
        {
            layers: newLayers,
            format: 'image/png'
        }, {
            singleTile: true,
            ratio: 1,
            transitionEffect: 'resize'
        },
        options];
        OpenLayers.Layer.WMS.prototype.initialize.apply(this, newArguments);
        this.attribution = options.attribution;
    },
    CLASS_NAME: "OpenLayers.Layer.WMS.Geogratis"
});
OpenLayers.Layer.WMS.Geogratis.URL_EN = 'http://wms.ess-ws.nrcan.gc.ca/wms/toporama_en';
OpenLayers.Layer.WMS.Geogratis.URL_FR = 'http://wms.sst-sw.rncan.gc.ca/wms/toporama_fr';
OpenLayers.Layer.WMS.Geogratis.LAYERS_EN = 'vegetation,builtup_areas,designated_areas,hydrography,hypsography,water_saturated_soils,landforms,constructions,water_features,road_network,railway,populated_places,structures,power_network,feature_names';
OpenLayers.Layer.WMS.Geogratis.LAYERS_FR = 'vegetation,agglomeration,aires_designees,hydrographie,hypsographie,sols_satures_eau,relief_formes,constructions,elements_hydro,reseau_routier,reseau_ferroviaire,regions_peuplees,structures,reseau_energetique,toponymie';
OpenLayers.Layer.WMS.Geogratis.TYPE_TOPORAMA = "toporama";
OpenLayers.Layer.BingVE = OpenLayers.Class(OpenLayers.Layer.VirtualEarth, {
    initialize: function (name, options) {
        if (options.maptype) {
            this.setMapType(options.maptype);
        } else {
            this.setMapType(OpenLayers.Layer.BingVE.TYPE_SHADED);
        }
        options.type = this.type;
        if (options.credentialsType != null && options.credentialsType != '') this.credentialsType = options.credentialsType;
        if (options.credentials != null && options.credentials != '') this.credentials = options.credentials;
        if (options.sphericalMercator) this.sphericalMercator = options.sphericalMercator;
        if (options.maxExtent) this.maxExtent = options.maxExtent;
        if (options.numZoomLevels) this.numZoomLevels = options.numZoomLevels;
        OpenLayers.Layer.VirtualEarth.prototype.initialize.apply(this, arguments);
    },
    setMapType: function (maptype) {
        this.maptype = maptype;
        if (this.maptype == OpenLayers.Layer.BingVE.TYPE_SHADED) {
            this.type = VEMapStyle.Shaded;
        } else if (this.maptype == OpenLayers.Layer.BingVE.TYPE_HYBRID) {
            this.type = VEMapStyle.Hybrid;
        } else if (this.maptype == OpenLayers.Layer.BingVE.TYPE_AERIAL) {
            this.type = VEMapStyle.Aerial;
        }
        if (this.mapObject) this.mapObject.SetMapStyle(this.type);
    },
    loadMapObject: function () {
        if (this.veDiv == null) {
            var veDiv = OpenLayers.Util.createDiv(this.name);
            var sz = this.map.getSize();
            veDiv.style.width = sz.w + "px";
            veDiv.style.height = sz.h + "px";
            this.div.appendChild(veDiv);
            this.veDiv = veDiv;
        }
        if (this.mapObject == null) {
            try {
                this.mapObject = new VEMap(this.name);
                if (this.credentials) {
                    this.mapObject.SetCredentials(this.credentials);
                    this.mapObject.AttachEvent("oncredentialserror", this.myHandleCredentialsError);
                    this.mapObject.AttachEvent("oncredentialsvalid", this.myHandleCredentialsValid);
                }
            } catch (e) {}
        }
        if (this.mapObject != null) {
            try {
                this.mapObject.LoadMap(null, null, this.type, false);
            } catch (e) {}
            this.mapObject.HideDashboard();
            if (typeof this.mapObject.SetAnimationEnabled == "function") {
                this.mapObject.SetAnimationEnabled(this.animationEnabled);
            }
        }
        if (!this.mapObject || !this.mapObject.vemapcontrol || !this.mapObject.vemapcontrol.PanMap || (typeof this.mapObject.vemapcontrol.PanMap != "function")) {
            this.dragPanMapObject = null;
        }
    },
    myHandleCredentialsError: function () {
        alert("The credentials are invalid.");
    },
    myHandleCredentialsValid: function () {},
    CLASS_NAME: "OpenLayers.Layer.BingVE"
});
OpenLayers.Layer.BingVE.TYPE_SHADED = "BingShaded";
OpenLayers.Layer.BingVE.TYPE_HYBRID = "BingHybrid";
OpenLayers.Layer.BingVE.TYPE_AERIAL = "BingAerial";
OpenLayers.Control.DragPan = OpenLayers.Class(OpenLayers.Control, {
    type: OpenLayers.Control.TYPE_TOOL,
    panned: false,
    interval: 1,
    documentDrag: false,
    kinetic: null,
    enableKinetic: false,
    kineticInterval: 10,
    draw: function () {
        if (this.enableKinetic) {
            var config = {
                interval: this.kineticInterval
            };
            if (typeof this.enableKinetic === "object") {
                config = OpenLayers.Util.extend(config, this.enableKinetic);
            }
            this.kinetic = new OpenLayers.Kinetic(config);
        }
        this.handler = new OpenLayers.Handler.Drag(this, {
            "move": this.panMap,
            "done": this.panMapDone,
            "down": this.panMapStart
        }, {
            interval: this.interval,
            documentDrag: this.documentDrag
        });
    },
    panMapStart: function () {
        if (this.kinetic) {
            this.kinetic.begin();
        }
    },
    panMap: function (xy) {
        if (this.kinetic) {
            this.kinetic.update(xy);
        }
        this.panned = true;
        this.map.pan(this.handler.last.x - xy.x, this.handler.last.y - xy.y, {
            dragging: true,
            animate: false
        });
    },
    panMapDone: function (xy) {
        if (this.panned) {
            var res = null;
            if (this.kinetic) {
                res = this.kinetic.end(xy);
            }
            this.map.pan(this.handler.last.x - xy.x, this.handler.last.y - xy.y, {
                dragging: !! res,
                animate: false
            });
            if (res) {
                var self = this;
                this.kinetic.move(res, function (x, y, end) {
                    self.map.pan(x, y, {
                        dragging: !end,
                        animate: false
                    });
                });
            }
            this.panned = false;
        }
    },
    CLASS_NAME: "OpenLayers.Control.DragPan"
});
OpenLayers.Control.PinchZoom = OpenLayers.Class(OpenLayers.Control, {
    type: OpenLayers.Control.TYPE_TOOL,
    containerOrigin: null,
    pinchOrigin: null,
    currentCenter: null,
    autoActivate: true,
    initialize: function (options) {
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
        this.handler = new OpenLayers.Handler.Pinch(this, {
            start: this.pinchStart,
            move: this.pinchMove,
            done: this.pinchDone
        }, this.handlerOptions);
    },
    activate: function () {
        var activated = OpenLayers.Control.prototype.activate.apply(this, arguments);
        if (activated) {
            this.map.events.on({
                moveend: this.updateContainerOrigin,
                scope: this
            });
            this.updateContainerOrigin();
        }
        return activated;
    },
    deactivate: function () {
        var deactivated = OpenLayers.Control.prototype.deactivate.apply(this, arguments);
        if (this.map && this.map.events) {
            this.map.events.un({
                moveend: this.updateContainerOrigin,
                scope: this
            });
        }
        return deactivated;
    },
    updateContainerOrigin: function () {
        var container = this.map.layerContainerDiv;
        this.containerOrigin = {
            x: parseInt(container.style.left, 10),
            y: parseInt(container.style.top, 10)
        };
    },
    pinchStart: function (evt, pinchData) {
        this.pinchOrigin = evt.xy;
        this.currentCenter = evt.xy;
    },
    pinchMove: function (evt, pinchData) {
        var scale = pinchData.scale;
        var containerOrigin = this.containerOrigin;
        var pinchOrigin = this.pinchOrigin;
        var current = evt.xy;
        var dx = Math.round((current.x - pinchOrigin.x) + (scale - 1) * (containerOrigin.x - pinchOrigin.x));
        var dy = Math.round((current.y - pinchOrigin.y) + (scale - 1) * (containerOrigin.y - pinchOrigin.y));
        this.applyTransform("translate3d(" + dx + "px, " + dy + "px, 0px) scale3d(" + scale + ", " + scale + ", 1)");
        this.currentCenter = current;
    },
    applyTransform: function (transform) {
        var style = this.map.layerContainerDiv.style;
        style['-webkit-transform'] = transform;
        style['-moz-transform'] = transform;
    },
    pinchDone: function (evt, start, last) {
        this.applyTransform("");
        var zoom = this.map.getZoomForResolution(this.map.getResolution() / last.scale, true);
        if (zoom !== this.map.getZoom() || !this.currentCenter.equals(this.pinchOrigin)) {
            var resolution = this.map.getResolutionForZoom(zoom);
            var location = this.map.getLonLatFromPixel(this.pinchOrigin);
            var zoomPixel = this.currentCenter;
            var size = this.map.getSize();
            location.lon += resolution * ((size.w / 2) - zoomPixel.x);
            location.lat -= resolution * ((size.h / 2) - zoomPixel.y);
            this.map.setCenter(location, zoom);
        }
    },
    CLASS_NAME: "OpenLayers.Control.PinchZoom"
});
OpenLayers.Strategy.Cluster = OpenLayers.Class(OpenLayers.Strategy, {
    distance: 20,
    threshold: null,
    features: null,
    clusters: null,
    clustering: false,
    resolution: null,
    activate: function () {
        var activated = OpenLayers.Strategy.prototype.activate.call(this);
        if (activated) {
            this.layer.events.on({
                "beforefeaturesadded": this.cacheFeatures,
                "moveend": this.cluster,
                scope: this
            });
        }
        return activated;
    },
    deactivate: function () {
        var deactivated = OpenLayers.Strategy.prototype.deactivate.call(this);
        if (deactivated) {
            this.clearCache();
            this.layer.events.un({
                "beforefeaturesadded": this.cacheFeatures,
                "moveend": this.cluster,
                scope: this
            });
        }
        return deactivated;
    },
    cacheFeatures: function (event) {
        var propagate = true;
        if (!this.clustering) {
            this.clearCache();
            this.features = event.features;
            this.cluster();
            propagate = false;
        }
        return propagate;
    },
    clearCache: function () {
        this.features = null;
    },
    cluster: function (event) {
        if ((!event || event.zoomChanged) && this.features) {
            var resolution = this.layer.map.getResolution();
            if (resolution != this.resolution || !this.clustersExist()) {
                this.resolution = resolution;
                var clusters = [];
                var feature, clustered, cluster;
                for (var i = 0; i < this.features.length; ++i) {
                    feature = this.features[i];
                    if (feature.geometry) {
                        clustered = false;
                        for (var j = clusters.length - 1; j >= 0; --j) {
                            cluster = clusters[j];
                            if (this.shouldCluster(cluster, feature)) {
                                this.addToCluster(cluster, feature);
                                clustered = true;
                                break;
                            }
                        }
                        if (!clustered) {
                            clusters.push(this.createCluster(this.features[i]));
                        }
                    }
                }
                this.layer.removeAllFeatures();
                if (clusters.length > 0) {
                    if (this.threshold > 1) {
                        var clone = clusters.slice();
                        clusters = [];
                        var candidate;
                        for (var i = 0, len = clone.length; i < len; ++i) {
                            candidate = clone[i];
                            if (candidate.attributes.count < this.threshold) {
                                Array.prototype.push.apply(clusters, candidate.cluster);
                            } else {
                                clusters.push(candidate);
                            }
                        }
                    }
                    this.clustering = true;
                    this.layer.addFeatures(clusters);
                    this.clustering = false;
                }
                this.clusters = clusters;
            }
        }
    },
    clustersExist: function () {
        var exist = false;
        if (this.clusters && this.clusters.length > 0 && this.clusters.length == this.layer.features.length) {
            exist = true;
            for (var i = 0; i < this.clusters.length; ++i) {
                if (this.clusters[i] != this.layer.features[i]) {
                    exist = false;
                    break;
                }
            }
        }
        return exist;
    },
    shouldCluster: function (cluster, feature) {
        var cc = cluster.geometry.getBounds().getCenterLonLat();
        var fc = feature.geometry.getBounds().getCenterLonLat();
        var distance = (Math.sqrt(Math.pow((cc.lon - fc.lon), 2) + Math.pow((cc.lat - fc.lat), 2)) / this.resolution);
        return (distance <= this.distance);
    },
    addToCluster: function (cluster, feature) {
        cluster.cluster.push(feature);
        cluster.attributes.count += 1;
    },
    createCluster: function (feature) {
        var center = feature.geometry.getBounds().getCenterLonLat();
        var cluster = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(center.lon, center.lat), {
            count: 1
        });
        cluster.cluster = [feature];
        return cluster;
    },
    CLASS_NAME: "OpenLayers.Strategy.Cluster"
});
OpenLayers.Handler.Feature = OpenLayers.Class(OpenLayers.Handler, {
    EVENTMAP: {
        'click': {
            'in': 'click',
            'out': 'clickout'
        },
        'mousemove': {
            'in': 'over',
            'out': 'out'
        },
        'dblclick': {
            'in': 'dblclick',
            'out': null
        },
        'mousedown': {
            'in': null,
            'out': null
        },
        'mouseup': {
            'in': null,
            'out': null
        },
        'touchstart': {
            'in': 'click',
            'out': 'clickout'
        }
    },
    feature: null,
    lastFeature: null,
    down: null,
    up: null,
    touch: false,
    clickTolerance: 4,
    geometryTypes: null,
    stopClick: true,
    stopDown: true,
    stopUp: false,
    initialize: function (control, layer, callbacks, options) {
        OpenLayers.Handler.prototype.initialize.apply(this, [control, callbacks, options]);
        this.layer = layer;
    },
    touchstart: function (evt) {
        if (!this.touch) {
            this.touch = true;
            this.map.events.un({
                mousedown: this.mousedown,
                mouseup: this.mouseup,
                mousemove: this.mousemove,
                click: this.click,
                dblclick: this.dblclick,
                scope: this
            });
        }
        return OpenLayers.Event.isMultiTouch(evt) ? true : this.mousedown(evt);
    },
    touchmove: function (evt) {
        OpenLayers.Event.stop(evt);
    },
    mousedown: function (evt) {
        this.down = evt.xy;
        return this.handle(evt) ? !this.stopDown : true;
    },
    mouseup: function (evt) {
        this.up = evt.xy;
        return this.handle(evt) ? !this.stopUp : true;
    },
    click: function (evt) {
        return this.handle(evt) ? !this.stopClick : true;
    },
    mousemove: function (evt) {
        if (!this.callbacks['over'] && !this.callbacks['out']) {
            return true;
        }
        this.handle(evt);
        return true;
    },
    dblclick: function (evt) {
        return !this.handle(evt);
    },
    geometryTypeMatches: function (feature) {
        return this.geometryTypes == null || OpenLayers.Util.indexOf(this.geometryTypes, feature.geometry.CLASS_NAME) > -1;
    },
    handle: function (evt) {
        if (this.feature && !this.feature.layer) {
            this.feature = null;
        }
        var type = evt.type;
        var handled = false;
        var previouslyIn = !! (this.feature);
        var click = (type == "click" || type == "dblclick" || type == "touchstart");
        this.feature = this.layer.getFeatureFromEvent(evt);
        if (this.feature && !this.feature.layer) {
            this.feature = null;
        }
        if (this.lastFeature && !this.lastFeature.layer) {
            this.lastFeature = null;
        }
        if (this.feature) {
            if (type === "touchstart") {
                OpenLayers.Event.stop(evt);
            }
            var inNew = (this.feature != this.lastFeature);
            if (this.geometryTypeMatches(this.feature)) {
                if (previouslyIn && inNew) {
                    if (this.lastFeature) {
                        this.triggerCallback(type, 'out', [this.lastFeature]);
                    }
                    this.triggerCallback(type, 'in', [this.feature]);
                } else if (!previouslyIn || click) {
                    this.triggerCallback(type, 'in', [this.feature]);
                }
                this.lastFeature = this.feature;
                handled = true;
            } else {
                if (this.lastFeature && (previouslyIn && inNew || click)) {
                    this.triggerCallback(type, 'out', [this.lastFeature]);
                }
                this.feature = null;
            }
        } else {
            if (this.lastFeature && (previouslyIn || click)) {
                this.triggerCallback(type, 'out', [this.lastFeature]);
            }
        }
        return handled;
    },
    triggerCallback: function (type, mode, args) {
        var key = this.EVENTMAP[type][mode];
        if (key) {
            if (type == 'click' && this.up && this.down) {
                var dpx = Math.sqrt(Math.pow(this.up.x - this.down.x, 2) + Math.pow(this.up.y - this.down.y, 2));
                if (dpx <= this.clickTolerance) {
                    this.callback(key, args);
                }
            } else {
                this.callback(key, args);
            }
        }
    },
    activate: function () {
        var activated = false;
        if (OpenLayers.Handler.prototype.activate.apply(this, arguments)) {
            this.moveLayerToTop();
            this.map.events.on({
                "removelayer": this.handleMapEvents,
                "changelayer": this.handleMapEvents,
                scope: this
            });
            activated = true;
        }
        return activated;
    },
    deactivate: function () {
        var deactivated = false;
        if (OpenLayers.Handler.prototype.deactivate.apply(this, arguments)) {
            this.moveLayerBack();
            this.feature = null;
            this.lastFeature = null;
            this.down = null;
            this.up = null;
            this.touch = false;
            this.map.events.un({
                "removelayer": this.handleMapEvents,
                "changelayer": this.handleMapEvents,
                scope: this
            });
            deactivated = true;
        }
        return deactivated;
    },
    handleMapEvents: function (evt) {
        if (evt.type == "removelayer" || evt.property == "order") {
            this.moveLayerToTop();
        }
    },
    moveLayerToTop: function () {
        var index = Math.max(this.map.Z_INDEX_BASE['Feature'] - 1, this.layer.getZIndex()) + 1;
        this.layer.setZIndex(index);
    },
    moveLayerBack: function () {
        var index = this.layer.getZIndex() - 1;
        if (index >= this.map.Z_INDEX_BASE['Feature']) {
            this.layer.setZIndex(index);
        } else {
            this.map.setLayerZIndex(this.layer, this.map.getLayerIndex(this.layer));
        }
    },
    CLASS_NAME: "OpenLayers.Handler.Feature"
});
OpenLayers.ProxyHost = "";
OpenLayers.nullHandler = function (request) {
    OpenLayers.Console.userError(OpenLayers.i18n("unhandledRequest", {
        'statusText': request.statusText
    }));
};
OpenLayers.loadURL = function (uri, params, caller, onComplete, onFailure) {
    if (typeof params == 'string') {
        params = OpenLayers.Util.getParameters(params);
    }
    var success = (onComplete) ? onComplete : OpenLayers.nullHandler;
    var failure = (onFailure) ? onFailure : OpenLayers.nullHandler;
    return OpenLayers.Request.GET({
        url: uri,
        params: params,
        success: success,
        failure: failure,
        scope: caller
    });
};
OpenLayers.parseXMLString = function (text) {
    var index = text.indexOf('<');
    if (index > 0) {
        text = text.substring(index);
    }
    var ajaxResponse = OpenLayers.Util.Try(function () {
        var xmldom = new ActiveXObject('Microsoft.XMLDOM');
        xmldom.loadXML(text);
        return xmldom;
    }, function () {
        return new DOMParser().parseFromString(text, 'text/xml');
    }, function () {
        var req = new XMLHttpRequest();
        req.open("GET", "data:" + "text/xml" + ";charset=utf-8," + encodeURIComponent(text), false);
        if (req.overrideMimeType) {
            req.overrideMimeType("text/xml");
        }
        req.send(null);
        return req.responseXML;
    });
    return ajaxResponse;
};
OpenLayers.Ajax = {
    emptyFunction: function () {},
    getTransport: function () {
        return OpenLayers.Util.Try(function () {
            return new XMLHttpRequest();
        }, function () {
            return new ActiveXObject('Msxml2.XMLHTTP');
        }, function () {
            return new ActiveXObject('Microsoft.XMLHTTP');
        }) || false;
    },
    activeRequestCount: 0
};
OpenLayers.Ajax.Responders = {
    responders: [],
    register: function (responderToAdd) {
        for (var i = 0; i < this.responders.length; i++) {
            if (responderToAdd == this.responders[i]) {
                return;
            }
        }
        this.responders.push(responderToAdd);
    },
    unregister: function (responderToRemove) {
        OpenLayers.Util.removeItem(this.reponders, responderToRemove);
    },
    dispatch: function (callback, request, transport) {
        var responder;
        for (var i = 0; i < this.responders.length; i++) {
            responder = this.responders[i];
            if (responder[callback] && typeof responder[callback] == 'function') {
                try {
                    responder[callback].apply(responder, [request, transport]);
                } catch (e) {}
            }
        }
    }
};
OpenLayers.Ajax.Responders.register({
    onCreate: function () {
        OpenLayers.Ajax.activeRequestCount++;
    },
    onComplete: function () {
        OpenLayers.Ajax.activeRequestCount--;
    }
});
OpenLayers.Ajax.Base = OpenLayers.Class({
    initialize: function (options) {
        this.options = {
            method: 'post',
            asynchronous: true,
            contentType: 'application/xml',
            parameters: ''
        };
        OpenLayers.Util.extend(this.options, options || {});
        this.options.method = this.options.method.toLowerCase();
        if (typeof this.options.parameters == 'string') {
            this.options.parameters = OpenLayers.Util.getParameters(this.options.parameters);
        }
    }
});
OpenLayers.Ajax.Request = OpenLayers.Class(OpenLayers.Ajax.Base, {
    _complete: false,
    initialize: function (url, options) {
        OpenLayers.Ajax.Base.prototype.initialize.apply(this, [options]);
        if (OpenLayers.ProxyHost && OpenLayers.String.startsWith(url, "http")) {
            url = OpenLayers.ProxyHost + encodeURIComponent(url);
        }
        this.transport = OpenLayers.Ajax.getTransport();
        this.request(url);
    },
    request: function (url) {
        this.url = url;
        this.method = this.options.method;
        var params = OpenLayers.Util.extend({}, this.options.parameters);
        if (this.method != 'get' && this.method != 'post') {
            params['_method'] = this.method;
            this.method = 'post';
        }
        this.parameters = params;
        if (params = OpenLayers.Util.getParameterString(params)) {
            if (this.method == 'get') {
                this.url += ((this.url.indexOf('?') > -1) ? '&' : '?') + params;
            } else if (/Konqueror|Safari|KHTML/.test(navigator.userAgent)) {
                params += '&_=';
            }
        }
        try {
            var response = new OpenLayers.Ajax.Response(this);
            if (this.options.onCreate) {
                this.options.onCreate(response);
            }
            OpenLayers.Ajax.Responders.dispatch('onCreate', this, response);
            this.transport.open(this.method.toUpperCase(), this.url, this.options.asynchronous);
            if (this.options.asynchronous) {
                window.setTimeout(OpenLayers.Function.bind(this.respondToReadyState, this, 1), 10);
            }
            this.transport.onreadystatechange = OpenLayers.Function.bind(this.onStateChange, this);
            this.setRequestHeaders();
            this.body = this.method == 'post' ? (this.options.postBody || params) : null;
            this.transport.send(this.body);
            if (!this.options.asynchronous && this.transport.overrideMimeType) {
                this.onStateChange();
            }
        } catch (e) {
            this.dispatchException(e);
        }
    },
    onStateChange: function () {
        var readyState = this.transport.readyState;
        if (readyState > 1 && !((readyState == 4) && this._complete)) {
            this.respondToReadyState(this.transport.readyState);
        }
    },
    setRequestHeaders: function () {
        var headers = {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'text/javascript, text/html, application/xml, text/xml, */*',
            'OpenLayers': true
        };
        if (this.method == 'post') {
            headers['Content-type'] = this.options.contentType + (this.options.encoding ? '; charset=' + this.options.encoding : '');
            if (this.transport.overrideMimeType && (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0, 2005])[1] < 2005) {
                headers['Connection'] = 'close';
            }
        }
        if (typeof this.options.requestHeaders == 'object') {
            var extras = this.options.requestHeaders;
            if (typeof extras.push == 'function') {
                for (var i = 0, length = extras.length; i < length; i += 2) {
                    headers[extras[i]] = extras[i + 1];
                }
            } else {
                for (var i in extras) {
                    headers[i] = extras[i];
                }
            }
        }
        for (var name in headers) {
            this.transport.setRequestHeader(name, headers[name]);
        }
    },
    success: function () {
        var status = this.getStatus();
        return !status || (status >= 200 && status < 300);
    },
    getStatus: function () {
        try {
            return this.transport.status || 0;
        } catch (e) {
            return 0;
        }
    },
    respondToReadyState: function (readyState) {
        var state = OpenLayers.Ajax.Request.Events[readyState];
        var response = new OpenLayers.Ajax.Response(this);
        if (state == 'Complete') {
            try {
                this._complete = true;
                (this.options['on' + response.status] || this.options['on' + (this.success() ? 'Success' : 'Failure')] || OpenLayers.Ajax.emptyFunction)(response);
            } catch (e) {
                this.dispatchException(e);
            }
            var contentType = response.getHeader('Content-type');
        }
        try {
            (this.options['on' + state] || OpenLayers.Ajax.emptyFunction)(response);
            OpenLayers.Ajax.Responders.dispatch('on' + state, this, response);
        } catch (e) {
            this.dispatchException(e);
        }
        if (state == 'Complete') {
            this.transport.onreadystatechange = OpenLayers.Ajax.emptyFunction;
        }
    },
    getHeader: function (name) {
        try {
            return this.transport.getResponseHeader(name);
        } catch (e) {
            return null;
        }
    },
    dispatchException: function (exception) {
        var handler = this.options.onException;
        if (handler) {
            handler(this, exception);
            OpenLayers.Ajax.Responders.dispatch('onException', this, exception);
        } else {
            var listener = false;
            var responders = OpenLayers.Ajax.Responders.responders;
            for (var i = 0; i < responders.length; i++) {
                if (responders[i].onException) {
                    listener = true;
                    break;
                }
            }
            if (listener) {
                OpenLayers.Ajax.Responders.dispatch('onException', this, exception);
            } else {
                throw exception;
            }
        }
    }
});
OpenLayers.Ajax.Request.Events = ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];
OpenLayers.Ajax.Response = OpenLayers.Class({
    status: 0,
    statusText: '',
    initialize: function (request) {
        this.request = request;
        var transport = this.transport = request.transport,
            readyState = this.readyState = transport.readyState;
        if ((readyState > 2 && !( !! (window.attachEvent && !window.opera))) || readyState == 4) {
            this.status = this.getStatus();
            this.statusText = this.getStatusText();
            this.responseText = transport.responseText == null ? '' : String(transport.responseText);
        }
        if (readyState == 4) {
            var xml = transport.responseXML;
            this.responseXML = xml === undefined ? null : xml;
        }
    },
    getStatus: OpenLayers.Ajax.Request.prototype.getStatus,
    getStatusText: function () {
        try {
            return this.transport.statusText || '';
        } catch (e) {
            return '';
        }
    },
    getHeader: OpenLayers.Ajax.Request.prototype.getHeader,
    getResponseHeader: function (name) {
        return this.transport.getResponseHeader(name);
    }
});
OpenLayers.Ajax.getElementsByTagNameNS = function (parentnode, nsuri, nsprefix, tagname) {
    var elem = null;
    if (parentnode.getElementsByTagNameNS) {
        elem = parentnode.getElementsByTagNameNS(nsuri, tagname);
    } else {
        elem = parentnode.getElementsByTagName(nsprefix + ':' + tagname);
    }
    return elem;
};
OpenLayers.Ajax.serializeXMLToString = function (xmldom) {
    var serializer = new XMLSerializer();
    var data = serializer.serializeToString(xmldom);
    return data;
};
OpenLayers.Format.XML = OpenLayers.Class(OpenLayers.Format, {
    namespaces: null,
    namespaceAlias: null,
    defaultPrefix: null,
    readers: {},
    writers: {},
    xmldom: null,
    initialize: function (options) {
        if (window.ActiveXObject) {
            this.xmldom = new ActiveXObject("Microsoft.XMLDOM");
        }
        OpenLayers.Format.prototype.initialize.apply(this, [options]);
        this.namespaces = OpenLayers.Util.extend({}, this.namespaces);
        this.namespaceAlias = {};
        for (var alias in this.namespaces) {
            this.namespaceAlias[this.namespaces[alias]] = alias;
        }
    },
    destroy: function () {
        this.xmldom = null;
        OpenLayers.Format.prototype.destroy.apply(this, arguments);
    },
    setNamespace: function (alias, uri) {
        this.namespaces[alias] = uri;
        this.namespaceAlias[uri] = alias;
    },
    read: function (text) {
        var index = text.indexOf('<');
        if (index > 0) {
            text = text.substring(index);
        }
        var node = OpenLayers.Util.Try(OpenLayers.Function.bind((function () {
            var xmldom;
            if (window.ActiveXObject && !this.xmldom) {
                xmldom = new ActiveXObject("Microsoft.XMLDOM");
            } else {
                xmldom = this.xmldom;
            }
            xmldom.loadXML(text);
            return xmldom;
        }), this), function () {
            return new DOMParser().parseFromString(text, 'text/xml');
        }, function () {
            var req = new XMLHttpRequest();
            req.open("GET", "data:" + "text/xml" + ";charset=utf-8," + encodeURIComponent(text), false);
            if (req.overrideMimeType) {
                req.overrideMimeType("text/xml");
            }
            req.send(null);
            return req.responseXML;
        });
        if (this.keepData) {
            this.data = node;
        }
        return node;
    },
    write: function (node) {
        var data;
        if (this.xmldom) {
            data = node.xml;
        } else {
            var serializer = new XMLSerializer();
            if (node.nodeType == 1) {
                var doc = document.implementation.createDocument("", "", null);
                if (doc.importNode) {
                    node = doc.importNode(node, true);
                }
                doc.appendChild(node);
                data = serializer.serializeToString(doc);
            } else {
                data = serializer.serializeToString(node);
            }
        }
        return data;
    },
    createElementNS: function (uri, name) {
        var element;
        if (this.xmldom) {
            if (typeof uri == "string") {
                element = this.xmldom.createNode(1, name, uri);
            } else {
                element = this.xmldom.createNode(1, name, "");
            }
        } else {
            element = document.createElementNS(uri, name);
        }
        return element;
    },
    createTextNode: function (text) {
        var node;
        if (typeof text !== "string") {
            text = String(text);
        }
        if (this.xmldom) {
            node = this.xmldom.createTextNode(text);
        } else {
            node = document.createTextNode(text);
        }
        return node;
    },
    getElementsByTagNameNS: function (node, uri, name) {
        var elements = [];
        if (node.getElementsByTagNameNS) {
            elements = node.getElementsByTagNameNS(uri, name);
        } else {
            var allNodes = node.getElementsByTagName("*");
            var potentialNode, fullName;
            for (var i = 0, len = allNodes.length; i < len; ++i) {
                potentialNode = allNodes[i];
                fullName = (potentialNode.prefix) ? (potentialNode.prefix + ":" + name) : name;
                if ((name == "*") || (fullName == potentialNode.nodeName)) {
                    if ((uri == "*") || (uri == potentialNode.namespaceURI)) {
                        elements.push(potentialNode);
                    }
                }
            }
        }
        return elements;
    },
    getAttributeNodeNS: function (node, uri, name) {
        var attributeNode = null;
        if (node.getAttributeNodeNS) {
            attributeNode = node.getAttributeNodeNS(uri, name);
        } else {
            var attributes = node.attributes;
            var potentialNode, fullName;
            for (var i = 0, len = attributes.length; i < len; ++i) {
                potentialNode = attributes[i];
                if (potentialNode.namespaceURI == uri) {
                    fullName = (potentialNode.prefix) ? (potentialNode.prefix + ":" + name) : name;
                    if (fullName == potentialNode.nodeName) {
                        attributeNode = potentialNode;
                        break;
                    }
                }
            }
        }
        return attributeNode;
    },
    getAttributeNS: function (node, uri, name) {
        var attributeValue = "";
        if (node.getAttributeNS) {
            attributeValue = node.getAttributeNS(uri, name) || "";
        } else {
            var attributeNode = this.getAttributeNodeNS(node, uri, name);
            if (attributeNode) {
                attributeValue = attributeNode.nodeValue;
            }
        }
        return attributeValue;
    },
    getChildValue: function (node, def) {
        var value = def || "";
        if (node) {
            for (var child = node.firstChild; child; child = child.nextSibling) {
                switch (child.nodeType) {
                case 3:
                case 4:
                    value += child.nodeValue;
                }
            }
        }
        return value;
    },
    concatChildValues: function (node, def) {
        var value = "";
        var child = node.firstChild;
        var childValue;
        while (child) {
            childValue = child.nodeValue;
            if (childValue) {
                value += childValue;
            }
            child = child.nextSibling;
        }
        if (value == "" && def != undefined) {
            value = def;
        }
        return value;
    },
    isSimpleContent: function (node) {
        var simple = true;
        for (var child = node.firstChild; child; child = child.nextSibling) {
            if (child.nodeType === 1) {
                simple = false;
                break;
            }
        }
        return simple;
    },
    contentType: function (node) {
        var simple = false,
            complex = false;
        var type = OpenLayers.Format.XML.CONTENT_TYPE.EMPTY;
        for (var child = node.firstChild; child; child = child.nextSibling) {
            switch (child.nodeType) {
            case 1:
                complex = true;
                break;
            case 8:
                break;
            default:
                simple = true;
            }
            if (complex && simple) {
                break;
            }
        }
        if (complex && simple) {
            type = OpenLayers.Format.XML.CONTENT_TYPE.MIXED;
        } else if (complex) {
            return OpenLayers.Format.XML.CONTENT_TYPE.COMPLEX;
        } else if (simple) {
            return OpenLayers.Format.XML.CONTENT_TYPE.SIMPLE;
        }
        return type;
    },
    hasAttributeNS: function (node, uri, name) {
        var found = false;
        if (node.hasAttributeNS) {
            found = node.hasAttributeNS(uri, name);
        } else {
            found = !! this.getAttributeNodeNS(node, uri, name);
        }
        return found;
    },
    setAttributeNS: function (node, uri, name, value) {
        if (node.setAttributeNS) {
            node.setAttributeNS(uri, name, value);
        } else {
            if (this.xmldom) {
                if (uri) {
                    var attribute = node.ownerDocument.createNode(2, name, uri);
                    attribute.nodeValue = value;
                    node.setAttributeNode(attribute);
                } else {
                    node.setAttribute(name, value);
                }
            } else {
                throw "setAttributeNS not implemented";
            }
        }
    },
    createElementNSPlus: function (name, options) {
        options = options || {};
        var uri = options.uri || this.namespaces[options.prefix];
        if (!uri) {
            var loc = name.indexOf(":");
            uri = this.namespaces[name.substring(0, loc)];
        }
        if (!uri) {
            uri = this.namespaces[this.defaultPrefix];
        }
        var node = this.createElementNS(uri, name);
        if (options.attributes) {
            this.setAttributes(node, options.attributes);
        }
        var value = options.value;
        if (value != null) {
            node.appendChild(this.createTextNode(value));
        }
        return node;
    },
    setAttributes: function (node, obj) {
        var value, uri;
        for (var name in obj) {
            if (obj[name] != null && obj[name].toString) {
                value = obj[name].toString();
                uri = this.namespaces[name.substring(0, name.indexOf(":"))] || null;
                this.setAttributeNS(node, uri, name, value);
            }
        }
    },
    readNode: function (node, obj) {
        if (!obj) {
            obj = {};
        }
        var group = this.readers[node.namespaceURI ? this.namespaceAlias[node.namespaceURI] : this.defaultPrefix];
        if (group) {
            var local = node.localName || node.nodeName.split(":").pop();
            var reader = group[local] || group["*"];
            if (reader) {
                reader.apply(this, [node, obj]);
            }
        }
        return obj;
    },
    readChildNodes: function (node, obj) {
        if (!obj) {
            obj = {};
        }
        var children = node.childNodes;
        var child;
        for (var i = 0, len = children.length; i < len; ++i) {
            child = children[i];
            if (child.nodeType == 1) {
                this.readNode(child, obj);
            }
        }
        return obj;
    },
    writeNode: function (name, obj, parent) {
        var prefix, local;
        var split = name.indexOf(":");
        if (split > 0) {
            prefix = name.substring(0, split);
            local = name.substring(split + 1);
        } else {
            if (parent) {
                prefix = this.namespaceAlias[parent.namespaceURI];
            } else {
                prefix = this.defaultPrefix;
            }
            local = name;
        }
        var child = this.writers[prefix][local].apply(this, [obj]);
        if (parent) {
            parent.appendChild(child);
        }
        return child;
    },
    getChildEl: function (node, name, uri) {
        return node && this.getThisOrNextEl(node.firstChild, name, uri);
    },
    getNextEl: function (node, name, uri) {
        return node && this.getThisOrNextEl(node.nextSibling, name, uri);
    },
    getThisOrNextEl: function (node, name, uri) {
        outer: for (var sibling = node; sibling; sibling = sibling.nextSibling) {
            switch (sibling.nodeType) {
            case 1:
                if ((!name || name === (sibling.localName || sibling.nodeName.split(":").pop())) && (!uri || uri === sibling.namespaceURI)) {
                    break outer;
                }
                sibling = null;
                break outer;
            case 3:
                if (/^\s*$/.test(sibling.nodeValue)) {
                    break;
                }
            case 4:
            case 6:
            case 12:
            case 10:
            case 11:
                sibling = null;
                break outer;
            }
        }
        return sibling || null;
    },
    lookupNamespaceURI: function (node, prefix) {
        var uri = null;
        if (node) {
            if (node.lookupNamespaceURI) {
                uri = node.lookupNamespaceURI(prefix);
            } else {
                outer: switch (node.nodeType) {
                case 1:
                    if (node.namespaceURI !== null && node.prefix === prefix) {
                        uri = node.namespaceURI;
                        break outer;
                    }
                    var len = node.attributes.length;
                    if (len) {
                        var attr;
                        for (var i = 0; i < len; ++i) {
                            attr = node.attributes[i];
                            if (attr.prefix === "xmlns" && attr.name === "xmlns:" + prefix) {
                                uri = attr.value || null;
                                break outer;
                            } else if (attr.name === "xmlns" && prefix === null) {
                                uri = attr.value || null;
                                break outer;
                            }
                        }
                    }
                    uri = this.lookupNamespaceURI(node.parentNode, prefix);
                    break outer;
                case 2:
                    uri = this.lookupNamespaceURI(node.ownerElement, prefix);
                    break outer;
                case 9:
                    uri = this.lookupNamespaceURI(node.documentElement, prefix);
                    break outer;
                case 6:
                case 12:
                case 10:
                case 11:
                    break outer;
                default:
                    uri = this.lookupNamespaceURI(node.parentNode, prefix);
                    break outer;
                }
            }
        }
        return uri;
    },
    getXMLDoc: function () {
        if (!OpenLayers.Format.XML.document && !this.xmldom) {
            if (document.implementation && document.implementation.createDocument) {
                OpenLayers.Format.XML.document = document.implementation.createDocument("", "", null);
            } else if (!this.xmldom && window.ActiveXObject) {
                this.xmldom = new ActiveXObject("Microsoft.XMLDOM");
            }
        }
        return OpenLayers.Format.XML.document || this.xmldom;
    },
    CLASS_NAME: "OpenLayers.Format.XML"
});
OpenLayers.Format.XML.CONTENT_TYPE = {
    EMPTY: 0,
    SIMPLE: 1,
    COMPLEX: 2,
    MIXED: 3
};
OpenLayers.Format.XML.lookupNamespaceURI = OpenLayers.Function.bind(OpenLayers.Format.XML.prototype.lookupNamespaceURI, OpenLayers.Format.XML.prototype);
OpenLayers.Format.XML.document = null;
OpenLayers.Format.KML = OpenLayers.Class(OpenLayers.Format.XML, {
    namespaces: {
        kml: "http://www.opengis.net/kml/2.2",
        gx: "http://www.google.com/kml/ext/2.2"
    },
    kmlns: "http://earth.google.com/kml/2.0",
    placemarksDesc: "No description available",
    foldersName: "OpenLayers export",
    foldersDesc: "Exported on " + new Date(),
    extractAttributes: true,
    extractStyles: false,
    extractTracks: false,
    trackAttributes: null,
    internalns: null,
    features: null,
    styles: null,
    styleBaseUrl: "",
    fetched: null,
    maxDepth: 0,
    initialize: function (options) {
        this.regExes = {
            trimSpace: (/^\s*|\s*$/g),
            removeSpace: (/\s*/g),
            splitSpace: (/\s+/),
            trimComma: (/\s*,\s*/g),
            kmlColor: (/(\w{2})(\w{2})(\w{2})(\w{2})/),
            kmlIconPalette: (/root:\/\/icons\/palette-(\d+)(\.\w+)/),
            straightBracket: (/\$\[(.*?)\]/g)
        };
        this.externalProjection = new OpenLayers.Projection("EPSG:4326");
        OpenLayers.Format.XML.prototype.initialize.apply(this, [options]);
    },
    read: function (data) {
        this.features = [];
        this.styles = {};
        this.fetched = {};
        var options = {
            depth: 0,
            styleBaseUrl: this.styleBaseUrl
        };
        return this.parseData(data, options);
    },
    parseData: function (data, options) {
        if (typeof data == "string") {
            data = OpenLayers.Format.XML.prototype.read.apply(this, [data]);
        }
        var types = ["Link", "NetworkLink", "Style", "StyleMap", "Placemark"];
        for (var i = 0, len = types.length; i < len; ++i) {
            var type = types[i];
            var nodes = this.getElementsByTagNameNS(data, "*", type);
            if (nodes.length == 0) {
                continue;
            }
            switch (type.toLowerCase()) {
            case "link":
            case "networklink":
                this.parseLinks(nodes, options);
                break;
            case "style":
                if (this.extractStyles) {
                    this.parseStyles(nodes, options);
                }
                break;
            case "stylemap":
                if (this.extractStyles) {
                    this.parseStyleMaps(nodes, options);
                }
                break;
            case "placemark":
                this.parseFeatures(nodes, options);
                break;
            }
        }
        return this.features;
    },
    parseLinks: function (nodes, options) {
        if (options.depth >= this.maxDepth) {
            return false;
        }
        var newOptions = OpenLayers.Util.extend({}, options);
        newOptions.depth++;
        for (var i = 0, len = nodes.length; i < len; i++) {
            var href = this.parseProperty(nodes[i], "*", "href");
            if (href && !this.fetched[href]) {
                this.fetched[href] = true;
                var data = this.fetchLink(href);
                if (data) {
                    this.parseData(data, newOptions);
                }
            }
        }
    },
    fetchLink: function (href) {
        var request = OpenLayers.Request.GET({
            url: href,
            async: false
        });
        if (request) {
            return request.responseText;
        }
    },
    parseStyles: function (nodes, options) {
        for (var i = 0, len = nodes.length; i < len; i++) {
            var style = this.parseStyle(nodes[i]);
            if (style) {
                var styleName = (options.styleBaseUrl || "") + "#" + style.id;
                this.styles[styleName] = style;
            }
        }
    },
    parseKmlColor: function (kmlColor) {
        var color = null;
        if (kmlColor) {
            var matches = kmlColor.match(this.regExes.kmlColor);
            if (matches) {
                color = {
                    color: '#' + matches[4] + matches[3] + matches[2],
                    opacity: parseInt(matches[1], 16) / 255
                };
            }
        }
        return color;
    },
    parseStyle: function (node) {
        var style = {};
        var types = ["LineStyle", "PolyStyle", "IconStyle", "BalloonStyle", "LabelStyle"];
        var type, styleTypeNode, nodeList, geometry, parser;
        for (var i = 0, len = types.length; i < len; ++i) {
            type = types[i];
            styleTypeNode = this.getElementsByTagNameNS(node, "*", type)[0];
            if (!styleTypeNode) {
                continue;
            }
            switch (type.toLowerCase()) {
            case "linestyle":
                var kmlColor = this.parseProperty(styleTypeNode, "*", "color");
                var color = this.parseKmlColor(kmlColor);
                if (color) {
                    style["strokeColor"] = color.color;
                    style["strokeOpacity"] = color.opacity;
                }
                var width = this.parseProperty(styleTypeNode, "*", "width");
                if (width) {
                    style["strokeWidth"] = width;
                }
                break;
            case "polystyle":
                var kmlColor = this.parseProperty(styleTypeNode, "*", "color");
                var color = this.parseKmlColor(kmlColor);
                if (color) {
                    style["fillOpacity"] = color.opacity;
                    style["fillColor"] = color.color;
                }
                var fill = this.parseProperty(styleTypeNode, "*", "fill");
                if (fill == "0") {
                    style["fillColor"] = "none";
                }
                var outline = this.parseProperty(styleTypeNode, "*", "outline");
                if (outline == "0") {
                    style["strokeWidth"] = "0";
                }
                break;
            case "iconstyle":
                var scale = parseFloat(this.parseProperty(styleTypeNode, "*", "scale") || 1);
                var width = 32 * scale;
                var height = 32 * scale;
                var iconNode = this.getElementsByTagNameNS(styleTypeNode, "*", "Icon")[0];
                if (iconNode) {
                    var href = this.parseProperty(iconNode, "*", "href");
                    if (href) {
                        var w = this.parseProperty(iconNode, "*", "w");
                        var h = this.parseProperty(iconNode, "*", "h");
                        var google = "http://maps.google.com/mapfiles/kml";
                        if (OpenLayers.String.startsWith(href, google) && !w && !h) {
                            w = 64;
                            h = 64;
                            scale = scale / 2;
                        }
                        w = w || h;
                        h = h || w;
                        if (w) {
                            width = parseInt(w) * scale;
                        }
                        if (h) {
                            height = parseInt(h) * scale;
                        }
                        var matches = href.match(this.regExes.kmlIconPalette);
                        if (matches) {
                            var palette = matches[1];
                            var file_extension = matches[2];
                            var x = this.parseProperty(iconNode, "*", "x");
                            var y = this.parseProperty(iconNode, "*", "y");
                            var posX = x ? x / 32 : 0;
                            var posY = y ? (7 - y / 32) : 7;
                            var pos = posY * 8 + posX;
                            href = "http://maps.google.com/mapfiles/kml/pal" + palette + "/icon" + pos + file_extension;
                        }
                        style["graphicOpacity"] = 1;
                        style["externalGraphic"] = href;
                    }
                }
                var hotSpotNode = this.getElementsByTagNameNS(styleTypeNode, "*", "hotSpot")[0];
                if (hotSpotNode) {
                    var x = parseFloat(hotSpotNode.getAttribute("x"));
                    var y = parseFloat(hotSpotNode.getAttribute("y"));
                    var xUnits = hotSpotNode.getAttribute("xunits");
                    if (xUnits == "pixels") {
                        style["graphicXOffset"] = -x * scale;
                    } else if (xUnits == "insetPixels") {
                        style["graphicXOffset"] = -width + (x * scale);
                    } else if (xUnits == "fraction") {
                        style["graphicXOffset"] = -width * x;
                    }
                    var yUnits = hotSpotNode.getAttribute("yunits");
                    if (yUnits == "pixels") {
                        style["graphicYOffset"] = -height + (y * scale) + 1;
                    } else if (yUnits == "insetPixels") {
                        style["graphicYOffset"] = -(y * scale) + 1;
                    } else if (yUnits == "fraction") {
                        style["graphicYOffset"] = -height * (1 - y) + 1;
                    }
                }
                style["graphicWidth"] = width;
                style["graphicHeight"] = height;
                break;
            case "balloonstyle":
                var balloonStyle = OpenLayers.Util.getXmlNodeValue(styleTypeNode);
                if (balloonStyle) {
                    style["balloonStyle"] = balloonStyle.replace(this.regExes.straightBracket, "${$1}");
                }
                break;
            case "labelstyle":
                var kmlColor = this.parseProperty(styleTypeNode, "*", "color");
                var color = this.parseKmlColor(kmlColor);
                if (color) {
                    style["fontColor"] = color.color;
                    style["fontOpacity"] = color.opacity;
                }
                break;
            default:
            }
        }
        if (!style["strokeColor"] && style["fillColor"]) {
            style["strokeColor"] = style["fillColor"];
        }
        var id = node.getAttribute("id");
        if (id && style) {
            style.id = id;
        }
        return style;
    },
    parseStyleMaps: function (nodes, options) {
        for (var i = 0, len = nodes.length; i < len; i++) {
            var node = nodes[i];
            var pairs = this.getElementsByTagNameNS(node, "*", "Pair");
            var id = node.getAttribute("id");
            for (var j = 0, jlen = pairs.length; j < jlen; j++) {
                var pair = pairs[j];
                var key = this.parseProperty(pair, "*", "key");
                var styleUrl = this.parseProperty(pair, "*", "styleUrl");
                if (styleUrl && key == "normal") {
                    this.styles[(options.styleBaseUrl || "") + "#" + id] = this.styles[(options.styleBaseUrl || "") + styleUrl];
                }
                if (styleUrl && key == "highlight") {}
            }
        }
    },
    parseFeatures: function (nodes, options) {
        var features = [];
        for (var i = 0, len = nodes.length; i < len; i++) {
            var featureNode = nodes[i];
            var feature = this.parseFeature.apply(this, [featureNode]);
            if (feature) {
                if (this.extractStyles && feature.attributes && feature.attributes.styleUrl) {
                    feature.style = this.getStyle(feature.attributes.styleUrl, options);
                }
                if (this.extractStyles) {
                    var inlineStyleNode = this.getElementsByTagNameNS(featureNode, "*", "Style")[0];
                    if (inlineStyleNode) {
                        var inlineStyle = this.parseStyle(inlineStyleNode);
                        if (inlineStyle) {
                            feature.style = OpenLayers.Util.extend(feature.style, inlineStyle);
                        }
                    }
                }
                if (this.extractTracks) {
                    var tracks = this.getElementsByTagNameNS(featureNode, this.namespaces.gx, "Track");
                    if (tracks && tracks.length > 0) {
                        var track = tracks[0];
                        var container = {
                            features: [],
                            feature: feature
                        };
                        this.readNode(track, container);
                        if (container.features.length > 0) {
                            features.push.apply(features, container.features);
                        }
                    }
                } else {
                    features.push(feature);
                }
            } else {
                throw "Bad Placemark: " + i;
            }
        }
        this.features = this.features.concat(features);
    },
    readers: {
        "kml": {
            "when": function (node, container) {
                container.whens.push(OpenLayers.Date.parse(this.getChildValue(node)));
            },
            "_trackPointAttribute": function (node, container) {
                var name = node.nodeName.split(":").pop();
                container.attributes[name].push(this.getChildValue(node));
            }
        },
        "gx": {
            "Track": function (node, container) {
                var obj = {
                    whens: [],
                    points: [],
                    angles: []
                };
                if (this.trackAttributes) {
                    var name;
                    obj.attributes = {};
                    for (var i = 0, ii = this.trackAttributes.length; i < ii; ++i) {
                        name = this.trackAttributes[i];
                        obj.attributes[name] = [];
                        if (!(name in this.readers.kml)) {
                            this.readers.kml[name] = this.readers.kml._trackPointAttribute;
                        }
                    }
                }
                this.readChildNodes(node, obj);
                if (obj.whens.length !== obj.points.length) {
                    throw new Error("gx:Track with unequal number of when (" + obj.whens.length + ") and gx:coord (" + obj.points.length + ") elements.");
                }
                var hasAngles = obj.angles.length > 0;
                if (hasAngles && obj.whens.length !== obj.angles.length) {
                    throw new Error("gx:Track with unequal number of when (" + obj.whens.length + ") and gx:angles (" + obj.angles.length + ") elements.");
                }
                var feature, point, angles;
                for (var i = 0, ii = obj.whens.length; i < ii; ++i) {
                    feature = container.feature.clone();
                    feature.fid = container.feature.fid || container.feature.id;
                    point = obj.points[i];
                    feature.geometry = point;
                    if ("z" in point) {
                        feature.attributes.altitude = point.z;
                    }
                    if (this.internalProjection && this.externalProjection) {
                        feature.geometry.transform(this.externalProjection, this.internalProjection);
                    }
                    if (this.trackAttributes) {
                        for (var j = 0, jj = this.trackAttributes.length; j < jj; ++j) {
                            feature.attributes[name] = obj.attributes[this.trackAttributes[j]][i];
                        }
                    }
                    feature.attributes.when = obj.whens[i];
                    feature.attributes.trackId = container.feature.id;
                    if (hasAngles) {
                        angles = obj.angles[i];
                        feature.attributes.heading = parseFloat(angles[0]);
                        feature.attributes.tilt = parseFloat(angles[1]);
                        feature.attributes.roll = parseFloat(angles[2]);
                    }
                    container.features.push(feature);
                }
            },
            "coord": function (node, container) {
                var str = this.getChildValue(node);
                var coords = str.replace(this.regExes.trimSpace, "").split(/\s+/);
                var point = new OpenLayers.Geometry.Point(coords[0], coords[1]);
                if (coords.length > 2) {
                    point.z = parseFloat(coords[2]);
                }
                container.points.push(point);
            },
            "angles": function (node, container) {
                var str = this.getChildValue(node);
                var parts = str.replace(this.regExes.trimSpace, "").split(/\s+/);
                container.angles.push(parts);
            }
        }
    },
    parseFeature: function (node) {
        var order = ["MultiGeometry", "Polygon", "LineString", "Point"];
        var type, nodeList, geometry, parser;
        for (var i = 0, len = order.length; i < len; ++i) {
            type = order[i];
            this.internalns = node.namespaceURI ? node.namespaceURI : this.kmlns;
            nodeList = this.getElementsByTagNameNS(node, this.internalns, type);
            if (nodeList.length > 0) {
                var parser = this.parseGeometry[type.toLowerCase()];
                if (parser) {
                    geometry = parser.apply(this, [nodeList[0]]);
                    if (this.internalProjection && this.externalProjection) {
                        geometry.transform(this.externalProjection, this.internalProjection);
                    }
                } else {
                    OpenLayers.Console.error(OpenLayers.i18n("unsupportedGeometryType", {
                        'geomType': type
                    }));
                }
                break;
            }
        }
        var attributes;
        if (this.extractAttributes) {
            attributes = this.parseAttributes(node);
        }
        var feature = new OpenLayers.Feature.Vector(geometry, attributes);
        var fid = node.getAttribute("id") || node.getAttribute("name");
        if (fid != null) {
            feature.fid = fid;
        }
        return feature;
    },
    getStyle: function (styleUrl, options) {
        var styleBaseUrl = OpenLayers.Util.removeTail(styleUrl);
        var newOptions = OpenLayers.Util.extend({}, options);
        newOptions.depth++;
        newOptions.styleBaseUrl = styleBaseUrl;
        if (!this.styles[styleUrl] && !OpenLayers.String.startsWith(styleUrl, "#") && newOptions.depth <= this.maxDepth && !this.fetched[styleBaseUrl]) {
            var data = this.fetchLink(styleBaseUrl);
            if (data) {
                this.parseData(data, newOptions);
            }
        }
        var style = OpenLayers.Util.extend({}, this.styles[styleUrl]);
        return style;
    },
    parseGeometry: {
        point: function (node) {
            var nodeList = this.getElementsByTagNameNS(node, this.internalns, "coordinates");
            var coords = [];
            if (nodeList.length > 0) {
                var coordString = nodeList[0].firstChild.nodeValue;
                coordString = coordString.replace(this.regExes.removeSpace, "");
                coords = coordString.split(",");
            }
            var point = null;
            if (coords.length > 1) {
                if (coords.length == 2) {
                    coords[2] = null;
                }
                point = new OpenLayers.Geometry.Point(coords[0], coords[1], coords[2]);
            } else {
                throw "Bad coordinate string: " + coordString;
            }
            return point;
        },
        linestring: function (node, ring) {
            var nodeList = this.getElementsByTagNameNS(node, this.internalns, "coordinates");
            var line = null;
            if (nodeList.length > 0) {
                var coordString = this.getChildValue(nodeList[0]);
                coordString = coordString.replace(this.regExes.trimSpace, "");
                coordString = coordString.replace(this.regExes.trimComma, ",");
                var pointList = coordString.split(this.regExes.splitSpace);
                var numPoints = pointList.length;
                var points = new Array(numPoints);
                var coords, numCoords;
                for (var i = 0; i < numPoints; ++i) {
                    coords = pointList[i].split(",");
                    numCoords = coords.length;
                    if (numCoords > 1) {
                        if (coords.length == 2) {
                            coords[2] = null;
                        }
                        points[i] = new OpenLayers.Geometry.Point(coords[0], coords[1], coords[2]);
                    } else {
                        throw "Bad LineString point coordinates: " + pointList[i];
                    }
                }
                if (numPoints) {
                    if (ring) {
                        line = new OpenLayers.Geometry.LinearRing(points);
                    } else {
                        line = new OpenLayers.Geometry.LineString(points);
                    }
                } else {
                    throw "Bad LineString coordinates: " + coordString;
                }
            }
            return line;
        },
        polygon: function (node) {
            var nodeList = this.getElementsByTagNameNS(node, this.internalns, "LinearRing");
            var numRings = nodeList.length;
            var components = new Array(numRings);
            if (numRings > 0) {
                var ring;
                for (var i = 0, len = nodeList.length; i < len; ++i) {
                    ring = this.parseGeometry.linestring.apply(this, [nodeList[i], true]);
                    if (ring) {
                        components[i] = ring;
                    } else {
                        throw "Bad LinearRing geometry: " + i;
                    }
                }
            }
            return new OpenLayers.Geometry.Polygon(components);
        },
        multigeometry: function (node) {
            var child, parser;
            var parts = [];
            var children = node.childNodes;
            for (var i = 0, len = children.length; i < len; ++i) {
                child = children[i];
                if (child.nodeType == 1) {
                    var type = (child.prefix) ? child.nodeName.split(":")[1] : child.nodeName;
                    var parser = this.parseGeometry[type.toLowerCase()];
                    if (parser) {
                        parts.push(parser.apply(this, [child]));
                    }
                }
            }
            return new OpenLayers.Geometry.Collection(parts);
        }
    },
    parseAttributes: function (node) {
        var attributes = {};
        var edNodes = node.getElementsByTagName("ExtendedData");
        if (edNodes.length) {
            attributes = this.parseExtendedData(edNodes[0]);
        }
        var child, grandchildren, grandchild;
        var children = node.childNodes;
        for (var i = 0, len = children.length; i < len; ++i) {
            child = children[i];
            if (child.nodeType == 1) {
                grandchildren = child.childNodes;
                if (grandchildren.length >= 1 && grandchildren.length <= 3) {
                    var grandchild;
                    switch (grandchildren.length) {
                    case 1:
                        grandchild = grandchildren[0];
                        break;
                    case 2:
                        var c1 = grandchildren[0];
                        var c2 = grandchildren[1];
                        grandchild = (c1.nodeType == 3 || c1.nodeType == 4) ? c1 : c2;
                        break;
                    case 3:
                    default:
                        grandchild = grandchildren[1];
                        break;
                    }
                    if (grandchild.nodeType == 3 || grandchild.nodeType == 4) {
                        var name = (child.prefix) ? child.nodeName.split(":")[1] : child.nodeName;
                        var value = OpenLayers.Util.getXmlNodeValue(grandchild);
                        if (value) {
                            value = value.replace(this.regExes.trimSpace, "");
                            attributes[name] = value;
                        }
                    }
                }
            }
        }
        return attributes;
    },
    parseExtendedData: function (node) {
        var attributes = {};
        var i, len, data, key;
        var dataNodes = node.getElementsByTagName("Data");
        for (i = 0, len = dataNodes.length; i < len; i++) {
            data = dataNodes[i];
            key = data.getAttribute("name");
            var ed = {};
            var valueNode = data.getElementsByTagName("value");
            if (valueNode.length) {
                ed['value'] = this.getChildValue(valueNode[0]);
            }
            var nameNode = data.getElementsByTagName("displayName");
            if (nameNode.length) {
                ed['displayName'] = this.getChildValue(nameNode[0]);
            }
            attributes[key] = ed;
        }
        var simpleDataNodes = node.getElementsByTagName("SimpleData");
        for (i = 0, len = simpleDataNodes.length; i < len; i++) {
            var ed = {};
            data = simpleDataNodes[i];
            key = data.getAttribute("name");
            ed['value'] = this.getChildValue(data);
            ed['displayName'] = key;
            attributes[key] = ed;
        }
        return attributes;
    },
    parseProperty: function (xmlNode, namespace, tagName) {
        var value;
        var nodeList = this.getElementsByTagNameNS(xmlNode, namespace, tagName);
        try {
            value = OpenLayers.Util.getXmlNodeValue(nodeList[0]);
        } catch (e) {
            value = null;
        }
        return value;
    },
    write: function (features) {
        if (!(OpenLayers.Util.isArray(features))) {
            features = [features];
        }
        var kml = this.createElementNS(this.kmlns, "kml");
        var folder = this.createFolderXML();
        for (var i = 0, len = features.length; i < len; ++i) {
            folder.appendChild(this.createPlacemarkXML(features[i]));
        }
        kml.appendChild(folder);
        return OpenLayers.Format.XML.prototype.write.apply(this, [kml]);
    },
    createFolderXML: function () {
        var folder = this.createElementNS(this.kmlns, "Folder");
        if (this.foldersName) {
            var folderName = this.createElementNS(this.kmlns, "name");
            var folderNameText = this.createTextNode(this.foldersName);
            folderName.appendChild(folderNameText);
            folder.appendChild(folderName);
        }
        if (this.foldersDesc) {
            var folderDesc = this.createElementNS(this.kmlns, "description");
            var folderDescText = this.createTextNode(this.foldersDesc);
            folderDesc.appendChild(folderDescText);
            folder.appendChild(folderDesc);
        }
        return folder;
    },
    createPlacemarkXML: function (feature) {
        var placemarkName = this.createElementNS(this.kmlns, "name");
        var name = feature.style && feature.style.label ? feature.style.label : feature.attributes.name || feature.id;
        placemarkName.appendChild(this.createTextNode(name));
        var placemarkDesc = this.createElementNS(this.kmlns, "description");
        var desc = feature.attributes.description || this.placemarksDesc;
        placemarkDesc.appendChild(this.createTextNode(desc));
        var placemarkNode = this.createElementNS(this.kmlns, "Placemark");
        if (feature.fid != null) {
            placemarkNode.setAttribute("id", feature.fid);
        }
        placemarkNode.appendChild(placemarkName);
        placemarkNode.appendChild(placemarkDesc);
        var geometryNode = this.buildGeometryNode(feature.geometry);
        placemarkNode.appendChild(geometryNode);
        return placemarkNode;
    },
    buildGeometryNode: function (geometry) {
        var className = geometry.CLASS_NAME;
        var type = className.substring(className.lastIndexOf(".") + 1);
        var builder = this.buildGeometry[type.toLowerCase()];
        var node = null;
        if (builder) {
            node = builder.apply(this, [geometry]);
        }
        return node;
    },
    buildGeometry: {
        point: function (geometry) {
            var kml = this.createElementNS(this.kmlns, "Point");
            kml.appendChild(this.buildCoordinatesNode(geometry));
            return kml;
        },
        multipoint: function (geometry) {
            return this.buildGeometry.collection.apply(this, [geometry]);
        },
        linestring: function (geometry) {
            var kml = this.createElementNS(this.kmlns, "LineString");
            kml.appendChild(this.buildCoordinatesNode(geometry));
            return kml;
        },
        multilinestring: function (geometry) {
            return this.buildGeometry.collection.apply(this, [geometry]);
        },
        linearring: function (geometry) {
            var kml = this.createElementNS(this.kmlns, "LinearRing");
            kml.appendChild(this.buildCoordinatesNode(geometry));
            return kml;
        },
        polygon: function (geometry) {
            var kml = this.createElementNS(this.kmlns, "Polygon");
            var rings = geometry.components;
            var ringMember, ringGeom, type;
            for (var i = 0, len = rings.length; i < len; ++i) {
                type = (i == 0) ? "outerBoundaryIs" : "innerBoundaryIs";
                ringMember = this.createElementNS(this.kmlns, type);
                ringGeom = this.buildGeometry.linearring.apply(this, [rings[i]]);
                ringMember.appendChild(ringGeom);
                kml.appendChild(ringMember);
            }
            return kml;
        },
        multipolygon: function (geometry) {
            return this.buildGeometry.collection.apply(this, [geometry]);
        },
        collection: function (geometry) {
            var kml = this.createElementNS(this.kmlns, "MultiGeometry");
            var child;
            for (var i = 0, len = geometry.components.length; i < len; ++i) {
                child = this.buildGeometryNode.apply(this, [geometry.components[i]]);
                if (child) {
                    kml.appendChild(child);
                }
            }
            return kml;
        }
    },
    buildCoordinatesNode: function (geometry) {
        var coordinatesNode = this.createElementNS(this.kmlns, "coordinates");
        var path;
        var points = geometry.components;
        if (points) {
            var point;
            var numPoints = points.length;
            var parts = new Array(numPoints);
            for (var i = 0; i < numPoints; ++i) {
                point = points[i];
                parts[i] = this.buildCoordinates(point);
            }
            path = parts.join(" ");
        } else {
            path = this.buildCoordinates(geometry);
        }
        var txtNode = this.createTextNode(path);
        coordinatesNode.appendChild(txtNode);
        return coordinatesNode;
    },
    buildCoordinates: function (point) {
        if (this.internalProjection && this.externalProjection) {
            point = point.clone();
            point.transform(this.internalProjection, this.externalProjection);
        }
        return point.x + "," + point.y;
    },
    CLASS_NAME: "OpenLayers.Format.KML"
});
(function ($) {
    $.toJSON = function (o) {
        var type = typeof (o);
        if (o === null) return "null";
        if (type == "undefined") return undefined;
        if (type == "number" || type == "boolean") return o + "";
        if (type == "string") return $.quoteString(o);
        if (type == 'object') {
            if (o.constructor === Date) {
                var month = o.getUTCMonth() + 1;
                if (month < 10) month = '0' + month;
                var day = o.getUTCDate();
                if (day < 10) day = '0' + day;
                var year = o.getUTCFullYear();
                var hours = o.getUTCHours();
                if (hours < 10) hours = '0' + hours;
                var minutes = o.getUTCMinutes();
                if (minutes < 10) minutes = '0' + minutes;
                var seconds = o.getUTCSeconds();
                if (seconds < 10) seconds = '0' + seconds;
                var milli = o.getUTCMilliseconds();
                if (milli < 100) milli = '0' + milli;
                if (milli < 10) milli = '0' + milli;
                return '"' + year + '-' + month + '-' + day + 'T' + hours + ':' + minutes + ':' + seconds + '.' + milli + 'Z"';
            }
            if (o.constructor === Array) {
                var ret = [];
                for (var i = 0; i < o.length; i++) {
                    ret.push($.toJSON(o[i]) || "null");
                }
                return "[" + ret.join(",") + "]";
            }
            var pairs = [];
            for (var k in o) {
                var name;
                var type = typeof k;
                if (type == "number") name = '"' + k + '"';
                else if (type == "string") name = $.quoteString(k);
                else continue;
                if (typeof o[k] == "function") continue;
                var val = $.toJSON(o[k]);
                pairs.push(name + ":" + val);
            }
            return "{" + pairs.join(", ") + "}";
        }
    };
    $.evalJSON = function (src) {
        if (typeof (JSON) == 'object' && JSON.parse) return JSON.parse(src);
        return eval("(" + src + ")");
    };
    $.secureEvalJSON = function (src) {
        if (typeof (JSON) == 'object' && JSON.parse) return JSON.parse(src);
        var filtered = src;
        filtered = filtered.replace(/\\["\\\/bfnrtu]/g, '@');
        filtered = filtered.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
        filtered = filtered.replace(/(?:^|:|,)(?:\s*\[)+/g, '');
        if (/^[\],:{}\s]*$/.test(filtered)) return eval("(" + src + ")");
        else throw new SyntaxError("Error parsing JSON, source is not valid.");
    };
    $.quoteString = function (string) {
        if (string.match(_escapeable)) {
            return '"' + string.replace(_escapeable, function (a) {
                var c = _meta[a];
                if (typeof c === 'string') return c;
                c = a.charCodeAt();
                return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
            }) + '"';
        }
        return '"' + string + '"';
    };
    var _escapeable = /["\\\x00-\x1f\x7f-\x9f]/g;
    var _meta = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"': '\\"',
        '\\': '\\\\'
    };
})(jQuery);
Korem = OpenLayers.Class({});
Korem.Strategy = OpenLayers.Class({});
Korem.Feature = OpenLayers.Class({});
Korem.Layer = OpenLayers.Class({});
Korem.Control = OpenLayers.Class({});
Korem.Control.Generic = OpenLayers.Class({});
OpenLayers.Control.KVectorLayerClick = OpenLayers.Class(OpenLayers.Control, {
    CLASS_NAME: "Korem.Control.KVectorLayerClick",
    EVENT_TYPES: ["clickmarker", "clickstrategy"],
    defaultHandlerOptions: {
        'single': true,
        'double': false,
        'pixelTolerance': 0,
        'stopSingle': true,
        'stopDouble': false,
        'stopDown': false
    },
    autoActivate: true,
    initialize: function (options) {
        this.handlerOptions = OpenLayers.Util.extend({}, this.defaultHandlerOptions);
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
        this.clickHandlers = new OpenLayers.Events(this, null, this.EVENT_TYPES, false, {});
        var that = this;
        this.handler = new OpenLayers.Handler.Feature(this, options.vectorLayer, {
            'click': function (feature) {
                this.handler.evt.feature = feature;
                if (that.clickHandlers.listeners["clickstrategy"].length > 0) {
                    var those = this;
                    this.handler.evt.featureclick = function () {
                        if (feature.clickeable !== false) {
                            that.clickHandlers.triggerEvent("clickmarker", those.handler.evt);
                        }
                    }
                    that.clickHandlers.triggerEvent("clickstrategy", this.handler.evt);
                } else {
                    if (feature.clickeable !== false) {
                        that.clickHandlers.triggerEvent("clickmarker", this.handler.evt);
                    }
                }
                if (this.handler.evt.stopPropagation) {
                    this.handler.evt.stopPropagation();
                }
                this.handler.evt.cancelBubble = true;
                if (this.handler.evt.preventDefault) {
                    this.handler.evt.preventDefault();
                }
                this.handler.evt.returnValue = false;
                this.handler.evt.fallThrough = false;
                OpenLayers.Event.stop(this.handler.evt);
            }
        }, this.handlerOptions);
    },
    addHandler: function (obj, func) {
        this.clickHandlers.register("clickmarker", obj, func);
    },
    addStrategyHandler: function (obj, func) {
        this.clickHandlers.register("clickstrategy", obj, func);
    },
    clearClickHandlers: function () {
        this.clickHandlers.remove("clickmarker");
        this.clickHandlers.remove("clickstrategy");
    }
});
var KVector = {};
KVector.FEATEURE_CLICKEABLE = 1;
KVector.FEATEURE_NONCLICKEABLE = 2;

OpenLayers.Renderer.SVG.prototype.setExtent = function (extent, resolutionChanged) {
    OpenLayers.Renderer.Elements.prototype.setExtent.apply(this, arguments);
    var resolution = this.getResolution();
    var left = -extent.left / resolution;
    var top = extent.top / resolution;
    if (this.map.baseLayer.CLASS_NAME == "Korem.Layer.KMS") {
        var yResolution = resolution * ((this.map.baseLayer.drawing) ? 1 : this.map.baseLayer.xyRatio);
        top = extent.top / yResolution;
    }
    if (resolutionChanged) {
        this.left = left;
        this.top = top;
        var extentString = "0 0 " + this.size.w + " " + this.size.h;
        this.rendererRoot.setAttributeNS(null, "viewBox", extentString);
        this.translate(0, 0);
        return true;
    } else {
        var inRange = this.translate(left - this.left, top - this.top);
        if (!inRange) {
            this.setExtent(extent, true);
        }
        return inRange;
    }
};
OpenLayers.Renderer.SVG.prototype.drawCircle = function (node, geometry, radius) {
    var resolution = this.getResolution();
    var x = (geometry.x / resolution + this.left);
    var y = (this.top - geometry.y / resolution);
    if (this.map.baseLayer.CLASS_NAME == "Korem.Layer.KMS") {
        var yResolution = resolution * ((this.map.baseLayer.drawing) ? 1 : this.map.baseLayer.xyRatio);
        y = (this.top - geometry.y / yResolution);
    }
    if (this.inValidRange(x, y)) {
        node.setAttributeNS(null, "cx", x);
        node.setAttributeNS(null, "cy", y);
        node.setAttributeNS(null, "r", radius);
        return node;
    } else {
        return false;
    }
};
OpenLayers.Renderer.SVG.prototype.drawText = function (featureId, style, location) {
    var resolution = this.getResolution();
    var x = (location.x / resolution + this.left);
    var y = (location.y / resolution - this.top);
    if (this.map.baseLayer.CLASS_NAME == "Korem.Layer.KMS") {
        var yResolution = resolution * ((this.map.baseLayer.drawing) ? 1 : this.map.baseLayer.xyRatio);
        y = (location.y / yResolution - this.top);
    }
    var label = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX, "text");
    var tspan = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX + "_tspan", "tspan");
    label.setAttributeNS(null, "x", x);
    label.setAttributeNS(null, "y", -y);
    if (style.fontColor) {
        label.setAttributeNS(null, "fill", style.fontColor);
    }
    if (style.fontOpacity) {
        label.setAttributeNS(null, "opacity", style.fontOpacity);
    }
    if (style.fontFamily) {
        label.setAttributeNS(null, "font-family", style.fontFamily);
    }
    if (style.fontSize) {
        label.setAttributeNS(null, "font-size", style.fontSize);
    }
    if (style.fontWeight) {
        label.setAttributeNS(null, "font-weight", style.fontWeight);
    }
    if (style.labelSelect === true) {
        label.setAttributeNS(null, "pointer-events", "visible");
        label._featureId = featureId;
        tspan._featureId = featureId;
        tspan._geometry = location;
        tspan._geometryClass = location.CLASS_NAME;
    } else {
        label.setAttributeNS(null, "pointer-events", "none");
    }
    var align = style.labelAlign || "cm";
    label.setAttributeNS(null, "text-anchor", OpenLayers.Renderer.SVG.LABEL_ALIGN[align[0]] || "middle");
    if (this.isGecko) {
        label.setAttributeNS(null, "dominant-baseline", OpenLayers.Renderer.SVG.LABEL_ALIGN[align[1]] || "central");
    } else {
        tspan.setAttributeNS(null, "baseline-shift", OpenLayers.Renderer.SVG.LABEL_VSHIFT[align[1]] || "-35%");
    }
    tspan.textContent = style.label;
    if (!label.parentNode) {
        label.appendChild(tspan);
        this.textRoot.appendChild(label);
    }
};
OpenLayers.Renderer.SVG.prototype.getShortString = function (point) {
    var resolution = this.getResolution();
    var x = (point.x / resolution + this.left);
    var y = (this.top - point.y / resolution);
    if (this.map.baseLayer.CLASS_NAME == "Korem.Layer.KMS") {
        var yResolution = resolution * ((this.map.baseLayer.drawing) ? 1 : this.map.baseLayer.xyRatio);
        var y = (this.top - point.y / yResolution);
    }
    if (this.inValidRange(x, y)) {
        return x + "," + y;
    } else {
        return false;
    }
};
OpenLayers.Renderer.KVML = OpenLayers.Class(OpenLayers.Renderer.VML, {
    setStyle: function (node, style, options, geometry) {
        style = style || node._style;
        options = options || node._options;
        var fillColor = style.fillColor;
        if (node._geometryClass === "OpenLayers.Geometry.Point") {
            if (style.externalGraphic) {
                if (style.graphicTitle) {
                    node.title = style.graphicTitle;
                }
                var width = style.graphicWidth || style.graphicHeight;
                var height = style.graphicHeight || style.graphicWidth;
                width = width ? width : style.pointRadius * 2;
                height = height ? height : style.pointRadius * 2;
                var resolution = this.getResolution();
                var xOffset = (style.graphicXOffset != undefined) ? style.graphicXOffset : -(0.5 * width);
                var yOffset = (style.graphicYOffset != undefined) ? style.graphicYOffset : -(0.5 * height);
                node.style.left = (((geometry.x / resolution - this.offset.x) + xOffset) | 0) + "px";
                node.style.top = (((geometry.y / resolution - this.offset.y) - (yOffset + height)) | 0) + "px";
                if (this.map.baseLayer.CLASS_NAME == "Korem.Layer.KMS") {
                    var yResolution = resolution * ((this.map.baseLayer.drawing) ? 1 : this.map.baseLayer.xyRatio);
                    node.style.top = (((geometry.y / yResolution - this.offset.y) - (yOffset + height)) | 0) + "px";
                }
                node.style.width = width + "px";
                node.style.height = height + "px";
                node.style.flip = "y";
                fillColor = "none";
                options.isStroked = false;
            } else if (this.isComplexSymbol(style.graphicName)) {
                var cache = this.importSymbol(style.graphicName);
                node.path = cache.path;
                node.coordorigin = cache.left + "," + cache.bottom;
                var size = cache.size;
                node.coordsize = size + "," + size;
                this.drawCircle(node, geometry, style.pointRadius);
                node.style.flip = "y";
            } else {
                this.drawCircle(node, geometry, style.pointRadius);
            }
        }
        if (options.isFilled) {
            node.fillcolor = fillColor;
        } else {
            node.filled = "false";
        }
        var fills = node.getElementsByTagName("fill");
        var fill = (fills.length == 0) ? null : fills[0];
        if (!options.isFilled) {
            if (fill) {
                node.removeChild(fill);
            }
        } else {
            if (!fill) {
                fill = this.createNode('olv:fill', node.id + "_fill");
            }
            fill.opacity = style.fillOpacity;
            if (node._geometryClass === "OpenLayers.Geometry.Point" && style.externalGraphic) {
                if (style.graphicOpacity) {
                    fill.opacity = style.graphicOpacity;
                }
                fill.src = style.externalGraphic;
                fill.type = "frame";
                if (!(style.graphicWidth && style.graphicHeight)) {
                    fill.aspect = "atmost";
                }
            }
            if (fill.parentNode != node) {
                node.appendChild(fill);
            }
        }
        var rotation = style.rotation;
        if ((rotation !== undefined || node._rotation !== undefined)) {
            node._rotation = rotation;
            if (style.externalGraphic) {
                this.graphicRotate(node, xOffset, yOffset, style);
                fill.opacity = 0;
            } else if (node._geometryClass === "OpenLayers.Geometry.Point") {
                node.style.rotation = rotation || 0;
            }
        }
        var strokes = node.getElementsByTagName("stroke");
        var stroke = (strokes.length == 0) ? null : strokes[0];
        if (!options.isStroked) {
            node.stroked = false;
            if (stroke) {
                stroke.on = false;
            }
        } else {
            if (!stroke) {
                stroke = this.createNode('olv:stroke', node.id + "_stroke");
                node.appendChild(stroke);
            }
            stroke.on = true;
            stroke.color = style.strokeColor;
            stroke.weight = style.strokeWidth + "px";
            stroke.opacity = style.strokeOpacity;
            stroke.endcap = style.strokeLinecap == 'butt' ? 'flat' : (style.strokeLinecap || 'round');
            if (style.strokeDashstyle) {
                stroke.dashstyle = this.dashStyle(style);
            }
        }
        if (style.cursor != "inherit" && style.cursor != null) {
            node.style.cursor = style.cursor;
        }
        return node;
    },
    drawText: function (featureId, style, location) {
        var label = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX, "olv:rect");
        var textbox = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX + "_textbox", "olv:textbox");
        var resolution = this.getResolution();
        label.style.left = ((location.x / resolution - this.offset.x) | 0) + "px";
        label.style.top = ((location.y / resolution - this.offset.y) | 0) + "px";
        label.style.flip = "y";
        if (this.map.baseLayer.CLASS_NAME == "Korem.Layer.KMS") {
            var yResolution = resolution * ((this.map.baseLayer.drawing) ? 1 : this.map.baseLayer.xyRatio);
            label.style.top = ((location.y / yResolution - this.offset.y) | 0) + "px";
        }
        textbox.innerText = style.label;
        textbox.style.cursor = "pointer";
        if (style.fontColor) {
            textbox.style.color = style.fontColor;
        }
        if (style.fontOpacity) {
            textbox.style.filter = 'alpha(opacity=' + (style.fontOpacity * 100) + ')';
        }
        if (style.fontFamily) {
            textbox.style.fontFamily = style.fontFamily;
        }
        if (style.fontSize) {
            textbox.style.fontSize = style.fontSize;
        }
        if (style.fontWeight) {
            textbox.style.fontWeight = style.fontWeight;
        }
        if (style.labelSelect === true) {
            label._featureId = featureId;
            textbox._featureId = featureId;
            textbox._geometry = location;
            textbox._geometryClass = location.CLASS_NAME;
        }
        textbox.style.whiteSpace = "nowrap";
        textbox.inset = "1px,0px,0px,0px";
        if (!label.parentNode) {
            label.appendChild(textbox);
            this.textRoot.appendChild(label);
        }
        var align = style.labelAlign || "cm";
        if (align.length == 1) {
            align += "m";
        }
        var xshift = textbox.clientWidth * (OpenLayers.Renderer.VML.LABEL_SHIFT[align.substr(0, 1)]);
        var yshift = textbox.clientHeight * (OpenLayers.Renderer.VML.LABEL_SHIFT[align.substr(1, 1)]);
        label.style.left = parseInt(label.style.left) - xshift - 1 + "px";
        label.style.top = parseInt(label.style.top) + yshift + "px";
    },
    setExtent: function (extent, resolutionChanged) {
        OpenLayers.Renderer.Elements.prototype.setExtent.apply(this, arguments);
        var resolution = this.getResolution();
        var left = (extent.left / resolution) | 0;
        var top = (extent.top / resolution - this.size.h) | 0;
        if (this.map.baseLayer.CLASS_NAME == "Korem.Layer.KMS") {
            var yResolution = resolution * ((this.map.baseLayer.drawing) ? 1 : this.map.baseLayer.xyRatio);
            top = (extent.top / yResolution - this.size.h) | 0;
        }
        if (resolutionChanged || !this.offset) {
            this.offset = {
                x: left,
                y: top
            };
            left = 0;
            top = 0;
        } else {
            left = left - this.offset.x;
            top = top - this.offset.y;
        }
        var org = left + " " + top;
        this.root.coordorigin = org;
        var roots = [this.root, this.vectorRoot, this.textRoot];
        var root;
        for (var i = 0, len = roots.length; i < len; ++i) {
            root = roots[i];
            var size = this.size.w + " " + this.size.h;
            root.coordsize = size;
        }
        this.root.style.flip = "y";
        return true;
    },
    drawCircle: function (node, geometry, radius) {
        if (!isNaN(geometry.x) && !isNaN(geometry.y)) {
            var resolution = this.getResolution();
            node.style.left = (((geometry.x / resolution - this.offset.x) | 0) - radius) + "px";
            node.style.top = (((geometry.y / resolution - this.offset.y) | 0) - radius) + "px";
            if (this.map.baseLayer.CLASS_NAME == "Korem.Layer.KMS") {
                var yResolution = resolution * ((this.map.baseLayer.drawing) ? 1 : this.map.baseLayer.xyRatio);
                node.style.top = (((geometry.y / yResolution - this.offset.y) | 0) - radius) + "px";
            }
            var diameter = radius * 2;
            node.style.width = diameter + "px";
            node.style.height = diameter + "px";
            return node;
        }
        return false;
    },
    drawLine: function (node, geometry, closeLine) {
        this.setNodeDimension(node, geometry);
        var resolution = this.getResolution();
        var numComponents = geometry.components.length;
        var parts = new Array(numComponents);
        var comp, x, y;
        for (var i = 0; i < numComponents; i++) {
            comp = geometry.components[i];
            x = (comp.x / resolution - this.offset.x) | 0;
            y = (comp.y / resolution - this.offset.y) | 0;
            if (this.map.baseLayer.CLASS_NAME == "Korem.Layer.KMS") {
                var yResolution = resolution * ((this.map.baseLayer.drawing) ? 1 : this.map.baseLayer.xyRatio);
                y = (comp.y / yResolution - this.offset.y) | 0;
            }
            parts[i] = " " + x + "," + y + " l ";
        }
        var end = (closeLine) ? " x e" : " e";
        node.path = "m" + parts.join("") + end;
        return node;
    },
    setNodeDimension: function (node, geometry) {
        var bbox = geometry.getBounds();
        if (bbox) {
            var resolution = this.getResolution();
            var scaledBox = new OpenLayers.Bounds((bbox.left / resolution - this.offset.x) | 0, (bbox.bottom / resolution - this.offset.y) | 0, (bbox.right / resolution - this.offset.x) | 0, (bbox.top / resolution - this.offset.y) | 0);
            if (this.map.baseLayer.CLASS_NAME == "Korem.Layer.KMS") {
                var yResolution = resolution * ((this.map.baseLayer.drawing) ? 1 : this.map.baseLayer.xyRatio);
                scaledBox = new OpenLayers.Bounds((bbox.left / resolution - this.offset.x) | 0, (bbox.bottom / yResolution - this.offset.y) | 0, (bbox.right / resolution - this.offset.x) | 0, (bbox.top / yResolution - this.offset.y) | 0);
            }
            node.style.left = scaledBox.left + "px";
            node.style.top = scaledBox.top + "px";
            node.style.width = scaledBox.getWidth() + "px";
            node.style.height = scaledBox.getHeight() + "px";
            node.coordorigin = scaledBox.left + " " + scaledBox.top;
            node.coordsize = scaledBox.getWidth() + " " + scaledBox.getHeight();
        }
    },
    drawPolygon: function (node, geometry) {
        this.setNodeDimension(node, geometry);
        var resolution = this.getResolution();
        var path = [];
        var linearRing, i, j, len, ilen, comp, x, y;
        for (j = 0, len = geometry.components.length; j < len; j++) {
            linearRing = geometry.components[j];
            path.push("m");
            for (i = 0, ilen = linearRing.components.length; i < ilen; i++) {
                comp = linearRing.components[i];
                x = (comp.x / resolution - this.offset.x) | 0;
                y = (comp.y / resolution - this.offset.y) | 0;
                if (this.map.baseLayer.CLASS_NAME == "Korem.Layer.KMS") {
                    var yResolution = resolution * ((this.map.baseLayer.drawing) ? 1 : this.map.baseLayer.xyRatio);
                    y = (comp.y / yResolution - this.offset.y) | 0;
                }
                path.push(" " + x + "," + y);
                if (i == 0) {
                    path.push(" l");
                }
            }
            path.push(" x ");
        }
        path.push("e");
        node.path = path.join("");
        return node;
    }
});
OpenLayers.Renderer.VML.prototype.setStyle = function (node, style, options, geometry) {
    style = style || node._style;
    options = options || node._options;
    var fillColor = style.fillColor;
    if (node._geometryClass === "OpenLayers.Geometry.Point") {
        if (style.externalGraphic) {
            if (style.graphicTitle) {
                node.title = style.graphicTitle;
            }
            var width = style.graphicWidth || style.graphicHeight;
            var height = style.graphicHeight || style.graphicWidth;
            width = width ? width : style.pointRadius * 2;
            height = height ? height : style.pointRadius * 2;
            var resolution = this.getResolution();
            var xOffset = (style.graphicXOffset != undefined) ? style.graphicXOffset : -(0.5 * width);
            var yOffset = (style.graphicYOffset != undefined) ? style.graphicYOffset : -(0.5 * height);
            node.style.left = (((geometry.x / resolution - this.offset.x) + xOffset) | 0) + "px";
            node.style.top = (((geometry.y / resolution - this.offset.y) - (yOffset + height)) | 0) + "px";
            if (this.map.baseLayer.CLASS_NAME == "Korem.Layer.KMS") {
                var yResolution = resolution * ((this.map.baseLayer.drawing) ? 1 : this.map.baseLayer.xyRatio);
                node.style.top = (((geometry.y / yResolution - this.offset.y) - (yOffset + height)) | 0) + "px";
            }
            node.style.width = width + "px";
            node.style.height = height + "px";
            node.style.flip = "y";
            fillColor = "none";
            options.isStroked = false;
        } else if (this.isComplexSymbol(style.graphicName)) {
            var cache = this.importSymbol(style.graphicName);
            node.path = cache.path;
            node.coordorigin = cache.left + "," + cache.bottom;
            var size = cache.size;
            node.coordsize = size + "," + size;
            this.drawCircle(node, geometry, style.pointRadius);
            node.style.flip = "y";
        } else {
            this.drawCircle(node, geometry, style.pointRadius);
        }
    }
    if (options.isFilled) {
        node.fillcolor = fillColor;
    } else {
        node.filled = "false";
    }
    var fills = node.getElementsByTagName("fill");
    var fill = (fills.length == 0) ? null : fills[0];
    if (!options.isFilled) {
        if (fill) {
            node.removeChild(fill);
        }
    } else {
        if (!fill) {
            fill = this.createNode('olv:fill', node.id + "_fill");
        }
        fill.opacity = style.fillOpacity;
        if (node._geometryClass === "OpenLayers.Geometry.Point" && style.externalGraphic) {
            if (style.graphicOpacity) {
                fill.opacity = style.graphicOpacity;
            }
            fill.src = style.externalGraphic;
            fill.type = "frame";
            if (!(style.graphicWidth && style.graphicHeight)) {
                fill.aspect = "atmost";
            }
        }
        if (fill.parentNode != node) {
            node.appendChild(fill);
        }
    }
    var rotation = style.rotation;
    if ((rotation !== undefined || node._rotation !== undefined)) {
        node._rotation = rotation;
        if (style.externalGraphic) {
            this.graphicRotate(node, xOffset, yOffset, style);
            fill.opacity = 0;
        } else if (node._geometryClass === "OpenLayers.Geometry.Point") {
            node.style.rotation = rotation || 0;
        }
    }
    var strokes = node.getElementsByTagName("stroke");
    var stroke = (strokes.length == 0) ? null : strokes[0];
    if (!options.isStroked) {
        node.stroked = false;
        if (stroke) {
            stroke.on = false;
        }
    } else {
        if (!stroke) {
            stroke = this.createNode('olv:stroke', node.id + "_stroke");
            node.appendChild(stroke);
        }
        stroke.on = true;
        stroke.color = style.strokeColor;
        stroke.weight = style.strokeWidth + "px";
        stroke.opacity = style.strokeOpacity;
        stroke.endcap = style.strokeLinecap == 'butt' ? 'flat' : (style.strokeLinecap || 'round');
        if (style.strokeDashstyle) {
            stroke.dashstyle = this.dashStyle(style);
        }
    }
    if (style.cursor != "inherit" && style.cursor != null) {
        node.style.cursor = style.cursor;
    }
    return node;
};
OpenLayers.Renderer.VML.prototype.drawText = function (featureId, style, location) {
    var label = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX, "olv:rect");
    var textbox = this.nodeFactory(featureId + this.LABEL_ID_SUFFIX + "_textbox", "olv:textbox");
    var resolution = this.getResolution();
    label.style.left = ((location.x / resolution - this.offset.x) | 0) + "px";
    label.style.top = ((location.y / resolution - this.offset.y) | 0) + "px";
    label.style.flip = "y";
    if (this.map.baseLayer.CLASS_NAME == "Korem.Layer.KMS") {
        var yResolution = resolution * ((this.map.baseLayer.drawing) ? 1 : this.map.baseLayer.xyRatio);
        label.style.top = ((location.y / yResolution - this.offset.y) | 0) + "px";
    }
    textbox.innerText = style.label;
    if (style.fontColor) {
        textbox.style.color = style.fontColor;
    }
    if (style.fontOpacity) {
        textbox.style.filter = 'alpha(opacity=' + (style.fontOpacity * 100) + ')';
    }
    if (style.fontFamily) {
        textbox.style.fontFamily = style.fontFamily;
    }
    if (style.fontSize) {
        textbox.style.fontSize = style.fontSize;
    }
    if (style.fontWeight) {
        textbox.style.fontWeight = style.fontWeight;
    }
    if (style.labelSelect === true) {
        label._featureId = featureId;
        textbox._featureId = featureId;
        textbox._geometry = location;
        textbox._geometryClass = location.CLASS_NAME;
    }
    textbox.style.whiteSpace = "nowrap";
    textbox.inset = "1px,0px,0px,0px";
    if (!label.parentNode) {
        label.appendChild(textbox);
        this.textRoot.appendChild(label);
    }
    var align = style.labelAlign || "cm";
    if (align.length == 1) {
        align += "m";
    }
    var xshift = textbox.clientWidth * (OpenLayers.Renderer.VML.LABEL_SHIFT[align.substr(0, 1)]);
    var yshift = textbox.clientHeight * (OpenLayers.Renderer.VML.LABEL_SHIFT[align.substr(1, 1)]);
    label.style.left = parseInt(label.style.left) - xshift - 1 + "px";
    label.style.top = parseInt(label.style.top) + yshift + "px";
};
OpenLayers.Renderer.VML.prototype.setExtent = function (extent, resolutionChanged) {
    OpenLayers.Renderer.Elements.prototype.setExtent.apply(this, arguments);
    var resolution = this.getResolution();
    var left = (extent.left / resolution) | 0;
    var top = (extent.top / resolution - this.size.h) | 0;
    if (this.map.baseLayer.CLASS_NAME == "Korem.Layer.KMS") {
        var yResolution = resolution * ((this.map.baseLayer.drawing) ? 1 : this.map.baseLayer.xyRatio);
        top = (extent.top / yResolution - this.size.h) | 0;
    }
    if (resolutionChanged || !this.offset) {
        this.offset = {
            x: left,
            y: top
        };
        left = 0;
        top = 0;
    } else {
        left = left - this.offset.x;
        top = top - this.offset.y;
    }
    var org = left + " " + top;
    this.root.coordorigin = org;
    var roots = [this.root, this.vectorRoot, this.textRoot];
    var root;
    for (var i = 0, len = roots.length; i < len; ++i) {
        root = roots[i];
        var size = this.size.w + " " + this.size.h;
        root.coordsize = size;
    }
    this.root.style.flip = "y";
    return true;
};
OpenLayers.Renderer.VML.prototype.drawCircle = function (node, geometry, radius) {
    if (!isNaN(geometry.x) && !isNaN(geometry.y)) {
        var resolution = this.getResolution();
        node.style.left = (((geometry.x / resolution - this.offset.x) | 0) - radius) + "px";
        node.style.top = (((geometry.y / resolution - this.offset.y) | 0) - radius) + "px";
        if (this.map.baseLayer.CLASS_NAME == "Korem.Layer.KMS") {
            var yResolution = resolution * ((this.map.baseLayer.drawing) ? 1 : this.map.baseLayer.xyRatio);
            node.style.top = (((geometry.y / yResolution - this.offset.y) | 0) - radius) + "px";
        }
        var diameter = radius * 2;
        node.style.width = diameter + "px";
        node.style.height = diameter + "px";
        return node;
    }
    return false;
};
OpenLayers.Renderer.VML.prototype.drawLine = function (node, geometry, closeLine) {
    this.setNodeDimension(node, geometry);
    var resolution = this.getResolution();
    var numComponents = geometry.components.length;
    var parts = new Array(numComponents);
    var comp, x, y;
    for (var i = 0; i < numComponents; i++) {
        comp = geometry.components[i];
        x = (comp.x / resolution - this.offset.x) | 0;
        y = (comp.y / resolution - this.offset.y) | 0;
        if (this.map.baseLayer.CLASS_NAME == "Korem.Layer.KMS") {
            var yResolution = resolution * ((this.map.baseLayer.drawing) ? 1 : this.map.baseLayer.xyRatio);
            y = (comp.y / yResolution - this.offset.y) | 0;
        }
        parts[i] = " " + x + "," + y + " l ";
    }
    var end = (closeLine) ? " x e" : " e";
    node.path = "m" + parts.join("") + end;
    return node;
};
OpenLayers.Renderer.VML.prototype.setNodeDimension = function (node, geometry) {
    var bbox = geometry.getBounds();
    if (bbox) {
        var resolution = this.getResolution();
        var scaledBox = new OpenLayers.Bounds((bbox.left / resolution - this.offset.x) | 0, (bbox.bottom / resolution - this.offset.y) | 0, (bbox.right / resolution - this.offset.x) | 0, (bbox.top / resolution - this.offset.y) | 0);
        if (this.map.baseLayer.CLASS_NAME == "Korem.Layer.KMS") {
            var yResolution = resolution * ((this.map.baseLayer.drawing) ? 1 : this.map.baseLayer.xyRatio);
            scaledBox = new OpenLayers.Bounds((bbox.left / resolution - this.offset.x) | 0, (bbox.bottom / yResolution - this.offset.y) | 0, (bbox.right / resolution - this.offset.x) | 0, (bbox.top / yResolution - this.offset.y) | 0);
        }
        node.style.left = scaledBox.left + "px";
        node.style.top = scaledBox.top + "px";
        node.style.width = scaledBox.getWidth() + "px";
        node.style.height = scaledBox.getHeight() + "px";
        node.coordorigin = scaledBox.left + " " + scaledBox.top;
        node.coordsize = scaledBox.getWidth() + " " + scaledBox.getHeight();
    }
};
OpenLayers.Renderer.VML.prototype.drawPolygon = function (node, geometry) {
    this.setNodeDimension(node, geometry);
    var resolution = this.getResolution();
    var path = [];
    var linearRing, i, j, len, ilen, comp, x, y;
    for (j = 0, len = geometry.components.length; j < len; j++) {
        linearRing = geometry.components[j];
        path.push("m");
        for (i = 0, ilen = linearRing.components.length; i < ilen; i++) {
            comp = linearRing.components[i];
            x = (comp.x / resolution - this.offset.x) | 0;
            y = (comp.y / resolution - this.offset.y) | 0;
            if (this.map.baseLayer.CLASS_NAME == "Korem.Layer.KMS") {
                var yResolution = resolution * ((this.map.baseLayer.drawing) ? 1 : this.map.baseLayer.xyRatio);
                y = (comp.y / yResolution - this.offset.y) | 0;
            }
            path.push(" " + x + "," + y);
            if (i == 0) {
                path.push(" l");
            }
        }
        path.push(" x ");
    }
    path.push("e");
    node.path = path.join("");
    return node;
};
Korem.Layer.Vector = OpenLayers.Class(OpenLayers.Layer.Vector, {
    CLASS_NAME: "Korem.Layer.Vector",
    renderers: ['SVG', 'KVML', 'Canvas'],
    rendererOptions: {
        zIndexing: true
    },
    initialize: function (name, options) {
        this.clickEvents = new OpenLayers.Control.KVectorLayerClick({
            vectorLayer: this
        });
        OpenLayers.Layer.Vector.prototype.initialize.apply(this, arguments);
        if (options && options.featureBehavior) {
            this.featureBehavior = options.featureBehavior;
        }
        this.events.register("beforefeaturesadded", this, this.beforeFeaturesAdded);
    },
    beforeFeaturesAdded: function (evt) {
        if (this.featureBehavior === KVector.FEATEURE_NONCLICKEABLE) {
            $j.each(evt.features, function (index, feature) {
                if (feature.setClickeable && (feature.clickeable != true)) {
                    feature.setClickeable(false)
                };
            });
        }
    },
    afterAdd: function () {
        OpenLayers.Layer.Vector.prototype.afterAdd.apply(this, arguments);
        if (this.strategies) {
            for (var i = 0, len = this.strategies.length; i < len; i++) {
                if (this.strategies[i].setMap) {
                    this.strategies[i].setMap(this.map);
                }
            }
        }
        this.map.addControl(this.clickEvents);
    },
    addFeatureClickHandler: function (obj, func) {
        this.clickEvents.addHandler(obj, func);
    },
    addStrategyClickHandler: function (obj, func) {
        this.clickEvents.addStrategyHandler(obj, func);
    },
    clearClickHandlers: function () {
        this.clickEvents.clearClickHandlers();
    }
});
var VMarker = {};
VMarker.ANCHOR_TOPLEFT = 1;
VMarker.ANCHOR_TOPCENTER = 2;
VMarker.ANCHOR_TOPRIGHT = 3;
VMarker.ANCHOR_CENTERLEFT = 4;
VMarker.ANCHOR_CENTERCENTER = 5;
VMarker.ANCHOR_CENTERRIGHT = 6;
VMarker.ANCHOR_BOTTOMLEFT = 7;
VMarker.ANCHOR_BOTTOMCENTER = 8;
VMarker.ANCHOR_BOTTOMRIGHT = 9;
Korem.Feature.VMarker = OpenLayers.Class(OpenLayers.Feature.Vector, {
    anchor: VMarker.ANCHOR_BOTTOMCENTER,
    initialize: function (lon, lat, attributes) {
        OpenLayers.Feature.Vector.prototype.initialize.apply(this, [null, null, attributes]);
        if (!attributes) {
            attributes = {};
        }
        this.icon = {};
        this.icon.width = 20;
        this.icon.height = 34;
        this.icon.url = "http://www.fairdata2000.com/GoogleMaps/graphics/marker.png";
        if (!attributes.style && !attributes.icon) {
            this.style = {
                externalGraphic: this.icon.url,
                graphicWidth: this.icon.width,
                graphicHeight: this.icon.height,
                cursor: "pointer",
                graphicZIndex: 15
            };
        } else {
            if (attributes.style) {
                this.style = attributes.style;
            }
            if (attributes.icon) {
                this.style = {
                    externalGraphic: attributes.icon.url,
                    graphicWidth: attributes.icon.width,
                    graphicHeight: attributes.icon.height
                };
                this.icon = attributes.icon;
            }
            if (attributes.popup) {
                this.popup = attributes.popup;
            }
            if (attributes.father) {
                this.father = attributes.father;
            }
        }
        this.setClickeable(true);
        this.style.graphicZIndex = 15;
        if (attributes.anchor) {
            this.anchor = attributes.anchor;
        }
        this.setAnchor(this.anchor);
        this.geometry = new OpenLayers.Geometry.Point(lon, lat);
    },
    setClickeable: function (clickeable) {
        if (clickeable === false) {
            this.style.cursor = "";
        } else {
            this.style.cursor = "pointer";
        }
        this.clickeable = clickeable;
    },
    setAnchor: function (anchorPosition) {
        switch (anchorPosition) {
        case VMarker.ANCHOR_TOPLEFT:
            this.style.graphicXOffset = 0;
            this.style.graphicYOffset = 0;
            break;
        case VMarker.ANCHOR_TOPCENTER:
            this.style.graphicYOffset = 0;
            break;
        case VMarker.ANCHOR_TOPRIGHT:
            this.style.graphicXOffset = -this.style.graphicWidth;
            this.style.graphicYOffset = 0;
            break;
        case VMarker.ANCHOR_CENTERLEFT:
            this.style.graphicXOffset = 0;
            break;
        case VMarker.ANCHOR_CENTERCENTER:
            break;
        case VMarker.ANCHOR_CENTERRIGHT:
            this.style.graphicXOffset = -this.style.graphicWidth;
            break;
        case VMarker.ANCHOR_BOTTOMLEFT:
            this.style.graphicX
            Offset = 0;
            this.style.graphicYOffset = -this.style.graphicHeight;
            break;
        case VMarker.ANCHOR_BOTTOMCENTER:
            this.style.graphicYOffset = -this.style.graphicHeight;
            break;
        case VMarker.ANCHOR_BOTTOMRIGHT:
            this.style.graphicXOffset = -this.style.graphicWidth;
            this.style.graphicYOffset = -this.style.graphicHeight;
            break;
        }
    },
    CLASS_NAME: "Korem.Feature.VMarker"
});
/* Copyright (c) 2006-2011 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/BaseTypes/Class.js
 */


/**
 * Class: OpenLayers.Popup
 * A popup is a small div that can opened and closed on the map.
 * Typically opened in response to clicking on a marker.  
 * See <OpenLayers.Marker>.  Popup's don't require their own
 * layer and are added the the map using the <OpenLayers.Map.addPopup>
 * method.
 *
 * Example:
 * (code)
 * popup = new OpenLayers.Popup("chicken", 
 *                    new OpenLayers.LonLat(5,40),
 *                    new OpenLayers.Size(200,200),
 *                    "example popup",
 *                    true);
 *       
 * map.addPopup(popup);
 * (end)
 */
OpenLayers.Popup = OpenLayers.Class({

    /** 
     * Property: events  
     * {<OpenLayers.Events>} custom event manager 
     */
    events: null,
    
    /** Property: id
     * {String} the unique identifier assigned to this popup.
     */
    id: "",

    /** 
     * Property: lonlat 
     * {<OpenLayers.LonLat>} the position of this popup on the map
     */
    lonlat: null,

    /** 
     * Property: div 
     * {DOMElement} the div that contains this popup.
     */
    div: null,

    /** 
     * Property: contentSize 
     * {<OpenLayers.Size>} the width and height of the content.
     */
    contentSize: null,    

    /** 
     * Property: size 
     * {<OpenLayers.Size>} the width and height of the popup.
     */
    size: null,    

    /** 
     * Property: contentHTML 
     * {String} An HTML string for this popup to display.
     */
    contentHTML: null,
    
    /** 
     * Property: backgroundColor 
     * {String} the background color used by the popup.
     */
    backgroundColor: "",
    
    /** 
     * Property: opacity 
     * {float} the opacity of this popup (between 0.0 and 1.0)
     */
    opacity: "",

    /** 
     * Property: border 
     * {String} the border size of the popup.  (eg 2px)
     */
    border: "",
    
    /** 
     * Property: contentDiv 
     * {DOMElement} a reference to the element that holds the content of
     *              the div.
     */
    contentDiv: null,
    
    /** 
     * Property: groupDiv 
     * {DOMElement} First and only child of 'div'. The group Div contains the
     *     'contentDiv' and the 'closeDiv'.
     */
    groupDiv: null,

    /** 
     * Property: closeDiv
     * {DOMElement} the optional closer image
     */
    closeDiv: null,

    /** 
     * APIProperty: autoSize
     * {Boolean} Resize the popup to auto-fit the contents.
     *     Default is false.
     */
    autoSize: false,

    /**
     * APIProperty: minSize
     * {<OpenLayers.Size>} Minimum size allowed for the popup's contents.
     */
    minSize: null,

    /**
     * APIProperty: maxSize
     * {<OpenLayers.Size>} Maximum size allowed for the popup's contents.
     */
    maxSize: null,

    /** 
     * Property: displayClass
     * {String} The CSS class of the popup.
     */
    displayClass: "olPopup",

    /** 
     * Property: contentDisplayClass
     * {String} The CSS class of the popup content div.
     */
    contentDisplayClass: "olPopupContent",

    /** 
     * Property: padding 
     * {int or <OpenLayers.Bounds>} An extra opportunity to specify internal 
     *     padding of the content div inside the popup. This was originally
     *     confused with the css padding as specified in style.css's 
     *     'olPopupContent' class. We would like to get rid of this altogether,
     *     except that it does come in handy for the framed and anchoredbubble
     *     popups, who need to maintain yet another barrier between their 
     *     content and the outer border of the popup itself. 
     * 
     *     Note that in order to not break API, we must continue to support 
     *     this property being set as an integer. Really, though, we'd like to 
     *     have this specified as a Bounds object so that user can specify
     *     distinct left, top, right, bottom paddings. With the 3.0 release
     *     we can make this only a bounds.
     */
    padding: 0,

    /** 
     * Property: disableFirefoxOverflowHack
     * {Boolean} The hack for overflow in Firefox causes all elements 
     *     to be re-drawn, which causes Flash elements to be 
     *     re-initialized, which is troublesome.
     *     With this property the hack can be disabled.
     */
    disableFirefoxOverflowHack: false,

    /**
     * Method: fixPadding
     * To be removed in 3.0, this function merely helps us to deal with the 
     *     case where the user may have set an integer value for padding, 
     *     instead of an <OpenLayers.Bounds> object.
     */
    fixPadding: function() {
        if (typeof this.padding == "number") {
            this.padding = new OpenLayers.Bounds(
                this.padding, this.padding, this.padding, this.padding
            );
        }
    },

    /**
     * APIProperty: panMapIfOutOfView
     * {Boolean} When drawn, pan map such that the entire popup is visible in
     *     the current viewport (if necessary).
     *     Default is false.
     */
    panMapIfOutOfView: false,
    
    /**
     * APIProperty: keepInMap 
     * {Boolean} If panMapIfOutOfView is false, and this property is true, 
     *     contrain the popup such that it always fits in the available map
     *     space. By default, this is not set on the base class. If you are
     *     creating popups that are near map edges and not allowing pannning,
     *     and especially if you have a popup which has a
     *     fixedRelativePosition, setting this to false may be a smart thing to
     *     do. Subclasses may want to override this setting.
     *   
     *     Default is false.
     */
    keepInMap: false,

    /**
     * APIProperty: closeOnMove
     * {Boolean} When map pans, close the popup.
     *     Default is false.
     */
    closeOnMove: false,
    
    /** 
     * Property: map 
     * {<OpenLayers.Map>} this gets set in Map.js when the popup is added to the map
     */
    map: null,

    /** 
    * Constructor: OpenLayers.Popup
    * Create a popup.
    * 
    * Parameters: 
    * id - {String} a unqiue identifier for this popup.  If null is passed
    *               an identifier will be automatically generated. 
    * lonlat - {<OpenLayers.LonLat>}  The position on the map the popup will
    *                                 be shown.
    * contentSize - {<OpenLayers.Size>} The size of the content.
    * contentHTML - {String}          An HTML string to display inside the   
    *                                 popup.
    * closeBox - {Boolean}            Whether to display a close box inside
    *                                 the popup.
    * closeBoxCallback - {Function}   Function to be called on closeBox click.
    */
    initialize:function(id, lonlat, contentSize, contentHTML, closeBox, closeBoxCallback) {
        if (id == null) {
            id = OpenLayers.Util.createUniqueID(this.CLASS_NAME + "_");
        }

        this.id = id;
        this.lonlat = lonlat;

        this.contentSize = (contentSize != null) ? contentSize 
                                  : new OpenLayers.Size(
                                                   OpenLayers.Popup.WIDTH,
                                                   OpenLayers.Popup.HEIGHT);
        if (contentHTML != null) { 
             this.contentHTML = contentHTML;
        }
        this.backgroundColor = OpenLayers.Popup.COLOR;
        this.opacity = OpenLayers.Popup.OPACITY;
        this.border = OpenLayers.Popup.BORDER;

        this.div = OpenLayers.Util.createDiv(this.id, null, null, 
                                             null, null, null, "hidden");
        this.div.className = this.displayClass;
        
        var groupDivId = this.id + "_GroupDiv";
        this.groupDiv = OpenLayers.Util.createDiv(groupDivId, null, null, 
                                                    null, "relative", null,
                                                    "hidden");

        var id = this.div.id + "_contentDiv";
        this.contentDiv = OpenLayers.Util.createDiv(id, null, this.contentSize.clone(), 
                                                    null, "relative");
        this.contentDiv.className = this.contentDisplayClass;
        this.groupDiv.appendChild(this.contentDiv);
        this.div.appendChild(this.groupDiv);

        if (closeBox) {
            this.addCloseBox(closeBoxCallback);
        } 

        this.registerEvents();
    },

    /** 
     * Method: destroy
     * nullify references to prevent circular references and memory leaks
     */
    destroy: function() {

        this.id = null;
        this.lonlat = null;
        this.size = null;
        this.contentHTML = null;
        
        this.backgroundColor = null;
        this.opacity = null;
        this.border = null;
        
        if (this.closeOnMove && this.map) {
            this.map.events.unregister("movestart", this, this.hide);
        }

        this.events.destroy();
        this.events = null;
        
        if (this.closeDiv) {
            OpenLayers.Event.stopObservingElement(this.closeDiv); 
            this.groupDiv.removeChild(this.closeDiv);
        }
        this.closeDiv = null;
        
        this.div.removeChild(this.groupDiv);
        this.groupDiv = null;

        if (this.map != null) {
            this.map.removePopup(this);
        }
        this.map = null;
        this.div = null;
        
        this.autoSize = null;
        this.minSize = null;
        this.maxSize = null;
        this.padding = null;
        this.panMapIfOutOfView = null;
    },

    /** 
    * Method: draw
    * Constructs the elements that make up the popup.
    *
    * Parameters:
    * px - {<OpenLayers.Pixel>} the position the popup in pixels.
    * 
    * Returns:
    * {DOMElement} Reference to a div that contains the drawn popup
    */
    draw: function(px) {
        if (px == null) {
            if ((this.lonlat != null) && (this.map != null)) {
                px = this.map.getLayerPxFromLonLat(this.lonlat);
            }
        }

        // this assumes that this.map already exists, which is okay because 
        // this.draw is only called once the popup has been added to the map.
        if (this.closeOnMove) {
            this.map.events.register("movestart", this, this.hide);
        }
        
        //listen to movestart, moveend to disable overflow (FF bug)
        if (!this.disableFirefoxOverflowHack && OpenLayers.BROWSER_NAME == 'firefox') {
            this.map.events.register("movestart", this, function() {
                var style = document.defaultView.getComputedStyle(
                    this.contentDiv, null
                );
                var currentOverflow = style.getPropertyValue("overflow");
                if (currentOverflow != "hidden") {
                    this.contentDiv._oldOverflow = currentOverflow;
                    this.contentDiv.style.overflow = "hidden";
                }
            });
            this.map.events.register("moveend", this, function() {
                var oldOverflow = this.contentDiv._oldOverflow;
                if (oldOverflow) {
                    this.contentDiv.style.overflow = oldOverflow;
                    this.contentDiv._oldOverflow = null;
                }
            });
        }

        this.moveTo(px);
        if (!this.autoSize && !this.size) {
            this.setSize(this.contentSize);
        }
        this.setBackgroundColor();
        this.setOpacity();
        this.setBorder();
        this.setContentHTML();
        
        if (this.panMapIfOutOfView) {
            this.panIntoView();
        }    

        return this.div;
    },

    /** 
     * Method: updatePosition
     * if the popup has a lonlat and its map members set, 
     * then have it move itself to its proper position
     */
    updatePosition: function() {
        if ((this.lonlat) && (this.map)) {
            var px = this.map.getLayerPxFromLonLat(this.lonlat);
            if (px) {
                this.moveTo(px);           
            }    
        }
    },

    /**
     * Method: moveTo
     * 
     * Parameters:
     * px - {<OpenLayers.Pixel>} the top and left position of the popup div. 
     */
    moveTo: function(px) {
        if ((px != null) && (this.div != null)) {
            this.div.style.left = px.x + "px";
            this.div.style.top = px.y + "px";
        }
    },

    /**
     * Method: visible
     *
     * Returns:      
     * {Boolean} Boolean indicating whether or not the popup is visible
     */
    visible: function() {
        return OpenLayers.Element.visible(this.div);
    },

    /**
     * Method: toggle
     * Toggles visibility of the popup.
     */
    toggle: function() {
        if (this.visible()) {
            this.hide();
        } else {
            this.show();
        }
    },

    /**
     * Method: show
     * Makes the popup visible.
     */
    show: function() {
        this.div.style.display = '';

        if (this.panMapIfOutOfView) {
            this.panIntoView();
        }    
    },

    /**
     * Method: hide
     * Makes the popup invisible.
     */
    hide: function() {
        this.div.style.display = 'none';
    },

    /**
     * Method: setSize
     * Used to adjust the size of the popup. 
     *
     * Parameters:
     * contentSize - {<OpenLayers.Size>} the new size for the popup's 
     *     contents div (in pixels).
     */
    setSize:function(contentSize) { 
        this.size = contentSize.clone(); 
        
        // if our contentDiv has a css 'padding' set on it by a stylesheet, we 
        //  must add that to the desired "size". 
        var contentDivPadding = this.getContentDivPadding();
        var wPadding = contentDivPadding.left + contentDivPadding.right;
        var hPadding = contentDivPadding.top + contentDivPadding.bottom;

        // take into account the popup's 'padding' property
        this.fixPadding();
        wPadding += this.padding.left + this.padding.right;
        hPadding += this.padding.top + this.padding.bottom;

        // make extra space for the close div
        if (this.closeDiv) {
            var closeDivWidth = parseInt(this.closeDiv.style.width);
            wPadding += closeDivWidth + contentDivPadding.right;
        }

        //increase size of the main popup div to take into account the 
        // users's desired padding and close div.        
        this.size.w += wPadding;
        this.size.h += hPadding;

        //now if our browser is IE, we need to actually make the contents 
        // div itself bigger to take its own padding into effect. this makes 
        // me want to shoot someone, but so it goes.
        if (OpenLayers.BROWSER_NAME == "msie") {
            this.contentSize.w += 
                contentDivPadding.left + contentDivPadding.right;
            this.contentSize.h += 
                contentDivPadding.bottom + contentDivPadding.top;
        }

        if (this.div != null) {
            this.div.style.width = this.size.w + "px";
            this.div.style.height = this.size.h + "px";
        }
        if (this.contentDiv != null){
            this.contentDiv.style.width = contentSize.w + "px";
            this.contentDiv.style.height = contentSize.h + "px";
        }
    },  

    /**
     * APIMethod: updateSize
     * Auto size the popup so that it precisely fits its contents (as 
     *     determined by this.contentDiv.innerHTML). Popup size will, of
     *     course, be limited by the available space on the current map
     */
    updateSize: function() {
        
        // determine actual render dimensions of the contents by putting its
        // contents into a fake contentDiv (for the CSS) and then measuring it
        var preparedHTML = "<div class='" + this.contentDisplayClass+ "'>" + 
            this.contentDiv.innerHTML + 
            "</div>";
 
        var containerElement = (this.map) ? this.map.layerContainerDiv
        								  : document.body;
        var realSize = OpenLayers.Util.getRenderedDimensions(
            preparedHTML, null,	{
                displayClass: this.displayClass,
                containerElement: containerElement
            }
        );

        // is the "real" size of the div is safe to display in our map?
        var safeSize = this.getSafeContentSize(realSize);

        var newSize = null;
        if (safeSize.equals(realSize)) {
            //real size of content is small enough to fit on the map, 
            // so we use real size.
            newSize = realSize;

        } else {

            //make a new OL.Size object with the clipped dimensions 
            // set or null if not clipped.
            var fixedSize = new OpenLayers.Size();
            fixedSize.w = (safeSize.w < realSize.w) ? safeSize.w : null;
            fixedSize.h = (safeSize.h < realSize.h) ? safeSize.h : null;
        
            if (fixedSize.w && fixedSize.h) {
                //content is too big in both directions, so we will use 
                // max popup size (safeSize), knowing well that it will 
                // overflow both ways.                
                newSize = safeSize;
            } else {
                //content is clipped in only one direction, so we need to 
                // run getRenderedDimensions() again with a fixed dimension
                var clippedSize = OpenLayers.Util.getRenderedDimensions(
                    preparedHTML, fixedSize, {
                        displayClass: this.contentDisplayClass,
                        containerElement: containerElement
                    }
                );
                
                //if the clipped size is still the same as the safeSize, 
                // that means that our content must be fixed in the 
                // offending direction. If overflow is 'auto', this means 
                // we are going to have a scrollbar for sure, so we must 
                // adjust for that.
                //
                var currentOverflow = OpenLayers.Element.getStyle(
                    this.contentDiv, "overflow"
                );
                if ( (currentOverflow != "hidden") && 
                     (clippedSize.equals(safeSize)) ) {
                    var scrollBar = OpenLayers.Util.getScrollbarWidth();
                    if (fixedSize.w) {
                        clippedSize.h += scrollBar;
                    } else {
                        clippedSize.w += scrollBar;
                    }
                }
                
                newSize = this.getSafeContentSize(clippedSize);
            }
        }                        
        this.setSize(newSize);     
    },    

    /**
     * Method: setBackgroundColor
     * Sets the background color of the popup.
     *
     * Parameters:
     * color - {String} the background color.  eg "#FFBBBB"
     */
    setBackgroundColor:function(color) { 
        if (color != undefined) {
            this.backgroundColor = color; 
        }
        
        if (this.div != null) {
            this.div.style.backgroundColor = this.backgroundColor;
        }
    },  
    
    /**
     * Method: setOpacity
     * Sets the opacity of the popup.
     * 
     * Parameters:
     * opacity - {float} A value between 0.0 (transparent) and 1.0 (solid).   
     */
    setOpacity:function(opacity) { 
        if (opacity != undefined) {
            this.opacity = opacity; 
        }
        
        if (this.div != null) {
            // for Mozilla and Safari
            this.div.style.opacity = this.opacity;

            // for IE
            this.div.style.filter = 'alpha(opacity=' + this.opacity*100 + ')';
        }
    },  
    
    /**
     * Method: setBorder
     * Sets the border style of the popup.
     *
     * Parameters:
     * border - {String} The border style value. eg 2px 
     */
    setBorder:function(border) { 
        if (border != undefined) {
            this.border = border;
        }
        
        if (this.div != null) {
            this.div.style.border = this.border;
        }
    },      
    
    /**
     * Method: setContentHTML
     * Allows the user to set the HTML content of the popup.
     *
     * Parameters:
     * contentHTML - {String} HTML for the div.
     */
    setContentHTML:function(contentHTML) {

        if (contentHTML != null) {
            this.contentHTML = contentHTML;
        }
       
        if ((this.contentDiv != null) && 
            (this.contentHTML != null) &&
            (this.contentHTML != this.contentDiv.innerHTML)) {
       
            this.contentDiv.innerHTML = this.contentHTML;
       
            if (this.autoSize) {
                
                //if popup has images, listen for when they finish
                // loading and resize accordingly
                this.registerImageListeners();

                //auto size the popup to its current contents
                this.updateSize();
            }
        }    

    },
    
    /**
     * Method: registerImageListeners
     * Called when an image contained by the popup loaded. this function
     *     updates the popup size, then unregisters the image load listener.
     */   
    registerImageListeners: function() { 

        // As the images load, this function will call updateSize() to 
        // resize the popup to fit the content div (which presumably is now
        // bigger than when the image was not loaded).
        // 
        // If the 'panMapIfOutOfView' property is set, we will pan the newly
        // resized popup back into view.
        // 
        // Note that this function, when called, will have 'popup' and 
        // 'img' properties in the context.
        //
        var onImgLoad = function() {
            
            this.popup.updateSize();
     
            if ( this.popup.visible() && this.popup.panMapIfOutOfView ) {
                this.popup.panIntoView();
            }

            OpenLayers.Event.stopObserving(
                this.img, "load", this.img._onImageLoad
            );
    
        };

        //cycle through the images and if their size is 0x0, that means that 
        // they haven't been loaded yet, so we attach the listener, which 
        // will fire when the images finish loading and will resize the 
        // popup accordingly to its new size.
        var images = this.contentDiv.getElementsByTagName("img");
        for (var i = 0, len = images.length; i < len; i++) {
            var img = images[i];
            if (img.width == 0 || img.height == 0) {

                var context = {
                    'popup': this,
                    'img': img
                };

                //expando this function to the image itself before registering
                // it. This way we can easily and properly unregister it.
                img._onImgLoad = OpenLayers.Function.bind(onImgLoad, context);

                OpenLayers.Event.observe(img, 'load', img._onImgLoad);
            }    
        } 
    },

    /**
     * APIMethod: getSafeContentSize
     * 
     * Parameters:
     * size - {<OpenLayers.Size>} Desired size to make the popup.
     * 
     * Returns:
     * {<OpenLayers.Size>} A size to make the popup which is neither smaller
     *     than the specified minimum size, nor bigger than the maximum 
     *     size (which is calculated relative to the size of the viewport).
     */
    getSafeContentSize: function(size) {

        var safeContentSize = size.clone();

        // if our contentDiv has a css 'padding' set on it by a stylesheet, we 
        //  must add that to the desired "size". 
        var contentDivPadding = this.getContentDivPadding();
        var wPadding = contentDivPadding.left + contentDivPadding.right;
        var hPadding = contentDivPadding.top + contentDivPadding.bottom;

        // take into account the popup's 'padding' property
        this.fixPadding();
        wPadding += this.padding.left + this.padding.right;
        hPadding += this.padding.top + this.padding.bottom;

        if (this.closeDiv) {
            var closeDivWidth = parseInt(this.closeDiv.style.width);
            wPadding += closeDivWidth + contentDivPadding.right;
        }

        // prevent the popup from being smaller than a specified minimal size
        if (this.minSize) {
            safeContentSize.w = Math.max(safeContentSize.w, 
                (this.minSize.w - wPadding));
            safeContentSize.h = Math.max(safeContentSize.h, 
                (this.minSize.h - hPadding));
        }

        // prevent the popup from being bigger than a specified maximum size
        if (this.maxSize) {
            safeContentSize.w = Math.min(safeContentSize.w, 
                (this.maxSize.w - wPadding));
            safeContentSize.h = Math.min(safeContentSize.h, 
                (this.maxSize.h - hPadding));
        }
        
        //make sure the desired size to set doesn't result in a popup that 
        // is bigger than the map's viewport.
        //
        if (this.map && this.map.size) {
            
            var extraX = 0, extraY = 0;
            if (this.keepInMap && !this.panMapIfOutOfView) {
                var px = this.map.getPixelFromLonLat(this.lonlat);
                switch (this.relativePosition) {
                    case "tr":
                        extraX = px.x;
                        extraY = this.map.size.h - px.y;
                        break;
                    case "tl":
                        extraX = this.map.size.w - px.x;
                        extraY = this.map.size.h - px.y;
                        break;
                    case "bl":
                        extraX = this.map.size.w - px.x;
                        extraY = px.y;
                        break;
                    case "br":
                        extraX = px.x;
                        extraY = px.y;
                        break;
                    default:    
                        extraX = px.x;
                        extraY = this.map.size.h - px.y;
                        break;
                }
            }    
          
            var maxY = this.map.size.h - 
                this.map.paddingForPopups.top - 
                this.map.paddingForPopups.bottom - 
                hPadding - extraY;
            
            var maxX = this.map.size.w - 
                this.map.paddingForPopups.left - 
                this.map.paddingForPopups.right - 
                wPadding - extraX;
            
            safeContentSize.w = Math.min(safeContentSize.w, maxX);
            safeContentSize.h = Math.min(safeContentSize.h, maxY);
        }
        
        return safeContentSize;
    },
    
    /**
     * Method: getContentDivPadding
     * Glorious, oh glorious hack in order to determine the css 'padding' of 
     *     the contentDiv. IE/Opera return null here unless we actually add the 
     *     popup's main 'div' element (which contains contentDiv) to the DOM. 
     *     So we make it invisible and then add it to the document temporarily. 
     *
     *     Once we've taken the padding readings we need, we then remove it 
     *     from the DOM (it will actually get added to the DOM in 
     *     Map.js's addPopup)
     *
     * Returns:
     * {<OpenLayers.Bounds>}
     */
    getContentDivPadding: function() {

        //use cached value if we have it
        var contentDivPadding = this._contentDivPadding;
        if (!contentDivPadding) {

        	if (this.div.parentNode == null) {
	        	//make the div invisible and add it to the page        
	            this.div.style.display = "none";
	            document.body.appendChild(this.div);
	    	}
	            
            //read the padding settings from css, put them in an OL.Bounds        
            contentDivPadding = new OpenLayers.Bounds(
                OpenLayers.Element.getStyle(this.contentDiv, "padding-left"),
                OpenLayers.Element.getStyle(this.contentDiv, "padding-bottom"),
                OpenLayers.Element.getStyle(this.contentDiv, "padding-right"),
                OpenLayers.Element.getStyle(this.contentDiv, "padding-top")
            );
    
            //cache the value
            this._contentDivPadding = contentDivPadding;

            if (this.div.parentNode == document.body) {
	            //remove the div from the page and make it visible again
	            document.body.removeChild(this.div);
	            this.div.style.display = "";
            }
        }
        return contentDivPadding;
    },

    /**
     * Method: addCloseBox
     * 
     * Parameters:
     * callback - {Function} The callback to be called when the close button
     *     is clicked.
     */
    addCloseBox: function(callback) {

        this.closeDiv = OpenLayers.Util.createDiv(
            this.id + "_close", null, new OpenLayers.Size(17, 17)
        );
        this.closeDiv.className = "olPopupCloseBox"; 
        
        // use the content div's css padding to determine if we should
        //  padd the close div
        var contentDivPadding = this.getContentDivPadding();
         
        this.closeDiv.style.right = contentDivPadding.right + "px";
        this.closeDiv.style.top = contentDivPadding.top + "px";
        this.groupDiv.appendChild(this.closeDiv);

        var closePopup = callback || function(e) {
            this.hide();
            OpenLayers.Event.stop(e);
        };
        OpenLayers.Event.observe(this.closeDiv, "touchend", 
                OpenLayers.Function.bindAsEventListener(closePopup, this));
        OpenLayers.Event.observe(this.closeDiv, "click", 
                OpenLayers.Function.bindAsEventListener(closePopup, this));
    },

    /**
     * Method: panIntoView
     * Pans the map such that the popup is totaly viewable (if necessary)
     */
    panIntoView: function() {
        
        var mapSize = this.map.getSize();
    
        //start with the top left corner of the popup, in px, 
        // relative to the viewport
        var origTL = this.map.getViewPortPxFromLayerPx( new OpenLayers.Pixel(
            parseInt(this.div.style.left),
            parseInt(this.div.style.top)
        ));
        var newTL = origTL.clone();
    
        //new left (compare to margins, using this.size to calculate right)
        if (origTL.x < this.map.paddingForPopups.left) {
            newTL.x = this.map.paddingForPopups.left;
        } else 
        if ( (origTL.x + this.size.w) > (mapSize.w - this.map.paddingForPopups.right)) {
            newTL.x = mapSize.w - this.map.paddingForPopups.right - this.size.w;
        }
        
        //new top (compare to margins, using this.size to calculate bottom)
        if (origTL.y < this.map.paddingForPopups.top) {
            newTL.y = this.map.paddingForPopups.top;
        } else 
        if ( (origTL.y + this.size.h) > (mapSize.h - this.map.paddingForPopups.bottom)) {
            newTL.y = mapSize.h - this.map.paddingForPopups.bottom - this.size.h;
        }
        
        var dx = origTL.x - newTL.x;
        var dy = origTL.y - newTL.y;
        
        this.map.pan(dx, dy);
    },

    /** 
     * Method: registerEvents
     * Registers events on the popup.
     *
     * Do this in a separate function so that subclasses can 
     *   choose to override it if they wish to deal differently
     *   with mouse events
     * 
     *   Note in the following handler functions that some special
     *    care is needed to deal correctly with mousing and popups. 
     *   
     *   Because the user might select the zoom-rectangle option and
     *    then drag it over a popup, we need a safe way to allow the
     *    mousemove and mouseup events to pass through the popup when
     *    they are initiated from outside. The same procedure is needed for
     *    touchmove and touchend events.
     * 
     *   Otherwise, we want to essentially kill the event propagation
     *    for all other events, though we have to do so carefully, 
     *    without disabling basic html functionality, like clicking on 
     *    hyperlinks or drag-selecting text.
     */
     registerEvents:function() {
        this.events = new OpenLayers.Events(this, this.div, null, true);

        function onTouchstart(evt) {
            OpenLayers.Event.stop(evt, true);
        }
        this.events.on({
            "mousedown": this.onmousedown,
            "mousemove": this.onmousemove,
            "mouseup": this.onmouseup,
            "click": this.onclick,
            "mouseout": this.onmouseout,
            "dblclick": this.ondblclick,
            "touchstart": onTouchstart,
            scope: this
        });
        
     },

    /** 
     * Method: onmousedown 
     * When mouse goes down within the popup, make a note of
     *   it locally, and then do not propagate the mousedown 
     *   (but do so safely so that user can select text inside)
     * 
     * Parameters:
     * evt - {Event} 
     */
    onmousedown: function (evt) {
        this.mousedown = true;
        OpenLayers.Event.stop(evt, true);
    },

    /** 
     * Method: onmousemove
     * If the drag was started within the popup, then 
     *   do not propagate the mousemove (but do so safely
     *   so that user can select text inside)
     * 
     * Parameters:
     * evt - {Event} 
     */
    onmousemove: function (evt) {
        if (this.mousedown) {
            OpenLayers.Event.stop(evt, true);
        }
    },

    /** 
     * Method: onmouseup
     * When mouse comes up within the popup, after going down 
     *   in it, reset the flag, and then (once again) do not 
     *   propagate the event, but do so safely so that user can 
     *   select text inside
     * 
     * Parameters:
     * evt - {Event} 
     */
    onmouseup: function (evt) {
        if (this.mousedown) {
            this.mousedown = false;
            OpenLayers.Event.stop(evt, true);
        }
    },

    /**
     * Method: onclick
     * Ignore clicks, but allowing default browser handling
     * 
     * Parameters:
     * evt - {Event} 
     */
    onclick: function (evt) {
        OpenLayers.Event.stop(evt, true);
    },

    /** 
     * Method: onmouseout
     * When mouse goes out of the popup set the flag to false so that
     *   if they let go and then drag back in, we won't be confused.
     * 
     * Parameters:
     * evt - {Event} 
     */
    onmouseout: function (evt) {
        this.mousedown = false;
    },
    
    /** 
     * Method: ondblclick
     * Ignore double-clicks, but allowing default browser handling
     * 
     * Parameters:
     * evt - {Event} 
     */
    ondblclick: function (evt) {
        OpenLayers.Event.stop(evt, true);
    },

    CLASS_NAME: "OpenLayers.Popup"
});

OpenLayers.Popup.WIDTH = 200;
OpenLayers.Popup.HEIGHT = 200;
OpenLayers.Popup.COLOR = "white";
OpenLayers.Popup.OPACITY = 1;
OpenLayers.Popup.BORDER = "0px";
