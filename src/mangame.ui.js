/**
 * Javascript Game Engine for HTML5 Canvas
 *
 * @author rogeriolino <http://rogeriolino.com>
 */

var UIComponent = Graphics.extend({

    init: function(game, x, y) {
        this._super(game.canvas, x, y);
        this.game = game;
    },

    isOver: function() {
        var mx = this.game.mouse.pos.x();
        var my = this.game.mouse.pos.y();
        return (mx >= this.left() && mx <= this.right()) && (my >= this.top() && my <= this.bottom());
    }

})

var InputTag = UIComponent.extend({

    init: function(game, x, y, type, name) {
        this._super(game, x, y);
        this.type = type || "text";
        this.name = name || "";
        this.width(100);
        this.height(20);
        this._tag = null;
    },

    _createTag: function() {
        var input = document.createElement("input");
        input.setAttribute("type", this.type);
        input.style.position = "absolute";
        input.value = "";
        return input;
    },

    update: function(elapsedTime) {
        if (this._tag != null) {
            var pos = this.game.canvas.absolutePosition();
            with (this._tag.style) {
                top = (pos.y() + this.pos.y()) + "px";
                left = (pos.x() + this.pos.x()) + "px";
                width = this.width() + "px";
                height = this.height() + "px";
            }
        }
    },

    _drawImpl: function() {
        if (this._tag == null) {
            this._tag = this._createTag();
            this.update(0);
            document.body.appendChild(this._tag);
        }
    },

    value: function(v) {
        if (!arguments.length) {
            return this._tag.value;
        }
        this._tag.value = v;
    }

});

var InputText = InputTag.extend({

    init: function(game, x, y, name) {
        this._super(game, x, y, "text", name);
    }

});

var InputPassword = InputTag.extend({

    init: function(game, x, y, name) {
        this._super(game, x, y, "password", name);
    }

});

var Button = UIComponent.extend({

    init: function(game, x, y, props) {
        this._super(game, x, y);
        this.out = this.getStateGraphics(props, 'out');
        this.over = this.getStateGraphics(props, 'over') || this.out;
        this.pressed = this.getStateGraphics(props, 'pressed') || this.out;
        this.isPressed = false;
        this.onPress = props[Button.ON_PRESS];
        this.onRelease = props[Button.ON_RELEASE];
        this.currentGraphic = this.out;
        this._attachEvents();
    },

    _attachEvents: function() {
        var self = this;
        this.game.addEventListener(Mouse.MOUSE_MOVE, function(e) {
                if (!self.isPressed) {
                    if (self.isOver()) {
                        self.currentGraphic = self.over;
                    } else {
                        self.currentGraphic = self.out;
                    }
                }
            }
        );
        this.game.addEventListener(Mouse.MOUSE_DOWN, function(e) {
                if (self.isOver()) {
                    self.isPressed = true;
                    self.currentGraphic = self.pressed;
                    if (typeof(self.onPress) == "function") {
                        self.onPress();
                    }
                }
            }
        );
        this.game.addEventListener(Mouse.MOUSE_UP, function(e) {
                if (self.isOver()) {
                    self.currentGraphic = self.over;
                    if (typeof(self.onRelease) == "function") {
                        self.onRelease();
                    }
                } else {
                    self.currentGraphic = self.out;
                }
                self.isPressed = false;
            }
        );
    },

    getStateGraphics: function(props, key) {
        return this.isValidStateGraphics(props[key]) ? props[key] : null;
    },

    isValidStateGraphics: function(graphic) {
        return (graphic instanceof GraphicsGroup || graphic instanceof Graphics);
    },

    width: function() { 
        if (this.currentGraphic) {
            return this.currentGraphic.width();
        }
        return 0;
    },

    height: function() {
        if (this.currentGraphic) {
            return this.currentGraphic.height();
        }
        return 0;
    },

     _drawImpl: function() {
         this.currentGraphic.canvas = this.canvas;
         this.currentGraphic.draw();
     }
    
})
Button.ON_PRESS = "onpress";
Button.ON_RELEASE = "onrelease";
