/**
 * Javascript Game Engine for HTML5 Canvas
 * @author rogeriolino <http://rogeriolino.com>
 */
var Mangame = {
    name: "mangame",
    filename: "mangame.js",
    version: "0.1.6",
    dev: true
};

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
        if (!arguments.length) {
            return this._x;
        }
        this._x = x;
    },
    
    y: function(y) {
        if (!arguments.length) {
            return this._y;
        }
        this._y = y;
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
        if (!arguments.length) {
            return this._color;
        }
        this._color = c;
    },
    
    offsetX: function(x) {
        if (!arguments.length) {
            return this._offsetX;
        }
        this._offsetX = x;
    },
    
    offsetY: function(y) {
        if (!arguments.length) {
            return this._offsetY;
        }
        this._offsetY = y;
    },
    
    blur: function(b) {
        if (!arguments.length) {
            return this._blur;
        }
        this._blur = b;
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
        if (!arguments.length) {
            return this._color;
        }
        this._color = c;
    },
    
    alpha: function(a) {
        if (!arguments.length) {
            return this._alpha;
        }
        this._alpha = a;
    },
    
    visible: function(v) {
        if (!arguments.length) {
            return this._visible;
        }
        this._visible = v;
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
        if (!arguments.length) {
            return this._size;
        }
        this._size = s;
    },
    
    color: function(c) {
        if (!arguments.length) {
            return this._color;
        }
        this._color = c;
    },
    
    alpha: function(a) {
        if (!arguments.length) {
            return this._alpha;
        }
        this._alpha = a;
    },
    
    visible: function(v) {
        if (!arguments.length) {
            return this._visible;
        }
        this._visible = v;
    }
});

