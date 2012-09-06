/**
 * Javascript Game Engine for HTML5 Canvas
 * @author rogeriolino <http://rogeriolino.com>
 */
var Mangame = {
    name: "mangame",
    filename: "mangame.js",
    version: "0.2.0",
    dev: false
};
var scripts = document.getElementsByTagName('script');
Mangame.script = scripts[scripts.length - 1];
Mangame.path = Mangame.script.src.replace(/\\/g,'/').replace(/\/[^\/]*$/, '');

// Class Inheritance by John Resig
(function(){
    var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
    this.Class = function(){};
    Class.extend = function(prop) {
        var _super = this.prototype;
        initializing = true;
        var prototype = new this();
        initializing = false;
        for (var name in prop) {
            prototype[name] = typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name]) ?
            (function(name, fn) {
              return function() {
                var tmp = this._super;
                this._super = _super[name];
                var ret = fn.apply(this, arguments);
                this._super = tmp;
                return ret;
              };
            })(name, prop[name]) : prop[name];
        }
        function Class() {
            if (!initializing && this.init) this.init.apply(this, arguments);
        }
        Class.prototype = prototype;
        Class.constructor = Class;
        Class.extend = arguments.callee;
        return Class;
    };
})();

var Canvas = Class.extend({

    init: function(node) {
        if (typeof(node) == "string") {
            this._canvas = document.getElementById(node);
            if (this._canvas == null) {
                throw "Invalid tag canvas id: " + node;
            }
        } else if (node instanceof HTMLElement) {
            this._canvas = node;
        }
        if (this._canvas.getContext) {
            this.context = this._canvas.getContext("2d");
        } else {
            throw "Your browser doesn't support canvas";
        }
    },
    
    width: function() {
        if (this._canvas) {
            return this._canvas.clientWidth;
        }
        return 0;
    },
    
    height: function() {
        if (this._canvas) {
            return this._canvas.clientHeight;
        }
        return 0;
    },

    clear: function() {
        this.context.beginPath();
        this.context.clearRect(0, 0, this.width(), this.height());
        this.context.closePath();
    },
    
    absolutePosition: function() {
        var pos = new Point(0, 0);
        var element = this._canvas;
        while (element) {
            pos.x(pos.x() + element.offsetLeft);
            pos.y(pos.y() + element.offsetTop);
            element = element.offsetParent;
        }
        return pos;
    },
    
    isOver: function(x, y) {
        var absPos = this.absolutePosition();
        return (x >= absPos.x() && x <= absPos.x() + this.width()) && (y >= absPos.y() && y <= absPos.y() + this.height());
    }

});

var Point = Class.extend({
    
    init: function(x, y) {
        this.set(x, y);
    },
    
    set: function(x, y) {
        this.x(x || 0);
        this.y(y || 0);
    },
    
    x: function(x) {
        if (arguments.length) {
            this._x = x;
        }
        return this._x;
        
    },
    
    y: function(y) {
        if (arguments.length) {
            this._y = y;
        }
        return this._y;
    },
    
    clone: function(p) {
        if (p) {
            return new Point(p.x(), p.y());
        } else {
            return new Point(this.x(), this.y());
        }
    },
    
    toString: function() {
        return "(" + this._x + "," + this._y + ")";
    }
    
});

var Shadow = Class.extend({
    
    init: function(prop) {
        this.set(prop);
    },
    
    set: function(prop) {
        prop = prop || {};
        this.color(prop.color || "#000");
        this.offsetX(prop.offsetX || 0);
        this.offsetY(prop.offsetY || 0);
        this.blur(prop.blur || 0);
    },
    
    color: function(c) {
        if (arguments.length) {
            this._color = c;
        }
        return this._color;
    },
    
    offsetX: function(x) {
        if (arguments.length) {
            this._offsetX = x;
        }
        return this._offsetX;
    },
    
    offsetY: function(y) {
        if (arguments.length) {
            this._offsetY = y;
        }
        return this._offsetY;
    },
    
    blur: function(b) {
        if (arguments.length) {
            this._blur = b;
        }
        return this._blur;
    }
    
});

