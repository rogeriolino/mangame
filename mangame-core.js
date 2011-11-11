/**
 * Javascript Game Engine for HTML5 Canvas
 *
 * Copyright 2010 Rogerio A Lino Filho <http://rogeriolino.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author rogeriolino
 * 
 */

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

    init : function(node) {
        this.width = 0;
        this.height = 0;
        this._canvas = null;
        this.context = null;

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
            this.width = this._canvas.clientWidth;
            this.height = this._canvas.clientHeight;
        } else {
            throw "Your browser doesn't support canvas";
        }
    },

    clear : function() {
        this.context.beginPath();
        this.context.clearRect(0, 0, this.width, this.height);
        this.context.closePath();
    }

})

var CanvasNode = Class.extend({

    init : function(canvas, x, y) {
        this.canvas = canvas;
        this.x = x || 0;
        this.y = y || 0;
        this.width = 0;
        this.height = 0;
        this.angle = 0;
        this.shadow = {
            color : "#000",
            offsetX : 0,
            offsetY : 0,
            blur : 0
        }
    },

    rotate : function() {
        if (this.angle != 0) {
            var theta = this.angle * Math.PI / 180;
            this.canvas.context.rotate(theta);
        }
    }

})

var CanvasNodeGroup = CanvasNode.extend({

    init : function(canvas, x, y) {
        this._super(canvas, x, y);
        this.removeChilds();
    },

    appendChild : function(child) {
        if (child instanceof CanvasNode) {
            child.canvas = this.canvas;
            this.childNodes[this.childNodes.length] = child;
        } else {
            throw "Invalid child: must be a CanvasNode instance, given " + ((child) ? child.constructor : child);
        }
    },

    removeChilds : function() {
        this.childNodes = new Array();
    }

})

var GraphicsGroup = CanvasNodeGroup.extend({

    init : function(canvas, x, y) {
        this._super(canvas, x, y);
        this.visible = true;
    },

    getWidth : function() {
        var width = 0;
        for (var i = 0; i < this.childNodes.length; i++) {
            var child = this.childNodes[i];
            var w = child.x + child.getWidth();
            width = (w > width) ? w : width;
        }
        return width;
    },

    getHeight : function() { 
        var height = 0;
        for (var i = 0; i < this.childNodes.length; i++) {
            var child = this.childNodes[i];
            var h = child.y + child.getHeight();
            height = (h > height) ? h : height;
        }
        return height;
    },

    update : function(elapsedTime) {
        for (var i = 0; i < this.childNodes.length; i++) {
            var child = this.childNodes[i];
            child.update(elapsedTime);
        }
    },

    draw : function() {
        if (this.visible) {
            this.canvas.context.save();
            this.canvas.context.translate(this.x, this.y);
            this.rotate();
            this._preDraw();
            for (var i = 0; i < this.childNodes.length; i++) {
                var child = this.childNodes[i];
                if (this._canDrawChild(child)) {
                    child.draw();
                }
            }
            this._postDraw();
            this.canvas.context.restore();
        }
    },

    _preDraw : function() { },

    _postDraw : function() { },

    _canDrawChild : function(child) {
        return true;
    }

})

var Graphics = CanvasNode.extend({

    init : function(canvas, x, y) {
        this._super(canvas, x, y);
        this.visible = true;
        this.fill = {
            visible : true,
            color : "#fff",
            alpha : 1
        }
        this.stroke = {
            visible : true,
            color : "#000",
            size  : 1,
            alpha : 1
        }
    },

    getWidth : function() {return 0;},

    getHeight : function() {return 0;},

    update : function(elapsedTime) { },

    draw : function() {
        if (this.visible) {
            this.canvas.context.beginPath();
            this.canvas.context.save();
            this.canvas.context.translate(this.x, this.y);
            this.rotate();
            if (this.shadow.blur > 0) {
                this.canvas.context.shadowOffsetX = this.shadow.offsetX;
                this.canvas.context.shadowOffsetY = this.shadow.offsetY;
                this.canvas.context.shadowBlur = this.shadow.blur;
                this.canvas.context.shadowColor = this.shadow.color;
            }
            this._drawImpl();
            if (this.fill.visible) {
                this.canvas.context.globalAlpha = this.fill.alpha;
                this.canvas.context.fillStyle = this.fill.color;
                this.canvas.context.fill();
            }
            if (this.stroke.visible) {
                this.canvas.context.globalAlpha = this.fill.alpha;
                this.canvas.context.strokeStyle = this.stroke.color;
                this.canvas.context.lineWidth = this.stroke.size;
                this.canvas.context.stroke();
            }
            this.canvas.context.restore();
            this.canvas.context.closePath();
            this.canvas.context.globalAlpha = 1;
        }
    },

    _preDraw : function() {},

    _postDraw : function() {},

    _drawImpl : function() {}

});


