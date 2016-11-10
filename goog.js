goog = {};

goog.base = function(me, opt_methodName, var_args) {
    var caller = arguments.callee.caller;

    if (goog.STRICT_MODE_COMPATIBLE || (goog.DEBUG && !caller)) {
        throw Error('arguments.caller not defined.  goog.base() cannot be used ' +
            'with strict mode code. See ' +
            'http://www.ecma-international.org/ecma-262/5.1/#sec-C');
    }

    if (caller.superClass_) {
        // Copying using loop to avoid deop due to passing arguments object to
        // function. This is faster in many JS engines as of late 2014.
        var ctorArgs = new Array(arguments.length - 1);
        for (var i = 1; i < arguments.length; i++) {
            ctorArgs[i - 1] = arguments[i];
        }
        // This is a constructor. Call the superclass constructor.
        return caller.superClass_.constructor.apply(me, ctorArgs);
    }

    // Copying using loop to avoid deop due to passing arguments object to
    // function. This is faster in many JS engines as of late 2014.
    var args = new Array(arguments.length - 2);
    for (var i = 2; i < arguments.length; i++) {
        args[i - 2] = arguments[i];
    }
    var foundCaller = false;
    for (var ctor = me.constructor; ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) {
        if (ctor.prototype[opt_methodName] === caller) {
            foundCaller = true;
        } else if (foundCaller) {
            return ctor.prototype[opt_methodName].apply(me, args);
        }
    }

    // If we did not find the caller in the prototype chain, then one of two
    // things happened:
    // 1) The caller is an instance method.
    // 2) This method was not called by the right caller.
    if (me[opt_methodName] === caller) {
        return me.constructor.prototype[opt_methodName].apply(me, args);
    } else {
        throw Error(
            'goog.base called from a method of one name ' +
            'to a method of a different name');
    }
};

goog.inherits = function(childCtor, parentCtor) {
    /** @constructor */
    function tempCtor() {};
    tempCtor.prototype = parentCtor.prototype;
    childCtor.superClass_ = parentCtor.prototype;
    childCtor.prototype = new tempCtor();
    /** @override */
    childCtor.prototype.constructor = childCtor;

    /**
     * Calls superclass constructor/method.
     *
     * This function is only available if you use goog.inherits to
     * express inheritance relationships between classes.
     *
     * NOTE: This is a replacement for goog.base and for superClass_
     * property defined in childCtor.
     *
     * @param {!Object} me Should always be "this".
     * @param {string} methodName The method name to call. Calling
     *     superclass constructor can be done with the special string
     *     'constructor'.
     * @param {...*} var_args The arguments to pass to superclass
     *     method/constructor.
     * @return {*} The return value of the superclass method/constructor.
     */
    childCtor.base = function(me, methodName, var_args) {
        // Copying using loop to avoid deop due to passing arguments object to
        // function. This is faster in many JS engines as of late 2014.
        var args = new Array(arguments.length - 2);
        for (var i = 2; i < arguments.length; i++) {
            args[i - 2] = arguments[i];
        }
        return parentCtor.prototype[methodName].apply(me, args);
    };
};


defineD = function(namespace) {
    var last = window,
        current = '';
    while (namespace) {
        current = namespace.indexOf('.') != -1 ? namespace.substring(0, namespace.indexOf('.')) : namespace;
        namespace = namespace.indexOf('.') != -1 ? namespace.substring(namespace.indexOf('.') + 1) : undefined;
        last[current] = last[current] || {};
        last = last[current];
    }
    return last;
};


function getXMLResource(url, handler, selector, ) {
    $.ajax({
            type: "GET",
            url: url,
            dataType: "html"
        })
        .done(function(data) {
            handler($(data));
        });
};

openDesign.UI = {
    init: function() {
        var self = this;
        var url = "ui/open/res/ui.xml";
        var handler = function(data) {
            self.uiXml = data;
            var pwindow = self.uiXml.find("#openDesignWindow");
            $(".openAndSave", "#ui-container").append(pwindow);
            $("#openDesignWindow .title").html(ResourceManager.getString("open_my_design"));
            var sc;
            $.OpenDesign(".contentsWrapper").on('scroll', function(e) {
                clearTimeout(sc);
                sc = setTimeout(function(e) {
                    if (openDesign.Constants.scrollable &&
                        ($.OpenDesign(".contentsWrapper")[0].scrollHeight == ($.OpenDesign(".contentsWrapper").scrollTop() + $.OpenDesign(".contentsWrapper").height()))
                    ) {
                        openDesign.Handler.loadProjectsByUser(adskUser.sid, openDesign.Constants.offset, openDesign.Constants.limit, true);
                    }
                }, 200);
            });
        };
        var selector = ".openWd";
        getXMLResource(url, handler, selector);
    }
}
