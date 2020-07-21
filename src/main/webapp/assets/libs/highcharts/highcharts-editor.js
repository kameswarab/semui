/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/


//////////////////////////////////////////////////////////////////////////////

/** The main highcharts editor namespace 
 * @ignore
 */
var highed = {
    schemas: {},
    meta: {},
    plugins: {},

    /** Clear an object 
      * Deletes all the object attributes.
      * Useful when needing to clear an object without invalidating references to it
      * @namespace highed
      * @param obj {object} - the object to clear
     */
    clearObj: function (obj) {
        Object.keys(obj).forEach(function (key) {
            delete obj[key];
        });
    },

    /** Preform an AJAX request. Same syntax as jQuery. 
     *  @namespace highed
     *  @param p {object} - options
     *    > url {string} - the URL to call
     *    > type {enum} - the type of request
     *    > dataType {enum} - the type of data expected
     *    > success {function} - function to call on success
     *    > error {function} - function to call on request fail
     *    > data {object} - the payload
     *    > autoFire {boolean} - wether or not to fire the request right away
     * 
     *   @emits Error {string} - when there's an error 
     *   @emits OK {string} - when the request succeeded
     *   @returns {object} - interface to the request
     */
    ajax: function (p) {
        var props = highed.merge({
            url: false,
            type: 'GET',
            dataType: 'json',
            success: false,
            error: false,
            data: {},
            autoFire: true
          }, p),
          headers = {
            json: 'application/json',
            xml: 'application/xml',
            text: 'text/plain',
            octet: 'application/octet-stream'
          },
          r = new XMLHttpRequest(),
          events = highed.events()
        ;

        if (!props.url) return false;

        r.open(props.type, props.url, true);
        r.setRequestHeader('Content-Type', headers[props.dataType] || headers.text);

        r.onreadystatechange = function () {
            events.emit('ReadyStateChange', r.readyState, r.status);

            if (r.readyState === 4 && r.status === 200) {         
              if (props.dataType === 'json') {        
                try {
                  var json = JSON.parse(r.responseText);
                  if (highed.isFn(props.success)) {
                    props.success(json);        
                  }
                  events.emit('OK', json);
                } catch(e) {
                  if (highed.isFn(props.error)) {
                    props.error(e.toString(), r.responseText);
                  }
                  events.emit('Error', e.toString(), r.status);
                }      
              } else {
                if (highed.isFn(props.success)) {
                  props.success(r.responseText);
                }        
                events.emit('OK', r.responseText);
              }         
            } else if (r.readyState === 4) {
              events.emit('Error', r.status, r.statusText);
              if (highed.isFn(props.error)) {
                props.error(r.status, r.statusText);
              }
            }
        };

        function fire() {
            try {
              r.send(JSON.stringify(props.data));            
            } catch (e) {
              r.send(props.data || true);      
            }    
        }

        if (props.autoFire) {
            fire();    
        }

        return {
            on: events.on,
            fire: fire,
            request: r
        };
    },

    /** Generate a uuid 
     *  Borrowed from http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
     *  @namespace highed
     *  @returns {string} - a UUID string
     */
    uuid: function () {
        var d = new Date().getTime(), uuid;
        
        if (window.performance && typeof window.performance.now === "function") {
            d += performance.now(); //use high-precision timer if available
        }
        
        uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
    },

    /** Map an array to an object
     *  @namespace highed
     *  @param {array} arr - the array to map
     *  @return {object} - an object with the array contents as keys, and their value set to true
     */
    arrToObj: function (arr) {
        var obj = {};

        if (highed.isStr(arr)) {
            arr = arr.split(' ');
        }

        arr.forEach(function (thing) {
            obj[thing] = true;
        });

        return obj;
    },

    /** Make a camel back string pretty
     *  Transforms e.g. `imACamelBackString` to `Im a camelback string`.
     *  @namespace highed
     *  @param str {string} - the input string
     *  @return {string} - the transformed string
     */
    uncamelize: function (str) {
        var s = '';

        if (!str) {
            return str;
        }

        if (str.length < 0 || !str) {
            return str;
        }

        for (var i = 0; i < str.length; i++) {
            if (str[i] === str[i].toUpperCase()) {
                s += ' ';
            }
            s += str[i];            
        }

        return s[0].toUpperCase() + s.substr(1);
    },

    /** Clamp a number between min/max
     *  @namespace highed
     *  @param min {number} - minimum value
     *  @param max {number} - maximum value
     *  @returns {number} - the clamped value
     */
    clamp: function (min, max, value) {
        if (value < min) return min;
        if (value > max) return max;
        return value;
    },

    /** Convert a hex value to RGB
     *
     *  @namespace highed
     *  @param {string} hex - the hex string
     *  @return {object} - an object with rgb components
     *    > r {number} - red
     *    > g {number} - green
     *    > b {number} - blue
     */
    hexToRgb: function (hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {
            r: 0, g: 0, b: 0
        };
    },

    /** Invert a color 
     *  @namespace highed
     *  @param {string} hex - the color to invert
     *  @return {string} - new hex color
     */
    invertHexColor: function (hex) {
        var rgb = highed.hexToRgb(hex),
            res = 0
        ;

        rgb.r = 255 - rgb.r;
        rgb.g = 255 - rgb.g;
        rgb.b = 255 - rgb.b;

        res = rgb.r << 16;
        res |= rgb.g << 8;
        res |= rgb.b;

        return '#' + res;
    },

    /** Return #FFF or #000 based on the intensity of a color
     *  @namespace highed
     *  @param {string} hex - input color
     *  @return {string} - the new hex color
     */
    getContrastedColor: function (hex) {
        var rgb = highed.hexToRgb(hex),
            avarage = (rgb.r + rgb.g + rgb.b) / 3
        ;

        if (avarage > 150) {
            return '#000';
        }
        return '#FFF';
    },

    /** Convert a string to a bool
     *  @namespace highed
     *  @param {string} what - the string to convert
     *  @return {bool} - the resulting bool
     */
    toBool: function (what) {
        return what === 'true' || what === true || what === 'on';
    },

    /** Set a property based on -- delimited path  
     *  @namespace highed
     *  @param {object} obj - the object to modify
     *  @param {string} path - the path to the attribute to change
     *  @param {anything} value - the value to set
     */
    setAttr: function (obj, path, value, index) {
        var current = obj;

        if (highed.isArr(obj)) {
            obj.forEach(function (thing) {
                highed.setAttr(thing, path, value, index);
            });
            return;
        }

        path = path.replace(/\-\-/g, '.').replace(/\-/g, '.').split('.');

        path.forEach(function(p, i) {
            if (i === path.length - 1) {  
                current[p] = value;                                     
            } else {
                if (typeof current[p] === 'undefined') {
                    current = current[p] = {};
                } else {
                    current = current[p]; 

                    if (highed.isArr(current)) {
                        if (index > current.length - 1) {
                            for (var j = current.length; j <= index; j++ ) {
                                current.push({});
                            }
                        } 
                        if (index >= 0) {
                            current = current[index];                            
                        }
                    }                      
                }
            }
        });
    },

    /** Get a property based on -- delimited path  
     *  @namespace highed
     *  @param {object} obj - the object to traverse
     *  @param {string} path - the path to the attribute to get
     *  @returns {anything} - the value or false
     */
    getAttr: function (obj, path, index) {
        var current = obj,
            result = false
        ;

        if (highed.isArr(obj)) {
            obj.forEach(function (thing) {
                result = highed.getAttr(thing, path);
            });
            return result;
        }

        path = path.replace(/\-\-/g, '.').replace(/\-/g, '.').split('.');

        path.forEach(function(p, i) {
            if (i === path.length - 1) {  
                if (typeof current !== 'undefined') {
                    result = current[p];                                     
                } 
            } else {
                if (typeof current[p] === 'undefined') {
                    current = current[p] = {};
                } else {
                    current = current[p];         

                    if (highed.isArr(current) && index >= 0 && index < current.length) {
                        current = current[index];
                    }               
                }
            }
        });

        return result;
    },

    /** Deep merge two objects.
     * Note: this modifies object `a`!
     * @namespace highed
     * @param {object} a - the destination object
     * @param {object} b - the source object
     * @return {object} - argument a
     */
    merge: function (a, b) {
        if (!a || !b) return a || b;    
        Object.keys(b).forEach(function (bk) {
         if (highed.isNull(b[bk]) || highed.isBasic(b[bk])) {
            a[bk] = b[bk];
         } else if (highed.isArr(b[bk])) {
           
           a[bk] = [];
           
           b[bk].forEach(function (i) {
             if (highed.isNull(i) || highed.isBasic(i)) {
               a[bk].push(i);
             } else {
               a[bk].push(highed.merge({}, i));
             }
           });
         } else if (b[bk].tagName && b[bk].appendChild && b[bk].removeChild && b[bk].style) {  
            a[bk] = b[bk];
         } else {
            a[bk] = a[bk] || {};
            highed.merge(a[bk], b[bk]);
         }          
        });    
        return a;
    },

    /** Check if something is null or undefined
     *  @namespace highed
     *  @param {anything} what - the value to check
     *  @return {bool} - true if nulll
     */
    isNull: function (what) {
        return (typeof what === 'undefined' || what === null);
    },

    /** Check if something is a string 
     *  @namespace highed
     *  @param {anything} what - the value to check
     *  @return {bool} - true if string
     */
    isStr: function (what) {
        return (typeof what === 'string' || what instanceof String);
    },

    /** Check if something is a number
     * @namespace highed
     *  @param {anything} what - the value to check
     *  @return {bool} - true if number
     */
    isNum: function(what) {
        return !isNaN(parseFloat(what)) && isFinite(what);
    },

    /** Check if a value is a function
     * @namespace highed
     * @param {anything} what - the value to check
     * @return {bool} - true if function
     */
    isFn: function (what) {
        return (what && (typeof what === 'function') || (what instanceof Function));
    },

    /** Check if a value is an array
     * @namespace highed
     * @param {anything} what - the value to check
     * @return {bool} - true if array
     */
    isArr: function (what) {
        return (!highed.isNull(what) && what.constructor.toString().indexOf("Array") > -1);
    },

    /** Check if a value is a boolean
     * @namespace highed
     * @param {anything} what - the value to check
     * @return {bool} - true if bool
     */
    isBool: function (what) {
        return (what === true || what === false);
    },

    /** Check if a value is a basic type
     * A basic type is either a bool, string, or a number
     * @namespace highed
     * @param {anything} what - the value to check
     * @return {bool} - true if basic
     */
    isBasic: function (what) {
        return !highed.isArr(what) && (highed.isStr(what) || highed.isNum(what) || highed.isBool(what) || highed.isFn(what));
    }
};

//Stateful functions
(function () {
    var logLevels = [
            'error',
            'warn',
            'notice',
            'verbose'
        ],
        currentLogLevel = 4,
        initQueue = [],
        isReady = false,
        includedScripts = {},
        cdnScripts = [
            "https://code.highcharts.com/stock/highstock.js",   
            "http://code.highcharts.com/adapters/standalone-framework.js",  
            "https://code.highcharts.com/highcharts-more.js",   
            "https://code.highcharts.com/highcharts-3d.js", 
            "https://code.highcharts.com/modules/data.js",  
            "https://code.highcharts.com/modules/exporting.js"
        ]
    ;

    ///////////////////////////////////////////////////////////////////////////
    
    function pollForReady() {
        if (!isReady) {
            if (document.body) {
                isReady = true;
                initQueue.forEach(function (fn) {
                    fn();
                });
            } else {
                setTimeout(pollForReady, 100);
            }
        }
    }

    pollForReady();

    ///////////////////////////////////////////////////////////////////////////

    /** Add a function to call when the document is ready
     * @param {function} fn - the function to call
     */
    highed.ready = function (fn) {
        if (highed.isFn(fn)) {
            if (isReady) {
                fn();
            } else {
                initQueue.push(fn);
            }
        }
    };

    /** Log something
     * Accepts a variable amount of arguments after `level` which will be
     * the log message (similar to `console.log`).
     * @param {number} level - the log level 1..4    
     */
    highed.log = function (level) {
        var things = (Array.prototype.slice.call(arguments));
        things.splice(0, 1);

        if (level <= currentLogLevel) {
            console.log.apply(undefined, [logLevels[level - 1] + ':'].concat(things));
        }
    };

    /** Include something 
     *  @namespace highed
     *  @param what {string} - URL to a css or javascript file
     *  @param fn {function} - function to call when done including the script
     */
    highed.include = function (what, fn) {
        var n;

        function next() {
            if (n < what.length - 1) {
                highed.include(what[++n], next);
            }

            return highed.isFn(fn) && fn();
        }

        if (highed.isArr(what)) {
            n = -1;
            return next();            
        }

        if (includedScripts[what]) {
            highed.log(3, 'script already included, skipping:', what);
            return fn();
        }
        
        highed.log(3, 'including script', what);
        includedScripts[what] = true;

        if (what.lastIndexOf('.css') === what.length - 4) {
            n = highed.dom.cr('link');
            n.rel = 'stylesheet';
            n.type = 'text/css';
            n.href = what;
            n.onload = fn;
        } else {
            n = highed.dom.cr('script');
            n.src = what;
            n.onload = fn;
        }

        highed.dom.ap(document.head, n);
    };

    ///////////////////////////////////////////////////////////////////////////

 //   highed.ready(function () {
        //Include the highcharts scripts
    // function tryAddScripts() {
    //     if (document.head) {
    //         cdnScripts.forEach(function (script) {
    //             var s = document.createElement('script');
    //             s.src = script;
    //             document.head.appendChild(s);
    //         });            
    //     } else {
    //         setTimeout(tryAddScripts, 10);            
    //     }
    // }

    // tryAddScripts();


    // function include(script, next) {
    //     var sc=document.createElement("script");
    //     sc.src = script;
    //     sc.type="text/javascript";
    //     sc.onload=function() {
    //         if (++next < incl.length) {
    //             include(incl[next], next);
    //         } else {
    //             loadedScripts = true;
    //         }
    //     };
    //     document.head.appendChild(sc);
    // }

    // var inc = {},
    //     incl = []
    // ; 

    // document.querySelectorAll("script").forEach(function(t) {inc[t.src.substr(0, t.src.indexOf("?"))] = 1;});

    // Object.keys(cdnScripts).forEach(function (k){
    //     if (!inc[k] && k && k.length > 0) {
    //         incl.push(k)
    //     }
    // });

    // if (incl.length > 0) { include(incl[0], 0); } else {loadedScripts = true;}
})();
/*******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

/** Namespace for DOM helper functions 
 * @ignore
 */
highed.dom = {
    /** Append a set of nodes to another node.
     * Arguments supplied after the @param {} target represents the children to append.
     * @namespace highed.dom
     * @param target {object} - the node to append to
     * @return {domnode} - the target
     */
    ap: function (target) {
        var children = (Array.prototype.slice.call(arguments));
        children.splice(0, 1);

        target = highed.dom.get(target);
        
        if (!highed.isNull(target) && typeof target.appendChild !== 'undefined') {
            children.forEach(function (child) {
                if (highed.isArr(child)) {
                  child.forEach(function (sc) {
                    highed.dom.ap(target, sc);
                  });
                } else if (typeof child !== 'undefined' && typeof child.appendChild !== 'undefined') {
                    target.appendChild(child);                  
                } else if (child !== false) {
                    highed.log(1, 'child is not valid (highed.dom.ap)');
                }
            });
        } else {
            highed.log(1, 'target is not a valid DOM node (highed.dom.ap)');
        }

        return target;
    },

    /** Create a set of options for a select
     * @namespace highed.dom
     * @param select {HTMLSelect} - the dropdown to add options to
     * @param options {(array|object)} - the options as an array or as an object keyed on ID
     */
    options: function (select, options, selected) {
        if (highed.isNull(options)) {

        } else if (highed.isArr(options)) {
            options.forEach(function (option) {
                highed.dom.ap(select,
                    highed.dom.cr('option', '', option, option)
                );
            });

            if (selected) {
              select.selectedIndex = selected;
            }
        } else if (highed.isStr(options)) {
            try {
                highed.dom.options(select, JSON.parse(options));
            } catch (e) {
                highed.log(e + ' in highed.options (json parser)');
            }
        } else {
            Object.keys(options).forEach(function (key) {
                highed.dom.ap(select,
                    highed.dom.cr('option', '', options[key], key)
                );
            });
        }
    },

    /** Show a node when another is hovered
     * @namespace highed.dom
     * @param parent {object} - the node to listen for the hover on
     * @param child {object} - the node to show when the parent is hovered
     */
    showOnHover: function (parent, child) {
        if (highed.isArr(child)) {
            child.forEach(function (c) {
                highed.dom.showOnHover(parent, c);
            });
            return;
        }

        highed.dom.on(parent, 'mouseover', function () {
            highed.dom.style(child, {
                //display: 'block',
                opacity: 1,
            //  background: 'rgba(46, 46, 46, 0.85)',
                'pointer-events': 'auto'
            });
        });

        highed.dom.on(parent, 'mouseout', function () {
            highed.dom.style(child, {
                //display: 'none',
                opacity: 0,
                //background: 'rgba(0, 0, 0, 0)',
                'pointer-events': 'none'
            });
        });
    },

    /** Create a new HTML node
     * @namespace highed.dom
     * @param type {string} - the type of node to create
     * @param cssClass {string} (optional) - the css class to use for the node
     * @param innerHTML {string} (optional) - the inner html of the new node
     * @param id {string} (optional) - the id of the new node
     *
     * @return {domnode} - the new dom node
     */
    cr: function (type, cssClass, innerHTML, id) {
        var res = false;

        if (typeof type !== 'undefined') {
            res = document.createElement(type);
            
            if (typeof cssClass !== 'undefined') {
                res.className = cssClass;
            }

            if (typeof innerHTML !== 'undefined') {
                res.innerHTML = innerHTML;
            }

            if (typeof id !== 'undefined') {
                res.id = id;
            }
        } else {
            highed.log(1, 'no node type supplied (highed.dom.cr');          
        }

        return res;
    },

    /** Style a node
     * @namespace highed.dom
     * @param nodes {(object|array)}  - the node to style. Can also be an array
     * @param style {object} - object containing style properties
     *
     * @return {anything} - whatever was supplied to @param {} nodes
     */
    style: function (nodes, style) {
        if (highed.isArr(nodes)) {
            nodes.forEach(function (node) {
                highed.dom.style(node, style);
            });
            return nodes;
        }

        if (nodes && nodes.style) {
            Object.keys(style).forEach(function (p) {
                nodes.style[p] = style[p];
            });
          return nodes;
        }
        return false;
    },

    /** Attach an event listener to a dom node
     * @namespace highed.dom
     * @param target {object} - the dom node to attach to
     * @param event {string} - the event to listen for
     * @param callback {function} - the function to call when the event is emitted
     * @param context {object} (optional) - the context of the callback function
     *
     * @return {function} - a function that can be called to unbind the handler
     */
    on: function (target, event, callback, context) {
        var s = [];

        if (!target) {
          return function () {};
        }
    
        if (target === document.body && event === 'resize') {
          //Need some special magic here eventually.
        }
        
        if (target && target.forEach) {
          target.forEach(function (t) {
            s.push(highed.dom.on(t, event, callback));
          });
        }
        
        if (s.length > 0) {
          return function () {
            s.forEach(function (f) {
              f();
            });
          };
        }

        function actualCallback() {
          if (highed.isFn(callback)) {
            return callback.apply(context, arguments);
          }
          return;
        }

        if (target.addEventListener) {
          target.addEventListener(event, actualCallback, false);
        } else {
          target.attachEvent('on' + event, actualCallback, false);
        }   

        return function () {
          if (window.removeEventListener) {
            target.removeEventListener(event, actualCallback, false);
          } else {
            target.detachEvent('on' + event, actualCallback);
          }
        };
    },

    /** Get or set the value of a node
     * @namespace highed.dom
     * @param node {object} - the node to get the value of
     * @param value {(string|bool|number)} (optional) - the value to set
     * @return {anything} - the value
     */
    val: function (node, value) {
        if (node.tagName === 'SELECT') {
            if (node.selectedIndex >= 0) {
                if (!highed.isNull(value)) {
                    for (var i = 0; i < node.options.length; i++) {
                        if (node.options[i].id === value) {
                            node.selectedIndex = i;
                            break;
                        }
                    }
                }
                return node.options[node.selectedIndex].id;
            }           
        } else if (node.tagName === 'INPUT') {
            if (node.type === 'checkbox') {
                if (!highed.isNull(value)) {
                    node.checked = highed.toBool(value);
                }
                return node.checked;
            }
            if (!highed.isNull(value)) {
                node.value = value;
            }
            return node.value;
        } else {
            if (!highed.isNull(value)) {
                node.innerHTML = value;
            }
            return node.innerText;
        }

        return false;
    },

    /** Get the size of a node
     * @namespace highed.dom
     * @param node {object} - the node to get the size of
     * @return {object} - the size as an object `{w, h}`
     */
    size: function (node) {
        return {
            w: node.clientWidth,
            h: node.clientHeight
        };
    },

    /** Get the position of a node
     * @namespace highed.dom
     * @param node {object} - the node to get the position of
     * @return {object} - the position as an object `{x, y}`
     */
    pos: function (node) {
        return {
            x: node.offsetLeft,
            y: node.offsetTop
        };
    },

    /** Find a node
     * @namespace highed.dom
     * @param node {object} - the node to find. Either a string or an actual node instance
     * @return {object} - the node or false if the node was not found
     */
    get: function (node) {
        if (node && node.appendChild) {
            return node;
        }
        return document.getElementById(node) || false;
    }
};
/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

/** Event dispatcher object
 *  Constructs an instance of an event dispatcher when called. 
 *  @constructor
 *  @example
 *  var events = highed.events();
 *  events.on('foobar', function () {console.log('Hello world!')});
 *  events.emit('foobar');
 */
highed.events = function () {
    var callbacks = {},
        listenerCounter = 0
    ;

    /** Listen to an event
      * @memberof highed.events
      * @param event {string} - the event to listen for
      * @param callback {function} - the function to call when the event is emitted
      * @returns {function} - function that can be called to unbind the listener
      */
    function on(event, callback, context) {
        var id = ++listenerCounter;

        if (highed.isArr(callback)) {
            return callback.forEach(function (cb) {
                on(event, cb, context);
            });
        }

        callbacks[event] = callbacks[event] || [];

        callbacks[event].push({
            id: id,
            fn: callback,
            context: context
        });

        return function () {
            callbacks[event] = callbacks[event].filter(function (e) {
                return e.id !== id;
            });
        };
    }

    return {
        on: on,

        /** Emit an event
         * Note that the function accepts a variable amount of arguments. Any arguments after the event name will be passed on to any event listeners attached to the event being emitted.         
         * @memberof highed.events
         * @param event {string} - the event to emit         
         * @return {number} - The number of events dispatched
         */
        emit: function (event) {
            var args = Array.prototype.slice.call(arguments);
            args.splice(0, 1);

            if (typeof callbacks[event] !== 'undefined') {

                callbacks[event].forEach(function (event) {
                    if (highed.isFn(event.fn)) {
                        event.fn.apply(event.context, args);
                    }
                });

                return callbacks[event].length;
            }
            return 0;
        }
    };
};
/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

/** 
 * @ignore
 */
highed.ready(function () {
    var uploader = highed.dom.cr('input'),
        cb = false
    ;

    uploader.type = 'file';
    uploader.accept = '.csv';

    highed.dom.ap(document.body, uploader);

    highed.dom.style(uploader, {
        display: 'none'
    });


 /** Upload and parse a local file
  *  Borrowed from almostvanilla which is licensed under MIT.
  *  @param props
  *     > type {string} - the type of data to load
  *     > accept {string} - the accepted file extensions
  *     > multiple {boolean} - allow multiple files
  *     > progress {function} - progress callback
  *       > {number} - the progress in percent
  *     > success {function} - function called when the file is uploaded
  *       > {object} - the file information
  *         > filename {string} - the name of the file
  *         > size {number} - the size of the file in bytes
  *         > data {string} - the file data  
  */  
  highed.readLocalFile = function (props) {
    var p = highed.merge({
          type: 'text',
          multiple: false,
          accept: '.csv'            
        }, props)
    ;

    uploader.accept = p.accept;
    
    if (highed.isFn(cb)) {
      cb();
    }  
      
    cb = highed.dom.on(uploader, 'change', function () {      
      function crReader(file) {
        var reader = new FileReader();
                
        reader.onloadstart = function (evt) {
          if (highed.isFn(p.progress)) {
            p.progress(Math.round( (evt.loaded / evt.total) * 100));
          }
        };
        
        reader.onload = function (event) {
          var data = reader.result;
          
          if (p.type === 'json') {
            try {
              data = JSON.parse(data);
            } catch (e) {
              if (highed.isFn(p.error)) {
                p.error(e);
              }
            }
          }
          
          if (highed.isFn(p.success)) {
            p.success({
              filename: file.name,
              size: file.size,
              data: data 
            });
          }    
        };
        
        return reader;
      }
      
      for (var i = 0; i < uploader.files.length; i++) {
        if (!p.type || p.type === 'text' || p.type === 'json') {
          crReader(uploader.files[i]).readAsText(uploader.files[i]);                            
        } else if (p.type === 'binary') {
          crReader(uploader.files[i]).readAsBinaryString(uploader.files[i]);
        } else if (p.type === 'b64') {
          crReader(uploader.files[i]).readAsDataURL(uploader.files[i]);
        }
      }      
    });
    
    uploader.multiple = p.multiple;
    
    uploader.click();
  };
});
/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