var Fill = Class.extend({
    
    init: function(prop) {
        this.set(prop)
    },
    
    set: function(prop) {
        prop = prop || {};
        this.color(prop.color || "#fff");
        this.alpha(prop.alpha || 1);
        this.visible(prop.visible || true);
    },
    
    color: function(c) {
        if (arguments.length) {
            this._color = c;
        }
        return this._color;
    },
    
    alpha: function(a) {
        if (arguments.length) {
            this._alpha = a;
        }
        return this._alpha;
    },
    
    visible: function(v) {
        if (arguments.length) {
            this._visible = v;
        }
        return this._visible;
    }
});

var Stroke = Class.extend({
    
    init: function(prop) {
        this.set(prop);
    },
    
    set: function(prop) {
        prop = prop || {};
        this.size(prop.size || 1);
        this.color(prop.color || "#000");
        this.alpha(prop.alpha || 1);
        this.visible(prop.visible || true);
    },
    
    size: function(s) {
        if (arguments.length) {
            this._size = s;
        }
        return this._size;
    },
    
    color: function(c) {
        if (arguments.length) {
            this._color = c;
        }
        return this._color;
    },
    
    alpha: function(a) {
        if (arguments.length) {
            this._alpha = a;
        }
        return this._alpha;
    },
    
    visible: function(v) {
        if (arguments.length) {
            this._visible = v;
        }
        return this._visible;
    }
});

var CanvasNode = Class.extend({

    init: function(canvas, x, y) {
        this.canvas = canvas;
        this.width(0);
        this.height(0);
        this.angle(0);
        this.pos(x, y);
        this.shadow = new Shadow();
        this.binds = {};
    },
    
    pos: function() {
        if (arguments.length) {
            if (arguments[0] instanceof Point) {
                this._pos = arguments[0];
            } else {
                this._pos = new Point(arguments[0], arguments[1]);
            }
        }
        return this._pos;
    },
    
    /* position relative to canvas, and not to parent */
    absolutePos: function() {
        var x = 0;
        var y = 0;
        var node = this;
        do {
            x += node.pos().x();
            y += node.pos().y();
            node = node.parent();
        } while (node);
        return new Point(x, y);
    },

    width: function(w) {
        if (arguments.length) {
            this._width = w;
        }
        return this._width;
    },

    height: function(h) {
        if (arguments.length) {
            this._height = h;
        }
        return this._height;
    },
    
    left: function() {
        return this.pos().x();
    },
    
    right: function() {
        return this.pos().x() + this.width();
    },
    
    top: function() {
        return this.pos.y();
    },
    
    bottom: function() {
        return this.pos().y() + this.height();
    },
    
    center: function() {
        return new Point(this.pos().x() + this.width() / 2, this.pos().y() + this.height() / 2);
    },
    
    angle: function(a) {
        if (arguments.length) {
            this._angle = a;
        }
        return this._angle;
    },

    rotate: function() {
        if (this.angle != 0) {
            var theta = this.angle() * Math.PI / 180;
            this.canvas.context.rotate(theta);
        }
    },
    
    bind: function(prop, fn) {
        if (typeof(fn) == 'function') {
            this.binds[prop] = fn;
        }
    },
    
    parent: function(node) {
        if (arguments.length) {
            if (node instanceof CanvasNode) {
                this._parent = node;
            } else {
                throw "Invalid parent: must be a CanvasNode instance, given " + ((node) ? node.constructor : node);
            }
        }
        return this._parent;
    },
    
    execBinds: function() {
        if (this.binds.x) {
            this.pos().x(this.binds.x());
        }
        if (this.binds.y) {
            this.pos().y(this.binds.y());
        }
        for (var i in this.binds) {
            if (typeof(this[i]) == 'function') {
                this[i](this.binds[i]());
            }
        }
    }

})

