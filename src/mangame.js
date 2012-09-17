/**
 * Javascript Game Engine for HTML5 Canvas
 * @author rogeriolino <http://rogeriolino.com>
 */
var Mangame = {
    name: "mangame",
    filename: "mangame.js",
    version: "0.2.1",
    dev: true
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
        Class.prototype.createProperty = function(name, defaultValue) {
            this['_' + name] = defaultValue;
            this[name] = (function() {
                if (arguments.length) {
                    this['_' + name] = arguments[0];
                    return this;
                }
                return this['_' + name];
            });
        }
        Class.prototype.set = function(prop) {
            prop = (prop instanceof Object) ? prop : {};
            for (var i in prop) {
                if (this[i]) {
                    if (typeof(this[i]) == 'function') {
                        this[i](prop[i]);
                    } else {
                        this[i] = prop[i];
                    }
                }
            }
        }
        return Class;
    };
})();


// javascript ext
Array.prototype.random = function() {
    var i = Math.floor(Math.random() * this.length);
    return this[i];
};

Array.prototype.remove = function() {
    if (arguments.length > 0) {
        if (arguments[0] instanceof Object) {
            this.removeObject(arguments[0]);
        } else {
            if (arguments.length == 2) {
                this.removeIndex(arguments[0], arguments[1]);
            } else {
                this.removeIndex(arguments[0]);
            }
        }
    }
}

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.removeIndex = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

Array.prototype.removeObject = function(obj) {
    var v;
    var newArr = [];
    while (v = this.shift()) {
        if (v != obj) {
            newArr.push(v);
        }
    }
    this.push.apply(this, newArr);
};

