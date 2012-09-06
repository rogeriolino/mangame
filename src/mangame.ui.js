/**
 * Javascript Game Engine for HTML5 Canvas
 * @author rogeriolino <http://rogeriolino.com>
 */
var UIComponent = Graphics.extend({

    init: function(game, x, y) {
        this._super(game.canvas, x, y);
        this.game = game;
    },

    isOver: function() {
        var pos = this.absolutePos();
        var mx = this.game.mouse.pos().x();
        var my = this.game.mouse.pos().y();
        return (mx >= pos.x() && mx <= pos.x() + this.width()) && (my >= pos.y() && my <= pos.y() + this.height());
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
            var parentPos = this.parent().pos();
            var x = parentPos.x() + (pos.x() + this.pos().x());
            var y = parentPos.y() + (pos.y() + this.pos().y());
            with (this._tag.style) {
                top = y + "px";
                left = x + "px";
                width = this.width() + "px";
                height = this.height() + "px";
                padding = "3px 5px";
                border = "1px solid #ccc";
            }
        }
        this.execBinds();
    },

    _drawImpl: function() {
        if (this._tag == null) {
            this._tag = this._createTag();
            this.update(0);
            document.body.appendChild(this._tag);
        }
    },

    value: function(v) {
        if (arguments.length) {
            this._tag.value = v;
        }
        return this._tag.value;
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

var SimpleButton = Button.extend({
    
    init: function(game, x, y, props) {
        props = props || {};
        props.label = props.label || "";
        this.paddingTop = props.padding || props.paddingTop || 10;
        this.paddingLeft = props.padding || props.paddingLeft || 0;
        this.radius = props.radius || 2;
        this.fontSize = props.fontSize || 12;
        this.labelWidth = props.label.length * this.fontSize;
        this.labelHeight = this.fontSize;
        this.label = this._createLabel(game, props.label);
        this._super(game, x, y, {
            out: this._outGroup(game),
            over: this._overGroup(game),
            pressed: this._pressedGroup(game),
            onrelease: props.action
        });
    },
    
    _createLabel: function(game, text) {
        var label = new Text(game.canvas, (this.labelWidth + this.paddingLeft * 2) / 2, this.paddingTop - 2, text);
        label.color("#000");
        label.align("center");
        label.size(this.fontSize);
        return label;
    },
    
    _createRectangle: function(game) {
        var rect = new Rectangle(game.canvas, 0, 0, this.labelWidth + this.paddingLeft * 2, this.labelHeight + this.paddingTop * 2, this.radius);
        rect.fill.color("#f1f1f1");
        rect.stroke.color("#cccccc");
        rect.stroke.color("#cccccc");
        return rect;
    },
    
    _outGroup: function(game) {
        var group = new GraphicsGroup(game.canvas, 0, 0);
        var rect = this._createRectangle(game);
        group.add(rect);
        group.add(this.label);
        return group;
    },
    
    _overGroup: function(game) {
        var group = new GraphicsGroup(game.canvas, 0, 0);
        var rect = this._createRectangle(game);
        rect.fill.color("#ddd");
        rect.shadow.color("#eee");
        rect.shadow.blur(10);
        rect.shadow.offsetX(1);
        rect.shadow.offsetY(1);
        group.add(rect);
        group.add(this.label);
        return group;
    },
    
    _pressedGroup: function(game, label) {
        var group = new GraphicsGroup(game.canvas, 0, 0);
        var rect = this._createRectangle(game);
        group.add(rect);
        group.add(this.label);
        return group;
    }
    
})