var CanvasNodeGroup = CanvasNode.extend({

    init: function(canvas, x, y) {
        this._super(canvas, x, y);
        this.clear();
    },

    add: function(child) {
        if (child instanceof CanvasNode) {
            child.canvas = this.canvas;
            child.parent(this);
            this.childs.push(child);
        } else {
            throw "Invalid child: must be a CanvasNode instance, given " + ((child) ? child.constructor : child);
        }
    },

    clear: function() {
        this.childs = [];
    }

})

var GraphicsGroup = CanvasNodeGroup.extend({

    init: function(canvas, x, y) {
        this._super(canvas, x, y);
        this.visible = true;
    },

    /**
     * Readonly
     */
    width: function() {
        var maxWidth = 0;
        if (this.childs) {
            for (var i = 0; i < this.childs.length; i++) {
                var child = this.childs[i];
                var right = child.right();
                maxWidth = (right > maxWidth) ? right : maxWidth;
            }
        }
        return maxWidth;
    },

    /**
     * Readonly
     */
    height: function() { 
        var maxHeight = 0;
        if (this.childs) {
            for (var i = 0; i < this.childs.length; i++) {
                var child = this.childs[i];
                var bottom = child.bottom();
                maxHeight = (bottom > maxHeight) ? bottom : maxHeight;
            }
        }
        return maxHeight;
    },

    update: function(elapsedTime) {
        for (var i = 0; i < this.childs.length; i++) {
            var child = this.childs[i];
            child.update(elapsedTime);
        }
        this.execBinds();
    },

    draw: function() {
        if (this.visible) {
            this.canvas.context.save();
            this.canvas.context.translate(this.pos().x(), this.pos().y());
            this.rotate();
            this._preDraw();
            for (var i = 0; i < this.childs.length; i++) {
                var child = this.childs[i];
                if (child.draw && this._canDrawChild(child)) {
                    child.draw();
                }
            }
            this._postDraw();
            this.canvas.context.restore();
        }
    },

    _preDraw: function() { },

    _postDraw: function() { },

    _canDrawChild: function(child) {
        return true;
    }

})

var Graphics = CanvasNode.extend({

    init: function(canvas, x, y) {
        this._super(canvas, x, y);
        this.visible = true;
        this.fill = new Fill();
        this.stroke = new Stroke();
    },

    update: function(elapsedTime) { 
        this.execBinds(); 
    },

    draw: function() {
        if (this.visible) {
            this.canvas.context.beginPath();
            this.canvas.context.save();
            this.canvas.context.translate(this.pos().x(), this.pos().y());
            this.rotate();
            if (this.shadow && this.shadow.blur() > 0) {
                this.canvas.context.shadowOffsetX = this.shadow.offsetX();
                this.canvas.context.shadowOffsetY = this.shadow.offsetY();
                this.canvas.context.shadowBlur = this.shadow.blur();
                this.canvas.context.shadowColor = this.shadow.color();
            }
            this._drawImpl();
            if (this.fill && this.fill.visible()) {
                this.canvas.context.globalAlpha = this.fill.alpha();
                this.canvas.context.fillStyle = this.fill.color();
                this.canvas.context.fill();
            }
            if (this.stroke && this.stroke.visible()) {
                this.canvas.context.globalAlpha = this.fill.alpha();
                this.canvas.context.strokeStyle = this.stroke.color();
                this.canvas.context.lineWidth = this.stroke.size();
                this.canvas.context.stroke();
            }
            this.canvas.context.restore();
            this.canvas.context.closePath();
            this.canvas.context.globalAlpha = 1;
        }
    },

    _preDraw: function() {},

    _postDraw: function() {},

    _drawImpl: function() {}

});

var Scene = GraphicsGroup.extend({

    init: function(game) {
        this._super(game.canvas, 0, 0);
        this.game = game;
    },

    updateScene: function(elapsedTime) {
        this.update(elapsedTime);
        this.onUpdate(elapsedTime);
    },

    onUpdate: function(elapsedTime) {}

})