var CanvasNode = Class.extend({

    init: function(canvas, x, y) {
        this.canvas = canvas;
        this.width(0);
        this.height(0);
        this.angle(0);
        this.pos = new Point(x, y);
        this.shadow = new Shadow();
        this.binds = {};
    },

    width: function(w) {
        if (!arguments.length) {
            return this._width;
        }
        this._width = w;
    },

    height: function(h) {
        if (!arguments.length) {
            return this._height;
        }
        this._height = h;
    },
    
    left: function() {
        return this.pos.x();
    },
    
    right: function() {
        return this.pos.x() + this.width();
    },
    
    top: function() {
        return this.pos.y();
    },
    
    bottom: function() {
        return this.pos.y() + this.height();
    },
    
    angle: function(a) {
        if (!arguments.length) {
            return this._angle;
        }
        this._angle = a;
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
    
    execBinds: function() {
        if (this.binds.x) {
            this.pos.x(this.binds.x());
        }
        if (this.binds.y) {
            this.pos.y(this.binds.y());
        }
        if (this.binds.width) {
            this.width(this.binds.width());
        }
        if (this.binds.height) {
            this.height(this.binds.height());
        }
        if (this.binds.angle) {
            this.angle(this.binds.angle());
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
            this.canvas.context.translate(this.pos.x(), this.pos.y());
            this.rotate();
            this._preDraw();
            for (var i = 0; i < this.childs.length; i++) {
                var child = this.childs[i];
                if (this._canDrawChild(child)) {
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
            this.canvas.context.translate(this.pos.x(), this.pos.y());
            this.rotate();
            if (this.shadow.blur() > 0) {
                this.canvas.context.shadowOffsetX = this.shadow.offsetX();
                this.canvas.context.shadowOffsetY = this.shadow.offsetY();
                this.canvas.context.shadowBlur = this.shadow.blur();
                this.canvas.context.shadowColor = this.shadow.color();
            }
            this._drawImpl();
            if (this.fill.visible()) {
                this.canvas.context.globalAlpha = this.fill.alpha();
                this.canvas.context.fillStyle = this.fill.color();
                this.canvas.context.fill();
            }
            if (this.stroke.visible()) {
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
        this._updateImpl(elapsedTime);
    },

    _updateImpl: function(elapsedTime) {}

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
        // finding mangame script path
        var path = "";
        var scripts = document.getElementsByTagName("script");
        for (var i = 0; i < scripts.length; i++) {
            var script = scripts[i];
            var src = script.src.split('?')[0];
            if (src.substr(-Mangame.filename.length) == Mangame.filename) {
                path = src;
                break;
            }
        }
        if (self.totalDependencies > 0) {
            var loadStatus = function(message) { 
                self.canvas.clear();
                var text = new Text(self.canvas, 10, self.canvas.height - 30, message); 
                text.color("#999");
                text.draw();
            };
            function loadDep(i) {
                var dep = self.dependencies[i];
                var url = path.replace(Mangame.filename, "mangame." + dep + ".js?v=" + Mangame.version);
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
        this.pos = new Point(x, y);
        this.width(w || 0);
        this.height(h || 0);
    },
    
    width: function(w) {
        if (!arguments.length) {
            return this._width;
        }
        this._width = w;
    },
    
    height: function(h) {
        if (!arguments.length) {
            return this._height;
        }
        this._height = h;
    }

})

var GameIO = Class.extend({

    init: function(game) {
        this.game = game;
    }

})

var Mouse = GameIO.extend({

    init: function(game) {
        var self = this;
        this._super(game);
        this.pos = new Point(0, 0);
        this.game.addEventListener(Mouse.MOUSE_MOVE, function(e) {self.updatePos(e.pos)});
    },
    
    isMouseEvent: function(e) {
        return e instanceof MouseEvent;
    },

    updatePos: function(pos) {
        this.pos = pos;
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
        if (!arguments.length) {
            return this._value;
        }
        this._value = v;
    },
    
    size: function(s) {
        if (!arguments.length) {
            return this._size;
        }
        this._size = s;
    },
    
    font: function(f) {
        if (!arguments.length) {
            return this._font;
        }
        this._font = f;
    },
    
    color: function(c) {
        if (!arguments.length) {
            return this._color;
        }
        this._color = c;
    },
    
    bold: function(b) {
        if (!arguments.length) {
            return this._bold;
        }
        this._bold = b;
    },
    
    baseline: function(b) {
        if (!arguments.length) {
            return this._baseline;
        }
        this._baseline = b;
    },
    
    align: function(a) {
        if (!arguments.length) {
            return this._align;
        }
        this._align = a;
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
    init: function(canvas, x, y, img) {
        this._super(canvas, x, y);
        this.loaded = false;
        if (img instanceof Image) {
            this._image = img;
            this.url = img.src;
        } else {
            this.url = img;
            this._image = new Image();
            this._image.src = this.url;
        }
        var self = this;
        this.viewport = new Viewport(0, 0, -1, -1);
        this._image.onload = function() {
            self.loaded = true;
            self.viewport.width((self.viewport.width() < 0) ? self.width() : self.viewport.width());
            self.viewport.height((self.viewport.height() < 0) ? self.height() : self.viewport.height());
        }
    },

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
        var image = new Image2D(this.canvas, this.pos.x(), this.pos.y(), this.url);
        image.loaded = this.loaded;
        image.viewport.pos.x(this.viewport.pos.x());
        image.viewport.pos.y(this.viewport.pos.y());
        image.viewport.width(this.viewport.width());
        image.viewport.height(this.viewport.height());
        return image;
    },

    _drawImpl: function() {
        if (this.loaded) {
            var sx = this.viewport.pos.x();
            var sy = this.viewport.pos.y();
            var sw = this.viewport.width();
            var sh = this.viewport.height();
            var dx = 0;
            var dy = 0;
            var dw = this.viewport.width();
            var dh = this.viewport.height();
            this.canvas.context.drawImage(this._image, sx, sy, sw, sh, dx, dy, dw, dh);
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