(function () {

    /** Show a dimmer backdrop 
     *
     *  Used to catch input when showing modals, context menues etc.
     *
     *  @example
     *  highed.showDimmer(function () {
     *       alert('You clicked the dimmer!');
     *  });
     *
     *  @param {function} fn - the function to call when the dimmer is clicked
     *  @param {bool} autohide - set to true to hide the dimmer when it's clicked
     *  @param {bool} transparent - set to true for the dimmer to be transparent
     *  @param {number} zIndex - the z index *offset* 
     *  @return {function} - A function that can be called to hide the dimmer
     */
    highed.showDimmer = function (fn, autohide, transparent, zIndex) {
        var dimmer = highed.dom.cr('div', 'highed-dimmer'),
            unbinder = false
        ;


        highed.dom.ap(document.body, dimmer);

        highed.dom.style(dimmer, {
            'opacity': 0.7,
            'pointer-events': 'auto',
            'z-index': 9999 + (zIndex || 0)
        });

        if (transparent) {
            highed.dom.style(dimmer, {
                'opacity': 0
            });
        }

        function hide () {
            highed.dom.style(dimmer, {
                'opacity': 0,
                'pointer-events': 'none'
            });

            if (highed.isFn(unbinder)) {
                unbinder();
                unbinder = false;
            }

            setTimeout(function () {
                if (dimmer.parentNode) {
                    dimmer.parentNode.removeChild(dimmer);                    
                }
            }, 300);
        }

        unbinder = highed.dom.on(dimmer, 'click', function (e) {
            
            if (highed.isFn(fn)) {
                fn();
            }
            
            if (autohide) {
                hide();
            }
        });

        return hide;
    };

})();

/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

/** Turn a DOM node into an overlay "popup"
 *
 *  @example
 *  //Create an overlay with hello world in it
 *  highed.OverlayModal(highed.dom.cr('h1', '', 'Hello World!'));
 *
 *  @constructor
 *
 *  @emits Show - when the overlay is shown
 *  @emits Hide - when the overlay is hidden
 *
 *  @param {object} contents - the DOM node to wrap. Properties is an object as such: `{wdith, height, minWidth, minHeight}`
 *  @param {object} attributes - properties for the modal
 *  @return {object} - A new instance of OverlayModal
 */