var Scene2D = Scene.extend({

    init: function(game) {
        this._super(game);
    }

})

var Loader = Class.extend({
    
    init: function(props) {
        props = props || {};
        this.onStart = (typeof(props.onLoad) == "function") ? props.onStart : (function(){});
        this.onLoad = (typeof(props.onLoad) == "function") ? props.onLoad : (function(){});
    }
    
});

var JsLoader = Loader.extend({
    
    init: function(url, props) {
        var self = this;
        this._super(props);
        this.script = document.createElement('script');
        this.script.type= 'text/javascript';
        this.script.src= url;
        if (this.script.readyState) { // IE
            this.script.onreadystatechange = function() {
                if (self.script.readyState == "loaded" || self.script.readyState == "complete") {
                    self.script.onreadystatechange = null;
                    self.onLoad();
                }
            };
        } else { // others
            this.script.onload = function(){
                self.onLoad();
            };
        }
        var head = document.getElementsByTagName('head')[0];
        head.appendChild(this.script);
        this.onStart();
    }
    
});

var Game = Graphics.extend({
    
    init: function(canvas, props) {
        props = props || {};
        this.onLoad = props.onLoad || function() {};
        this.canvas = canvas;
        this.scenes = [];
        this.running = false;
        this.currentScene = null;
        this.maxFps = 60;
        this.fps = 0;
        this.currentFps = 0;
        this.elapsedTime = 0;
        this.currentTime = 0;
        this.intervalId = 0;
        this.showFps = false;
        this.mouse = new Mouse(this);
        this.keyboard = new Keyboard(this);
        this.viewport = new Viewport(0, 0, this.canvas.width(), this.canvas.height());
        // dependencies
        this.dependencies = props.require || [];
        this.totalDependenciesLoaded = 0;
        this.totalDependencies = this.dependencies.length;
        this.loadDependencies();
    },
    
    loadDependencies: function() {
        var self = this;
        if (self.totalDependencies > 0) {
            var loadStatus = function(message) { 
                self.canvas.clear();
                var text = new Text(self.canvas, 10, self.canvas.height - 30, message); 
                text.color("#999");
                text.draw();
            };
            function loadDep(i) {
                var dep = self.dependencies[i];
                var url = Mangame.path + "/mangame." + dep + ".js?v=" + Mangame.version;
                if (Mangame.dev) {
                    url += "&time=" + ((new Date()).getTime());
                }
                new JsLoader(url, {
                    onStart: function() {
                        loadStatus("loading " + dep + "...");
                    },
                    onLoad: function() { 
                        self.totalDependenciesLoaded++;
                        if (self.totalDependenciesLoaded >= self.totalDependencies) {
                            loadStatus("dependencies loaded");
                            self.onLoad();
                        } else {
                            loadDep(self.totalDependenciesLoaded);
                        }
                    }
                });
            }
            loadDep(self.totalDependenciesLoaded);
        } else {
            self.onLoad();
        }
    },

    addScene: function(scene) {
        if (scene instanceof Scene) {
            if (this.scenes.length == 0) {
                this.currentScene = scene;
            }
            this.scenes.push(scene);
        } else {
            throw "Invalid scene: must be a Scene instance, given " + scene.constructor;
        }
    },
    
    addEventListener: function(eventName, fn) {
        var self = this;
        window.addEventListener(eventName, 
            function(e) {
                if (typeof(fn) == 'function') {
                    // prevent mouse event (click) on rollout
                    if ((eventName == Mouse.MOUSE_DOWN || eventName == Mouse.MOUSE_UP)&& !self.canvas.isOver(e.clientX, e.clientY)) {
                        return;
                    }
                    var event = new GameEvent({canvas: self.canvas, name: eventName, originalEvent: e});
                    fn(event);
                }
            }, 
            false
        );
    },
    
    getRequestAnimFrame: function() {
        var game = this;
        // requestAnim shim layer by Paul Irish
        return  window.requestAnimationFrame       || 
                window.webkitRequestAnimationFrame || 
                window.mozRequestAnimationFrame    || 
                window.oRequestAnimationFrame      || 
                window.msRequestAnimationFrame     || 
                function(/* function */ callback, /* DOMElement */ element){
                    window.setTimeout(callback, 1000 / game.maxFps);
                };
    },

    play: function() {
        var game = this;
        if (!game.running) {
            game.run();
        }
        game.running = true;
    },

    run: function() {
        var startTime = (new Date()).getTime();
        
        this.currentScene.updateScene(this.elapsedTime);
        this.canvas.clear();
        this.currentScene.draw();

        var endTime = (new Date()).getTime();

        if (endTime - this.currentTime > 1000) {
            this.currentTime = endTime;
            this.currentFps = this.fps;
            this.fps = 0;
        } else {
            this.fps++;
        }

        this.elapsedTime = endTime - startTime;

        if (this.showFps) {
            var text = new Text(this.canvas, 10, 10, "fps: " + this.currentFps);
            text.color("red");
            text.draw();
        }
        // loop
        var game = this;
        var raf = game.getRequestAnimFrame();
        raf(function() {game.run()});
    }

})