var Scene = GraphicsGroup.extend({

    init : function(game) {
        this._super(game.canvas, 0, 0);
        this.game = game;
    },

    updateScene : function(elapsedTime) {
        this.update(elapsedTime);
        this._updateImpl(elapsedTime);
    },

    _updateImpl : function(elapsedTime) {}

})

var Scene2D = Scene.extend({

    init : function(game) {
        this._super(game);
    }

})

var Game = Graphics.extend({

    init : function(canvas) {
        this.canvas = canvas;
        this.scenes = new Array();
        this.running = false;
        this.currentScene = null;
        this.maxFps = 35;
        this.fps = 0;
        this.currentFps = 0;
        this.elapsedTime = 0;
        this.currentTime = 0;
        this.intervalId = 0;
        this.showFps = false;
        this.mouse = new Mouse(this);
        this.keyboard = new Keyboard(this);
        this.viewport = new Viewport(0, 0, this.canvas.width, this.canvas.height);
    },

    addScene : function(scene) {
        if (scene instanceof Scene) {
            if (this.scenes.length == 0) {
                this.currentScene = scene;
            }
            this.scenes[this.scenes.length] = scene;
        } else {
            throw "Invalid scene: must be a Scene instance, given " + scene.constructor;
        }
    },

    play : function() {
        this.running = true;
        if (this.running) {
            this.run();
            var game = this;
            this.intervalId = setInterval(function() {game.run()}, 1000 / this.maxFps);
        }
    },

    run : function() {
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
            text.color = "red";
            text.draw();
        }
    }

})

var Viewport = Class.extend({

    init : function(x, y, w, h) {
        this.x = x || 0;
        this.y = y || 0;
        this.width = w || 0;
        this.height = h || 0;
    }

})

var DomUtils = Class.extend({});
DomUtils.getEventPosition = function(event, node) {
    event = event ? event : window.event;
    var pos = {x : 0, y : 0};
    pos.x = event.clientX - node.offsetLeft + (window.pageXOffset || 0);
    if (pos.x < 0) {
        pos.x = 0;
    } else if (pos.x >  node.clientWidth) {
        pos.x = node.clientWidth;
    }
    pos.y = event.clientY - node.offsetTop + (window.pageYOffset || 0);
    if (pos.y < 0) {
        pos.y = 0;
    } else if (pos.y >  node.clientHeight) {
        pos.y = node.clientHeight;
    }
    return pos;
}
DomUtils.getElementPosition = function(element) {
    var pos = {x : 0, y : 0};
    while(element) {
	pos.x += element.offsetLeft;
	pos.y += element.offsetTop;
	element = element.offsetParent;
    }
    return pos;

    return DomUtils.getOffsetPosition(element.clientLeft, element.clientTop, node);
}

var GameIO = Class.extend({

    init : function(game) {
        this.game = game;
        this._attachEvents();
        this._events = new Object();
    },

    _attachEvents : function() {},

    _execEvents : function(type, e) {
        if (this._events[type] != null) {
            for (var i = 0; i < this._events[type].length; i++) {
                var fn = this._events[type][i];
                if (typeof(fn) == "function") {
                    fn(e);
                }
            }
        }
    },

    addEventListener : function(event, fn) {
        if (typeof(fn) == "function") {
            if (this._events[event] == null) {
                this._events[event] = new Array();
            }
            this._events[event][this._events[event].length] = fn;
        }
    }

})