var Canvas = Class.extend({
    
    defaultWidth: 800,
    defaultHeight: 500,

    init: function(node) {
        if (typeof(node) == "string") {
            this._canvas = document.getElementById(node);
            if (this._canvas == null) {
                throw "Invalid canvas tag id: " + node;
            }
        } else if (node instanceof HTMLCanvasElement) {
            this._canvas = node;
        } else {
            throw "Invalid canvas constructor parameter. The parameter must be a canvas element";
        }
        if (this._canvas.getContext) {
            this.context = this._canvas.getContext("2d");
            if (!this._canvas.getAttribute('width')) {
                this._canvas.width = this.defaultWidth;
            }
            if (!this._canvas.getAttribute('height')) {
                this._canvas.height = this.defaultHeight;
            }
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
    },
    
    toImage: function() {
        return new Image2D(this, this._canvas.toDataURL(), 0, 0);
    }

});

var Point = Class.extend({
    
    init: function(x, y) {
        this.createProperty('x', 0);
        this.createProperty('y', 0);
        if (arguments.length == 2) {
            this.x(x);
            this.y(y);
        } else if (arguments[0] instanceof Object) {
            this.set(arguments[0]);
        }
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
        this.createProperty('color', "#000");
        this.createProperty('offsetX', 0);
        this.createProperty('offsetY', 0);
        this.createProperty('blur', 0);
        this.set(prop);
    }
    
});

var Fill = Class.extend({
    
    init: function(prop) {
        this.createProperty('color', "#fff");
        this.createProperty('alpha', 1);
        this.createProperty('visible', true);
        this.set(prop);
    }
    
});

var Stroke = Class.extend({
    
    init: function(prop) {
        this.createProperty('blur', 0);
        this.createProperty('size', 1);
        this.createProperty('color', "#000");
        this.createProperty('alpha', 1);
        this.createProperty('visible', true);
        this.set(prop);
    }
    
});

var CanvasNode = Class.extend({

    init: function(canvas, x, y) {
        this.canvas = canvas;
        this.createProperty('width', 0);
        this.createProperty('height', 0);
        this.createProperty('angle', 0);
        this.createProperty('pos', new Point(x, y));
        this.createProperty('shadow', new Shadow());
        this.visible(true);
    },
    
    visible: function() {
        if (arguments.length) {
            this._visible = arguments[0];
            return this;
        }
        return this._visible && (this.parent() ? this.parent().visible() : true);
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

    rotate: function() {
        if (this.angle != 0) {
            var theta = this.angle() * Math.PI / 180;
            this.canvas.context.rotate(theta);
        }
    },
    
    parent: function(node) {
        if (arguments.length) {
            if (node instanceof CanvasNode) {
                this._parent = node;
                return this;
            } else {
                throw "Invalid parent: must be a CanvasNode instance, given " + ((node) ? node.constructor : node);
            }
        }
        return this._parent;
    }

})

var CanvasNodeGroup = CanvasNode.extend({

    init: function(canvas, x, y) {
        this._super(canvas, x, y);
        this.clear();
    },

    _updateWidth: function(child) {
        var maxWidth = this.width();
        var right = child.right();
        maxWidth = (right > maxWidth) ? right : maxWidth;
        this.width(maxWidth);
    },

    _updateHeight: function(child) { 
        var maxHeight = this.height();
        var bottom = child.bottom();
        maxHeight = (bottom > maxHeight) ? bottom : maxHeight;
        this.height(maxHeight);
    },

    add: function(child) {
        if (child instanceof Array) {
            for (var i = 0; i < child.length; i++) {
                this.add(child[i]);
            }
        } else {
            if (child instanceof CanvasNode) {
                child.canvas = this.canvas;
                child.parent(this);
                this.childs.push(child);
                this._updateWidth(child);
                this._updateHeight(child);
                if (this.postAdd) {
                    this.postAdd(child);
                }
            } else {
                throw "Invalid child: must be a CanvasNode instance, given " + ((child) ? child.constructor : child);
            }
        }
    },

    remove: function(child) {
        this.childs.remove(child);
    },

    clear: function() {
        this.childs = [];
    }

})

var GraphicsGroup = CanvasNodeGroup.extend({

    init: function(canvas, x, y) {
        this._super(canvas, x, y);
    },

    update: function(elapsedTime) {
        for (var i = 0; i < this.childs.length; i++) {
            var child = this.childs[i];
            child.update(elapsedTime);
        }
        if (this.onUpdate) {
            this.onUpdate(elapsedTime);
        }
    },

    draw: function() {
        if (this.visible()) {
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
        this.createProperty('fill', new Fill());
        this.createProperty('stroke', new Stroke());
    },

    update: function(elapsedTime) { 
    },

    draw: function() {
        if (this.visible()) {
            this.canvas.context.beginPath();
            this.canvas.context.save();
            this.canvas.context.translate(this.pos().x(), this.pos().y());
            this.rotate();
            var shadow = this.shadow();
            if (shadow.blur() > 0) {
                this.canvas.context.shadowOffsetX = shadow.offsetX();
                this.canvas.context.shadowOffsetY = shadow.offsetY();
                this.canvas.context.shadowBlur = shadow.blur();
                this.canvas.context.shadowColor = shadow.color();
            }
            this._drawImpl();
            var fill = this.fill();
            if (fill.visible()) {
                this.canvas.context.globalAlpha = fill.alpha();
                this.canvas.context.fillStyle = fill.color();
                this.canvas.context.fill();
            }
            var stroke = this.stroke();
            if (stroke.visible()) {
                this.canvas.context.globalAlpha = fill.alpha();
                this.canvas.context.strokeStyle = stroke.color();
                this.canvas.context.lineWidth = stroke.size();
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
        this.started = false;
    },

    updateScene: function(elapsedTime) {
        if (this.started) {
            this.update(elapsedTime);
            if (this.onUpdate) {
                this.onUpdate(elapsedTime);
            }
        }
    },
    
    start: function() {
        this.started = true;
        this.visible(true);
        if (this.onStart) {
            this.onStart();
        }
    },
    
    stop: function() {
        this.started = false;
        this.visible(false);
        if (this.onStop) {
            this.onStop();
        }
    }

})

var Scene2D = Scene.extend({

    init: function(game) {
        this._super(game);
    }

})

var SceneMenu = Scene2D.extend({

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

var Game = Class.extend({
    
    init: function(canvas, props) {
        props = props || {};
        this.onLoad = props.onLoad || props.load || function() {};
        if (canvas instanceof Canvas) {
            this.canvas = canvas;
        } else {
            this.canvas = new Canvas(canvas);
        }
        this.scenes = [];
        this.running = false;
        this.currentScene = null;
        this.currentSceneIndex = 0;
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
        if (scene instanceof Array) {
            for (var i = 0; i < scene.length; i++) {
                this.addScene(scene[i]);
            }
        } else {
            if (scene instanceof Scene) {
                if (this.scenes.length == 0) {
                    this.currentScene = scene;
                }
                scene.visible(false);
                this.scenes.push(scene);
            } else {
                throw "Invalid scene: must be a Scene instance, given " + scene.constructor;
            }
        }
        return this;
    },
    
    gotoScene: function(prop) {
        var self = this;
        if (self.inTransition == true) {
            return;
        }
        if (prop instanceof Object) {
            prop.index = (prop.index != undefined) ? prop.index : this.currentSceneIndex;
        } else {
            prop = {index: parseInt(prop)};
        }
        if (prop.index < 0 || prop.index >= this.scenes.length) {
            throw "Invalid scene index: " + prop.index;
        }
        var changeScene = function() {
            if (self.running) {
                self.currentScene.stop();
            }
            self.currentSceneIndex = prop.index;
            self.currentScene = self.scenes[prop.index];
            if (self.running) {
                self.currentScene.start();
            }
            if (prop.complete) {
                prop.complete();
            }
            self.inTransition = false;
        }
        if (prop.transition) {
            self.inTransition = true;
            var transition = new SceneTransition(self);
            transition.transition(self.currentScene, self.scenes[prop.index], prop.transition, prop.effect, prop.duration, changeScene);
        } else {
            changeScene();
        }
        return this;
    },
    
    nextScene: function(prop) {
        prop = prop || {};
        this.currentSceneIndex++;
        if (this.currentSceneIndex >= this.scenes.length) {
            this.currentSceneIndex = 0;
        }
        prop.index = this.currentSceneIndex;
        this.gotoScene(prop);
    },
    
    prevScene: function(prop) {
        prop = prop || {};
        this.currentSceneIndex--;
        if (this.currentSceneIndex < 0) {
            this.currentSceneIndex = this.scenes.length - 1;
        }
        prop.index = this.currentSceneIndex;
        this.gotoScene(prop);
    },
    
    addEventListener: function(eventName, fn) {
        var self = this;
        window.addEventListener(eventName, 
            function(e) {
                if (typeof(fn) == 'function') {
                    // prevent mouse event (click) on rollout
                    if ((eventName == Mouse.MOUSE_DOWN || eventName == Mouse.MOUSE_UP) && !self.canvas.isOver(e.clientX, e.clientY)) {
                        return;
                    }
                    fn(new GameEvent({canvas: self.canvas, name: eventName, originalEvent: e}));
                }
            }, 
            false
        );
        return this;
    },
    
    getRequestAnimFrame: function() {
        var game = this;
        // requestAnim shim layer by Paul Irish
        return  window.requestAnimationFrame       || 
                window.webkitRequestAnimationFrame || 
                window.mozRequestAnimationFrame    || 
                window.oRequestAnimationFrame      || 
                window.msRequestAnimationFrame     || 
                function(/* function */ callback, /* DOMElement */ element) {
                    window.setTimeout(callback, 1000 / game.maxFps);
                };
    },

    play: function() {
        if (!this.running) {
            this._run();
            if (this.currentScene) {
                this.currentScene.start();
            }
        }
        this.running = true;
        this.startTime = (new Date()).getTime();
    },

    _run: function() {
        if (this.currentScene) {
            this.currentScene.updateScene(this.elapsedTime);
            this.canvas.clear();
            this.currentScene.draw();
        }

        var endTime = (new Date()).getTime();
        
        if (endTime - this.currentTime > 1000) {
            this.currentTime = endTime;
            this.currentFps = this.fps;
            this.fps = 0;
        } else {
            this.fps++;
        }

        this.elapsedTime = endTime - this.startTime;

        if (this.showFps) {
            var text = new Text(this.canvas, 10, 10, "fps: " + this.currentFps);
            text.color("red");
            text.draw();
        }
        // loop
        var game = this;
        var raf = game.getRequestAnimFrame();
        this.startTime = (new Date()).getTime();
        raf(function() {game._run()});
    }

})

var SceneTransition = Class.extend({
    
    init: function(game) {
        this.game = game;
        if (typeof(Tween) == "undefined") {
            throw "Tween package not loaded";
        }
    },
    
    transition: function(from, to, transition, effect, duration, complete, change) {
        if (this[transition]) {
            this[transition](from, to, effect, duration, complete, change);
        }
    },
    
    fade: function(from, to, effect, duration, complete, change) {
        var self = this;
        duration = duration || 1;
        var rect = new Rectangle(self.game.canvas, 0, 0, self.game.canvas.width(), self.game.canvas.height());
        rect.fill().color("#000");
        rect.fill().alpha(30);
        rect.stroke().size(0);
        from.add(rect);
        // alpha 0 to 100
        var updateAlpha = function(event) {
            var value = event.target._pos;
            rect.fill().alpha(value / 100);
            if (change) {
               change(value);
            }
        };
        var tweenIn = new Tween(effect, 0, 100, duration / 2);
        tweenIn.onMotionChanged = updateAlpha;
        tweenIn.onMotionFinished = function(event) {
            var tweenOut = new Tween(effect, 100, 0, duration / 2);
            tweenOut.onMotionChanged = updateAlpha;
            tweenOut.onMotionFinished = function(event) {
                to.remove(rect);
            };
            from.remove(rect);
            to.add(rect);
            tweenOut.start();
            if (complete) {
                complete();
            }
        };
        tweenIn.start();
    },
    
    _slideX: function(from, to, effect, duration, complete, change, dir) {
        var self = this;
        duration = duration || .5;
        var width = this.game.canvas.width();
        var xini = -(width * dir);
        var image = this.game.canvas.toImage();
        this.game.currentScene = to;
        this.game.currentScene.add(image);
        this.game.currentScene.pos().x(xini);
        image.pos().x(-xini);
        var tween = new Tween(effect, 0, width, duration);
        tween.onMotionChanged = function(event) {
            var value = event.target._pos;
            self.game.currentScene.pos().x(xini + value * dir);
            if (change) {
                change(value);
            }
        }
        tween.onMotionFinished = function(event) {
            self.game.currentScene.remove(image);
            if (complete) {
                complete();
            }
        };
        tween.start();
    },
    
    slideLeft: function(from, to, effect, duration, complete, change) {
        this._slideX(from, to, effect, duration, complete, change, -1);
    },
    
    slideRight: function(from, to, effect, duration, complete, change) {
        this._slideX(from, to, effect, duration, complete, change, 1);
    },
    
    _slideY: function(from, to, effect, duration, complete, change, dir) {
        var self = this;
        duration = duration || .5;
        var height = this.game.canvas.height();
        var yini = -(height * dir);
        var image = this.game.canvas.toImage();
        this.game.currentScene = to;
        this.game.currentScene.add(image);
        this.game.currentScene.pos().y(yini);
        image.pos().y(-yini);
        var tween = new Tween(effect, 0, height, duration);
        tween.onMotionChanged = function(event) {
            var value = event.target._pos;
            self.game.currentScene.pos().y(yini + value * dir);
            if (change) {
                change(value);
            }
        }
        tween.onMotionFinished = function(event) {
            self.game.currentScene.remove(image);
            if (complete) {
                complete();
            }
        };
        tween.start();
    },
    
    slideTop: function(from, to, effect, duration, complete, change) {
        this._slideY(from, to, effect, duration, complete, change, -1);
    },
    
    slideBottom: function(from, to, effect, duration, complete, change) {
        this._slideY(from, to, effect, duration, complete, change, 1);
    }
    
});

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
        this.createProperty('pos', new Point());
        this.createProperty('width', 0);
        this.createProperty('height', 0);
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
        this.createProperty('pos', new Point());
        this.game.addEventListener(Mouse.MOUSE_MOVE, function(e) {self.updatePos(e.pos)});
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
        this.createProperty('value', value || '');
        this.createProperty('size', 12);
        this.createProperty('font', 'sans-serif');
        this.createProperty('color', '#000');
        this.createProperty('bold', false);
        this.createProperty('baseline', 'top');
        this.createProperty('align', 'start');
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
        this.viewport = new Viewport();
        var updateViewPort = function() {
            self.loaded = true;
            self.width(self._image.width);
            self.height(self._image.height);
            self.viewport.width(self.width());
            self.viewport.height(self.height());
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
            var fn = function() { image.loaded = true; load(); }
            if (image.loaded || "data:" == image.src.substring(0, 5)) {
                setTimeout(fn, 10);
            } else {
                image.addEventListener("load", fn, false);
            }
        }
    },
    
    put: function(url, image, load) {
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
    },
    
    _drawImpl: function() {
        this.currentImage.draw();
    }

})