var GameEvent = Class.extend({
    
    init: function(prop) {
        prop = prop || {};
        this.name = prop.name;
        this.canvas = prop.canvas;
        this.originalEvent = prop.originalEvent;
        this.pos = this._eventPos(this.canvas._canvas, this.originalEvent);
    },
    
    _eventPos: function(node, event) {
        event = event ? event : window.event;
        var pos = new Point(0, 0);
        pos.x(event.clientX - node.offsetLeft + (window.pageXOffset || 0));
        if (pos.x() < 0) {
            pos.x(0);
        } else if (pos.x() >  node.clientWidth) {
            pos.x(node.clientWidth);
        }
        pos.y(event.clientY - node.offsetTop + (window.pageYOffset || 0));
        if (pos.y() < 0) {
            pos.y(0);
        } else if (pos.y() >  node.clientHeight) {
            pos.y(node.clientHeight);
        }
        return pos;
    }
    
});

var Viewport = Class.extend({

    init: function(x, y, w, h) {
        this.pos(x, y);
        this.width(w || 0);
        this.height(h || 0);
    },
    
    pos: function() {
        if (arguments.length) {
            if (arguments[0] instanceof Point) {
                this._pos = arguments[0];
            } else {
                this._pos = new Point(arguments[0], arguments[1]);
            }
        }
        return this._pos;
    },
    
    width: function(w) {
        if (arguments.length) {
            this._width = w;
        }
        return this._width;
    },
    
    height: function(h) {
        if (arguments.length) {
            this._height = h;
        }
        return this._height;
    },
    
    contains: function(pos) {
        return (pos.x() >= this.pos().x() && pos.x() <= this.pos().x()) && (pos.y() >= this.pos().y() && pos.y() <= this.pos().y());
    }

})

var Scroller = Class.extend({
    
    init: function(game) {
        this.game = game;
    },
        
    scrollTo: function(pos) {
        if (pos instanceof Point) {
            var scene = this.game.currentScene;
            if (scene.width() > this.game.canvas.width()) {
                var pct = pos.x() * 100 / this.game.canvas.width();
                if (pct < 0) {
                    pct = 0;
                }
                if (pct > 100) {
                    pct = 100;
                }
                var sceneX = (scene.width() - this.game.canvas.width()) * pct / 100;
                if (sceneX >= 0 && scene.width() - sceneX > this.game.canvas.width()) {
                    scene.pos().x(-sceneX);
                }
            }
            if (scene.height() > this.game.canvas.height()) {
                var pct = pos.y() * 100 / this.game.canvas.height();
                if (pct < 0) {
                    pct = 0;
                }
                if (pct > 100) {
                    pct = 100;
                }
                var sceneY = (scene.height() - this.game.canvas.height()) * pct / 100;
                if (sceneY >= 0 && scene.height() - sceneY > this.game.canvas.height()) {
                    scene.pos().y(-sceneY);
                }
            }
        }
    }
    
});