var Mouse = GameIO.extend({

    init : function(game) {
        this._super(game);
        this.x = 0;
        this.y = 0;
    },

    _attachEvents : function() {
        var self = this;
        window.addEventListener(Mouse.MOUSE_MOVE, function(e) {
            self.onMove(e);
        }, false);
        window.addEventListener(Mouse.MOUSE_DOWN, function(e) {
            self.onDown(e);
        }, false);
        window.addEventListener(Mouse.MOUSE_UP, function(e) {
            self.onUp(e);
        }, false);
    },

    onMove : function(e) {
        var pos = DomUtils.getEventPosition(e, this.game.canvas._canvas);
        this.x = pos.x;
        this.y = pos.y;
        this._execEvents(Mouse.MOUSE_MOVE, e);
    },

    onDown : function(e) {
        this._execEvents(Mouse.MOUSE_DOWN, e);
    },

    onUp : function(e) {
        this._execEvents(Mouse.MOUSE_UP, e);
    }
    

})
Mouse.MOUSE_MOVE = "mousemove";
Mouse.MOUSE_DOWN = "mousedown";
Mouse.MOUSE_UP = "mouseup";

var Keyboard = GameIO.extend({

    init : function(game) {
        this._super(game);
    },

    _attachEvents : function() {
        var self = this;
        window.addEventListener(Keyboard.KEY_DOWN, function(e) {
            self.onDown(e);
        }, false);
        window.addEventListener(Keyboard.KEY_UP, function(e) {
            self.onUp(e);
        }, false);
    },

    onDown : function(e) {
        this._execEvents(Keyboard.KEY_DOWN, e);
    },

    onUp : function(e) {
        this._execEvents(Keyboard.KEY_UP, e);
    }

})
Keyboard.KEY_DOWN = "keydown";
Keyboard.KEY_UP = "keyup";

var Text = Graphics.extend({

    init : function(canvas, x, y, content) {
        this._super(canvas, x, y);
        this.content = content;
        this.size = 12;
        this.font = "sans-serif";
        this.color = "#000";
        this.bold = false;
        this.baseline = "top";
        this.align = "start";
    },

    _drawImpl : function() {
        this.canvas.context.textBaseline = this.baseline;
        this.canvas.context.textAlign = this.align;
        this.canvas.context.fillStyle = this.color;
        this.canvas.context.font = (this.bold ? "bold " : "") + this.size + "px " + this.font;
        this.canvas.context.fillText(this.content, 0, 0);
    }

})

var Image2D = Graphics.extend({

    init : function(canvas, x, y, url) {
        this._super(canvas, x, y);
        this.url = url;
        this.loaded = false;
        this._image = new Image();
        this._image.src = this.url;
        var self = this;
        this.viewport = new Viewport(0, 0, -1, -1);
        this._image.onload = function() {
            self.loaded = true;
            self.viewport.width = (self.viewport.width < 0) ? self.getWidth() : self.viewport.width;
            self.viewport.height = (self.viewport.height < 0) ? self.getHeight() : self.viewport.height;
        }
    },

    getWidth : function() {return this._image.width;},

    getHeight : function() {return this._image.height;},

    clone : function() {
        var image = new Image2D(this.canvas, this.x, this.y, this.url);
        image.loaded = this.loaded;
        image.viewport.x = this.viewport.x
        image.viewport.y = this.viewport.y;
        image.viewport.width = this.viewport.width;
        image.viewport.height = this.viewport.height;
        return image;
    },

    _drawImpl : function() {
        if (this.loaded) {
            var sx = this.viewport.x;
            var sy = this.viewport.y;
            var sw = this.viewport.width;
            var sh = this.viewport.height;
            var dx = 0;
            var dy = 0;
            var dw = this.viewport.width;
            var dh = this.viewport.height;
            this.canvas.context.drawImage(this._image, sx, sy, sw, sh, dx, dy, dw, dh);
        }
    }

})

var AnimatedImage = Graphics.extend({

    init : function(canvas, x, y, images) {
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

    update : function(elapsedTime) {
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
    
    _drawImpl : function() {
        this.currentImage.draw();
    }

})