highed.OverlayModal = function (contents, attributes) {
    var container = highed.dom.cr('div', 'highed-overlay-modal'),
        events = highed.events(),
        properties = highed.merge({
            width: 200,
            height: 200,
            minWidth: 690,
            minHeight: 0,
            showOnInit: true
        }, attributes),
        hideDimmer = false,
        visible = false
    ;

    ///////////////////////////////////////////////////////////////////////////

    /** Show the modal
     *  @memberof highed.OverlayModal
     */
    function show() {
        if (visible) return;

        highed.dom.style(container, {
            width: properties.width + (properties.width.indexOf('%') > 0 ? '' : 'px'),
            height: properties.height + (properties.height.indexOf('%') > 0 ? '' : 'px'),
            opacity: 1,
            'pointer-events': 'auto',
            'min-width': properties.minWidth + 'px',
            'min-height': properties.minHeight + 'px'
        });

        highed.dom.style(document.body, {
            'overflow-x': 'hidden',
            'overflow-y': 'hidden'
        });

        hideDimmer = highed.showDimmer(hide, true);

        setTimeout(function () {
            events.emit('Show');            
        }, 300);

        visible = true;
    }

    /** Hide the modal
     *  @memberof highed.OverlayModal
     *  @param suppress {boolean} - supress the hide event emitting
     */
    function hide(supress) {
        if (!visible) return;

        highed.dom.style(container, {
            width: '0px',
            height: '0px',
            opacity: 0,
            'pointer-events': 'none'
        });

        highed.dom.style(document.body, {
            'overflow-x': '',
            'overflow-y': ''
        });

        if (highed.isFn(hideDimmer)) {
            hideDimmer();
        }

        visible = false;

        if (!supress) {
            events.emit('Hide');            
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    
    highed.dom.ap(document.body, 
        container
    );

    if (contents) {
        highed.dom.ap(container,
            contents
        );
    }

    hide(true);

    ///////////////////////////////////////////////////////////////////////////

    //Public interface
    return {
        on: events.on,        
        show: show,        
        hide: hide,
        /** The container DOM node
         *  @memberof highed.OverlayModal
         */
        body: container
    };
};
/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

/** Horizontal splitter
 *
 *  Splits a view into two horizontal cells
 *
 *  @example
 *  var splitter = highed.HSplitter(document.body);
 *  highed.dom.ap(splitter.left, highed.dom.cr('div', '', 'Left!')); 
 *  highed.dom.ap(splitter.right, highed.dom.cr('div', '', 'Right!')); 
 *
 *  @constructor
 *  @param parent {domnode} - the parant to attach to
 *  @param attributes {object} - the settings for the splitter
 *    > leftWidth {number} - the width in percent of the left cell
 *    > noOverflow {bool} - wether or not overflowing is allowed
 */
highed.HSplitter = function (parent, attributes) {
    var properties = highed.merge({
            leftWidth: 40,
            noOverflow: false
        }, attributes),
        container = highed.dom.cr('div', 'highed-hsplitter'),
        left = highed.dom.cr('div', 'panel left'),
        right = highed.dom.cr('div', 'panel right'),
        leftBody = highed.dom.cr('div', 'highed-hsplitter-body'),
        rightBody = highed.dom.cr('div', 'highed-hsplitter-body')
    ;

    ///////////////////////////////////////////////////////////////////////////

    /** Force a resize of the splitter
     *  @memberof highed.HSplitter
     *  @param w {number} - the width of the splitter (will use parent if null)
     *  @param h {number} - the height of the splitter (will use parent if null)
     */
    function resize(w, h) {
        var s = highed.dom.size(parent);

        highed.dom.style([left, right, container], {
            height: (h || s.h) + 'px'
        });
    }
    
    ///////////////////////////////////////////////////////////////////////////

    highed.dom.ap(highed.dom.get(parent), 
        highed.dom.ap(container, 
            highed.dom.ap(left, leftBody),
            highed.dom.ap(right, rightBody)
        )
    );

    highed.dom.style(left, {
        width: properties.leftWidth + '%'
    });

    highed.dom.style(right, {
        width: (100 - properties.leftWidth) + '%'
    });

    if (properties.noOverflow) {
        highed.dom.style([container, left, right], {
            'overflow-y': 'hidden'
        });
    }

    parent = highed.dom.get(parent);

    ///////////////////////////////////////////////////////////////////////////

    // Public interface
    return {
        resize: resize,
        /** The dom node for the left cell
         *  @memberof highed.HSplitter
         *  @type {domnode}
         */
        left: leftBody,
        /** The dom node for the right cell
         *  @memberof highed.HSplitter
         *  @type {domnode}
         */
        right: rightBody
    };
};
/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

/** Vertical splitter
 *  Splits a view into two vertical cells
 *
 *  @example
 *  var splitter = highed.VSplitter(document.body);
 *  highed.dom.ap(splitter.top, highed.dom.cr('div', '', 'Top!')); 
 *  highed.dom.ap(splitter.bottom, highed.dom.cr('div', '', 'Bottom!')); 
 *
 *  @constructor
 *  @param parent {domnode} - the parant to attach to
 *  @param attributes {object} - the settings for the splitter
 *    > topHeight {number} - the height in percent of the left cell. Alternatively, use '123px' to set a capped size.
 *    > noOverflow {bool} - wether or not overflowing is allowed
 */
highed.VSplitter = function (parent, attributes) {
    var properties = highed.merge({
            topHeight: 40,
            noOverflow: false
        }, attributes),
        container = highed.dom.cr('div', 'highed-vsplitter'),
        top = highed.dom.cr('div', 'panel top'),
        bottom = highed.dom.cr('div', 'panel bottom'),
        topBody = highed.dom.cr('div', 'highed-vsplitter-body'),
        bottomBody = highed.dom.cr('div', 'highed-vsplitter-body')
    ;

    ///////////////////////////////////////////////////////////////////////////

    /** Force a resize of the splitter
     *  @memberof highed.VSplitter
     *  @param w {number} - the width of the splitter (will use parent if null)
     *  @param h {number} - the height of the splitter (will use parent if null)
     */
    function resize(w, h) {
        var s = highed.dom.size(parent);

         highed.dom.style(container, {
            width: (w || s.w) + 'px',
            height: (h || s.h) + 'px'
        });

        if (properties.topHeight.toString().indexOf('px') > 0) {
            highed.dom.style(top, {
                height: properties.topHeight
            });

            highed.dom.style(bottom, {
                height: (h || s.h) - (parseInt(properties.topHeight, 10)) + 'px'
            });

        } else {                       
            highed.dom.style(top, {
                height: properties.topHeight + '%'
            });

            highed.dom.style(bottom, {
                height: (100 - properties.topHeight) + '%'
            });
        }
        //highed.dom.style([top, bottom, container], {
        //    width: (w || s.w) + 'px'
        //});
    }
    
    ///////////////////////////////////////////////////////////////////////////

    highed.dom.ap(highed.dom.get(parent), 
        highed.dom.ap(container, 
            highed.dom.ap(top, topBody),
            highed.dom.ap(bottom, bottomBody)
        )
    );    

    if (properties.noOverflow) {
        highed.dom.style([container, top, bottom], {
            'overflow-x': 'hidden'
        });
    }

    parent = highed.dom.get(parent);

    ///////////////////////////////////////////////////////////////////////////

    // Public interface
    return {
        resize: resize,
        /** The dom node for the top cell
         *  @memberof highed.VSplitter
         *  @type {domnode}
         */
        top: topBody,
        /** The dom node for the bottom cell
         *  @memberof highed.VSplitter
         *  @type {domnode}
         */
        bottom: bottomBody
    };
};
/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

/** Standard tabcontrol compopnent
 *  @example 
 *  var tabs = highed.TabControl(document.body),
 *      tab1 = tabs.createTab({title: 'Tab 1'}),
 *      tab2 = tabs.createTab({title: 'Tab 2'})
 *  ;
 *  //Append things to tab1|tab2.body
 *
 *  @constructor
 *  
 *  @emits Focus {object} - when a new tab gets focus.
 * 
 *  @param parent {domnode} - the node to attach to
 *  @param noOverflow {boolean} - set to true to disable scrollbars
 */
highed.TabControl = function (parent, noOverflow) {
    var container = highed.dom.cr('div', 'highed-tab-control'),
        paneBar = highed.dom.cr('div', 'tabs'),
        body = highed.dom.cr('div', 'body'),
        indicator = highed.dom.cr('div', 'indicator'),

        events = highed.events(),
        selectedTab = false,
        tabs = []
    ;

    ///////////////////////////////////////////////////////////////////////////

    /** Force a resize of the tab control
     *  @memberof highed.TabControl
     *  @param w {number} - the width, uses parent width if null
     *  @param h {number} - the height, uses parent width if null
     */
    function resize(w, h) {
        var cs = highed.dom.size(parent),
            ps = highed.dom.size(paneBar)
        ;

        highed.dom.style(container, {
            height: (h || cs.h) + 'px'
        });

        highed.dom.style(body, {
            height: (h || cs.h) - ps.h + 'px'
        });
    
        //Also re-focus the active tab
        if (selectedTab) {
            selectedTab.focus();
        }
    }

    /** Select the first tab
     *  @memberof highed.TabControl
     */
    function selectFirst() {
        tabs.some(function (tab) {
            if (tab.visible()) {
                tab.focus();
                return true;
            }
        });
    }

    function updateVisibility() {
        var c = tabs.filter(function (a) {
            return a.visible();
        }).length;

        if (c < 2) {
            highed.dom.style(paneBar, {
                display: 'none'
            });
        } else {
            highed.dom.style(paneBar, {
                display: ''
            });
        }
    }

   

    /* Create and return a new tab
     * @memberof highed.TabControl
     * @name createTab
     * @properties - the properties for the tab:
     *   > title {string} - the title of the tab
     * @returns {object} - an interface to the tab
     *    > hide {function} - hide the tab
     *    > show {function} - show the tab
     *    > focus {function} - make the tab active
     *    > visible {function} - returns true if the tab is visible
     *    > body {domnode} - the tab body
     */
    function Tab(properties) {
        var tevents = highed.events(),
            tab = highed.dom.cr('div', 'tab', properties.title),
            tbody = highed.dom.cr('div', 'tab-body'),
            visible = true,
            texports = {}
        ;

        highed.dom.ap(paneBar, tab);
        highed.dom.ap(body, tbody);

        function hide() {
            visible = false;
            highed.dom.style(tab, {display: 'none'});
            updateVisibility();
        }

        function show() {
            visible = true;
            highed.dom.style(tab, {display: ''});
            updateVisibility();
        }

        function focus() {
            if (!visible) {
                return;
            }

            if (selectedTab) {
                selectedTab.node.className = 'tab';

                highed.dom.style(selectedTab.body, {
                    opacity: 0,
  //                  'pointer-events': 'none',
                    'display': 'none'
                });
            }

            highed.dom.style(indicator, {
                width: highed.dom.size(tab).w + 'px',
                left: highed.dom.pos(tab).x + 'px'
            });

            tab.className = 'tab tab-selected';

            highed.dom.style(tbody, {
                opacity: 1,
//                'pointer-events': 'auto',
                'display': 'block'
            });

            selectedTab = texports;
            tevents.emit('Focus');

            events.emit('Focus', texports);
        }

        highed.dom.on(tab, 'click', focus);

        texports = {
            on: tevents.on,
            focus: focus,
            node: tab,
            body: tbody,
            hide: hide,
            show: show,
            visible: function () {
                return visible;
            }
        };

        if (!selectedTab) {
            focus();
        }

        if (noOverflow) {
            highed.dom.style(tbody, {
                overflow: 'hidden'
            });
        }

        tabs.push(texports);

        resize();
        updateVisibility();

        return texports;
    }

    ///////////////////////////////////////////////////////////////////////////
    
    if (!highed.isNull(parent)) {

        highed.dom.ap(parent,
            highed.dom.ap(container, 
                highed.dom.ap(paneBar,
                    indicator
                ),
                body
            )
        );

        resize();
        updateVisibility();
    }

    ///////////////////////////////////////////////////////////////////////////

    return {
        on: events.on,
        createTab: Tab,
        resize: resize,
        selectFirst: selectFirst,
        /** Get the size of the title bar
         *  @memberof highed.TabControl
         *  @returns {object}
         *    > w {number} - the width of the control
         *    > h {number} - the height of the control
         */
        barSize: function () {
            return highed.dom.size(paneBar);
        }
    };
};
/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

/** An editable field
 *
 *  Creates a table row with thre columns:
 *    - label
 *    - widget
 *    - help icon
 * 
 *  @example
 *  //Create a table, append to body, add a color picker to it.
 *  highed.dom.ap(document.body,
 *      highed.dom.ap(highed.dom.cr('table'),
 *          highed.InspectorField('color', '#FFF', {
 *              title: 'Set the color!'  
 *          }, function (newValue) {
 *              highed.dom.style(document.body, {
 *                  backgroundColor: newValue   
 *              });
 *          })
 *      )
 *  );
 *
 *  @param type {enum} - the type of widget to use
 *    > string
 *    > number
 *    > range
 *    > boolean
 *    > color
 *    > font
 *    > options
 *    > object
 *  @param value {anything} - the current value of the field
 *  @param properties {object} - the properties for the widget
 *  @param fn {function} - the function to call when the field is changed
 *     > {anything} - the changed value
 *  @returns {domnode} - a DOM node containing the field + label wrapped in a tr
 */
highed.InspectorField = function (type, value, properties, fn, nohint) {
    var 
        fields = {
            string: function (val, callback) {
                var input = highed.dom.cr('input', 'highed-field-input');

                highed.dom.on(input, 'change', function () {
                    tryCallback(callback, input.value);
                });

                input.value = val || value;
                
                return input;
            },
            number: function (val, callback) {
                var input = highed.dom.cr('input', 'highed-field-input');

                input.type = 'number';

                if (!highed.isNull(properties.custom)) {
                    input.step = properties.custom.step;
                    input.min = properties.custom.minValue;
                    input.max = properties.custom.maxValue;                    
                }

                highed.dom.on(input, 'change', function () {
                    tryCallback(callback, parseFloat(input.value));
                });

                input.value = val || value;
                
                return input;
            },
            range: function (val, callback) {
                var f = highed.dom.cr('input', 'highed-field-input'),
                    indicator = highed.dom.cr('div', 'highed-field-range-indicator', '&nbsp;'),
                    nullIt = highed.dom.cr('span', 'highed-icon highed-field-range-null fa fa-undo', '')
                ;  

                f.className = 'highed-field-range';           
                f.type = 'range';
                f.step = properties.custom.step;
                f.min = properties.custom.minValue;
                f.max = properties.custom.maxValue;

                highed.dom.on(f, 'input', function () {
                    indicator.innerHTML = f.value;
                });

                highed.dom.on(f, 'change', function () {
                    tryCallback(callback, f.value);
                });

                if ((val || value) === null || ((val || value)) === 'null') {
                    indicator.innerHTML = 'auto';
                } else if (!highed.isNull(val || value)) {
                    indicator.innerHTML = val || value;                    
                } else {
                    indicator.innerHTML = '&nbsp;';
                }

                f.value = val || value;

                highed.dom.on(nullIt, 'click', function () {
                    f.value = 0;
                    indicator.innerHTML = 'auto';
                    tryCallback(callback, null);
                });

                return [f, indicator, nullIt];
            },
            boolean: function (val, callback) {
                var input = highed.dom.cr('input');             
                input.type = 'checkbox';

                input.checked = highed.toBool(val || value);

                highed.dom.on(input, 'change', function () {                    
                    tryCallback(callback, input.checked);
                });

                return input;
            },
            color: function (val, callback) {
                var box = highed.dom.cr('div', 'highed-field-colorpicker'); 

                function update(col, callback) {
                    box.innerHTML = col;
                    highed.dom.style(box, {
                        background: col,
                        color: highed.getContrastedColor(col)
                    });
                }           

                highed.dom.on(box, 'click', function (e) {
                    highed.pickColor(e.clientX, e.clientY, value, function (col) {
                        update(col);
                        tryCallback(callback, col);
                    });
                });

                update(val || value);

                return box;
            },
            font: function (val, callback) {
                return fields.string(val, callback);             

            },
            configset: function (val, callback) {
                return fields.string(val, callback);              
            },
            cssobject: function (val, callback) {
                var picker = highed.FontPicker(callback || fn, val || value);
                return picker.container;
            },
            options: function (val, callback) {
                var options = highed.dom.cr('select', 'highed-field-select');

                highed.dom.options(options, properties.values);

                highed.dom.val(options, val || value);

                highed.dom.on(options, 'change', function () {                    
                    tryCallback(callback, highed.dom.val(options));
                });

                return options;
            },
            object: function (val, callback) {
                //Create a sub-table of options
                var stable = highed.dom.cr('table', 'highed-customizer-table'),
                    wasUndefined = highed.isNull(val || value)
                ;

                val = val || {};

                if (properties && highed.isArr(properties.attributes)) {
                    properties.attributes.forEach(function (attr) {

                        val[attr.name] = val[attr.name] || attr.defaults || (attr.dataType.indexOf('object') >= 0 ? {} : '');

                        attr.title = highed.uncamelize(attr.title);

                        highed.dom.ap(stable, 
                            highed.InspectorField(attr.dataType, val[attr.name], attr, function (nval) {
                                val[attr.name] = nval;
                                tryCallback(callback, val);
                            })
                        );
                    });
                }

                if (wasUndefined) {
                    tryCallback(callback, val);
                }

                return stable;
            },
            array: function () {
                var container = highed.dom.cr('div'),
                    add = highed.dom.cr('span', 'highed-field-array-add fa fa-plus', ''),
                    itemsNode = highed.dom.cr('div', 'highed-inline-blocks'),
                    items = {},
                    itemCounter = 0,
                    itemTable = highed.dom.cr('table', 'highed-field-table')
                ;         

                if (highed.isStr(value)) {
                    try {
                        value = JSON.parse(value);
                    } catch (e) {

                    }
                }

                function addCompositeItem(val, supressCallback) {
                    var item,
                        rem = highed.dom.cr('span', 'highed-icon fa fa-trash'),
                        row = highed.dom.cr('tr'),
                        id = ++itemCounter
                    ;

                    function processChange(newVal) {
                        if (newVal) {
                            items[id].value = newVal;
                            doEmitCallback();                            
                        }
                    }

                    function doEmitCallback() {
                        if (highed.isFn(fn)) {
                            fn(Object.keys(items).map(function (key) {
                                return items[key].value;  
                            }));
                        }    
                    }

                    items[id] = {
                        id: id,
                        row: row,
                        value: val
                    };

                    item = fields[properties.subType] ? 
                           fields[properties.subType](val, processChange) : 
                           fields.string(val, processChange);
                    
                    highed.dom.ap(itemTable, 
                        highed.dom.ap(row,
                            highed.dom.ap(highed.dom.cr('td'),
                                item
                            ),
                            highed.dom.ap(highed.dom.cr('td'),
                                rem
                            )
                        )
                    );      

                    highed.dom.on(rem, 'click', function (e) {
                        delete items[id];
                        itemTable.removeChild(row);

                        doEmitCallback();

                        e.cancelBubble = true;
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        return false;
                    });

                    if (!supressCallback) {
                        processChange();
                    }
                }       

                highed.dom.ap(container, itemTable);

                highed.dom.on(add, 'click', function () {
                    addCompositeItem();
                });

                if (highed.isArr(value)) {
                    value.forEach(function (item) {
                        addCompositeItem(item, true);
                    });
                }

                highed.dom.ap(container, itemsNode, add);

                return container;
            }
        },
        help = highed.dom.cr('span', 'highed-icon fa fa-question-circle'),
        helpTD = highed.dom.cr('td'),
        widgetTD = highed.dom.cr('td', 'highed-field-table-widget-column'),
        titleCol = highed.dom.cr('td')
    ;

    function tryCallback(cb, val) {
        cb = cb || fn;
        if (highed.isFn(cb)) {
            cb(val);
        }
    }

    if (highed.isNull(value)) {
        value = '';
    }

    //Choose a type
    if (type && type.indexOf('|') >= 0) {
        type = type.indexOf('object') ? 'object' : type.split('|')[0];
    }

    if (!highed.isNull(properties.custom) && 
        !highed.isNull(properties.custom.minValue) && 
        !highed.isNull(properties.custom.maxValue) && 
        !highed.isNull(properties.custom.step)) {
        type = 'range';
    }

    if (type && type.indexOf('array') === 0) {
        properties.subType = type.substr(6, type.length - 7);
        type = 'array';
    }

    if (type === 'object') {
        nohint = true;
    }

    highed.dom.on([help], 'mouseover', function (e) {
        highed.Tooltip(e.clientX, e.clientY, properties.tooltip || properties.tooltipText);
    });        

    if (nohint) {
        highed.dom.style(help, {display: 'none'});
        widgetTD.colSpan = 2;
    }

    return highed.dom.ap(
        highed.dom.ap(highed.dom.cr('tr'),
            highed.dom.ap(titleCol,
                highed.dom.cr('span', '', properties.title)
            ),
            highed.dom.ap(widgetTD,
                fields[type] ? fields[type]() : fields.string()
            ),
            (!nohint ? 
             highed.dom.ap(helpTD,
                 //highed.dom.cr('span', 'highed-field-tooltip', properties.tooltip) 
                 help
            ) : false)
        )
    );
};
/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

/** A list component
 *
 *  Creates a list with selectable items
 *
 *  @example
 *  var list = highed.List(document.body).addItem({
 *      title: 'My Item',
 *      click: function() {
 *          alert('You clicked the item!');   
 *      }   
 *  });  
 *
 *  @constructor
 *  @param parent {domnode} - the node to attach the list to
 */
highed.List = function (parent) {
    var container = highed.dom.cr('div', 'highed-list'),
        selectedItem = false,
        events = highed.events(),
        items = []
    ;

    ///////////////////////////////////////////////////////////////////////////

    /** Add an item to the list
     * @memberof highed.List
     * @param item {object} - the item meta for the item to add
     *   > title {string} - the title as displayed in the list
     *   > id {anything} - the id of the item: used for `highed.List.on('Select')`
     *   > click {function} - function to call when clicking the item
     * @returns {object} - an interface to interact with the item
     *   > id {anything} - the item id
     *   > title {string} - the title of the item
     *   > node {domnode} - the dom node for the item
     *   > select {function} - selects the item if called
     */
    function addItem(item) {
        var node = highed.dom.cr('a', 'item', item.title),
            iexports = {}
        ;

        function select(e) {
            if (selectedItem) {
                selectedItem.node.className = 'item';
            }

            selectedItem = iexports;
            node.className = 'item item-selected';
            events.emit('Select', item.id);

            if (highed.isFn(item.click)) {
                return item.click(e);
            }
        }

        highed.dom.on(node, 'click', select);
        highed.dom.ap(container, node);

        iexports = {
            id: item.id,
            title: item.title,
            node: node,
            select: select
        };

        items.push(iexports);

        if (!selectedItem) {
            select();
        }

        return iexports;
    }

    /** Add a set of items to the list
     *  @memberof highed.List
     *  @param items {array<object>} - an array of items to add
     */
    function addItems(items) {
        if (highed.isArr(items)) {
            items.forEach(addItem);
        }
    }

    /** Clear all the items in the list
     *  @memberof highed.List
     */
    function clear() {
        container.innerHTML = '';
    }

    /** Force resize of the list 
     *  @memberof highed.List
     */
    function resize() {
        var ps = highed.dom.size(parent);

        highed.dom.style(container, {
            //height: ps.height + 'px'
            height: '100%'
        }); 
    }

    /** Show the list 
    *  @memberof highed.List
    */
    function show() {
        highed.dom.style(container, {

        });
    }

    /** Hide the list 
     *  @memberof highed.List
     */
    function hide() {

    }

    /** Select the first item 
     *  @memberof highed.List
     */
    function selectFirst() {
        if (items.length > 0) {
            items[0].select();
        }
    }

    /** Select an item
     *  @memberof highed.List
     *  @param which {string} - the id of the item to select
     */
    function select(which) {
        items.some(function (item) {
            if (which === item.title) {
                item.select();
                return true;
            }
        });
    }

    /** Reselect the current item
     *  @memberof highed.List
     */
    function reselect() {
        if (selectedItem) {
            selectedItem.select();
        }
    }

    /** Count the number of items currently in the list
     *  @memberof highed.List
     */
    function countItems() {
        return items.length;
    }

    /** Get the selected item
     *  @memberof highed.List
     *  @returns {object} - the selected item
     */
    function selected() {
        return selectedItem;
    }
    ///////////////////////////////////////////////////////////////////////////
    
    highed.dom.ap(parent, container);

    ///////////////////////////////////////////////////////////////////////////

    //Public interface
    return {
        on: events.on,
        addItem: addItem,
        addItems: addItems,
        clear: clear,
        resize: resize,
        show: show,
        hide: hide,
        selectFirst: selectFirst,
        select: select,
        reselect: reselect,
        selected: selected,
        count: countItems
    };
};
/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

(function () {
    var container = highed.dom.cr('div', 'highed-colorpicker'),
        canvas = highed.dom.cr('canvas', 'picker'),
        ctx = canvas.getContext('2d'),
        manualInput = highed.dom.cr('input', 'manual')      
    ;

    //Attach the container to the document when the document is ready
    highed.ready(function () {
        highed.dom.ap(document.body, container);
    });

    /** Color picker 
     *  Component to pick colors from the google material design color palette.
     *  User input is also possible.
     *
     *  @example 
     *  //Show a color picker at [10,10]
     *  highed.pickColor(10, 10, '#fff', function (color) {
     *      alert('You selected ' + color + ', great choice!');
     *  });
     * 
     *  @param x {number} - the x position to display the picker at
     *  @param y {number} - the y position to display the picker at
     *  @param current {string} - the current color
     *  @param fn {function} - the function to call when the color changes
     *    > newColor {string} - the color selected by the user
     */
    highed.pickColor = function (x, y, current, fn) {
        var windowSize = highed.dom.size(document.body),
            containerSize = highed.dom.size(container),
            pickerSize = highed.dom.size(canvas),
            binder = false,
            pbinder = false
        ;

        ///////////////////////////////////////////////////////////////////////
        
        /* Draws the color picker itself */
        function drawPicker() {
            //There's 14 hues per. color, 19 colors in total.
            var tx = Math.floor(pickerSize.w / 14),
                ty = Math.floor(pickerSize.h / 19),             
                col = -1
            ; 

            canvas.width = pickerSize.w;
            canvas.height = pickerSize.h;

            //To avoid picking null
            ctx.fillStyle = '#FFF';
            ctx.fillRect(0, 0, pickerSize.w, pickerSize.h);

            for (var y = 0; y < 19; y++) {
                for (var x = 0; x < 15; x++) {
                    ctx.fillStyle = highed.meta.colors[++col];//highed.meta.colors[x + y * tx];
                    ctx.fillRect(x * tx, y * ty, tx, ty);
                }
            }
        }

        /* Hide the picker */
        function hide() {
            highed.dom.style(container, {
                opacity: 0,
                'pointer-events': 'none'
            });
            binder();
            pbinder();
        }

        function rgbToHex(r, g, b){
            var res = '#' + ((r << 16) | (g << 8) | b).toString(16);
            if (res.length === 5) {
                return res.replace('#', '#00');
            } else if (res.length === 6) {
                return res.replace('#', '#0');
            }
            return res;
        }

        function pickColor(e) {
            var px = e.clientX,
                py = e.clientY,
                cp = highed.dom.pos(canvas),
                id = ctx.getImageData(px - cp.x - x, py - cp.y - y, 1, 1).data,
                col = rgbToHex(id[0] || 0, id[1], id[2])
            ;

            manualInput.value = col;

            if (highed.isFn(fn)) {
                fn(col);
            }
        }

        ///////////////////////////////////////////////////////////////////////

        //Make sure we're not off screen
        if (x > windowSize.w - containerSize.w) {
            x = windowSize.w - containerSize.w - 10;
        }

        if (y > windowSize.h - containerSize.h) {
            y = windowSize.h - containerSize.h - 10;
        }
        
        highed.dom.style(container, {
            left: x + 'px',
            top: y + 'px',
            opacity: 1,
            'pointer-events': 'auto'
        });

        highed.showDimmer(hide, true, true, 5);

        binder = highed.dom.on(manualInput, 'keyup', function () {
            if (highed.isFn(fn)) {
                fn(manualInput.value);
            }
        });

        pbinder = highed.dom.on(canvas, 'mousedown', function (e) {
            var mover = highed.dom.on(canvas, 'mousemove', pickColor),
                cancel = highed.dom.on(document.body, 'mouseup', function () {
                    mover();
                    cancel();
                })
            ;

            pickColor(e);
        });

        manualInput.value = current;

        drawPicker();

        ///////////////////////////////////////////////////////////////////////

        return {

        };
    };

    highed.dom.ap(container,
        canvas,
        manualInput
    );

})();
/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

/** A standard toolbar.
 *
 *  @example
 *  var toolbar = highed.Toolbar('my-node', {
 *    additionalCSS: ['cool-toolbar']  
 *  });  
 *
 *  @constructor
 *  @param parent {domnode} - the node to attach the toolbar to
 */
highed.Toolbar = function (parent, attributes) {
    var properties = highed.merge({
            additionalCSS: []
        }, attributes),
        container = highed.dom.cr('div', 'highed-toolbar ' + properties.additionalCSS.join(' ')),
        left = highed.dom.cr('div', 'highed-toolbar-left'),
        right = highed.dom.cr('div', 'highed-toolbar-right'),
        center = highed.dom.cr('div', 'highed-toolbar-center'),
        iconsRight = highed.dom.cr('div', 'icons')
    ;

    ///////////////////////////////////////////////////////////////////////////
    
    /** Add an icon to the toolbar
     *  @memberof highed.Toolbar
     *  @param icon {object} - an object containing the icon settings.
     *    > css {array} - the additional css class(s) to use
     *    > click {function} - the function to call when the icon is clicked
     */
    function addIcon(icon) {
        var i = highed.dom.cr('div', 'highed-icon fa ' + (icon.css || ''));

        highed.dom.on(i, 'click', function (e) {
            if (highed.isFn(icon.click)) {
                icon.click(e);
            }
        });

        highed.dom.ap(right, i);
    }

    ///////////////////////////////////////////////////////////////////////////

    highed.dom.ap(parent,
        highed.dom.ap(container,
            left,
            center,
            right
        )
    );

    ///////////////////////////////////////////////////////////////////////////
    
    return {
        /** The toolbar container
         *  @type {domnode}
         *  @memberof highed.Toolbar
         */
        container: container,        
        addIcon: addIcon,
        /** The left part of the toolbar
         *  @type {domnode}
         *  @memberof highed.Toolbar
         */
        left: left,
        /** The center part of the toolbar
         *  @type {domnode}
         *  @memberof highed.Toolbar
         */
        center: center,
        /** The right part of the toolbar
         *  @type {domnode}
         *  @memberof highed.Toolbar
         */
        right: right
    };
};
/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

(function () {

    /** Font picker 
     *
     *  Creates a small font picking widget editing of:
     *      - bold
     *      - font family
     *      - font size
     *      - color
     *  
     *  Note that this must be attached to the document manually by appending
     *  the returned container to something.
     *
     *  @example
     *  var picker = highed.FontPicker(function (newStyle) {
     *      highed.dom.style(document.body, newStyle);  
     *  });
     *
     *  highed.dom.ap(document.body, picker.container);
     *
     *  @param fn {function} - the function to call when things change
     *  @param style {object} - the current style object
     *    > fontFamily {string} - the font family
     *    > color {string} - the font color
     *    > fontWeight {string} - the current font weight
     *    > fontStyle {string} - the current font style
     *  @returns {object} - an interface to the picker
     *    > container {domnode} - the body of the picker
     */
    highed.FontPicker = function (fn, style) {
        var container = highed.dom.cr('div', 'highed-font-picker'),
            fontFamily = highed.dom.cr('select', 'font-family'),
            fontSize = highed.dom.cr('select', 'font-size'),
            boldBtn = highed.PushButton(undefined, 'bold'),
            italicBtn = highed.PushButton(undefined, 'italic'),
            color = highed.dom.cr('span', 'font-color', '&nbsp;')

        ;

        if (highed.isStr(style)) {
            try {
                style = JSON.parse(style);
            } catch (e) {

            }
        }

        style = highed.merge({
            'fontFamily': '"Lucida Grande", "Lucida Sans Unicode", Verdana, Arial, Helvetica, sans-serif',
            'color': '#333',
            'fontSize': '18px',
            'fontWeight': 'normal',
            'fontStyle': 'normal'
        }, style);
        
        ///////////////////////////////////////////////////////////////////////

        function callback() {
            if (highed.isFn(fn)) {
                fn(style);
            }
        }

        function updateColor(ncol, supressCallback) {
            highed.dom.style(color, {
                background: ncol
            });

            style.color = ncol;
            if (!supressCallback) {
                callback();             
            }
        }

        ///////////////////////////////////////////////////////////////////////

        //Add fonts to font selector
        highed.dom.options(fontFamily, highed.meta.fonts);
        //Add font sizes
        highed.dom.options(fontSize, [8, 10, 12, 14, 16, 18, 20, 22, 25, 26, 28, 30, 32, 34]);

        //Set the current values
        boldBtn.set(style.fontWeight === 'bold');
        italicBtn.set(style.fontStyle === 'italic');
        updateColor(style.color, true);
        highed.dom.val(fontFamily, style.fontFamily);
        highed.dom.val(fontSize, style.fontSize.replace('px', ''));

        //Listen to font changes
        highed.dom.on(fontFamily, 'change', function () {
            if (fontFamily.selectedIndex >= 0) {
                style.fontFamily = fontFamily.options[fontFamily.selectedIndex].id;
                callback();
            }
        });

        //Listen to font size changes
        highed.dom.on(fontSize, 'change', function () {
            if (fontSize.selectedIndex >= 0) {
                style.fontSize = fontSize.options[fontSize.selectedIndex].id + 'px';
                callback();
            }
        });

        //Listen to bold changes
        boldBtn.on('Toggle', function (state) {
            style.fontWeight = state ? 'bold' : 'normal';
            callback();
        });

        //Listen to italic changes
        italicBtn.on('Toggle', function (state) {
            style.fontStyle = state ? 'italic' : 'normal';
            callback();
        });

        //Handle color picker
        highed.dom.on(color, 'click', function (e) {
            highed.pickColor(e.clientX, e.clientY, style.color, updateColor);
        });

        //Create DOM
        highed.dom.ap(container,
            fontFamily,
            fontSize,
            boldBtn.button,
            italicBtn.button,
            color
        );

        ///////////////////////////////////////////////////////////////////////
        
        return {
            container: container
        };
    };
})();
/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

/** A wizard-type stepper
 *
 *  @emits Step - when going back/forth
 *  @emits AddStep - when a new step is added
 * 
 *  @constructor
 *  @param bodyParent {domnode} - the node to attach the body to
 *  @param indiatorParent {domnode} - the node to attach the indicators to
 *  @param attributes {object} - the settings for the stepper
 *    > indicatorPos {enum} - the indicator alignment
 *       > top
 *       > bottom
 */
highed.WizardStepper = function(bodyParent, indicatorParent, attributes) {
    var properties = highed.merge({
            indicatorPos: 'top'         
        }, attributes),
        events = highed.events(),
        body = highed.dom.cr('div', 'highed-wizstepper-body'),
        indicators = highed.dom.cr('div'),

        activeStep = false,
        stepCount = 0,
        steps = []
    ;

    ///////////////////////////////////////////////////////////////////////////

    /* Update the bar CSS - this is more stable than doing it in pure CS */
    function updateBarCSS() {
        var fsteps = steps.filter(function (t) { return t.visible; });
        fsteps.forEach(function (step, i) {
            if (i === 0) step.bar.className = 'bar bar-first';
            else if (i === fsteps.length - 1) step.bar.className = 'bar bar-last';
            else step.bar.className = 'bar';
            step.bar.className += ' ' + (properties.indicatorPos === 'bottom' ? 'bar-bottom' : 'bar-top');
        });
    }
    
    /** Add a new step
     *  @memberof highed.WizardStepper
     *  @param step {object} - an object describing the step
     *    > title {string} - the step title
     *  @returns {object} - interface to manipulate the step
     *    > activate {function} - function to activate the step
     *    > bubble {domnode} - the node for the bubble
     *    > body {domnode} - the node for the step body
     */
    function addStep(step) {        
        var stepexports = {
            number: ++stepCount,
            node: highed.dom.cr('div', 'highed-wizstepper-item'),
            label: highed.dom.cr('div', '', step.title, 'label'),
            bubble: highed.dom.cr('div', 'bubble ' + (properties.indicatorPos === 'bottom' ? 'bubble-bottom' : 'bubble-top')),
            bar: highed.dom.cr('div', 'bar ' + (properties.indicatorPos === 'bottom' ? 'bar-bottom' : 'bar-top')),
            body: highed.dom.cr('div', 'highed-step-body'),
            visible: true
        };

        function activate() {
            if (activeStep) {
                activeStep.bubble.innerHTML = '';
                
                highed.dom.style(activeStep.bubble, {
                    height: '',
                    width: '',
                    bottom: '-4px',
                    'font-size': '0px'
                });

                highed.dom.style(activeStep.body, {
                    opacity: 0,
                    'pointer-events': 'none'
                });

                if (properties.indicatorPos === 'top') {
                    highed.dom.style(activeStep.bubble, {
                        top: '-6px',
                        bottom: ''
                    });
                }
            }

            stepexports.bubble.innerHTML = stepexports.number;
            
            highed.dom.style(stepexports.bubble, {
                height: "25px",
                width: "25px",
                bottom: '-8px',
                'font-size': '16px'
            });

            highed.dom.style(stepexports.body, {
                opacity: 1,
                'pointer-events': 'auto'
            });

            if (properties.indicatorPos === 'top') {
                highed.dom.style(stepexports.bubble, {
                    top: '-10px'
                });
            }

            activeStep = stepexports;

            events.emit('Step', stepexports, stepCount, step);
        }

        stepexports.hide = function () {
            highed.dom.style(stepexports.node, {
                display: 'none'
            });
            if (stepexports.visible) {
                //This needs fixing
                stepCount--;
                stepexports.visible = false;
                updateBarCSS();                
            }
        };

        highed.dom.on(stepexports.node, 'click', activate);

        if (!activeStep) {
            activate();
        }       

        stepexports.activate = activate;

        steps.push(stepexports);
        
        updateBarCSS();

        highed.dom.ap(indicators, 
            highed.dom.ap(stepexports.node,
                stepexports.label,
                stepexports.bar,
                stepexports.bubble
            )
        );

        highed.dom.ap(body, stepexports.body);

        events.emit('AddStep', activeStep, stepCount);

        return stepexports;
    }

    /** Go to the next step 
     *  @memberof highed.WizardStepper
     */
    function next() {
        if (activeStep && activeStep.number < stepCount) {
            steps[activeStep.number].activate();
        }
    }

    /** Go to the previous step 
     *  @memberof highed.WizardStepper
     */
    function previous() {
        if (activeStep && activeStep.number > 1) {
            steps[activeStep.number - 2].activate();
        }
    }

    /** Force a resize of the splitter
     *  @memberof highed.WizardStepper
     *  @param w {number} - the width of the stepper (will use parent if null)
     *  @param h {number} - the height of the stepper (will use parent if null)
     */
    function resize(w, h) {
        var ps = highed.dom.size(bodyParent);

        highed.dom.style(body, {
            height: (h || ps.h) + 'px'
        });
    }

    ///////////////////////////////////////////////////////////////////////////
    
    highed.dom.ap(indicatorParent, indicators);
    highed.dom.ap(bodyParent, body);

    ///////////////////////////////////////////////////////////////////////////

    return {
        on: events.on,
        addStep: addStep,
        next: next,
        resize: resize,
        previous: previous,
        /** The main body
         *  @memberof highed.WizardStepper
         *  @type {domnode} 
         */
        body: body
    };
};
/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

(function () {
    var container = highed.dom.cr('div', 'highed-tooltip');

    highed.ready(function () {
        highed.dom.ap('confirmAlert', container);
    });

    function hide() {
        highed.dom.style(container, {
            opacity: 0,
            'pointer-events': 'none'
        });
    }

    highed.dom.on(container, 'mouseout', hide);
    highed.dom.on(container, 'click', hide);

    /** Show a tooltip
     *  @param x {number} - the x position of the tooltip
     *  @param y {number} - the y position of the tooltip
     *  @param tip {string} - the title
     *  @param blowup {boolean}  - blow the tooltip up
     */
    highed.Tooltip = function (x, y, tip, blowup) {
        highed.dom.style(container, {
            opacity: 1,
            'pointer-events': 'auto',
            left: x - 20 + 'px',
            top: y - 20 + 'px',
            width: '200px'
        });

        if (blowup) {
            highed.dom.style(container, {
                width: '90%',
                height: '90%',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, 0)'
            });
        }

        container.innerHTML = tip;
    };
})();

/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

/** A simple toggle button component
 *
 *  @example
 *  //Create a push button with the gear icon attached
 *  highed.PushButton(document.body, 'gear', false).on('Toggle', function (state) {
 *      alert('Push button is now ' + state);   
 *  });
 *
 *  @constructor
 *  
 *  @emits Toggle {boolean} - when the state changes
 *
 *  @param parent {domnode} (optional) - the parent to attach the button to
 *  @param icon {string} - the button icon
 *  @param state {boolean} - the innitial state of the button
 */
highed.PushButton = function (parent, icon, state) {
    var button = highed.dom.cr('span', 'highed-pushbutton fa fa-' + icon),
        events = highed.events()
    ;

    function updateCSS() {
        if (state) {
            button.className += ' highed-pushbutton-active';
        } else {            
            button.className = button.className.replace(' highed-pushbutton-active', '');
        }
    }

    /** Set the current state
     *  @memberof highed.PushButton
     *  @param flag {boolean} - the new state
     */
    function set(flag) {
        state = flag;
        updateCSS();
    }

    highed.dom.on(button, 'click', function () {
        state = !state;
        updateCSS();
        events.emit('Toggle', state);
    });

    if (!highed.isNull(parent)) {
        highed.dom.ap(parent, button);
    }

    updateCSS();

    return {
        set: set,
        /** The button
         * @memberof highed.PushButton
         * @type {domnode}
         */
        button: button,
        on: events.on
    };
};
/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

/** Tree component
 *
 *  @example
 *  var tree = highed.Tree(document.body).build({
 *     //Tree data here   
 *  });
 * 
 *  @emits Select {object} - when a node is selected
 *
 *  @constructor
 *  @param parent {domnode} - the node to attach the tree to
 */
highed.Tree = function (parent) {
    var container = highed.dom.cr('div', 'highed-tree'),
        selectedNode = false,
        reselectFn = false,
        events = highed.events()
    ;

    ///////////////////////////////////////////////////////////////////////////

    function createNode(child, key, pnode, instancedData, dataIndex, arrayHeader) {
        var title = highed.dom.cr('div', 'parent-title', child.title || highed.uncamelize(key)),
            icon = highed.dom.cr('div', 'exp-col-icon fa fa-plus'),
            body = highed.dom.cr('div', 'parent-body'),
            node = highed.dom.cr('div', 'node'),

            rightIcons = highed.dom.cr('div', 'right-icons'),
            remIcon = highed.dom.cr('div', 'highed-icon fa fa-minus-circle'),
            addIcon = highed.dom.cr('div', 'highed-icon fa fa-plus-circle'),

            expanded = false,
            noInspectSelf = false
        ;

        if (!arrayHeader && child.entries.length === 0 && Object.keys(child.children).length === 0) {
           // return;
        }

        if (arrayHeader || child.isArrayParent) {
            highed.dom.ap(node, rightIcons);

            if (arrayHeader) {
                highed.dom.ap(rightIcons,
                    addIcon
                );
            }

            if (child.isArrayParent) {
                highed.dom.ap(rightIcons,
                    remIcon
                );
            }

            highed.dom.on(remIcon, 'click', function () {
                if (confirm('Really delete the entry?')) {
                    arr = highed.getAttr(instancedData, child.id, dataIndex);
                    
                    arr = arr.filter(function (b, i) {
                        return i !== dataIndex;
                    });

                    highed.setAttr(instancedData, child.id, arr);  

                    events.emit('DataUpdate', child.id, arr);
                }
            });

            highed.dom.on(addIcon, 'click', function () {
                arr = highed.getAttr(instancedData, child.id, dataIndex);
                if (highed.isArr(arr)) {
                    arr.push({});
                    highed.setAttr(instancedData, child.id, arr);                       
                } else {
                    highed.setAttr(instancedData, child.id, [{}]);
                }
                if (highed.isFn(reselectFn)) {
                    reselectFn();
                }
            });
        }

        //child.dataIndex = dataIndex;

        highed.dom.ap(pnode,
            highed.dom.ap(node,
                icon,
                title
            ),
            body
        );

        highed.dom.style(body, {display: 'none'});

        function toggle() {
            if (!arrayHeader && Object.keys(child.children).length === 0) {
                return;
            }

            expanded = !expanded;
            if (expanded) {
                icon.className = 'exp-col-icon fa fa-minus';
                highed.dom.style(body, {display: 'block'});
            } else {
                icon.className = 'exp-col-icon fa fa-plus';                        
                highed.dom.style(body, {display: 'none'});
            }
        }

        highed.dom.on(icon, 'click', toggle);

        if (!arrayHeader && Object.keys(child.children).length === 0) {
            icon.className = 'exp-col-icon fa fa-sliders';
        }

        highed.dom.on(title, 'click', function () {
            if (arrayHeader) {
                return toggle();
            }

            if (noInspectSelf) {
                return;
            }

            if (selectedNode) {
                selectedNode.className = 'parent-title';
            }

            title.className = 'parent-title parent-title-selected';
            selectedNode = title;

            reselectFn = function () {
                events.emit('Select', child, highed.uncamelize(key), child.dataIndex);
            };

            events.emit('Select', child, highed.uncamelize(key), child.dataIndex);
        });

        return body;
    }
    
    /** Build the tree
     *  @memberof highed.Tree
     *  @param tree {object} - the tree to display
     *    > children {object} - the children of the node
     *    > entries {array} - array of orphan children 
     */
    function build(tree, pnode, instancedData, dataIndex) {

       // dataIndex = tree.dataIndex || dataIndex;

        if (tree.isInstancedArray) {

            //This requires some special handling. We actually need
            //access to instanced data to build it. 
            //What this means is that we need to create a sub-tree
            //for each of the elements in the instanced array.
            //Problem is we need to insert one element per. entry
            var arr = highed.getAttr(instancedData, tree.id, dataIndex),
                children = {}
            ;

            if (highed.isArr(arr)) {
                arr.forEach(function (data, i) {
                    children[tree.shortName + ' #' + (i + 1)] = {                        
                        children: tree.children,
                        entries: tree.entries,
                        dataIndex: i,
                        id: tree.id,
                        isArrayParent: true
                    };
                });

                return build(
                    {
                        children: children,
                        entries: []
                    }, 
                    createNode(tree, tree.shortName, pnode, instancedData, dataIndex, true),
                    instancedData, 
                    dataIndex
                );  
            } 
        } 

        if (tree && tree.entries) {
            Object.keys(tree.entries).forEach(function (key) {
                var entry = tree.entries[key];
                entry.data = instancedData;
            });
        }

        if (tree && tree.children) {
            Object.keys(tree.children).forEach(function (key) {
                var child = tree.children[key],
                    body = highed.dom.cr('div', 'parent-body')
                ;

                if (child.isInstancedArray) {
                    arr = highed.getAttr(instancedData, child.id, dataIndex);
                    if (highed.isArr(arr)) {
                        //Skip node creation - will be done later
                        return build(child, pnode, instancedData, dataIndex);                        
                    } 
                }

                body = createNode(child, key, pnode, instancedData, dataIndex);                        

                build(child, body, instancedData, child.dataIndex);
            });
        }
    }

    /** Reselect the currently selected node
     *  @memberof highed.Tree
     */
    function reselect() {
        if (selectedNode && highed.isFn(reselectFn)) {
            reselectFn();
        }
    }

    ///////////////////////////////////////////////////////////////////////////

    highed.dom.ap(parent, container);

    ///////////////////////////////////////////////////////////////////////////
    
    return {
        on: events.on,
        reselect: reselect,
        build: function (tree, data) {
            container.innerHTML = '';
            build(tree, container, data, 0);
        }
    };
};
/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

(function () {
    var container = highed.dom.cr('div', 'highed-snackbar'),
        title = highed.dom.cr('span', 'snackbar-title', 'THIS IS A SNACKBAR'),
        action = highed.dom.cr('span', 'snackbar-action', 'ACTION'),
        timeout = false,
        callback = false
    ;

    highed.ready(function () {
        highed.dom.ap(document.body, 
            highed.dom.ap(container,
                title,
                action
            )
        );
    });

    highed.dom.on(container, 'mouseover', function () {
        clearTimeout(timeout);
    });

    highed.dom.on(container, 'mouseout', function () {
        hide();
    });

    ///////////////////////////////////////////////////////////////////////////
    
    function hide() {
        timeout = setTimeout(function () {
            highed.dom.style(container, {
                bottom: '-58px'
            });
        }, 5000);
    }

    ///////////////////////////////////////////////////////////////////////////

    /**  Show a snackbar 
     *   A snack bar is those info rectangles showing up on the bottom left.
     *
     *   @example
     *   highed.snackBar('Hello world!'); 
     *
     *   @param stitle {string} (optional) - the snackbar title
     *   @param saction {string} (optional) - the snackbar action text
     *   @param fn {function} (optional) - the function to call when clicking the action
     */
    highed.snackBar = function (stitle, saction, fn) {
        title.innerHTML = stitle.toUpperCase();

        clearTimeout(timeout);
        
        if (saction) {
            action.innerHTML = saction.toUpperCase();           
        }

        if (callback) {
            callback();
        }

        highed.dom.style(container, {
            bottom: '10px'
        });

        highed.dom.style(action, {
            display: saction ? '' : 'none'
        });

        callback = highed.dom.on(action, 'click', fn);

        hide();
    };
})();

/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

if (typeof highed === 'undefined') {
	var highed = {meta: {}};
}

highed.meta.chartTemplates = {
	line: {
		title: 'Line charts',
		templates: {
			basic: {
				title: 'Line chart',
				urlImg: 'https://cloud.highcharts.com/images/abywon/0/136.svg',
				config: {
					'chart--type': 'line',
					'chart--polar': false
				},
				tooltipText: 'Requires one column for X values or categories, subsequently one column for each series\' Y values.'
			},
			withdatalabel: {
				title: 'With data labels',
				urlImg: 'https://cloud.highcharts.com/images/agonam/2/136.svg',
				config: {
					'chart--type': 'line',
					'plotOptions-series-dataLabels--enabled': true,
					'chart--polar': false
				},
				tooltipText: 'Requires one column for X values or categories, subsequently one column for each series\' Y values. ' +
				'Data labels by default displays the Y value.'
			},
			spline: {
				title: 'Spline',
				urlImg: 'https://cloud.highcharts.com/images/upafes/1/136.svg',
				config: {
					'chart--type': 'spline',
					'chart--polar': false
				},
				tooltipText: 'Requires one column for X values or categories, subsequently one column for each series\' Y values.'
			},
			splineWithDataLabel: {
				title: 'Spline with labels',
				urlImg: 'https://cloud.highcharts.com/images/odopic/2/136.svg',
				config: {
					'chart--type': 'spline',
					'plotOptions-series-dataLabels--enabled': true,
					'chart--polar': false
				},
				tooltipText: 'Requires one column for X values or categories, subsequently one column for each series\' Y values.'
			},
			logarithmic: {
				title: 'Logarithmic',
				urlImg: 'https://cloud.highcharts.com/images/abywon/0/136.svg',
				config: {
					'chart--type': 'line',
					'yAxis--type': 'logarithmic',
					'yAxis--minorTickInterval': 'auto',
					'chart--polar': false
				},
				tooltipText: 'Requires one column for X values or categories, subsequently one column for each series\' Y values.'
			},
			stepLine: {
				title: 'Step line',
				urlImg: 'https://cloud.highcharts.com/images/akeduw/0/136.svg',
				config: {
					'chart--type': 'line',
					'plotOptions-line--step': 'left',
					'chart--polar': false
				},
				tooltipText: 'Requires one column for X values or categories, subsequently one column for each series\' Y values.'
			},
			stepLineWithDataLabel: {
				title: 'Step line with labels',
				urlImg: 'https://cloud.highcharts.com/images/oxenux/0/136.svg',
				config: {
					'chart--type': 'line',
					'plotOptions-series-dataLabels--enabled': true,
					'plotOptions-line--step': 'left',
					'chart--polar': false
				},
				tooltipText: 'Requires one column for X values or categories, subsequently one column for each series\' Y values.'
			},
			inverted: {
				title: 'Inverted',
				urlImg: 'https://cloud.highcharts.com/images/ozojul/1/136.svg',
				config: {
					'chart--type': 'line',
					'chart--inverted': true,
					'chart--polar': false
				},
				tooltipText: 'Requires one column for X values or categories, subsequently one column for each series\' Y values.'
			},
			negative: {
				title: 'Negative color',
				urlImg: 'https://cloud.highcharts.com/images/uxyfys/2/136.svg',
				config: {
					'chart--type': 'line',
					'series[0]--negativeColor': '#0088FF',
					'series[0]--color': '#FF0000',
					'chart--polar': false
				},
				tooltipText: 'Requires one column for X values or categories, subsequently one column for each series\' Y values.'
			},
			errorbar: {
				title: 'Error bar',
				urlImg: 'https://cloud.highcharts.com/images/ypewak/0/136.svg',
				config: {
					'chart--type': 'line',
					'series[0]--type': 'line',
					'series[1]--type': 'errorbar',
					'chart--polar': false
				},
				tooltipText: 'Requires one data column for X values or categories, subsequently one data column for the series\' Y values. ' +
				'and two columns for the error bar series maximum and minimum.'
			},
			combination: {
				title: 'Combination chart',
				urlImg: 'https://cloud.highcharts.com/images/ynikoc/0/136.svg',
				config: {
					'chart--type': 'line',
					'series[0]--type': 'column',
					'chart--polar': false
				},
				tooltipText: 'Requires one data column for X values or categories, subsequently one data column for the series\' Y values. and two columns for the error bar series maximum and minimum.'
			}
		}
	},
	area: {
		title: 'Area charts',
		templates: {
			basic: {
				title: 'Basic',
				urlImg: 'https://cloud.highcharts.com/images/ecexev/2/136.svg',
				config: {
					'chart--type': 'area',
					'chart--polar': false
				},
				tooltipText: 'Non-stacked area chart. Requires one column for X values or categories, subsequently one column for each series\' Y values.'
			},
			basicDatalabels: {
				title: 'Area with labels',
				urlImg: 'https://cloud.highcharts.com/images/atikon/0/136.svg',
				config: {
					'chart--type': 'area',
					'plotOptions-series-dataLabels--enabled': true,
					'chart--polar': false
				},
				tooltipText: 'Non-stacked area chart with data labels. Requires one column for X values or categories, subsequently one column for each series\' Y values.'
			},
			stacked: {
				title: 'Stacked',
				urlImg: 'https://cloud.highcharts.com/images/inebav/1/136.svg',
				config: {
					'chart--type': 'area',
					'plotOptions-series--stacking': 'normal',
					'chart--polar': false
				},
				tooltipText: 'Stacked area chart. Requires one column for X values or categories, subsequently one column for each series\' Y values. ' +
				'The first data series is in the top of the stack.'
			},
			stackedDatalabels: {
				title: 'Stacked with labels',
				urlImg: 'https://cloud.highcharts.com/images/iluryh/0/136.svg',
				config: {
					'chart--type': 'area',
					'plotOptions-series--stacking': 'normal',
					'plotOptions-series-dataLabels--enabled': true,
					'chart--polar': false
				},
				tooltipText: 'Stacked area chart. Requires one column for X values or categories, subsequently one column for each series\' Y values. ' +
				'The first data series is in the top of the stack.'
			},
			percentage: {
				title: 'Stacked percentage',
				urlImg: 'https://cloud.highcharts.com/images/iporos/1/136.svg',
				config: {
					'chart--type': 'area',
					'plotOptions-series--stacking': 'percent',
					'chart--polar': false
				},
				tooltipText: 'Stacked percentage area chart. Requires one column for X values or categories, subsequently one column for each series\' Y values. ' +
				'The first data series is in the top of the stack.'
			},
			inverted: {
				title: 'Inverted',
				urlImg: 'https://cloud.highcharts.com/images/yqenid/0/136.svg',
				config: {
					'chart--type': 'area',
					'chart--inverted': true,
					'chart--polar': false
				},
				tooltipText: 'Area chart with inverted axes. Requires one column for X values or categories, subsequently one column for each series\' Y values.'
			},
			invertedDatalabels: {
				title: 'Inverted with labels',
				urlImg: 'https://cloud.highcharts.com/images/acemyq/0/136.svg',
				config: {
					'chart--type': 'area',
					'chart--inverted': true,
					'plotOptions-series-dataLabels--enabled': true,
					'chart--polar': false
				},
				tooltipText: 'Area chart with inverted axes and data labels. Requires one column for X values or categories, subsequently one column for each series\' Y values.'
			},
			stepLine: {
				title: 'Step line',
				urlImg: 'https://cloud.highcharts.com/images/abutix/0/136.svg',
				config: {
					'chart--type': 'area',
					'plotOptions-area--step': 'left',
					'chart--polar': false
				},
				tooltipText: 'Requires one column for X values or categories, subsequently one column for each series\' Y values.'
			},
			negative: {
				title: 'Negative color',
				urlImg: 'https://cloud.highcharts.com/images/ydypal/0/136.svg',
				config: {
					'chart--type': 'area',
					'series[0]--negativeColor': '#0088FF',
					'series[0]--color': '#FF0000',
					'chart--polar': false
				},
				tooltipText: 'Displays negative values with an alternative color. Colors can be set in Customize -> Simple -> Data series. Requires one column for X values or categories, subsequently one column for each series\' Y values.'
			},
			arearange: {
				title: 'Arearange',
				urlImg: 'https://cloud.highcharts.com/images/udepat/0/136.svg',
				config: {
					'chart--type': 'arearange',
					'chart--polar': false
				},
				tooltipText: 'Requires one data column for X values or categories, subsequently two data column for each arearange series\' Y values.'
			}
		}
	},
	column: {
		title: 'Column charts',
		templates: {
			grouped: {
				title: 'Basic',
				urlImg: 'https://cloud.highcharts.com/images/ovobiq/1/136.svg',
				config: {
					'chart--type': 'column',
					'chart--polar': false
				},
				tooltipText: 'Grouped column chart. Requires one data column for X values or categories, subsequently one data column for each series\' Y values.'
			},
			groupedLabels: {
				title: 'With label',
				urlImg: 'https://cloud.highcharts.com/images/ivetir/1/136.svg',
				config: {
					'chart--type': 'column',
					'plotOptions-series-dataLabels--enabled': true,
					'chart--polar': false
				},
				tooltipText: 'Grouped column chart with datalabels. Requires one data column for X values or categories, subsequently one data column for each series\' Y values.'
			},
			column3d: {
				title: 'Column 3D',
				urlImg: 'https://cloud.highcharts.com/images/ahyqyx/1/136.svg',
				config: {
					'chart--type': 'column',
					'chart--margin': 75,
					'chart-options3d--enabled': true,
					'chart-options3d--alpha': 15,
					'chart-options3d--beta': 15,
					'chart-options3d--depth': 50,
					'chart-options3d--viewDistance': 15,
					'plotOptions-column--depth': 25,
					'chart--polar': false
				},
				tooltipText: 'Requires one data column for X values or categories, subsequently one data column for each series\' Y values.'
			},
			columnstacked: {
				title: 'Stacked',
				urlImg: 'https://cloud.highcharts.com/images/ycehiz/1/136.svg',
				config: {
					'chart--type': 'column',
					'plotOptions-series--stacking': 'normal',
					'chart--polar': false
				},
				tooltipText: 'Requires one data column for X values or categories, subsequently one data column for each series\' Y values.'
			},
			columnstackedLabels: {
				title: 'Stacked with labels',
				urlImg: 'https://cloud.highcharts.com/images/acijil/0/136.svg',
				config: {
					'chart--type': 'column',
					'plotOptions-series--stacking': 'normal',
					'plotOptions-series-dataLabels--enabled': true,
					'chart--polar': false
				},
				tooltipText: 'Requires one data column for X values or categories, subsequently one data column for each series\' Y values.'
			},
			columnStacked3d: {
				title: 'Stacked 3D',
				urlImg: 'https://cloud.highcharts.com/images/ahyqyx/1/136.svg',
				config: {
					'chart--type': 'column',
					'chart--margin': 75,
					'chart-options3d--enabled': true,
					'chart-options3d--alpha': 15,
					'chart-options3d--beta': 15,
					'chart-options3d--depth': 50,
					'chart-options3d--viewDistance': 15,
					'plotOptions-column--depth': 25,
					'plotOptions-series--stacking': 'normal',
					'chart--polar': false
				},
				tooltipText: 'Requires one data column for X values or categories, subsequently one data column for each series\' Y values.'
			},
			columnStackedPercentage: {
				title: 'Stacked percent',
				urlImg: 'https://cloud.highcharts.com/images/ojixow/0/136.svg',
				config: {
					'chart--type': 'column',
					'plotOptions-series--stacking': 'percent'
				},
				tooltipText: 'Grouped column chart. Requires one data column for X values or categories, subsequently one data column for each series\' Y values.'
			},
			columnStackedPercentageLabels: {
				title: 'Stacked percent with labels',
				urlImg: 'https://cloud.highcharts.com/images/iwanyg/0/136.svg',
				config: {
					'chart--type': 'column',
					'plotOptions-series--stacking': 'percent',
					'plotOptions-series-dataLabels--enabled': true,
					'chart--polar': false
				},
				tooltipText: 'Grouped column chart. Requires one data column for X values or categories, subsequently one data column for each series\' Y values.'
			},
			negative: {
				title: 'Negative color',
				urlImg: 'https://cloud.highcharts.com/images/yxajih/0/136.svg',
				config: {
					'chart--type': 'column',
					'series[0]--negativeColor': '#0088FF',
					'series[0]--color': '#FF0000',
					'chart--polar': false
				},
				tooltipText: 'Requires one column for X values or categories, subsequently one column for each series\' Y values.'
			},
			multiColor: {
				title: 'Multi color',
				urlImg: 'https://cloud.highcharts.com/images/alyqyz/0/136.svg',
				config: {
					'chart--type': 'column',
					'plotOptions-series--colorByPoint': true,
					'chart--polar': false
				},
				tooltipText: 'Requires one data column for X values or categories (vertical axis), subsequently ' +
				'one data column for each series\' Y values (horizontal axis).'
			},
			logarithmic: {
				title: 'Logarithmic',
				urlImg: 'https://cloud.highcharts.com/images/igipeg/0/136.svg',
				config: {
					'chart--type': 'column',
					'yAxis--type': 'logarithmic',
					'yAxis--minorTickInterval': 'auto',
					'chart--polar': false
				},
				tooltipText: 'Requires one data column for X values or categories (vertical axis), subsequently ' +
				'one data column for each series\' Y values (horizontal axis).'
			},
			columnrange: {
				title: 'Columnrange',
				urlImg: 'https://cloud.highcharts.com/images/ihilaq/0/136.svg',
				config: {
					'chart--type': 'columnrange',
					'chart--polar': false
				},
				tooltipText: 'Requires one data column for X values or categories (vertical axis), subsequently ' +
				'two data column for each series\' Y values (horizontal axis).'
			},
			columnrangeLabelsLabels: {
				title: 'Columnrange with labels',
				urlImg: 'https://cloud.highcharts.com/images/ojykiw/0/136.svg',
				config: {
					'chart--type': 'columnrange',
					'plotOptions-series-dataLabels--enabled': true,
					'chart--polar': false
				},
				tooltipText: 'Requires one data column for X values or categories (vertical axis), subsequently ' +
				'two data column for each series\' Y values (horizontal axis).'
			},
			packedColumns: {
				title: 'Packed columns',
				urlImg: 'https://cloud.highcharts.com/images/exypor/0/136.svg',
				config: {
					'chart--type': 'column',
					'plotOptions-series--pointPadding': 0,
					'plotOptions-series--groupPadding': 0,
					'plotOptions-series--borderWidth': 0,
					'plotOptions-series--shadow': false,
					'chart--polar': false
				},
				tooltiptext: 'Requires one data column for X values or categories, subsequently one data column for the series\' Y values.'
			},
			errorbar: {
				title: 'Error bar',
				urlImg: 'https://cloud.highcharts.com/images/icytes/0/136.svg',
				config: {
					'chart--type': 'column',
					'series[1]--type': 'errorbar',
					'chart--polar': false
				},
				tooltipText: 'Requires one data column for X values or categories, subsequently one data column for the series\' Y values. and two columns for the error bar series maximum and minimum.'
			}
		}
	},
	bar: {
		title: 'Bar charts',
		templates: {
			basic: {
				title: 'Basic bar',
				urlImg: 'https://cloud.highcharts.com/images/ovuvul/1/137.svg',
				config: {
					'chart--type': 'column',
					'chart--inverted': true,
					'chart--polar': false
				},
				tooltipText: 'Requires one data column for X values or categories (vertical axis), subsequently ' +
				'one data column for each series\' Y values (horizontal axis).'
			},
			basicLabels: {
				title: 'Basic with labels',
				urlImg: 'https://cloud.highcharts.com/images/ovuvul/1/137.svg',
				config: {
					'chart--type': 'column',
					'chart--inverted': true,
					'plotOptions-series-dataLabels--enabled': true,
					'chart--polar': false
				},
				tooltipText: 'Requires one data column for X values or categories (vertical axis), subsequently ' +
				'one data column for each series\' Y values (horizontal axis).'
			},
			barstacked: {
				title: 'Stacked bar',
				urlImg: 'https://cloud.highcharts.com/images/epodat/3/136.svg',
				config: {
					'chart--type': 'column',
					'chart--inverted': true,
					'plotOptions-series--stacking': 'normal',
					'chart--polar': false
				},
				tooltipText: 'Requires one data column for X values or categories (vertical axis), subsequently ' +
				'one data column for each series\' Y values (horizontal axis).'
			},
			barstackedLabels: {
				title: 'Stacked with labels',
				urlImg: 'https://cloud.highcharts.com/images/otupaz/1/136.svg',
				config: {
					'chart--type': 'column',
					'chart--inverted': true,
					'plotOptions-series--stacking': 'normal',
					'plotOptions-series-dataLabels--enabled': true,
					'chart--polar': false
				},
				tooltipText: 'Requires one data column for X values or categories (vertical axis), subsequently ' +
				'one data column for each series\' Y values (horizontal axis).'
			},
			barstackedpercentage: {
				title: 'Stacked percent bar',
				urlImg: 'https://cloud.highcharts.com/images/yhekaq/2/136.svg',
				config: {
					'chart--type': 'column',
					'chart--inverted': true,
					'plotOptions-series--stacking': 'percent',
					'chart--polar': false
				},
				tooltipText: 'Requires one data column for X values or categories (vertical axis), subsequently ' +
				'one data column for each series\' Y values (horizontal axis).'
			},
			barstackedpercentageLabels: {
				title: 'Stacked percentage with labels',
				urlImg: 'https://cloud.highcharts.com/images/izoqyx/0/136.svg',
				config: {
					'chart--type': 'column',
					'chart--inverted': true,
					'plotOptions-series--stacking': 'percent',
					'plotOptions-series-dataLabels--enabled': true,
					'chart--polar': false
				},
				tooltipText: 'Requires one data column for X values or categories (vertical axis), subsequently ' +
				'one data column for each series\' Y values (horizontal axis).'
			},
			negative: {
				title: 'Negative color',
				urlImg: 'https://cloud.highcharts.com/images/efygam/0/136.svg',
				config: {
					'chart--type': 'column',
					'chart--inverted': true,
					'series[0]--negativeColor': '#0088FF',
					'series[0]--color': '#FF0000',
					'chart--polar': false
				},
				tooltipText: 'Requires one column for X values or categories, subsequently one column for each series\' Y values.'
			},
			multiColor: {
				title: 'Multi color',
				urlImg: 'https://cloud.highcharts.com/images/ogixak/0/136.svg',
				config: {
					'chart--type': 'column',
					'chart--inverted': true,
					'plotOptions-series-colorByPoint': true,
					'chart--polar': false
				},
				tooltipText: 'Requires one data column for X values or categories (vertical axis), subsequently ' +
				'one data column for each series\' Y values (horizontal axis).'
			},
			logarithmic: {
				title: 'Logarithmic',
				urlImg: 'https://cloud.highcharts.com/images/imykus/0/136.svg',
				config: {
					'chart--type': 'column',
					'chart--inverted': true,
					'yAxis--type': 'logarithmic',
					'yAxis--minorTickInterval': 'auto',
					'chart--polar': false
				},
				tooltipText: 'Requires one data column for X values or categories (vertical axis), subsequently ' +
				'one data column for each series\' Y values (horizontal axis).'
			},
			barRange: {
				title: 'Horizontal columnrange',
				urlImg: 'https://cloud.highcharts.com/images/iqagel/0/136.svg',
				config: {
					'chart--type': 'columnrange',
					'chart--inverted': true,
					'chart--polar': false
				},
				tooltipText: 'Requires one data column for X values or categories (vertical axis), subsequently ' +
				'two data column for each series\' Y values (horizontal axis).'
			},
			barRangeLabels: {
				title: 'Columnrange with labels',
				urlImg: 'https://cloud.highcharts.com/images/eracar/0/136.svg',
				config: {
					'chart--type': 'columnrange',
					'chart--inverted': true,
					'plotOptions-series-dataLabels--enabled': true,
					'chart--polar': false
				},
				tooltipText: 'Requires one data column for X values or categories (vertical axis), subsequently ' +
				'two data column for each series\' Y values (horizontal axis).'
			},
			packedColumns: {
				title: 'Packed columns',
				urlImg: 'https://cloud.highcharts.com/images/orixis/0/136.svg',
				config: {
					'chart--type': 'column',
					'chart--inverted': true,
					'plotOptions-series--pointPadding': 0,
					'plotOptions-series--groupPadding': 0,
					'plotOptions-series--borderWidth': 0,
					'plotOptions-series--shadow': false,
					'chart--polar': false
				},
				tooltiptext: 'Requires one data column for X values or categories, subsequently one data column for the series\' Y values.'
			},
			errorbar: {
				title: 'Error bar',
				urlImg: 'https://cloud.highcharts.com/images/omikax/0/136.svg',
				config: {
					'chart--type': 'column',
					'chart--inverted': true,
					'series[1]--type': 'errorbar',
					'chart--polar': false
				},
				tooltipText: 'Requires one data column for X values or categories, subsequently one data column for the series\' Y values. and two columns for the error bar series maximum and minimum.'
			}
		}
	},
	scatterandbubble: {
		title: 'Scatter and Bubble',
		templates: {
			scatter: {
				title: 'Scatter chart',
				urlImg: 'https://cloud.highcharts.com/images/ezatat/0/136.svg',
				config: {
					'chart--type': 'scatter',
					'chart--polar': false
				},
				tooltipText: 'Requires one data column for X values and one for Y values.'
			},
			bubbles: {
				title: 'Bubble chart',
				urlImg: 'https://cloud.highcharts.com/images/usyfyw/0/136.svg',
				config: {
					'chart--type': 'bubble',
					'chart--polar': false
				},
				tooltipText: 'Requires three data columns: one for X values, one for Y values and one for the size of the bubble (Z value).'
			},
			scatterLine: {
				title: 'Scatter with line',
				urlImg: 'https://cloud.highcharts.com/images/ydaqok/0/136.svg',
				config: {
					'chart--type': 'scatter',
					'plotOptions-series--lineWidth': 1,
					'chart--polar': false
				},
				tooltipText: 'Requires one data column for X values and one for Y values.'
			},
			scatterLineNoMarker: {
				title: 'Scatter with line, no marker',
				urlImg: 'https://cloud.highcharts.com/images/uvepiw/0/136.svg',
				config: {
					'chart--type': 'scatter',
					'plotOptions-series--lineWidth': 1,
					'plotOptions-series-marker--enabled': false,
					'chart--polar': false
				},
				tooltipText: 'Requires one data column for X values and one for Y values.'
			}
		}
	},
	pie: {
		title: 'Pie charts',
		templates: {
			pie: {
				title: 'Pie chart',
				urlImg: 'https://cloud.highcharts.com/images/yqoxob/3/136.svg',
				config: {
					'chart--type': 'pie',
					'plotOptions-pie--allowPointSelect': true,
					'plotOptions-pie--cursor': true,
					'plotOptions-series-dataLabels--enabled': true,
					'chart--polar': false
				},
				tooltipText: 'Requires two data columns: one for slice names (shown in data labels) and one for their values.'
			},
			pie3D: {
				title: '3D Pie chart',
				urlImg: 'https://cloud.highcharts.com/images/erifer/3/136.svg',
				config: {
					'chart--type': 'pie',
					'chart-options3d--enabled': true,
					'chart-options3d--alpha': 45,
					'chart-options3d--beta': 0,
					'plotOptions-pie--allowPointSelect': true,
					'plotOptions-pie--depth': 35,
					'plotOptions-pie--cursor': 'pointer',
					'plotOptions-series-dataLabels--enabled': true,
					'chart--polar': false
				},
				tooltipText: 'Requires two data columns: one for slice names (shown in data labels) and one for their values.'
			},
			pielegend: {
				title: 'Pie with legend',
				urlImg: 'https://cloud.highcharts.com/images/anofof/0/136.svg',
				config: {
					'chart--type': 'pie',
					'plotOptions-pie--allowPointSelect': true,
					'plotOptions-pie--cursor': true,
					'plotOptions-pie--showInLegend': true,
					'plotOptions-pie-dataLabels--enabled': false,
					'chart--polar': false
				},
				tooltipText: 'Requires two data columns: one for slice names (shown in the legend) and one for their values.'
			},
			pie3Dlegend: {
				title: '3D Pie with legend',
				urlImg: 'https://cloud.highcharts.com/images/ubopaq/0/136.svg',
				config: {
					'chart--type': 'pie',
					'chart-options3d--enabled': true,
					'chart-options3d--alpha': 45,
					'chart-options3d--beta': 0,
					'plotOptions-pie--allowPointSelect': true,
					'plotOptions-pie--depth': 35,
					'plotOptions-pie--cursor': 'pointer',
					'plotOptions-pie--showInLegend': true,
					'plotOptions-pie-dataLabels--enabled': false,
					'chart--polar': false
				},
				tooltipText: 'Requires two data columns: one for slice names (shown in legend) and one for their values.'
			},
			donut: {
				title: 'Donut',
				urlImg: 'https://cloud.highcharts.com/images/upaxab/2/136.svg',
				config: {
					'chart--type': 'pie',
					'plotOptions-pie--allowPointSelect': true,
					'plotOptions-pie--cursor': true,
					'plotOptions-pie--innerSize': '60%',
					'plotOptions-pie-dataLabels--enabled': true,
					'chart--polar': false
				},
				tooltipText: 'Requires two data columns: one for slice names (shown in data labels) and one for their values.'
			},
			donutlegend: {
				title: 'Donut with legend',
				urlImg: 'https://cloud.highcharts.com/images/arutag/1/136.svg',
				config: {
					'chart--type': 'pie',
					'plotOptions-pie--allowPointSelect': true,
					'plotOptions-pie--cursor': true,
					'plotOptions-pie--showInLegend': true,
					'plotOptions-pie--innerSize': '60%',
					'plotOptions-pie-dataLabels--enabled': false,
					'chart--polar': false
				},
				tooltipText: 'Donut with categories. Requires two data columns: one for slice names (shown in legend) and one for their values.'
			},
			donut3D: {
				title: '3D Donut chart',
				urlImg: 'https://cloud.highcharts.com/images/ehuvoh/3/136.svg',
				config: {
					'chart--type': 'pie',
					'chart-options3d--enabled': true,
					'chart-options3d--alpha': 45,
					'chart-options3d--beta': 0,
					'plotOptions-pie--allowPointSelect': true,
					'plotOptions-pie--depth': 35,
					'plotOptions-pie--cursor': 'pointer',
					'plotOptions-series-dataLabels--enabled': true,
					'plotOptions-pie--innerSize': '60%',
					'chart--polar': false
				},
				tooltipText: 'Requires two data columns: one for slice names (shown in data labels) and one for their values.'
			},
			donut3Dlegend: {
				title: '3D Donut chart with legend',
				urlImg: 'https://cloud.highcharts.com/images/oriwyb/1/136.svg',
				config: {
					'chart--type': 'pie',
					'chart-options3d--enabled': true,
					'chart-options3d--alpha': 45,
					'chart-options3d--beta': 0,
					'plotOptions-pie--allowPointSelect': true,
					'plotOptions-pie--depth': 35,
					'plotOptions-pie--cursor': 'pointer',
					'plotOptions-series-dataLabels--enabled': false,
					'plotOptions-pie--showInLegend': true,
					'plotOptions-pie--innerSize': '60%',
					'chart--polar': false
				},
				tooltipText: '3D Donut with categories. Requires two data columns: one for slice names (shown in data labels) and one for their values.'
			},
			semicircledonut: {
				title: 'Semi circle donut',
				urlImg: 'https://cloud.highcharts.com/images/iwyfes/2/136.svg',
				config: {
					'chart--type': 'pie',
					'plotOptions-pie--allowPointSelect': false,
					'plotOptions-series-dataLabels--enabled': true,
					'plotOptions-pie-dataLabels--distance': -30,
					'plotOptions-pie-dataLabels--style': {
						fontWeight: 'bold',
						color: 'white',
						textShadow: '0px 1px 2px black'
					},
					'plotOptions-pie--innerSize': '50%',
					'plotOptions-pie--startAngle': -90,
					'plotOptions-pie--endAngle': 90,
					'plotOptions-pie--center': ['50%', '75%'],
					'chart--polar': false
				},
				tooltipText: 'Requires two data columns: one for slice names (shown in data labels) and one for their values.'
			}
		}
	},
	polar: {
		title: 'Polar',
		templates: {
			polarLine: {
				title: 'Polar line',
				urlImg: 'https://cloud.highcharts.com/images/ajogud/2/136.svg',
				config: {
					'chart--type': 'line',
					'chart--polar': true
				},
				tooltipText: 'Requires one column for X values or categories (labels around the perimeter), subsequently one column for each series\' Y values ' +
				'(plotted from center and out).'
			},
			spiderLine: {
				title: 'Spider line',
				urlImg: 'https://cloud.highcharts.com/images/uqonaj/0/136.svg',
				config: {
					'chart--type': 'line',
					'chart--polar': true,
					'xAxis--tickmarkPlacement': 'on',
					'xAxis--lineWidth': 0,
					'yAxis--lineWidth': 0,
					'yAxis--gridLineInterpolation': 'polygon'
				},
				tooltipText: 'Requires one column for X values or categories (labels around the perimeter), subsequently one column for each series\' Y values ' +
				'(plotted from center and out).'
			},
			polarArea: {
				title: 'Polar area',
				urlImg: 'https://cloud.highcharts.com/images/oqajux/0/136.svg',
				config: {
					'chart--type': 'area',
					'chart--polar': true
				},
				tooltipText: 'Requires one column for X values or categories (labels around the perimeter), subsequently one column for each series\' Y values ' +
				'(plotted from center and out).'
			},
			spiderArea: {
				title: 'Spider area',
				urlImg: 'https://cloud.highcharts.com/images/exajib/0/136.svg',
				config: {
					'chart--type': 'area',
					'chart--polar': true,
					'xAxis--tickmarkPlacement': 'on',
					'xAxis--lineWidth': 0,
					'yAxis--lineWidth': 0,
					'yAxis--gridLineInterpolation': 'polygon'
				},
				tooltipText: 'Requires one column for X values or categories (labels around the perimeter), subsequently one column for each series\' Y values ' +
				'(plotted from center and out).'
			}
		}
	},
	stock: {
		title: 'Stock charts',
		templates: {
			basic: {
				title: 'Basic',
				urlImg: 'https://cloud.highcharts.com/images/awuhad/3/136.svg',
				constr: 'StockChart',
				config: {
					'chart--type': 'line',
					'rangeSelector--enabled': false,
					'chart--polar': false
				},
				tooltipText: 'Requires one column for X values or categories, subsequently one column for each series\' Y values.'
			},
			areastock: {
				title: 'Area',
				urlImg: 'https://cloud.highcharts.com/images/ukaqor/136.svg',
				constr: 'StockChart',
				config: {
					'chart--type': 'area',
					'rangeSelector--enabled': false,
					'chart--polar': false
				},
				tooltipText: 'Requires one column for X values or categories, subsequently one column for each series\' Y values.'
			},
			columnstock: {
				title: 'Column',
				urlImg: 'https://cloud.highcharts.com/images/ogywen/136.svg',
				constr: 'StockChart',
				config: {
					'chart--type': 'column',
					'rangeSelector--enabled': false,
					'chart--polar': false
				},
				tooltipText: 'Requires one column for X values or categories, subsequently one column for each series\' Y values.'
			},
			ohlc: {
				title: 'OHLC',
				urlImg: 'https://cloud.highcharts.com/images/opilip/2/136.svg',
				constr: 'StockChart',
				config: {
					'chart--type': 'ohlc',
					'rangeSelector--enabled': false,
					'chart--polar': false
				},
				tooltipText: 'Requires one column for X values or categories, subsequently four columns for each series\' Y values, e.g. open, high, low, close.'
			},
			candlestick: {
				title: 'Candlestick',
				urlImg: 'https://cloud.highcharts.com/images/etybef/0/136.svg',
				constr: 'StockChart',
				config: {
					'chart--type': 'candlestick',
					'rangeSelector--enabled': false,
					'chart--polar': false
				},
				tooltipText: 'Requires one column for X values or categories, subsequently four columns for each series\' Y values, e.g. open, high, low, close.'
			}
		}
	},
	more: {
		title: 'More types',
		templates: {
			solidgauge: {
				title: 'Solid gauge',
				urlImg: 'https://cloud.highcharts.com/images/apocob/0/136.svg',
				tooltipText: 'Requires one column for X values or categories, subsequently one column for each series\' Y values.',
				config: {
					'chart--type': 'solidgauge',
					'pane--center': ['50%', '85%'],
					'pane--size': '140%',
					'pane--startAngle': '-90',
					'pane--endAngle': '90',
					'pane--background': {
						backgroundColor: '#EEE',
						innerRadius: '60%',
						outerRadius: '100%',
						shape: 'arc'
					},
					'tooltip--enabled': false,
					'yAxis--stops': [
						[0.1, '#55BF3B'], // green
						[0.5, '#DDDF0D'], // yellow
						[0.9, '#DF5353'] // red
					],
					'yAxis--min': 0,
					'yAxis--max': 100,
					'yAxis--lineWidth': 0,
					'yAxis--minorTickInterval': null,
					'yAxis--tickPixelInterval': 400,
					'yAxis--tickWidth': 0,
					'yAxis-title--y': -70,
					'yAxis-labels--y': 16,
					'plotOptions-solidgauge-dataLabels--y': 10,
					'plotOptions-solidgauge-dataLabels--borderWidth': 0,
					'plotOptions-solidgauge-dataLabels--useHTML': true,
					'series[0]-dataLabels--format': '<div style="text-align:center"><span style="font-size:25px;color:#000000">{y}</span></div>'
				}
			},
			funnel: {
				title: 'Funnel',
				urlImg: 'https://cloud.highcharts.com/images/exumeq/0/136.svg',
				tooltipText: 'Requires one column for X values or categories, subsequently one column for each series\' Y values.',
				config: {
					'chart--type': 'funnel',
					'plotOptions-series-datalabels--color': '#000000',
					'plotOptions-series-dataLabels--softConnector': true,
					'plotOptions-series--neckWidth': '20%',
					'plotOptions-series--neckHeight': '35%',
					'series[0]--width': '64%'
				}
			},
			pyramid: {
				title: 'Pyramid',
				urlImg: 'https://cloud.highcharts.com/images/obulek/0/136.svg',
				tooltipText: 'Requires one column for X values or categories, subsequently one column for each series\' Y values.',
				config: {
					'chart--type': 'pyramid',
					'plotOptions-series-datalabels--color': '#000000',
					'plotOptions-series-dataLabels--softConnector': true,
					'series[0]--width': '64%'
				}
			},
			boxplot: {
				title: 'Boxplot',
				urlImg: 'https://cloud.highcharts.com/images/idagib/0/136.svg',
				tooltipText: 'Requires one column for X values, and one column each for low, lower quartile, median, upper quartile and high values.',
				config: {
					'chart--type': 'boxplot'
				}
			}

			// Issue #202 - heatmap makes no sense without proper category support
			//heatmap: {
			//	title: 'Heatmap',
			//	urlImg: 'https://cloud.highcharts.com/images/NOTREADY/0/136.svg',
			//	tooltipText: 'Requires ?? TODO',
			//	config: {
			//		'chart--type': 'heatmap',
			//		'plotOptions-series--borderWidth' : 1,
			//		'colorAxis--min' : 0
			//	}
			//},

			//speedometer: {
			//	title: 'Speedometer',
			//	config: {
			//		'chart--type': 'gauge',
			//		'chart--plotBackgroundColor': null,
			//		'chart--plotBackgroundImage': null,
			//		'chart--plotBorderwidth': 0,
			//		'chart-plotShadow': false,
			//		'pane--startAngle': -150,
			//		'pane--endAngle': 150,
			//		'yAxis--min': 0,
			//		'yAxis--max': 200,
			//		'yAxis--minorTickInterval': 'auto',
			//		'yAxis--minorTickWidth': 1,
			//		'yAxis--minorTickLength': 10,
			//		'yAxis--minorTickPosition': 'inside',
			//		'yAxis--minorTickColor': '#666',
			//		'yAxis--tickPixelInterval': 30,
			//		'yAxis--tickWidth': 2,
			//		'yAxis--tickPosition': 'inside',
			//		'yAxis--tickLength': 10,
			//		'yAxis--tickColor': '#666',
			//		'yAxis-labels--step': 2,
			//		'yAxis-labels--rotation': 'auto',
			//		'yAxis-plotBands': [{
			//			from: 0,
			//			to: 120,
			//			color: '#55BF3B' // green
			//		}, {
			//			from: 120,
			//			to: 160,
			//			color: '#DDDF0D' // yellow
			//		}, {
			//			from: 160,
			//			to: 200,
			//			color: '#DF5353' // red
			//		}]
			//	}
			//}
		}
	},
	combinations: {
		title: 'Combination charts',
		templates: {
			lineColumn: {
				title: 'Line and column',
				urlImg: 'https://cloud.highcharts.com/images/ynikoc/0/136.svg',
				config: {
					'chart--type': 'line',
					'series[0]--type': 'column'
				},
				tooltipText: 'Requires one data column for X values or categories, subsequently one data column for each series\' Y values. By default, the first series is a column series and subsequent series are lines.'
			},
			columnLine: {
				title: 'Column and line',
				urlImg: 'https://cloud.highcharts.com/images/ufafag/0/136.svg',
				config: {
					'chart--type': 'column',
					'series[0]--type': 'line'
				},
				tooltipText: 'Requires one data column for X values or categories, subsequently one data column for each series\' Y values. By default, the first series is a line series and subsequent series are columns.'
			},
			areaLine: {
				title: 'Area and line',
				urlImg: 'https://cloud.highcharts.com/images/ahimym/0/136.svg',
				config: {
					'chart--type': 'line',
					'series[0]--type': 'area'
				},
				tooltipText: 'Requires one data column for X values or categories, subsequently one data column for each series\' Y values. By default, the first series is a area series and subsequent series are lines.'
			},
			scatterLine: {
				title: 'Scatter and line',
				urlImg: 'https://cloud.highcharts.com/images/etakof/0/136.svg',
				config: {
					'chart--type': 'line',
					'series[0]--type': 'scatter'
				},
				tooltipText: 'Requires one data column for X values or categories, subsequently one data column for each series\' Y values. By default, the first series is a scatter series and subsequent series are lines.'
			},
			arearangeLine: {
				title: 'Arearange and line',
				urlImg: 'https://cloud.highcharts.com/images/ypepug/0/136.svg',
				config: {
					'chart--type': 'line',
					'series[0]--type': 'arearange'
				},
				tooltipText: 'Requires one data column for X values or categories, subsequently one data column for each series\' Y values. By default, the first series is a arearange series and subsequent series are lines.'
			}
		} // templates-combinations
	} 
};

if (typeof module !== 'undefined') {
	module.exports = highed.meta.chartTemplates;
}
/*
Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

highed.meta.optionsExtended = {
  "options": {
    "Titles": [
      {
        "text": "Main titles",
        "options": [
          {
            "text": "Chart title",
            "id": "title--text",
            "tooltipText": "The main chart title.",
            "dataType": "string",
            "context": "General",
            "defaults": "Chart title",
            "parent": "title"
          },
          {
            "text": "Chart subtitle",
            "id": "subtitle--text",
            "tooltipText": "The chart's subtitle, normally displayed with smaller fonts below the main title.",
            "dataType": "string",
            "context": "General",
            "parent": "subtitle"
          },
          {
            "text": "Y axis title",
            "id": "yAxis-title--text",
            "tooltipText": "The Y axis title, normally displayed vertically along the Y axis.",
            "dataType": "string",
            "context": "General",
            "defaults": "Values",
            "parent": "yAxis-title"
          }
        ]
      }
    ],
    "General": [
      {
        "text": "Chart size",
        "options": [
          {
            "id": "chart--width",
            "text": "Chart width",
            "custom": {
              "minValue": 0,
              "maxValue": 5000,
              "step": 10
            },
            "dataType": "number",
            "context": "General",
            "tooltipText": "An explicit width for the chart. By default (when <code>null</code>) the width is calculated from the offset width of the containing element.",
            "defaults": "null",
            "parent": "chart"
          },
          {
            "id": "chart--height",
            "text": "Chart height",
            "custom": {
              "minValue": 0,
              "maxValue": 5000,
              "step": 10
            },
            "dataType": "number",
            "context": "General",
            "tooltipText": "An explicit height for the chart. By default (when <code>null</code>) the height is calculated from the offset height of the containing element, or 400 pixels if the containing element's height is 0.",
            "defaults": "null",
            "parent": "chart"
          }
        ]
      },
      {
        "text": "Chart Interaction",
        "options": [
          {
            "id": "chart--zoomType",
            "text": "Allow zooming",
            "dataType": "string",
            "context": "General",
            "tooltipText": "Decides in what dimensions the user can zoom by dragging the mouse. Can be one of <code>x</code>, <code>y</code> or <code>xy</code>.",
            "parent": "chart",
            "values": "[null, \"x\", \"y\", \"xy\"]"
          },
          {
            "id": "chart--polar",
            "text": "Polar (radar) projection",
            "dataType": "boolean",
            "context": "General",
            "tooltipText": "When true, cartesian charts like line, spline, area and column are transformed into the polar coordinate system. Requires <code>highcharts-more.js</code>.",
            "defaults": "false",
            "parent": "chart"
          }
        ]
      }
    ],
    "Appearance": [
      {
        "text": "Fonts",
        "options": [
          {
            "id": "chart--style",
            "text": "Font family",
            "tooltipText": "The font to use throughout the chart",
            "dataType": "cssobject",
            "context": "General",
            "defaults": "{\"fontFamily\":\"\\\"Lucida Grande\\\", \\\"Lucida Sans Unicode\\\", Verdana, Arial, Helvetica, sans-serif\",\"fontSize\":\"12px\"}",
            "parent": "chart"
          }
        ]
      },
      {
        "text": "Titles",
        "options": [
          {
            "id": "title--style",
            "text": "Main title style",
            "tooltipText": "Styling for the main chart title",
            "dataType": "cssobject",
            "context": "General",
            "defaults": "{ \"color\": \"#333333\", \"fontSize\": \"18px\" }",
            "parent": "title"
          },
          {
            "id": "subtitle--style",
            "text": "Subtitle style",
            "tooltipText": "Styling for the chart's subtitle, normally displayed with smaller fonts below the main title",
            "dataType": "cssobject",
            "context": "General",
            "defaults": "{ \"color\": \"#555555\" }",
            "parent": "subtitle"
          }
        ]
      },
      {
        "text": "Series colors",
        "options": [
          {
            "id": "colors",
            "text": "Colors",
            "tooltipText": "Default colors for the data series, or for individual points in a pie series or a column series with individual colors. Colors will be picked in succession. If a color is explicitly set for each series in the <em>Data series</em> view, that color will take precedence.",
            "dataType": "array<color>",
            "context": "General",
            "defaults": "[ \"#7cb5ec\" , \"#434348\" , \"#90ed7d\" , \"#f7a35c\" , \"#8085e9\" , \"#f15c80\" , \"#e4d354\" , \"#2b908f\" , \"#f45b5b\" , \"#91e8e1\"]"
          }
        ]
      },
      {
        "text": "Chart area",
        "options": [
          {
            "id": "chart--backgroundColor",
            "text": "Background color",
            "tooltipText": "Background color for the full chart area",
            "dataType": "color",
            "context": "General",
            "defaults": "#FFFFFF",
            "parent": "chart"
          },
          {
            "id": "chart--borderWidth",
            "text": "Border width",
            "custom": {
              "minValue": 0
            },
            "dataType": "number",
            "context": "General",
            "tooltipText": "The pixel width of the outer chart border.",
            "defaults": "0",
            "parent": "chart"
          },
          {
            "id": "chart--borderRadius",
            "text": "Border corner radius",
            "custom": {
              "minValue": 0
            },
            "dataType": "number",
            "context": "General",
            "tooltipText": "The corner radius of the outer chart border.",
            "defaults": "0",
            "parent": "chart"
          },
          {
            "id": "chart--borderColor",
            "text": "Border color",
            "dataType": "color",
            "context": "General",
            "tooltipText": "The color of the outer chart border.",
            "defaults": "#4572A7",
            "parent": "chart"
          }
        ]
      },
      {
        "text": "Plot area",
        "options": [
          {
            "id": "chart--plotBackgroundColor",
            "text": "Background color",
            "tooltipText": "Background color for the plot area, the area inside the axes",
            "dataType": "color",
            "context": "General",
            "parent": "chart"
          },
          {
            "id": "chart--plotBackgroundImage",
            "text": "Background image URL",
            "tooltipText": "The online URL for an image to use as the plot area background",
            "dataType": "string",
            "context": "General",
            "parent": "chart"
          },
          {
            "id": "chart--plotBorderWidth",
            "text": "Border width",
            "dataType": "number",
            "context": "General",
            "tooltipText": "The pixel width of the plot area border.",
            "defaults": "0",
            "parent": "chart"
          },
          {
            "id": "chart--plotBorderColor",
            "text": "Border color",
            "dataType": "color",
            "context": "General",
            "tooltipText": "The color of the inner chart or plot area border.",
            "defaults": "#C0C0C0",
            "parent": "chart"
          }
        ]
      }
    ],
    "Axes": [
      {
        "text": "Axes setup",
        "options": [
          {
            "id": "chart--inverted",
            "text": "Inverted axes",
            "dataType": "boolean",
            "context": "General",
            "tooltipText": "<p>Whether to invert the axes so that the x axis is vertical and y axis is horizontal. When true, the x axis is <a href=\"#xAxis.reversed\">reversed</a> by default. If a bar series is present in the chart, it will be inverted automatically.</p>\r\n\r\n<p>Inverting the chart doesn't have an effect if there are no cartesian series in the chart, or if the chart is <a href=\"#chart.polar\">polar</a>.</p>",
            "defaults": "false",
            "parent": "chart"
          }
        ]
      },
      {
        "id": "xAxis",
        "text": "X-Axis",
        "options": [
          {
            "id": "xAxis-crosshair",
            "text": "Crosshair",
            "dataType": "boolean|object",
            "context": "General",
            "tooltipText": "Configure a crosshair that follows either the mouse pointer or the hovered point.",
            "defaults": "false",
            "parent": "xAxis",
            "values": "",
            "attributes": [
              {
                "dataType": "color",
                "name": "color",
                "title": "color",
                "tooltipText": "The color of the crosshair. Defaults to <code>#C0C0C0</code> for numeric and datetime axes, and <code>rgba(155,200,255,0.2)</code> for category axes, where the crosshair by default highlights the whole category.",
                "defaults": "",
                "values": ""
              },
              {
                "dataType": "string",
                "name": "dashStyle",
                "title": "dashStyle",
                "tooltipText": "The dash style for the crosshair. See <a href=\"#plotOptions.series.dashStyle\">series.dashStyle</a> for possible values.",
                "defaults": "Solid",
                "values": "[\"Solid\", \"ShortDash\", \"ShortDot\", \"ShortDashDot\", \"ShortDashDotDot\", \"Dot\", \"Dash\" ,\"LongDash\", \"DashDot\", \"LongDashDot\", \"LongDashDotDot\"]"
              },
              {
                "dataType": "boolean",
                "name": "snap",
                "title": "snap",
                "tooltipText": "Whether the crosshair should snap to the point or follow the pointer independent of points.",
                "defaults": "true",
                "values": ""
              },
              {
                "dataType": "number",
                "name": "width",
                "title": "width",
                "tooltipText": "The pixel width of the crosshair. Defaults to 1 for numeric or datetime axes, and for one category width for category axes.",
                "defaults": "",
                "values": ""
              },
              {
                "dataType": "number",
                "name": "zIndex",
                "title": "zIndex",
                "tooltipText": "The Z index of the crosshair. Higher Z indices allow drawing the crosshair on top of the series or behind the grid lines.",
                "defaults": "2",
                "values": ""
              }
            ]
          },
          {
            "id": "xAxis-title--style",
            "text": "X axis title",
            "tooltipText": "Styling and text for the X axis title",
            "dataType": "cssobject",
            "context": "General",
            "defaults": "{ \"color\": \"#707070\", \"fontWeight\": \"bold\" }",
            "parent": "xAxis-title"
          },
          {
            "id": "xAxis-title--text",
            "dataType": "string",
            "context": "General",
            "tooltipText": "The actual text of the axis title. It can contain basic HTML text markup like &lt;b&gt;, &lt;i&gt; and spans with style.",
            "parent": "xAxis-title",
            "text": "text"
          },
          {
            "id": "xAxis--type",
            "text": "Type",
            "tooltipText": "The type of axis",
            "dataType": "string",
            "context": "General",
            "defaults": "linear",
            "parent": "xAxis",
            "values": "[\"linear\", \"logarithmic\", \"datetime\", \"category\"]"
          },
          {
            "id": "xAxis--opposite",
            "text": "Opposite side of chart",
            "dataType": "boolean",
            "context": "General",
            "tooltipText": "Whether to display the axis on the opposite side of the normal. The normal is on the left side for vertical axes and bottom for horizontal, so the opposite sides will be right and top respectively. This is typically used with dual or multiple axes.",
            "defaults": "false",
            "parent": "xAxis"
          },
          {
            "id": "xAxis--reversed",
            "text": "Reversed direction",
            "dataType": "boolean",
            "context": "General",
            "tooltipText": "Whether to reverse the axis so that the highest number is closest to the origin. If the chart is inverted, the x axis is reversed by default.",
            "defaults": "false",
            "parent": "xAxis"
          },
          {
            "id": "xAxis-labels--format",
            "text": "Axis labels format",
            "tooltipText": "<p>A format string for the axis labels. The value is available through a variable <code>{value}</code>.</p><p><b>Units</b> can be added for example like <code>{value} USD</code>.</p><p><b>Formatting</b> can be added after a colon inside the variable, for example <code>USD {value:.2f}</code> to display two decimals, or <code>{value:%Y-%m-%d}</code> for a certain time format.",
            "dataType": "string",
            "context": "General",
            "defaults": "{value}",
            "parent": "xAxis-labels"
          },
          {
            "id": "xAxis-labels--rotation",
            "text": "Axis labels rotation",
            "custom": {
              "step": 5,
              "minValue": -90,
              "maxValue": 90
            },
            "dataType": "number",
            "context": "General",
            "tooltipText": "Rotation of the labels in degrees.",
            "defaults": "0",
            "parent": "xAxis-labels"
          }
        ]
      },
      {
        "id": "yAxis",
        "text": "Y-Axis",
        "options": [
          {
            "id": "yAxis-crosshair",
            "text": "Crosshair",
            "dataType": "boolean|object",
            "context": "General",
            "tooltipText": "Configure a crosshair that follows either the mouse pointer or the hovered point.",
            "defaults": "false",
            "parent": "yAxis",
            "values": "",
            "attributes": [
              {
                "dataType": "color",
                "name": "color",
                "title": "color",
                "tooltipText": "The color of the crosshair. Defaults to <code>#C0C0C0</code> for numeric and datetime axes, and <code>rgba(155,200,255,0.2)</code> for category axes, where the crosshair by default highlights the whole category.",
                "defaults": "",
                "values": ""
              },
              {
                "dataType": "string",
                "name": "dashStyle",
                "title": "dashStyle",
                "tooltipText": "The dash style for the crosshair. See <a href=\"#plotOptions.series.dashStyle\">series.dashStyle</a> for possible values.",
                "defaults": "Solid",
                "values": "[\"Solid\", \"ShortDash\", \"ShortDot\", \"ShortDashDot\", \"ShortDashDotDot\", \"Dot\", \"Dash\" ,\"LongDash\", \"DashDot\", \"LongDashDot\", \"LongDashDotDot\"]"
              },
              {
                "dataType": "boolean",
                "name": "snap",
                "title": "snap",
                "tooltipText": "Whether the crosshair should snap to the point or follow the pointer independent of points.",
                "defaults": "true",
                "values": ""
              },
              {
                "dataType": "number",
                "name": "width",
                "title": "width",
                "tooltipText": "The pixel width of the crosshair. Defaults to 1 for numeric or datetime axes, and for one category width for category axes.",
                "defaults": "",
                "values": ""
              },
              {
                "dataType": "number",
                "name": "zIndex",
                "title": "zIndex",
                "tooltipText": "The Z index of the crosshair. Higher Z indices allow drawing the crosshair on top of the series or behind the grid lines.",
                "defaults": "2",
                "values": ""
              }
            ]
          },
          {
            "id": "yAxis-title--style",
            "text": "Y axis title",
            "tooltipText": "Styling and text for the X axis title",
            "dataType": "cssobject",
            "context": "General",
            "defaults": "{ \"color\": \"#707070\", \"fontWeight\": \"bold\" }",
            "parent": "yAxis-title"
          },
          {
            "id": "yAxis--type",
            "text": "Type",
            "tooltipText": "The type of axis",
            "dataType": "string",
            "context": "General",
            "defaults": "linear",
            "parent": "yAxis",
            "values": "[\"linear\", \"logarithmic\", \"datetime\", \"category\"]"
          },
          {
            "id": "yAxis--opposite",
            "text": "Opposite side of chart",
            "dataType": "boolean",
            "context": "General",
            "tooltipText": "Whether to display the axis on the opposite side of the normal. The normal is on the left side for vertical axes and bottom for horizontal, so the opposite sides will be right and top respectively. This is typically used with dual or multiple axes.",
            "defaults": "false",
            "parent": "yAxis"
          },
          {
            "id": "yAxis--reversed",
            "text": "Reversed direction",
            "dataType": "boolean",
            "context": "General",
            "tooltipText": "Whether to reverse the axis so that the highest number is closest to the origin. If the chart is inverted, the x axis is reversed by default.",
            "defaults": "false",
            "parent": "yAxis"
          }
        ]
      }
    ],
    "Data series": [
      {
        "id": "series",
        "array": true,
        "text": "Series",
        "controlledBy": {
          "title": "Select Series",
          "options": "series",
          "optionsTitle": "name"
        },
        "filteredBy": "series--type",
        "options": [
          {
            "id": "series--type",
            "text": "Series type",
            "tooltipText": "The type of series",
            "dataType": "string",
            "context": "General",
            "parent": "series<pie>",
            "values": "[null, \"line\", \"spline\", \"column\", \"area\", \"areaspline\", \"pie\", \"arearange\", \"areasplinerange\", \"boxplot\", \"bubble\", \"columnrange\", \"errorbar\", \"funnel\", \"gauge\", \"scatter\", \"waterfall\"]",
            "subType": [
              "pie",
              "line",
              "bubble",
              "treemap",
              "bar",
              "pyramid",
              "areaspline",
              "scatter",
              "gauge",
              "waterfall",
              "area",
              "errorbar",
              "polygon",
              "solidgauge",
              "funnel",
              "column",
              "spline",
              "arearange",
              "columnrange",
              "heatmap",
              "areasplinerange",
              "boxplot"
            ],
            "subTypeDefaults": {}
          },
          {
            "id": "series--color",
            "text": "Color",
            "tooltipText": "The main color of the series. If no color is given here, the color is pulled from the array of default colors as given in the \"Appearance\" section.",
            "dataType": "color",
            "context": "General",
            "defaults": "null",
            "parent": "series<polygon>",
            "subType": [
              "polygon",
              "areasplinerange",
              "boxplot",
              "scatter",
              "waterfall",
              "areaspline",
              "bar",
              "spline",
              "line",
              "treemap",
              "arearange",
              "columnrange",
              "gauge",
              "column",
              "area",
              "errorbar",
              "heatmap",
              "bubble"
            ],
            "subTypeDefaults": {
              "treemap": "null",
              "errorbar": "#000000",
              "heatmap": "null"
            }
          },
          {
            "id": "series--negativeColor",
            "text": "Negative color",
            "tooltipText": "The negative color of the series below the threshold. Threshold is default zero, this can be changed in the advanced settings.",
            "dataType": "color",
            "context": "General",
            "defaults": "null",
            "parent": "series<areaspline>",
            "values": "",
            "subType": [
              "areaspline",
              "polygon",
              "bubble",
              "gauge",
              "scatter",
              "boxplot",
              "arearange",
              "errorbar",
              "bar",
              "areasplinerange",
              "line",
              "column",
              "spline",
              "area"
            ],
            "subTypeDefaults": {
              "polygon": "null",
              "bubble": "null",
              "gauge": "null",
              "scatter": "null",
              "boxplot": "null",
              "arearange": "null",
              "errorbar": "null",
              "bar": "null",
              "areasplinerange": "null",
              "line": "null",
              "column": "null",
              "spline": "null",
              "area": "null"
            }
          },
          {
            "id": "series--colorByPoint",
            "text": "Color by point",
            "tooltipText": "Use one color per point. Colors can be changed in the \"Appearance\" section.",
            "dataType": "boolean",
            "context": "General",
            "defaults": "false",
            "parent": "series<boxplot>",
            "subType": [
              "boxplot",
              "errorbar",
              "bar",
              "heatmap",
              "waterfall",
              "treemap",
              "column",
              "columnrange"
            ],
            "subTypeDefaults": {
              "errorbar": "false",
              "bar": "false",
              "heatmap": "false",
              "waterfall": "false",
              "treemap": "false",
              "column": "false",
              "columnrange": "false"
            }
          },
          {
            "id": "series--dashStyle",
            "text": "Dash style",
            "dataType": "string",
            "context": "General",
            "tooltipText": "A name for the dash style to use for the graph. Applies only to series type having a graph, like <code>line</code>, <code>spline</code>, <code>area</code> and <code>scatter</code> in  case it has a <code>lineWidth</code>. The value for the <code>dashStyle</code> include:\r\n\t\t    <ul>\r\n\t\t    \t<li>Solid</li>\r\n\t\t    \t<li>ShortDash</li>\r\n\t\t    \t<li>ShortDot</li>\r\n\t\t    \t<li>ShortDashDot</li>\r\n\t\t    \t<li>ShortDashDotDot</li>\r\n\t\t    \t<li>Dot</li>\r\n\t\t    \t<li>Dash</li>\r\n\t\t    \t<li>LongDash</li>\r\n\t\t    \t<li>DashDot</li>\r\n\t\t    \t<li>LongDashDot</li>\r\n\t\t    \t<li>LongDashDotDot</li>\r\n\t\t    </ul>",
            "defaults": "Solid",
            "parent": "series<arearange>",
            "values": "[\"Solid\", \"ShortDash\", \"ShortDot\", \"ShortDashDot\", \"ShortDashDotDot\", \"Dot\", \"Dash\" ,\"LongDash\", \"DashDot\", \"LongDashDot\", \"LongDashDotDot\"]",
            "subType": [
              "arearange",
              "polygon",
              "areaspline",
              "bubble",
              "scatter",
              "areasplinerange",
              "line",
              "spline",
              "waterfall",
              "area"
            ],
            "subTypeDefaults": {
              "polygon": "Solid",
              "areaspline": "Solid",
              "bubble": "Solid",
              "scatter": "Solid",
              "areasplinerange": "Solid",
              "line": "Solid",
              "spline": "Solid",
              "waterfall": "Dot",
              "area": "Solid"
            }
          },
          {
            "id": "series-marker--enabled",
            "text": "Enable point markers",
            "dataType": "boolean",
            "context": "General",
            "tooltipText": "Enable or disable the point marker. If <code>null</code>, the markers are hidden when the data is dense, and shown for more widespread data points.",
            "defaults": "null",
            "parent": "series<line>-marker",
            "subType": [
              "line",
              "spline",
              "area",
              "polygon",
              "areaspline",
              "scatter",
              "bubble"
            ],
            "subTypeDefaults": {
              "spline": "null",
              "area": "null",
              "polygon": "null",
              "areaspline": "null",
              "scatter": "null",
              "bubble": "null"
            }
          },
          {
            "id": "series-marker--symbol",
            "text": "Marker symbol",
            "dataType": "string",
            "context": "General",
            "tooltipText": "<p>A predefined shape or symbol for the marker. When null, the symbol is pulled from options.symbols. Other possible values are \"circle\", \"square\", \"diamond\", \"triangle\" and \"triangle-down\".</p>\r\n\r\n<p>Additionally, the URL to a graphic can be given on this form:  \"url(graphic.png)\". Note that for the image to be applied to exported charts, its URL needs to be accessible by the export server.</p>\r\n\r\n<p>Custom callbacks for symbol path generation can also be added to <code>Highcharts.SVGRenderer.prototype.symbols</code>. The callback is then used by its method name, as shown in the demo.</p>",
            "parent": "series<spline>-marker",
            "values": "[null, \"circle\", \"square\", \"diamond\", \"triangle\", \"triangle-down\"]",
            "subType": [
              "spline",
              "polygon",
              "area",
              "areaspline",
              "line",
              "bubble",
              "scatter"
            ],
            "subTypeDefaults": {}
          }
        ]
      }
    ],
    "Value labels": [
      {
        "id": "data-labels",
        "text": "Value labels",
        "options": [
          {
            "id": "plotOptions-series-dataLabels--enabled",
            "text": "Enable data labels for all series",
            "tooltipText": "Show small labels next to each data value (point, column, pie slice etc)",
            "dataType": "boolean",
            "context": "General",
            "defaults": "false",
            "parent": "plotOptions-series-dataLabels"
          },
          {
            "id": "plotOptions-series-dataLabels--style",
            "text": "Text style",
            "dataType": "cssobject",
            "context": "General",
            "tooltipText": "Styles for the label.",
            "defaults": "{\"color\": \"contrast\", \"fontSize\": \"11px\", \"fontWeight\": \"bold\", \"textShadow\": \"0 0 6px contrast, 0 0 3px contrast\" }",
            "parent": "plotOptions-series-dataLabels"
          }
        ]
      }
    ],
    "Legend": [
      {
        "text": "General",
        "options": [
          {
            "id": "legend--enabled",
            "text": "Enable legend",
            "dataType": "boolean",
            "context": "General",
            "tooltipText": "Enable or disable the legend.",
            "defaults": "true",
            "parent": "legend"
          },
          {
            "id": "legend--layout",
            "text": "Item layout",
            "dataType": "string",
            "context": "General",
            "tooltipText": "The layout of the legend items. Can be one of \"horizontal\" or \"vertical\".",
            "defaults": "horizontal",
            "parent": "legend",
            "values": "[\"horizontal\", \"vertical\"]"
          }
        ]
      },
      {
        "text": "Placement",
        "options": [
          {
            "id": "legend--align",
            "text": "Horizontal alignment",
            "dataType": "string",
            "context": "General",
            "tooltipText": "<p>The horizontal alignment of the legend box within the chart area. Valid values are <code>left</code>, <code>center</code> and <code>right</code>.</p>\r\n\r\n<p>In the case that the legend is aligned in a corner position, the <code>layout</code> option will determine whether to place it above/below or on the side of the plot area.</p>",
            "defaults": "center",
            "parent": "legend",
            "values": "[\"left\", \"center\", \"right\"]"
          },
          {
            "id": "legend--x",
            "text": "Horizontal offset",
            "tooltipText": "The pixel offset of the legend relative to its alignment",
            "dataType": "number",
            "context": "General",
            "defaults": "0",
            "parent": "legend"
          },
          {
            "id": "legend--verticalAlign",
            "text": "Vertical alignment",
            "dataType": "string",
            "context": "General",
            "tooltipText": "<p>The vertical alignment of the legend box. Can be one of <code>top</code>, <code>middle</code> or  <code>bottom</code>. Vertical position can be further determined by the <code>y</code> option.</p>\r\n\r\n<p>In the case that the legend is aligned in a corner position, the <code>layout</code> option will determine whether to place it above/below or on the side of the plot area.</p>",
            "defaults": "bottom",
            "parent": "legend",
            "values": "[\"top\", \"middle\", \"bottom\"]"
          },
          {
            "id": "legend--y",
            "text": "Vertical offset",
            "tooltipText": "The pixel offset of the legend relative to its alignment",
            "dataType": "number",
            "context": "General",
            "defaults": "0",
            "parent": "legend"
          },
          {
            "id": "legend--floating",
            "text": "Float on top of plot area",
            "dataType": "boolean",
            "context": "General",
            "tooltipText": "When the legend is floating, the plot area ignores it and is allowed to be placed below it.",
            "defaults": "false",
            "parent": "legend"
          }
        ]
      },
      {
        "text": "Appearance",
        "options": [
          {
            "id": "legend--itemStyle",
            "text": "Text style",
            "dataType": "cssobject",
            "context": "General",
            "tooltipText": "CSS styles for each legend item. Only a subset of CSS is supported, notably those options related to text.",
            "defaults": "{ \"color\": \"#333333\", \"cursor\": \"pointer\", \"fontSize\": \"12px\", \"fontWeight\": \"bold\" }",
            "parent": "legend"
          },
          {
            "id": "legend--itemHiddenStyle",
            "text": "Text style hidden",
            "dataType": "cssobject",
            "context": "General",
            "tooltipText": "CSS styles for each legend item when the corresponding series or point is hidden. Only a subset of CSS is supported, notably those options related to text. Properties are inherited from <code>style</code> unless overridden here. Defaults to:\r\n<pre>itemHiddenStyle: {\r\n\tcolor: '#CCC'\r\n}</pre>",
            "parent": "legend"
          },
          {
            "id": "legend--backgroundColor",
            "text": "Background color",
            "dataType": "color",
            "context": "General",
            "tooltipText": "The background color of the legend.",
            "parent": "legend"
          },
          {
            "id": "legend--borderWidth",
            "text": "Border width",
            "dataType": "number",
            "context": "General",
            "tooltipText": "The width of the drawn border around the legend.",
            "defaults": "0",
            "parent": "legend"
          },
          {
            "id": "legend--borderRadius",
            "text": "Border corner radius",
            "dataType": "number",
            "context": "General",
            "tooltipText": "The border corner radius of the legend.",
            "defaults": "0",
            "parent": "legend"
          },
          {
            "id": "legend--borderColor",
            "text": "Border color",
            "dataType": "color",
            "context": "General",
            "tooltipText": "The color of the drawn border around the legend.",
            "defaults": "#909090",
            "parent": "legend"
          }
        ]
      }
    ],
    "Tooltip": [
      {
        "text": "General",
        "options": [
          {
            "id": "tooltip--enabled",
            "text": "Enable tooltip",
            "tooltipText": "Enable or disable the tooltip. The tooltip is the information box that appears on mouse-over or touch on a point.",
            "dataType": "boolean",
            "context": "General",
            "defaults": "true",
            "parent": "tooltip"
          },
          {
            "id": "tooltip--shared",
            "text": "Shared between series",
            "dataType": "boolean",
            "context": "General",
            "tooltipText": "<p>When the tooltip is shared, the entire plot area will capture mouse movement or touch events. Tooltip texts for series types with ordered data (not pie, scatter, flags etc) will be shown in a single bubble. This is recommended for single series charts and for tablet/mobile optimized charts.</p>\r\n\r\n<p>See also the experimental implementation for <a href=\"http://jsfiddle.net/gh/get/jquery/1.7.2/highcharts/highcharts/tree/master/samples/highcharts/studies/tooltip-split/\">tooltip.split</a>, that is better suited for charts with many series, especially line-type series.</p>",
            "defaults": "false",
            "parent": "tooltip"
          }
        ]
      },
      {
        "text": "Color and border",
        "options": [
          {
            "id": "tooltip--backgroundColor",
            "text": "Background color",
            "tooltipText": "The background color of the tooltip",
            "dataType": "color",
            "context": "General",
            "defaults": "rgba(255, 255, 255, 0.85)",
            "parent": "tooltip"
          },
          {
            "id": "tooltip--borderWidth",
            "text": "Border width",
            "custom": {
              "minValue": 0
            },
            "dataType": "number",
            "context": "General",
            "tooltipText": "The pixel width of the tooltip border.",
            "defaults": "1",
            "parent": "tooltip"
          },
          {
            "id": "tooltip--borderRadius",
            "text": "Border corner radius",
            "custom": {
              "minValue": 0
            },
            "dataType": "number",
            "context": "General",
            "tooltipText": "The radius of the rounded border corners.",
            "defaults": "3",
            "parent": "tooltip"
          },
          {
            "id": "tooltip--borderColor",
            "text": "Border color",
            "tooltipText": "The border color of the tooltip. If no color is given, the corresponding series color is used.",
            "dataType": "color",
            "context": "General",
            "defaults": "null",
            "parent": "tooltip"
          }
        ]
      }
    ]
  }
};
/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

highed.meta.colors = [
//Red
    '#F44336',
    '#FFEBEE',
    '#FFCDD2',
    '#EF9A9A',
    '#E57373',
    '#EF5350',
    '#F44336',
    '#E53935',
    '#D32F2F',
    '#C62828',
    '#B71C1C',
    '#FF8A80',
    '#FF5252',
    '#FF1744',
    '#D50000',
//Pink
    '#E91E63',
    '#FCE4EC',
    '#F8BBD0',
    '#F48FB1',
    '#F06292',
    '#EC407A',
    '#E91E63',
    '#D81B60',
    '#C2185B',
    '#AD1457',
    '#880E4F',
    '#FF80AB',
    '#FF4081',
    '#F50057',
    '#C51162',
//Purple
    '#9C27B0',
    '#F3E5F5',
    '#E1BEE7',
    '#CE93D8',
    '#BA68C8',
    '#AB47BC',
    '#9C27B0',
    '#8E24AA',
    '#7B1FA2',
    '#6A1B9A',
    '#4A148C',
    '#EA80FC',
    '#E040FB',
    '#D500F9',
    '#AA00FF',
//Deep Purple
    '#673AB7',
    '#EDE7F6',
    '#D1C4E9',
    '#B39DDB',
    '#9575CD',
    '#7E57C2',
    '#673AB7',
    '#5E35B1',
    '#512DA8',
    '#4527A0',
    '#311B92',
    '#B388FF',
    '#7C4DFF',
    '#651FFF',
    '#6200EA',
//Indigo
    '#3F51B5',
    '#E8EAF6',
    '#C5CAE9',
    '#9FA8DA',
    '#7986CB',
    '#5C6BC0',
    '#3F51B5',
    '#3949AB',
    '#303F9F',
    '#283593',
    '#1A237E',
    '#8C9EFF',
    '#536DFE',
    '#3D5AFE',
    '#304FFE',
//Blue
    '#2196F3',
    '#E3F2FD',
    '#BBDEFB',
    '#90CAF9',
    '#64B5F6',
    '#42A5F5',
    '#2196F3',
    '#1E88E5',
    '#1976D2',
    '#1565C0',
    '#0D47A1',
    '#82B1FF',
    '#448AFF',
    '#2979FF',
    '#2962FF',
//Light Blue
    '#03A9F4',
    '#E1F5FE',
    '#B3E5FC',
    '#81D4FA',
    '#4FC3F7',
    '#29B6F6',
    '#03A9F4',
    '#039BE5',
    '#0288D1',
    '#0277BD',
    '#01579B',
    '#80D8FF',
    '#40C4FF',
    '#00B0FF',
    '#0091EA',
//Cyan
    '#00BCD4',
    '#E0F7FA',
    '#B2EBF2',
    '#80DEEA',
    '#4DD0E1',
    '#26C6DA',
    '#00BCD4',
    '#00ACC1',
    '#0097A7',
    '#00838F',
    '#006064',
    '#84FFFF',
    '#18FFFF',
    '#00E5FF',
    '#00B8D4',
//Teal
    '#009688',
    '#E0F2F1',
    '#B2DFDB',
    '#80CBC4',
    '#4DB6AC',
    '#26A69A',
    '#009688',
    '#00897B',
    '#00796B',
    '#00695C',
    '#004D40',
    '#A7FFEB',
    '#64FFDA',
    '#1DE9B6',
    '#00BFA5',
//Green
    '#4CAF50',
    '#E8F5E9',
    '#C8E6C9',
    '#A5D6A7',
    '#81C784',
    '#66BB6A',
    '#4CAF50',
    '#43A047',
    '#388E3C',
    '#2E7D32',
    '#1B5E20',
    '#B9F6CA',
    '#69F0AE',
    '#00E676',
    '#00C853',
//Light Green
    '#8BC34A',
    '#F1F8E9',
    '#DCEDC8',
    '#C5E1A5',
    '#AED581',
    '#9CCC65',
    '#8BC34A',
    '#7CB342',
    '#689F38',
    '#558B2F',
    '#33691E',
    '#CCFF90',
    '#B2FF59',
    '#76FF03',
    '#64DD17',
//Lime
    '#CDDC39',
    '#F9FBE7',
    '#F0F4C3',
    '#E6EE9C',
    '#DCE775',
    '#D4E157',
    '#CDDC39',
    '#C0CA33',
    '#AFB42B',
    '#9E9D24',
    '#827717',
    '#F4FF81',
    '#EEFF41',
    '#C6FF00',
    '#AEEA00',
//Yellow
    '#FFEB3B',
    '#FFFDE7',
    '#FFF9C4',
    '#FFF59D',
    '#FFF176',
    '#FFEE58',
    '#FFEB3B',
    '#FDD835',
    '#FBC02D',
    '#F9A825',
    '#F57F17',
    '#FFFF8D',
    '#FFFF00',
    '#FFEA00',
    '#FFD600',
//Amber
    '#FFC107',
    '#FFF8E1',
    '#FFECB3',
    '#FFE082',
    '#FFD54F',
    '#FFCA28',
    '#FFC107',
    '#FFB300',
    '#FFA000',
    '#FF8F00',
    '#FF6F00',
    '#FFE57F',
    '#FFD740',
    '#FFC400',
    '#FFAB00',
//Orange
    '#FF9800',
    '#FFF3E0',
    '#FFE0B2',
    '#FFCC80',
    '#FFB74D',
    '#FFA726',
    '#FF9800',
    '#FB8C00',
    '#F57C00',
    '#EF6C00',
    '#E65100',
    '#FFD180',
    '#FFAB40',
    '#FF9100',
    '#FF6D00',
//Deep Orange
    '#FF5722',
    '#FBE9E7',
    '#FFCCBC',
    '#FFAB91',
    '#FF8A65',
    '#FF7043',
    '#FF5722',
    '#F4511E',
    '#E64A19',
    '#D84315',
    '#BF360C',
    '#FF9E80',
    '#FF6E40',
    '#FF3D00',
    '#DD2C00',
//Brown
    '#795548',
    '#EFEBE9',
    '#D7CCC8',
    '#BCAAA4',
    '#A1887F',
    '#8D6E63',
    '#795548',
    '#6D4C41',
    '#5D4037',
    '#4E342E',
    '#3E2723',
    '#3E2723',
    '#3E2723',
    '#3E2723',
    '#3E2723',
//Grey
    '#9E9E9E',
    '#FAFAFA',
    '#F5F5F5',
    '#EEEEEE',
    '#E0E0E0',
    '#BDBDBD',
    '#9E9E9E',
    '#757575',
    '#616161',
    '#424242',
    '#212121',
    '#212121',
    '#212121',
    '#212121',
//Blue Grey
    '#607D8B',
    '#ECEFF1',
    '#CFD8DC',
    '#B0BEC5',
    '#90A4AE',
    '#78909C',
    '#607D8B',
    '#546E7A',
    '#455A64',
    '#37474F',
    '#37474F',
    '#37474F',
    '#37474F',
    '#263238'
];
/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

highed.meta.fonts = [
    '"Lucida Grande", "Lucida Sans Unicode", Verdana, Arial, Helvetica, sans-serif',
    'Courier',
    'Arial',
    'Verdana',
    'Georgia',
    'Palatino Linotype',
    'Times New Roman',
    'Comic Sans MS',
    'Impact',
    'Lucida Sans Unicode',
    'Tahoma',
    'Lucida Console',
    'Courier New',
    'Monaco',
    'Monospace'
];

/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

/** UI for selecting a chart template from the ones defined in meta/highed.meta.charts.js
 *  @constructor
 *  @param parent {domnode} - the parent to attach the selector to
 *
 *  @emits Select - when selecting a template
 *    > {object} - the template definition
 */
highed.ChartTemplateSelector = function (parent) {
    var events = highed.events(),
        splitter = highed.HSplitter(parent, {leftWidth: 30}),
        list = highed.List(splitter.left),
        templates = splitter.right,
        selected = false
    ;

    ///////////////////////////////////////////////////////////////////////////

    function showTemplates(templateList, masterID) {
        templates.innerHTML = '';

        Object.keys(templateList).forEach(function (key) {
            var t = templateList[key],
                node = highed.dom.cr('div', 'highed-chart-template-preview'),
                titleBar = highed.dom.cr('div', 'highed-chart-template-title', t.title)
            ;

            if (selected && selected.id === masterID + key + t.title) {
                node.className = 'highed-chart-template-preview highed-chart-template-preview-selected';
                selected.node = node;
            }

            highed.dom.style(node, {
                'background-image': 'url(' + t.urlImg + ')'         
            });

            highed.dom.showOnHover(node, titleBar);

            highed.dom.on(node, 'click', function () {
                if (selected) {
                    selected.node.className = 'highed-chart-template-preview';
                }

                node.className = 'highed-chart-template-preview highed-chart-template-preview-selected';

                selected = {
                    id: masterID + key + t.title,
                    node: node
                };

                events.emit('Select', templateList[key]);
            });

            highed.dom.ap(templates, 
                highed.dom.ap(node,
                    titleBar
                )
            );
        });
    }
    
    /* Force a resize */
    function resize(w, h) {
        splitter.resize(w, h);
    }

    /* Build the UI */
    function build() {
        list.addItems(Object.keys(highed.meta.chartTemplates).map(function (key) {
            return {
                id: key,
                title: highed.meta.chartTemplates[key].title
            };
        }));

        list.selectFirst();
    }

    ///////////////////////////////////////////////////////////////////////////

    list.on('Select', function (id) {
        showTemplates(highed.meta.chartTemplates[id].templates, id);
    });

    build();

    ///////////////////////////////////////////////////////////////////////////

    return {
        on: events.on,
        resize: resize,
        rebuild: build,
        list:list
    };
};
/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

/** UI For customizing a chart
 *  @constructor
 *  @emits PropertyChange - when a property changes
 *    > {string} - the path of the change
 *    > {anything} - the new value
 *    > {number} - the change array index
 *  @param parent {domnode} - the node to attach the editor to
 *  @param attributes {object} - the attributes
 *    > noAdvanced {bool} - set to false to force disable the advance view
 *    > availableSettings {string|array} - whitelist of exposed settings
 */
highed.ChartCustomizer = function (parent, attributes) {
    var properties = highed.merge({
            noAdvanced: false,
            availableSettings: []
        }, attributes),
        events = highed.events(),
        tabs = highed.TabControl(parent, true),
        simpleTab = tabs.createTab({title: 'SIMPLE'}),
        advancedTab = tabs.createTab({title: 'ADVANCED'}),
        
        splitter = highed.HSplitter(simpleTab.body, {leftWidth: 30}),
        list = highed.List(splitter.left),
        body = splitter.right,

        advSplitter = highed.HSplitter(advancedTab.body, {leftWidth: 30}),
        advBody = advSplitter.right,
        advTree = highed.Tree(advSplitter.left),

        flatOptions = {},
        chartOptions = {},

        highlighted = false
    ;

    properties.availableSettings = highed.arrToObj(properties.availableSettings);

    ///////////////////////////////////////////////////////////////////////////

     /** Force a resize of the editor 
     *  @memberof highed.ChartCustomizer
     */
    function resize(w, h) {
        var bsize;
        
        tabs.resize(w, h);
        bsize = tabs.barSize();

        list.resize(w, h - bsize.h);
        splitter.resize(w, h - bsize.h - 10);
    }

    /** Init the customizer
     *  @memberof highed.ChartCustomizer
     *  @param foptions {object} - the customized options
     *  @param coptions {object} - the full chart options
     */
    function init(foptions, coptions) {
        flatOptions = foptions || {};
        chartOptions = coptions || flatOptions;
        list.reselect();
        buildTree();
        advTree.reselect();
    }

    function buildBody(entry) {

    }

    function applyFilter(detailIndex, filteredBy, filter) {       
        var selected = list.selected(),
            id = selected.id,
            entry = highed.meta.optionsExtended.options[id]
        ;

        if (!selected) return false;
        
        body.innerHTML = '';

        entry.forEach(function (thing) {
            selectGroup(thing, false, false, detailIndex, filteredBy, filter);
        });
        
        highlighted = false;
    }

    function shouldInclude(group) {
        var doInclude = false;

        if (Object.keys(properties.availableSettings).length > 0) {
            if (highed.isArr(group)) {
                group.forEach(function (sub) {
                    if (shouldInclude(sub)) {
                        doInclude = true;
                    }
                });
            } else if (highed.isArr(group.options)) {
                group.options.forEach(function (sub) {
                    if (shouldInclude(sub)) {
                        doInclude = true;
                    }
                });
            } else if (properties.availableSettings[group.id]) {
                doInclude = true;
            } 

            return doInclude;
        }
        
        return true;
    }

    //This function has mutated into a proper mess. Needs refactoring.
    function selectGroup(group, table, options, detailIndex, filteredBy, filter) {
        var master, vals, doInclude = true;

        options = options || flatOptions;

        if (highed.isArr(group.options)) {
            table = highed.dom.cr('table', 'highed-customizer-table');

            doInclude = shouldInclude(group);

            if (!doInclude) {
                return;
            }

            highed.dom.ap(body, 
                highed.dom.cr('div', 'highed-customizer-table-heading', group.text)
            );

            if (group.filteredBy) {
                filter = highed.getAttr(options, group.filteredBy, detailIndex);
            }

            if (group.controlledBy) {
                master = highed.dom.cr('select', 'highed-box-size highed-stretch');
            
                if (highed.isStr(group.controlledBy.options)) {
                    vals = highed.getAttr(options, group.controlledBy.options, detailIndex);

                    if (highed.isArr(vals)) {
                        if (vals.length === 0) {
                            highed.dom.ap(body, highed.dom.cr('i', '', 'No data to display..'));
                            return;
                        }

                        highed.dom.options(master,
                            vals.map(function (t) {
                                return group.controlledBy.optionsTitle ? t[group.controlledBy.optionsTitle] : t;
                            }),
                            detailIndex
                        );  

                        highed.dom.on(master, 'change', function () {
                            detailIndex = master.selectedIndex;

                            table.innerHTML = '';

                            group.options.forEach(function (sub) {
                                if (group.filteredBy) {
                                    filter = highed.getAttr(options, group.filteredBy, detailIndex);                                    
                                }
                                selectGroup(sub, table, options, detailIndex, group.filteredBy, filter);
                            });
                        });

                        highed.dom.ap(body, master);               
                        detailIndex = detailIndex || 0;
                    } else {
                        return;
                    }
                }
            }

            highed.dom.ap(body, table);

            group.options.forEach(function (sub) {
                selectGroup(sub, table, options, detailIndex, group.filteredBy, filter);
            });
                   
        } else if (typeof group.id !== 'undefined') {     

            //Check if we should filter out this column
            if (filter && group.subType && group.subType.length) {
                if (!highed.arrToObj(group.subType)[filter]) {
                    return;
                }
            }

            if (Object.keys(properties.availableSettings).length > 0) {
                if (!properties.availableSettings[group.id]) {
                    return;
                }
            }

            //highed.dom.ap(sub, highed.dom.cr('span', '', referenced[0].returnType));
            highed.dom.ap(table, 
                highed.InspectorField(
                    group.values ? 'options' : group.dataType, 
                    (highed.getAttr(options, group.id, detailIndex) || (filter && group.subTypeDefaults[filter] ? group.subTypeDefaults[filter] : group.defaults)), 
                    {
                        title: group.text,
                        tooltip: group.tooltipText,
                        values: group.values,
                        custom: group.custom,
                        attributes: group.attributes || []   
                    },
                    function (newValue) {        
                        events.emit('PropertyChange', group.id, newValue, detailIndex);
                        
                        if (group.id === filteredBy) {
                            //This is a master for the rest of the childs,
                            //which means that we need to rebuild everything 
                            //here somehow and check their subType
                            applyFilter(detailIndex, filteredBy, newValue);
                        }
                    }
                )
            );
        }
    }

    function buildTree() {
        if (properties.noAdvanced || highed.isNull(highed.meta.optionsAdvanced)) {
            advancedTab.hide();
        } else {
            advTree.build(highed.meta.optionsAdvanced, chartOptions);        
        }
    }

    function build() {
        Object.keys(highed.meta.optionsExtended.options).forEach(function (key) {
            if (!shouldInclude(highed.meta.optionsExtended.options[key])) {
                return;
            }

            list.addItem({
                id: key,
                title: key
            });
        });

        buildTree();
    }

    /** Focus a category
     *  @memberof highed.ChartCustomizer
     *  @param thing {anything} - the category to focus
     */
    function focus(thing, x, y) {
        list.select(thing);
        // var entry = highed.meta.optionsExtended.options[thing];

        // if (entry) {
        //     body.innerHTML = '';
        //     entry.forEach(function (thing) {
        //         selectGroup(thing);
        //     });
        // }
    }

    ///////////////////////////////////////////////////////////////////////////
    
    list.on('Select', function (id){
        var entry = highed.meta.optionsExtended.options[id];
        body.innerHTML = '';
        entry.forEach(function (thing) {
            selectGroup(thing);
        });
        highlighted = false;
    });

    advTree.on('Select', function (item, selected, arrIndex) {
        var table = highed.dom.cr('table', 'highed-customizer-table');
        advBody.innerHTML = '';

        Object.keys(item.entries).forEach(function (key) {
            var entry = item.entries[key];
            
            highed.dom.ap(table,
                highed.InspectorField(
                    entry.values ?  'options' : (entry.dataType || 'string'), 
                    (highed.getAttr(chartOptions, entry.id, arrIndex)  || entry.defaults), 
                    {
                        title: highed.uncamelize(entry.shortName),
                        tooltip: entry.description,
                        values: entry.values,
                        custom: {},
                        attributes: entry.attributes || []
                    },
                    function (newValue) {       
                        events.emit('PropertyChange', entry.id, newValue, arrIndex);
                    }
                )
            );
        });

        highed.dom.ap(advBody, 
            highed.dom.cr('div', 'highed-customizer-table-heading', selected),
            table
        );
    });

    advTree.on('DataUpdate', function (path, data) {
        events.emit('PropertyChange', path, data);
    });

    tabs.on('Focus', function () {
        init(flatOptions, chartOptions);
    });

    build();

    return {
        /* Listen to an event */
        on: events.on,
        resize: resize,
        init: init,
        focus: focus,
        reselect: list.reselect
    };
};
/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

/** This is a component that implements a toolbar with wizard steps 
  * @constructor
  * @emits Step - when stepping back or forth
  * @emits AddStep - when adding a step to the stepper
  * @param parent {domnode} - the dom node to attach the UI to
  * @param bodyParent {domnode} - the dom node to attach the stepper body to
  * @param attributes {object} - options for the object
*/
highed.WizardBar = function (parent, bodyParent, attributes) {
    var toolbar = highed.Toolbar(parent, { 
            additionalCSS: ['highed-wizstepper-bar'] 
        }),
        stepper = highed.WizardStepper(bodyParent, toolbar.center),
        next = highed.dom.cr('span', 'highed-wizstepper-next-prev fa fa-arrow-right'),
        previous = highed.dom.cr('span', 'highed-wizstepper-next-prev fa fa-arrow-left')
    ;

    ///////////////////////////////////////////////////////////////////////////

    function handleStepEvent(step, count) {
        if (step.number > 1) {
            highed.dom.style(previous, {
                opacity: 1,
                'pointer-events': 'auto',
                'visibility': 'visible'
            });
        } else {
            highed.dom.style(previous, {
                opacity: 0,
                'pointer-events': 'none',
                'visibility': 'hidden'
            });
        }

        if (step.number < count) {
            highed.dom.style(next, {
                opacity: 1,
                'pointer-events': 'auto',
                'visibility': 'visible'
            });
        } else {
            highed.dom.style(next, {
                opacity: 0,
                'pointer-events': 'none',
                'visibility': 'hidden'
            });
        }
    }

    stepper.on('Step', handleStepEvent);
    stepper.on('AddStep', handleStepEvent);

    highed.dom.on(next, 'click', stepper.next);
    highed.dom.on(previous, 'click', stepper.previous);

    ///////////////////////////////////////////////////////////////////////////

    highed.dom.ap(toolbar.right, next);
    highed.dom.ap(toolbar.left, previous);

    highed.dom.style(previous, {
        opacity: 0,
        'pointer-events': 'none'
    });

    return {
        container: toolbar.container,
        on: stepper.on,
        next: stepper.next,
        previous: stepper.previous,
        addStep: stepper.addStep
    };
};
/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

(function () {
    var webImports = {};

    highed.plugins.import = {
        /** Install a data import plugin 
          * @namespace highed.plugins.import
          * @param name {string} - the name of the plugin
          * @param defintion {object} - the plugin definition
          *   > description {string} - the plugin description
          *   > treatAs {string} - what to treat the import as: `json|csv`
          *   > fetchAs {string} - what the expect request return is
          *   > defaultURL {string} - the default URL
          *   > depdendencies {array<string>} - set of additional javascript/css to include
          *   > options {object} - additional user-supplied options
          *      > label {string} - the title of the option
          *      > type {string} - the type of the option
          *      > default {string} - the default value
          *   > filter {function} - function to call when executing the plugin
          *      >  url {anything} - request url 
          *      >  options {object} - contains user-defined options
          *      >  callback {function} - function to call when the import is done
          */
        install: function (name, defintion) {
            if (highed.isNull(webImports[name])) {
                webImports[name] = highed.merge({
                    title: false,
                    description: '',
                    treatAs: 'csv',
                    fetchAs: 'json',
                    defaultURL: '',
                    dependencies: [],
                    options: {},
                    filter: function (){}
                }, defintion);

                if (webImports[name].dependencies) {
                    highed.include(webImports[name].dependencies);
                }
            } else {
                highed.log(1, 'tried to register an import plugin which already exists:', name);
            }
        }
    };

    /** Data importer widget
     *  @constructor
     *  @emits ImportChartSettings - when importing chart settings
     *  @emits ImportCSV - when importing CSV
     *  @emits ImportJSON - when importing JSON
     *  @param parent {domnode} - the node to attach the widget to
     *  @param attributes {object} - the settings
     *     > options {string} - the options to include: `csv json plugins samples`
     *     > plugins {string} - the plugins to activate (must have been installed first)
     */
    highed.DataImporter = function (parent, attributes) {
        var events = highed.events(),

            properties = highed.merge({
                options: ['csv','samples'],
                plugins: ['CSV', 'JSON', 'Difi', 'Socrata', 'Google Spreadsheets']
            }, attributes),

            tabs = highed.TabControl(parent),
            csvTab = tabs.createTab({title: 'CSV'}),
            jsonTab = tabs.createTab({title: 'JSON'}),
            webTab = tabs.createTab({title: 'Plugins'}),

            csvPasteArea = highed.dom.cr('textarea', 'highed-imp-pastearea'),
            csvImportBtn = highed.dom.cr('button', 'highed-imp-button', 'Import'),
            csvImportFileBtn = highed.dom.cr('button', 'highed-imp-button', 'Upload & Import File'),
            delimiter = highed.dom.cr('input', 'highed-imp-input'),
            dateFormat = highed.dom.cr('input', 'highed-imp-input'),
            decimalPoint = highed.dom.cr('input', 'highed-imp-input'),
            firstAsNames = highed.dom.cr('input', 'highed-imp-input'),

            jsonPasteArea = highed.dom.cr('textarea', 'highed-imp-pastearea'),
            jsonImportBtn = highed.dom.cr('button', 'highed-imp-button', 'Import'),
            jsonImportFileBtn = highed.dom.cr('button', 'highed-imp-button', 'Upload & Import File'),

            webSplitter = highed.HSplitter(webTab.body, {leftWidth: 30}),
            webList = highed.List(webSplitter.left)            
        ;

        jsonPasteArea.value = JSON.stringify({}, undefined, 2);

        ///////////////////////////////////////////////////////////////////////////

        properties.options = highed.arrToObj(properties.options);
        properties.plugins = highed.arrToObj(properties.plugins);

        function updateOptions() {
            if (!properties.options.csv) {
                csvTab.hide();
            }
            if (!properties.options.json) {
                jsonTab.hide();
            }
            if (Object.keys(properties.plugins) === 0 || !properties.options.plugins) {
                webTab.hide();
            }

            tabs.selectFirst();
        }

        function buildWebTab() {
            Object.keys(webImports).forEach(function (name) {

                if (!properties.plugins[name]) {
                    return;
                }

                function buildBody() {            
                    var options = webImports[name],
                        url = highed.dom.cr('input', 'highed-imp-input-stretch'),
                        urlTitle = highed.dom.cr('div', '', 'URL'),
                        importBtn = highed.dom.cr('button', 'highed-imp-button highed-imp-button-right', 'Import ' + name + ' from URL'),
                        dynamicOptionsContainer = highed.dom.cr('table', 'highed-customizer-table'),
                        dynamicOptions = {}
                    ;

                    url.value = options.defaultURL || '';

                    Object.keys(options.options || {}).forEach(function (name) {
                        dynamicOptions[name] = options.options[name].default;

                        highed.dom.ap(dynamicOptionsContainer,
                            highed.InspectorField(options.options[name].type, options.options[name].default, {title: options.options[name].label}, function (nval) {
                                dynamicOptions[name] = nval;
                            }, true)
                        );
                    });

                    if (options.supressURL) {
                        highed.dom.style([url, urlTitle], {
                            display: 'none'
                        });
                    }

                    url.placeholder = 'Enter URL';

                    highed.dom.on(importBtn, 'click', function () {
                        highed.snackBar('Importing ' + name + ' data');

                        if (highed.isFn(options.request)) {
                            return options.request(url.value, dynamicOptions, function (err, chartProperties) {
                                if (err) return highed.snackBar('import error: ' + err);
                                events.emit('ImportChartSettings', chartProperties);
                            });
                        }

                        highed.ajax({
                            url: url.value,
                            type: 'get',
                            dataType: options.fetchAs || 'text',
                            success: function (val) {
                                options.filter(val, highed.merge({}, dynamicOptions), function (error, val) {       
                                    if (error) return highed.snackBar('import error: ' + error);                         
                                    if (options.treatAs === 'csv') {
                                        csvTab.focus();
                                        csvPasteArea.value = val;
                                        emitCSVImport(val);
                                    } else {
                                        processJSONImport(val);
                                    }
                                });
                            },
                            error: function (err) {
                                highed.snackBar('import error: ' + err);
                            }
                        });
                    });

                    webSplitter.right.innerHTML = '';

                    highed.dom.ap(webSplitter.right,
                        highed.dom.cr('div', 'highed-customizer-table-heading', options.title || name),
                        highed.dom.cr('div', 'highed-imp-help', options.description),
                        urlTitle,
                        url,
                        Object.keys(options.options || {}).length ? dynamicOptionsContainer : false,
                        highed.dom.cr('br'),
                        importBtn
                    );
                }

                webList.addItem({
                    id: name,
                    title: webImports[name].title || name,
                    click: buildBody
                });

            });

            webList.selectFirst();
        }

        function emitCSVImport(csv) {
            events.emit('ImportCSV', {
                itemDelimiter: delimiter.value,
                firstRowAsNames: firstAsNames.checked,
                dateFormat: dateFormat.value,
                csv: csv || csvPasteArea.value,
                decimalPoint: decimalPoint.value
            });
        }

        function processJSONImport(jsonString) {
            var json = jsonString;
            if (highed.isStr(json)) {            
                try {
                    json = JSON.parse(jsonString);
                } catch(e) {
                    highed.snackBar('Error parsing json: ' + e);
                    return false;
                }
            }
            events.emit('ImportJSON', json);
            highed.snackBar('imported json');
        }
        
        /** Force a resize of the widget 
         *  @memberof highed.DataImporter
         */
        function resize(w, h) {
            var bsize,
                ps = highed.dom.size(parent)
            ;

            tabs.resize(w || ps.w, h || ps.h);
            bsize = tabs.barSize();
            
            webSplitter.resize(w || ps.w, (h || ps.h) - bsize.h - 20);
            webList.resize(w || ps.w, (h || ps.h) - bsize.h);
        }

        ///////////////////////////////////////////////////////////////////////////

        highed.dom.ap(csvTab.body,
            csvPasteArea/*,

            highed.dom.cr('span', 'highed-imp-label', 'Delimiter'),
            delimiter,
            highed.dom.cr('br'),

            highed.dom.cr('span', 'highed-imp-label', 'Date Format'),
            dateFormat,
            highed.dom.cr('br'),

            highed.dom.cr('span', 'highed-imp-label', 'Decimal Point Notation'),
            decimalPoint,
            highed.dom.cr('br'),

            highed.dom.cr('span', 'highed-imp-label', 'First Row Is Series Names'),
            firstAsNames,
            highed.dom.cr('br')*/
        );

        highed.dom.ap(jsonTab.body, 
            highed.dom.cr('div', 'highed-imp-help', 'Paste JSON into the below box, or upload a file. Click Import to import your data.'),
            jsonPasteArea,
            jsonImportFileBtn,
            jsonImportBtn
        );

        highed.dom.on(csvPasteArea, 'keyup', function (e) {
            if (e.keyCode === 13 || ((e.metaKey || e.ctrlKey) && e.key === 'z')) {
                emitCSVImport();
            }
        });

        highed.dom.on(jsonImportBtn, 'click', function () {
            processJSONImport(jsonPasteArea.value);
        });

        updateOptions();

        delimiter.value = '<<>>';
        //dateFormat.value = 'YYYY-mm-dd';
        firstAsNames.type = 'checkbox';
        decimalPoint.value = '.';
        firstAsNames.checked = true;


        //Should hide the web tab if running where cross-origin is an issue

        resize();

        ///////////////////////////////////////////////////////////////////////////
        
        return {
            on: events.on,
            resize: resize,
            emitCSVImport: emitCSVImport,
            processJSONImport: processJSONImport,
            jsonPasteArea:jsonPasteArea
        };
    };
})();
/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

(function () {
    var exportPlugins = {};

    highed.plugins.export = {
        /** Install an export plugin
         *  @namespace highed.plugins.export
         *  @param name {string} - the name of the plugin
         *  @param definition {object} - the plugin definition
         */
        install: function (name, definition) {
            if (highed.isNull(exportPlugins[name])) {
                exportPlugins[name] = highed.merge({
                    description: '',
                    options: {},
                    title: false,
                    downloadOutput: false
                }, definition);

                if (exportPlugins[name].dependencies) {
                    highed.include(exportPlugins[name].dependencies);
                }

            } else {
                highed.log(1, 'tried to register an export plugin which already exists:', name);
            }
        }
    };

    /** Export widget
     *  @constructor
     *  @param parent {domnode} - the node to attach the widget to
     *  @param attributes {object} - the options
     *    > options {string} - things to include: `csv html json plugins`
     *    > plugins {string|array} - plugins to activate
     */
    highed.Exporter = function (parent, attributes) {
        var //splitter = highed.HSplitter(parent, {leftWidth: 50, noOverflow: true}),
            properties = highed.merge({
                options: 'csv html json plugins',
                plugins: 'beatify-js beatify-json'
            }, attributes),    

            tctrl = highed.TabControl(parent),
            jsonTab = tctrl.createTab({title: 'Export JSON'}),

            exportJSON = highed.dom.cr('a', '', 'Create'),
            jsonValue = highed.dom.cr('textarea', 'highed-imp-pastearea'),

            currentChartPreview = false,
            hasBuiltPlugins = false,
            hasBeenVisible = false,
            pluginData = {},
            activePlugins = {},
            activePlugin = false
        ;

        properties.options = highed.arrToObj(properties.options);
        properties.plugins = highed.arrToObj(properties.plugins);

        ///////////////////////////////////////////////////////////////////////////        

        //Hides unwanted stuff
        function updateOptions() {
            if (!properties.options.html) {
                htmlTab.hide();
            }
            if (!properties.options.json) {
                jsonTab.hide();
            }
            if (!properties.options.html) {
                htmlTab.hide();
            }
            if (!properties.options.plugins) {
                pluginTab.hide();
            }
            if (Object.keys(properties.plugins) === 0) {
                pluginTab.hide();
            }

            tctrl.selectFirst();
        }


        //Build plugin panel
        function buildPlugins() {
            if (hasBuiltPlugins) return;
            hasBuiltPlugins = true;

            Object.keys(exportPlugins).forEach(function (name) {
                var options = exportPlugins[name]
                ;

                pluginData[name] = {options: {}};

                if (!properties.plugins[name]) {
                    return false;
                }

                function buildBody() {                      
                    var container = highed.dom.cr('div'),
                        executeBtn = highed.dom.cr('button', 'highed-imp-button highed-imp-button-right', options.exportTitle || 'Create'),
                        dynamicOptionsContainer = highed.dom.cr('table', 'highed-customizer-table'),
                        additionalUI = highed.dom.cr('div'),
                        dynamicOptions = pluginData[name].options
                    ;
                    
                   // pluginSplitter.right.innerHTML = '';            

                    Object.keys(options.options || {}).forEach(function (pname) {
                        dynamicOptions[pname] = options.options[pname].default;

                        highed.dom.ap(dynamicOptionsContainer,
                            highed.InspectorField(
                                options.options[pname].type, 
                                options.options[pname].default, 
                                {
                                    title: options.options[pname].label
                                }, 
                                function (nval) {
                                    dynamicOptions[pname] = nval;

                                    if (highed.isFn(options.show)) {
                                        options.show.apply(pluginData[name], [currentChartPreview]);
                                    }
                                }, true)
                        );
                    });

                    function doExport() {
                    	
                        if (highed.isFn(options.export) && currentChartPreview) {
                            options.export.apply(pluginData[name], [dynamicOptions, currentChartPreview, function (err, data, filename) {
                                if (err) return highed.snackBar('Export error: ' + err);

                                if (options.downloadOutput) {
                                    var l = highed.dom.cr('a');
                                    l.download = filename || 'unkown';
                                    l.href = 'data:application/octet-stream,' + encodeURIComponent(data);
                                    highed.dom.ap(document.body, l);
                                    l.click();
                                    document.body.removeChild(l);
                                }

                                highed.snackBar((options.title || name) + ' export complete');
                            }, additionalUI]);
                        }
                    }

                    highed.dom.on(executeBtn, 'click', doExport);

                    highed.dom.ap(pluginSplitter.right, container);

                    highed.dom.style(container, {display: 'none'});

                    highed.dom.ap(container,
                        highed.dom.cr('div', 'highed-customizer-table-heading', options.title || name),
                        highed.dom.cr('div', 'highed-imp-help', options.description),
                        Object.keys(options.options || {}).length ? dynamicOptionsContainer : false,
                        additionalUI,
                        options.export ? executeBtn : false
                    );              

                    if (highed.isFn(options.create)) {
                        options.create.apply(pluginData[name], [currentChartPreview, additionalUI]);
                    }

                    activePlugins[name] = {
                        export: doExport,
                        show: function () {
                            if (activePlugin) {
                                activePlugin.hide();
                            }
                            highed.dom.style(container, {display: ''});
                            options.show.apply(pluginData[name], [currentChartPreview]);
                            activePlugin = activePlugins[name];
                        },
                        hide: function () {
                            highed.dom.style(container, {display: 'none'});
                        }
                    };
                }

                buildBody();

            });            
        }

        /** Set the export boxes based on chart JSON data (chart.options)
         *  @memberof highed.Exporter
         *  @param chartData {object} - the chart JSON
         *  @param chartHTML {string} - chart HTML
         *  @param chartSVG {string} - chart svg
         *  @param chartPreview {object} - instance of highed.ChartPreview
         */
        function init(chartData, chartHTML, chartSVG, chartPreview) {
            var title = '_export';

            if (chartData.title && chartData.title.text) {
                title = chartData.title.text.replace(/\s/g, '_') + title;
            } else {
                title = 'untitled' + title;
            }

            jsonValue.value = JSON.stringify(chartData);
            
           /* exportJSON.onclick = 'createChart()' + jsonValue.value;*/
        
            currentChartPreview = chartPreview;

            buildPlugins();

            if (activePlugin) {
                activePlugin.show();
            }

            hasBeenVisible = true;
        }   

        /** Force a resize of the UI
         *  @memberof highed.Exporter
         */
        function resize(w, h) {
            var bsize;

            //splitter.resize(w, h);
            tctrl.resize(w, h);
            bsize = tctrl.barSize();

            /*pluginSplitter.resize(w, h - bsize.h - 20);
            pluginList.resize(w, h - bsize.h);*/
        }

        function doSelectOnClick(thing) {
            highed.dom.on(thing, 'click', function () {
                thing.focus();
                thing.select();
            });
        }

        ///////////////////////////////////////////////////////////////////////////

        highed.dom.ap(jsonTab.body,
           // highed.dom.cr('div', 'highed-imp-headline', 'Export JSON'),
            highed.dom.ap(highed.dom.cr('div', 'highed-imp-spacer'),
                jsonValue
            ),
            highed.dom.ap(highed.dom.cr('button', 'highed-imp-button'),
                exportJSON
            )
        );

        resize();
        updateOptions();

        doSelectOnClick(jsonValue);

        ///////////////////////////////////////////////////////////////////////////

        return {
            init: init,
            resize: resize,
            buildPluginUI: buildPlugins,
        };
    };
})();
/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

/** Basic chart preview
 *  This is just a facade to Highcharts.Chart mostly.
 *  It implements a sliding drawer type widget,
 *  where the initial state can be as part of the main DOM,
 *  and where the expanded state covers most of the screen (90%)
 *
 *  @constructor
 *
 *  @param parent {domnode} - the node to attach the preview to
 *  @param attributes {object} - the settings
 *    > defaultChartOptions {object} - the default chart options 
 */
highed.ChartPreview = function (parent, attributes) {
    var properties = highed.merge({
            defaultChartOptions: {
                title: {
                    text: 'My Chart'
                },
                subtitle: {
                    text: 'My Untitled Chart'
                },
                exporting: {
                 //   url: 'http://127.0.0.1:7801'
                }
            },
            expandTo: parent
        }, attributes),
        events = highed.events(),
        customizedOptions = highed.merge({}, properties.defaultChartOptions),
        aggregatedOptions = highed.merge({}, attributes.aggregatedOptions),
        flatOptions = highed.merge({}, attributes.flatOptions),   
        templateOptions = highed.merge({}, attributes.templateOptions),
        chartOptions = highed.merge({}, attributes.chartOptions),
      
        throttleTimeout = false,
        chart = false,
        preExpandSize = false,
        toggleButton = highed.dom.cr('div', 'highed-icon highed-chart-preview-expand fa fa-angle-double-left'),
        expanded = false,
        wysiwyg = {
            'highcharts-legend': 'Legend',
            'highcharts-title': 'Titles',
            'highcharts-subtitle': 'Titles',
            'highcharts-yaxis-labels': 'Axes',
            'highcharts-xaxis-labels': 'Axes',
            'highcharts-yaxis-title': 'Axes'
        }
    ;

    ///////////////////////////////////////////////////////////////////////////

    function attachWYSIWYG() {
        Object.keys(wysiwyg).forEach(function (key) {            
            highed.dom.on(parent.querySelector('.' + key), 'click', function (e) {
                events.emit('RequestEdit', wysiwyg[key], e.clientX, e.clientY);
            });
        });
    }

    /* Get the chart if it's initied */
    function gc(fn) {
        if (highed.isFn(fn)) {
            if (chart && chart.options) {
                return fn(chart);
            } else {                
                return fn(init());
                //highed.log(1, 'chart is undefined: chart preview');
            }
        } 
        return false;
    }

    /* Emit change events */
    function emitChange() {
        events.emit('ChartChange', aggregatedOptions);

        //Throttled event - we use this when doing server stuff in the handler
        //since e.g. using the color picker can result in quite a lot of updates
        //within a short amount of time
        clearTimeout(throttleTimeout);
        throttleTimeout = setTimeout(function () {
            events.emit('ChartChangeLately', aggregatedOptions);
        }, 800);
    }

    /* Init the chart */
    function init(options, pnode, noAnimation) {
        var i;

        //We want to work on a copy..
        options = highed.merge({}, options || aggregatedOptions);
        highed.setAttr(options, 'chart--renderTo', pnode || parent);

        if (noAnimation) {
            highed.setAttr(options, 'plotOptions--series--animation', false);
        }

        if (typeof window.Highcharts === 'undefined') {
            highed.snackBar('Highcharts.JS must be included to use the editor');
            return;
        }

        try {
            chart = new Highcharts.Chart(options);   
            //This is super ugly.
            customizedOptions.series = customizedOptions.series || [];
            highed.merge(customizedOptions.series, chart.options.series);
            updateAggregated();    

            highed.merge(chartOptions, chart.options);       

            attachWYSIWYG();

            resize();
            highed.dom.ap(pnode || parent, toggleButton);
        } catch (ex) {
            var e = ex.toString();

            //So we know that the return here is likely to be an
            //url with the error code. so extract it.
            highed.log(1, 'error initializing chart:', e);

            i = e.indexOf('www.');
            
            if (i > 0) {
                highed.snackBar('There\'s a problem with your chart!', e.substr(i), function () {
                    window.open('http://' + e.substr(i));
                });
            } else {
                //Our assumption was wrong. The world is ending.
                highed.snackBar(e);            
            }
        }       

        return chart;
    }

    /* Resize the preview */
    function resize() {
        gc(function (chart) {
            chart.reflow();
        });
    }

    function updateAggregated() {
       // customizedOptions.plotOptions = customizedOptions.plotOptions || {};
       // customizedOptions.plotOptions.series = customizedOptions.plotOptions.series || [];
        customizedOptions.series = customizedOptions.series || [];

        //Merge fest
        highed.clearObj(aggregatedOptions);
        highed.merge(aggregatedOptions, highed.merge(highed.merge({}, templateOptions),highed.merge({}, customizedOptions)));
    }

    /* Load a template from the meta
     * @template - the template object
     */
    function loadTemplate(template) {
        if (!template || !template.config) {
            return highed.log(1, 'chart preview: templates must be an object {config: {...}}');
        }

        highed.clearObj(templateOptions);

        highed.setAttr(customizedOptions, 'series', []);

        gc(function (chart) {

            Object.keys(template.config).forEach(function (key) {
                highed.setAttr(templateOptions, key, template.config[key]);
                flatOptions[key] = template.config[key];
            });

            updateAggregated();
            init(aggregatedOptions);
            emitChange();
        });
    }

    /* Load CSV data
     * @data - the data to load
     */
    function loadCSVData(data) {
        if (!data || !data.csv) {
            return highed.log(1, 'chart load csv: data.csv is required');
        }

        
        gc(function (chart) {
            highed.setAttr(customizedOptions, 'series', []);
            highed.setAttr(customizedOptions, 'plotOptions--series--animation', true);
            highed.setAttr(customizedOptions, 'data--csv', data.csv);
            highed.setAttr(customizedOptions, 'data--googleSpreadsheetKey', undefined);
            highed.setAttr(customizedOptions, 'data--itemDelimiter', data.itemDelimiter);
            highed.setAttr(customizedOptions, 'data--firstRowAsNames', data.firstRowAsNames);
            highed.setAttr(customizedOptions, 'data--dateFormat', data.dateFormat);
            highed.setAttr(customizedOptions, 'data--decimalPoint', data.decimalPoint);

            updateAggregated();

            init(aggregatedOptions);
            emitChange();
        });
    }

    /* Load JSON data
     * Functionally, this only instances a new
     * chart with the supplied data as its options.
     * It accepts both a string and and object
     * @data - the data to load
     */
    function loadJSONData(data) {
        gc(function (chart) {
            if (highed.isStr(data)) {
                try {
                    loadJSONData(JSON.parse(data));
                } catch (e) {
                    highed.snackBar('invalid json: ' + e);
                }
            } else if (highed.isBasic(data)) {
                highed.snackBar('the data is not valid json');
            } else {

                templateOptions = {};
                highed.clearObj(customizedOptions);
                highed.merge(customizedOptions, highed.merge({}, data));
                updateAggregated();
                init(customizedOptions);
                emitChange();
            }
        });
    }

    function loadChartSettings(settings) {
        gc(function (chart) {

            Object.keys(settings || {}).forEach(function (key) {
                highed.setAttr(customizedOptions, key, settings[key]);
            });

            updateAggregated();
            init(aggregatedOptions);
            emitChange();
        });
    }

    /* Set an attribute
     * @id - the path of the attribute
     * @value - the value to set
     * @index - used if the option is an array
     */
    function set(id, value, index) {
        gc(function (chart) {
            highed.setAttr([chart.options, customizedOptions], id, value, index);        
            highed.setAttr(chart.options, 'plotOptions--series--animation', false, index);

            flatOptions[id] = value;

            updateAggregated();
            init(aggregatedOptions, undefined, true);
            emitChange();
        });

        if (id.indexOf('lang--') === 0 && customizedOptions.lang) {
            Highcharts.setOptions({
                lang: customizedOptions.lang
            });
        }
    }

    function updateChartPreview(){
    	updateAggregated();
        init(aggregatedOptions);
        emitChange();
    }
    
    /* Get embeddable JSON */
    function getEmbeddableJSON() {
        var r = highed.merge({}, aggregatedOptions);

        //This should be part of the series
        if (!highed.isNull(r.data)) {
            r.data = undefined;
            //delete r['data'];
        }

        return r;
    }

    /* Get embeddable SVG */
    function getEmbeddableSVG() {
        return gc(function (chart) {
            return highed.isFn(chart.getSVG) ? chart.getSVG() : '';
        });
    }

    /* Get embeddable JavaScript */
    function getEmbeddableJavaScript(id) {
        return gc(function (chart) {            
            var 
                cdnIncludes = {
                    "https://code.highcharts.com/stock/highstock.js": 1,   
                    "https://code.highcharts.com/adapters/standalone-framework.js": 1,  
                    "https://code.highcharts.com/highcharts-more.js": 1,   
                    "https://code.highcharts.com/highcharts-3d.js": 1, 
                    "https://code.highcharts.com/modules/data.js": 1,  
                    "https://code.highcharts.com/modules/exporting.js": 1,
                    "http://code.highcharts.com/modules/funnel.js": 1,
                    "http://code.highcharts.com/modules/solid-gauge.js": 1
                },
                title = chart.options.titles ? chart.options.titles.text || 'untitled chart' : 'untitled chart'
            ;

            id = id || '';

            highed.setAttr(aggregatedOptions, 'chart--renderTo', id);

            /*
                This magic code will generate an injection script that will
                check if highcharts is included, and include it if not.
                Afterwards, it will create the chart, and insert it into the page.

                It's quite messy, could to client-side templating or something,
                but it works.
            */

            return '\n' + [  
                '(function(){ ',
                'function include(script, next) {',
                    'var sc=document.createElement("script");',
                    'sc.src = script;',
                    'sc.type="text/javascript";',
                    'sc.onload=function() {',
                        'if (++next < incl.length) include(incl[next], next);',
                    '};',
                    'document.head.appendChild(sc);',
                '}',

                'var inc = {},incl=[]; document.querySelectorAll("script").forEach(function(t) {inc[t.src.substr(0, t.src.indexOf("?"))] = 1;});',
                'Object.keys(', JSON.stringify(cdnIncludes), ').forEach(function (k){',
                    'if (!inc[k]) {',
                        'incl.push(k)',
                    '}',
                '});',

                'if (incl.length > 0) { include(incl[0], 0); }',

                ' function cl() {',
                    'typeof window["Highcharts"] !== "undefined" && Highcharts.Data ? ',
                        'new Highcharts.chart("', id, '", ', 
                            JSON.stringify(getEmbeddableJSON()), ')',
                    ' : ',
                    'setTimeout(cl, 20);',
                '}',
                'cl();',
                '})();'

            ].join('') + '\n';
        });
    }

    /* Get embeddable HTML */
    function getEmbeddableHTML(placehold) {
        return gc(function (chart) {       
            var id = 'highcharts-' + highed.uuid();     
            return '\n' + [
                '<div id="', id, '">',
                placehold ? getEmbeddableSVG() : '',
                '</div>'
            ].join('') + '<script>' + getEmbeddableJavaScript(id) + '</script>';
        });
    }

    /* Expand the chart from its drawer */
    function expand() {
        gc(function (chart) {
            if (!expanded) {            
                highed.dom.style(properties.expandTo, {
                    width: '100%',
                    display: 'block'
                });

                preExpandSize = highed.dom.size(parent);
                init(chart.options, properties.expandTo);
                expanded = true;

                toggleButton.className = 'highed-icon highed-chart-preview-expand fa fa-angle-double-right';

            }
        });
    }

    /* Collapse the chart into its drawer */
    function collapse() {
        gc(function (chart) {
            if (preExpandSize && expanded) {

                highed.dom.style(properties.expandTo, {
                    width: '0px',
                    display: 'none'
                });

                toggleButton.className = 'highed-icon highed-chart-preview-expand fa fa-angle-double-left';

                init(chart.options, parent);
                expanded = false;
            }
        });
    }

    function newChart() {
        highed.clearObj(templateOptions);
        highed.clearObj(customizedOptions);
        highed.clearObj(flatOptions);

        highed.merge(customizedOptions, properties.defaultChartOptions);

        updateAggregated();
        
        init(aggregatedOptions);
        
        emitChange();
    }

    function exportChart(options) {
        gc(function (chart) {
            chart.exportChart(options, aggregatedOptions);
        });
    }

    ///////////////////////////////////////////////////////////////////////////

    //Init the initial chart
    updateAggregated();
    init();

    highed.dom.on(toggleButton, 'click', function () {
        return expanded ? collapse() : expand();
    });

    ///////////////////////////////////////////////////////////////////////////

    return {
        on: events.on,
        expand: expand,
        collapse: collapse,
        emitChange:updateChartPreview,
        new: newChart,

        loadTemplate: loadTemplate,
        resize: resize,
        
        options: {
            set: set,
            customizedOptions: customizedOptions,
            flat: flatOptions,
            chart: chartOptions,
            aggregatedOptions :customizedOptions,
            templateOptions:templateOptions,
        },

        data: {
            csv: loadCSVData,
            json: loadJSONData,
            settings: loadChartSettings,
            export: exportChart
        },

        export: {
            html: getEmbeddableHTML,
            json: getEmbeddableJSON,
            svg: getEmbeddableSVG,
            js: getEmbeddableJavaScript
        }
    };
};
/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

(function () {
    var instanceCount = 0,
        installedPlugins = {},
        activePlugins = {},
        pluginEvents = highed.events()
    ;

    ///////////////////////////////////////////////////////////////////////////

    //We embed the plugin system here because we want to access it in the
    //editor, but there shouldn't be any access to the internals outside.

     /** Install an editor plugin
      *
      *  Note that plugins must be enabled when creating the editor
      *  for it to be active.
      *
      *  @namespace highed.plugins.editor
      *
      *  @param name       {string} - the name of the plugin
      *  @param definition {object} - the plugin definition 
      *     > meta {object}
      *         > version {string}
      *         > author {string}
      *         > homepage {string}
      *     > dependencies {array<string>} - URLs of script dependencies
      *     > options {object}
      *         > <option_name> {object}
      *             > type {string} - the type of the option
      *             > label {string} - the label
      *             > default {anything} - the default value
      */
     function install(name, definition) {
        var properties = highed.merge({
                meta: {
                    version: 'unknown',
                    author: 'unknown',
                    homepage: 'unknown'
                },
                dependencies: [],
                options: {}                
            }, definition)
        ;

        properties.dependencies.forEach(highed.include);

        if (!highed.isNull(installedPlugins[name])) {
            return highed.log(1, 'plugin -', name, 'is already installed');
        }

        installedPlugins[name] = properties;
    }

    function use(name, options) {
        var plugin = installedPlugins[name],
            filteredOptions = {}
        ;

        if (!highed.isNull(plugin)) {
            if (activePlugins[name]) {
                return highed.log(2, 'plugin -', name, 'is already active');
            }

            //Verify options
            Object.keys(plugin.options).forEach(function (key) {
                var option = plugin.options[key];
                if (highed.isBasic(option) || highed.isArr(option)) {
                    highed.log(2, 'plugin -', name, 'unexpected type definition for option', key, 'expected object');
                } else {

                    filteredOptions[key] = options[key] || plugin.options[key].default || '';

                    if (option.required && highed.isNull(options[key])) {
                        highed.log(1, 'plugin -', name, 'option', key, 'is required');
                    }
                }
            });

            activePlugins[name] = {
                definition: plugin,
                options: filteredOptions
            };

            if (highed.isFn(plugin.activate)) {
                activePlugins[name].definition.activate(filteredOptions);
            }    

            pluginEvents.emit('Use', activePlugins[name]);

        } else {
            highed.log(2, 'plugin -', name, 'is not installed');
        }
    }

    //Public interface
    highed.plugins.editor = {    
        install: install,
        use: use
    };

    ///////////////////////////////////////////////////////////////////////////

    /**The main chart editor object 
     * @constructor
     * @emits ChartChange - when the chart changes
     *   > {object} - new chart data
     * @emits ChartChangedLately - when the chart changes, on a throttle so events are not emitted more frequently than every 100ms
     *   > {object} - new chart data
     * @param {object} parent - the node to attach the editor to
     * @param {object} attributes - the editor settings
     * @return {highed.Editor} - A new instance of an editor
     */
    highed.Editor = function (parent, attributes) {
    	
        var events = highed.events(),

            properties = highed.merge({
                defaultChartOptions: {},
                on: {},
                plugins: {},
                features: 'import templates customize',
                includeSVGInHTMLEmbedding: true,
                importer: {},
            }, attributes),

            container = highed.dom.cr('div', 'highed-container'),
            expandContainer = highed.dom.cr('div', 'highed-expand-container'),

            mainToolbar = highed.Toolbar(container, {
                additionalCSS: ['highed-header']
            }),

            splitter = highed.HSplitter(container, {leftWidth: 60}),

            wizbar = highed.WizardBar(container, splitter.left),

            dataImpStep = wizbar.addStep({title: 'Import'}),
            dataImp = highed.DataImporter(dataImpStep.body, properties.importer),
        
            templateStep = wizbar.addStep({title: 'Templates'}),
            chartTemplateSelector = highed.ChartTemplateSelector(templateStep.body),

            chartContainer = highed.dom.cr('div', 'highed-box-size highed-chart-container'),
            createChartBtn = highed.dom.cr('button', 'highed-imp-button', 'Generate Chart'),
            chartPreview = highed.ChartPreview(chartContainer, {defaultChartOptions: properties.defaultChartOptions, expandTo: expandContainer,
            	templateOptions:attributes.templateOptions,flatOptions:attributes.flatOptions,aggregatedOptions:attributes.aggregatedOptions}),

            customizerStep = wizbar.addStep({title: 'Customize', id: 'customize'}),
            chartCustomizer = highed.ChartCustomizer(customizerStep.body);

        ///////////////////////////////////////////////////////////////////////////

        //Hide features that are disabled
        function applyFeatures() {
            var things = highed.arrToObj(properties.features.split(' '));

            if (!things.import) {
                dataImpStep.hide();
            }

            if (!things.templates) {
                templateStep.hide();
            }

            if (!things.customize) {
                customizerStep.hide();
            }

        }

        /** 
         * Force a resize of the editor
         * @memberof highed.Editor
         */
        function resize() {
            var cs = highed.dom.size(container),
                ms = highed.dom.size(mainToolbar.container),
                wb = highed.dom.size(wizbar.container)
            ;

            //wizbar.resize(undefined, cs.h - ms.h - wb.h);
            chartCustomizer.resize(undefined, cs.h - ms.h - wb.h);
            chartTemplateSelector.resize(undefined, cs.h - ms.h - wb.h);
            splitter.resize(cs.w, cs.h - ms.h - wb.h);
            chartPreview.resize();
            dataImp.resize(cs.w, cs.h - ms.h - wb.h);
            events.emit('Resized');
        }

        function destroy() {
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
        }

        ///////////////////////////////////////////////////////////////////////////

        //Attach to parent node
        parent = highed.dom.get(parent);
        if (parent) {
            highed.dom.ap(parent, 
                highed.dom.ap(container,
                    expandContainer
                )                           
            );

            highed.dom.ap(splitter.right, 
                chartContainer
            );
            highed.dom.ap(splitter.right, 
            		createChartBtn
            );

            highed.dom.ap(mainToolbar.left,
                highed.dom.style(highed.dom.cr('div', 'highed-logo'), {}
                )
            );

            resize();
            highed.dom.on(window, 'resize', resize);
        } else {
            highed.log(1, 'no valid parent supplied to editor');
        }

        highed.dom.style(templateStep.body, {padding: '4px'});

        highed.dom.ap(templateStep.body);

        highed.dom.on(createChartBtn, 'click', createChart);
        
        ///////////////////////////////////////////////////////////////////////////
        
        chartTemplateSelector.on('Select', chartPreview.loadTemplate);
        chartCustomizer.on('PropertyChange', chartPreview.options.set);
        dataImp.on('ImportCSV', chartPreview.data.csv);
        dataImp.on('ImportJSON', chartPreview.data.json);
        dataImp.on('ImportChartSettings', chartPreview.data.settings);

        chartPreview.on('RequestEdit', function (event, x, y) {
            chartCustomizer.focus(event, x, y);
        });

        ///////////////////////////////////////////////////////////////////////////

        wizbar.on('Step', function (step, count, thing) {
            if (thing.id === 'customize') {
                chartCustomizer.init(chartPreview.options.customizedOptions, chartPreview.options.chart);                
            }
        });

        //Route preview events
        chartPreview.on('ChartChange', function (newData) { events.emit('ChartChange', newData);});
        chartPreview.on('ChartChangeLately', function (newData) { events.emit('ChartChangeLately', newData);});


        ///////////////////////////////////////////////////////////////////////////
            
        //Attach event listeners defined in the properties
        if (!highed.isBasic(properties.on)) {
            Object.keys(properties.on).forEach(function (event) {
                if (highed.isFn(properties.on[event])) {
                    events.on(event, properties.on[event]);
                } else {
                    highed.log(2, 'tried attaching a non-function to' + event);
                }
            });
        } else {
            highed.log(2, 'on object in editor properties is not a valid object');
        }

        //Activate plugins
        Object.keys(properties.plugins).forEach(function (name) {
            highed.plugins.use(name, properties.plugins[name] || {});
        });

        //Dispatch change events to the active plugins
        chartPreview.on('ChartChangeLately', function (options) {
            Object.keys(activePlugins).forEach(function (key) {
                var plugin = activePlugins[key];
                if (highed.isFn(plugin.definition.chartchange)) {
                    plugin.definition.chartchange.apply(plugin.options, [{
                        json: highed.merge({}, chartPreview.options.customizedOptions)
                    }, plugin.options]);
                }
            });
        });

        applyFeatures();

        mainToolbar.addIcon({
            css: 'fa-times',
            click: function() {
            	var element=$('#confirmAlert');
        		angular.element(element).scope().continueOrCancel();
            }
        });

        chartCustomizer.init(chartPreview.options.customizedOptions, chartPreview.options.chart);

        ///////////////////////////////////////////////////////////////////////////

        //Public interface
        return {
            on: events.on,
            /* Force a resize of the editor */
            resize: resize,
            /* Get embeddable javascript */
            getEmbeddableHTML: chartPreview.export.html,
            /* Get embeddable json */
            getEmbeddableJSON: chartPreview.export.json,
            /* Get embeddable SVG */
            getEmbeddableSVG: chartPreview.export.svg,
            /* Destroy the editor */
            destroy: destroy,
            /* Toolbar */
            toolbar: mainToolbar,
            chartPreview: chartPreview,            
            dataImporter: dataImp,           
            chartTemplateSelector:chartTemplateSelector
        };
    };
})();
/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/

/******************************************************************************

Copyright (c) 2016, Highsoft

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

******************************************************************************/