var GameIO = Class.extend({

    init: function(game) {
        this.game = game;
    }

})

var Mouse = GameIO.extend({

    init: function(game) {
        var self = this;
        this._super(game);
        this.pos(0, 0);
        this.game.addEventListener(Mouse.MOUSE_MOVE, function(e) {self.updatePos(e.pos)});
    },
    
    pos: function() {
        if (arguments.length) {
            if (arguments[0] instanceof Point) {
                this._pos = arguments[0];
            } else {
                this._pos = new Point(arguments[0], arguments[1]);
            }
        }
        return this._pos;
    },
    
    isMouseEvent: function(e) {
        return e instanceof MouseEvent;
    },

    updatePos: function(pos) {
        this.pos(pos);
    }
    
});
Mouse.MOUSE_MOVE = "mousemove";
Mouse.MOUSE_DOWN = "mousedown";
Mouse.MOUSE_UP = "mouseup";

var Keyboard = GameIO.extend({

    init: function(game) {
        this._super(game);
    }

})
Keyboard.KEY_DOWN = "keydown";
Keyboard.KEY_UP = "keyup";

var Text = Graphics.extend({

    init: function(canvas, x, y, value) {
        this._super(canvas, x, y);
        this.set({value: value});
    },
    
    set: function(prop) {
        prop = prop || {};
        this.value(prop.value || "");
        this.size(prop.size || 12);
        this.font(prop.font || "sans-serif");
        this.color(prop.color || "#000");
        this.bold(prop.bold || false);
        this.baseline(prop.baseline || "top");
        this.align(prop.align || "start");
    },
    
    value: function(v) {
        if (arguments.length) {
            this._value = v;
        }
        return this._value;
    },
    
    size: function(s) {
        if (arguments.length) {
            this._size = s;
        }
        return this._size;
    },
    
    font: function(f) {
        if (arguments.length) {
            this._font = f;
        }
        return this._font;
    },
    
    color: function(c) {
        if (arguments.length) {
            this._color = c;
        }
        return this._color;
    },
    
    bold: function(b) {
        if (arguments.length) {
            this._bold = b;
        }
        return this._bold;
    },
    
    baseline: function(b) {
        if (arguments.length) {
            this._baseline = b;
        }
        return this._baseline;
    },
    
    align: function(a) {
        if (arguments.length) {
            this._align = a;
        }
        return this._align;
    },

    _drawImpl: function() {
        this.canvas.context.textBaseline = this.baseline();
        this.canvas.context.textAlign = this.align();
        this.canvas.context.fillStyle = this.color();
        this.canvas.context.font = (this.bold() ? "bold " : "") + this.size() + "px " + this.font();
        this.canvas.context.fillText(this.value(), 0, 0);
    }

})

var Image2D = Graphics.extend({

    /**
     * @param img (url or Image)
     */
    init: function(canvas, img, x, y) {
        this._super(canvas, x, y);
        this.loaded = false;
        var self = this;
        this.viewport = new Viewport(0, 0, -1, -1);
        var updateViewPort = function() {
            self.loaded = true;
            self.viewport.width((self.viewport.width() < 0) ? self.width() : self.viewport.width());
            self.viewport.height((self.viewport.height() < 0) ? self.height() : self.viewport.height());
            self.onLoad();
        }
        if (img instanceof Image) {
            this._image = img;
            this.url = img.src;
            Image2D.Cache.put(this.url, img, updateViewPort);
        } else {
            this.url = img;
            this._image = Image2D.Cache.get(this.url, updateViewPort);
        }
    },
    
    onLoad: function() {},

    /**
     * Readonly
     */
    width: function() {
        if (this._image) {
            return this._image.width;
        }
        return 0;
    },

    /**
     * Readonly
     */
    height: function() {
        if (this._image) {
            return this._image.height;
        }
        return 0;
    },

    clone: function() {
        var image = new Image2D(this.canvas, this.url, this.pos().x(), this.pos().y());
        image.loaded = this.loaded;
        image.viewport.pos().x(this.viewport.pos().x());
        image.viewport.pos().y(this.viewport.pos().y());
        image.viewport.width(this.viewport.width());
        image.viewport.height(this.viewport.height());
        return image;
    },

    _drawImpl: function() {
        if (this.loaded) {
            var sx = this.viewport.pos().x(); // The x coordinate where to start clipping
            var sy = this.viewport.pos().y(); // The y coordinate where to start clipping
            var sw = this.viewport.width(); // The width of the clipped image
            var sh = this.viewport.height(); // The height of the clipped image
            var dx = 0; // The x coordinate where to place the image on the canvas
            var dy = 0; // The y coordinate where to place the image on the canvas
            var dw = sw; // The width of the image to use (stretch or reduce the image)
            var dh = sh; // The height of the image to use (stretch or reduce the image)
            this.canvas.context.drawImage(this._image, sx, sy, dw, dh, dx, dy, dw, dh);
        }
    }

});
Image2D.Cache = {
    images: {},
    
    _create: function(url) {
        var image = new Image();
        image.loaded = false;
        image.src = url;
        Image2D.Cache.put(url, image);
        return image;
    },
    
    _onload: function(image, load) {
        if (typeof(load) == 'function') {
            if (image.loaded) {
                load();
            } else {
                image.addEventListener("load", load, false);
            }
        }
    },
    
    put: function(url, image, load) {
        image.addEventListener("load", function() { this.loaded = true; }, false);
        Image2D.Cache._onload(image, load);
        Image2D.Cache.images[url] = image;
    },
    
    get: function(url, load) {
        var image;
        if (Image2D.Cache.images[url]) {
            image = Image2D.Cache.images[url];
        } else {
            image = Image2D.Cache._create(url);
        }
        Image2D.Cache._onload(image, load);
        return image;
    }
}

var Pattern = Image2D.extend({
    
    init: function(canvas, img, x, y) {
        this._super(canvas, img, x, y);
        this.repetitions = {
            all: 'repeat', 
            x: 'repeat-x',
            y: 'repeat-y',
            no: 'no-repeat'
        };
        this.repeat('all');
    },
    
    repeat: function(r) {
        if (arguments.length) {
            if (this.repetitions[r]) {
                this._repeat = r;
            } else {
                throw "Invalid repetition value: " + r;
            }
        }
        return this._repeat;
    },

    _drawImpl: function() {
        if (this.loaded) {
            var dx = this.viewport.pos().x();
            var dy = this.viewport.pos().y();
            var vw = this.viewport.width() - dx;
            var vh = this.viewport.height() - dy;
            var repetition = this.repetitions[this.repeat()];
            var p = this.canvas.context.createPattern(this._image, repetition);
            this.canvas.context.fillStyle = p;
            this.canvas.context.fillRect(0, 0, vw, vh);
        }
    }
    
})

var AnimatedImage = Graphics.extend({

    init: function(canvas, x, y, images) {
        if (!(images instanceof Array) || images.length == 0 || !(images[0] instanceof Image2D)) {
            throw "The images parameter must be a Array of Image2D not empty";
        }
        this._super(canvas, x, y);
        this.loop = true;
        this.playing = true;
        this.frameTime = 300; // miliseconds
        this.elapsedTime = 0;
        this.images = images;
        this.currentFrame = 0;
        this.currentImage = this.images[0];
    },

    update: function(elapsedTime) {
        if (this.playing) {
            this.elapsedTime += elapsedTime;
            if (this.elapsedTime > this.frameTime) {
                this.elapsedTime = 0;
                this.currentFrame++;
                if (this.currentFrame >= this.images.length) {
                    this.currentFrame = 0;
                }
                this.currentImage = this.images[this.currentFrame];
            }
        }
        this.execBinds();
    },
    
    _drawImpl: function() {
        this.currentImage.draw();
    }

})