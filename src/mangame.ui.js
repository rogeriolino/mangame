/**
 * Javascript Game Engine for HTML5 Canvas
 * @author rogeriolino <http://rogeriolino.com>
 */
var UIComponent = Graphics.extend({

    init: function(game, x, y) {
        this._super(game.canvas, x, y);
        this.game = game;
        this.createProperty('disabled', false);
    },

    isOver: function() {
        if (this.disabled() || !this.visible()) {
            return false;
        }
        var pos = this.absolutePos();
        var mx = this.game.mouse.pos().x();
        var my = this.game.mouse.pos().y();
        return (mx >= pos.x() && mx <= pos.x() + this.width()) && (my >= pos.y() && my <= pos.y() + this.height());
    }

});

var HtmlComponent = UIComponent.extend({
    
    init: function(game, x, y, tagName, name) {
        this._super(game, x, y);
        this.createProperty('name', '' || name);
        this._tag = null;
        this.tagName = tagName;
    },
    
    _createTag: function() {
        if (!this.tagName) {
            throw "Error on create HtmlComponent, no tag name found";
        }
        var tag = document.createElement(this.tagName);
        tag.setAttribute("name", this.name());
        tag.style.position = "absolute";
        if (this.postCreateTag) {
            this.postCreateTag(tag);
        }
        return tag;
    },

    _drawImpl: function() {
    },
    
    tag: function() {
        if (!this._tag) {
            this._tag = this._createTag();
            document.body.appendChild(this._tag);
            this.update(0);
        }
        return this._tag;
    },
    
    update: function(elapsedTime) {
        var pos = this.game.canvas.absolutePosition();
        var parent = this.parent();
        var parentPos = (parent) ? this.parent().pos() : new Point();
        var x = parentPos.x() + (pos.x() + this.pos().x());
        var y = parentPos.y() + (pos.y() + this.pos().y());
        with (this.tag().style) {
            top = y + "px";
            left = x + "px";
            if (this.width() > 0) {
                width = this.width() + "px";
            }
            if (this.height() > 0) {
                height = this.height() + "px";
            }
        }
    },
    
    on: function(event, fn) {
        this.tag().addEventListener(event, fn, false);
    }
    
});

var HtmlInput = HtmlComponent.extend({

    init: function(game, x, y, type, name) {
        this._super(game, x, y, "input", name);
        this.createProperty('type', type || 'text');
        this.createProperty('width', 100);
        this.createProperty('height', 20);
    },

    postCreateTag: function(tag) {
        tag.setAttribute("type", this.type());
        if (this.styles) {
            for (var i in this.styles) {
                tag.style[i] = this.styles[i];
            }
        }
        tag.value = "";
        return tag;
    },

    value: function(v) {
        if (arguments.length) {
            this.tag().value = v;
        }
        return this.tag().value;
    }

});

var HtmlInputText = HtmlInput.extend({

    init: function(game, x, y, name) {
        this._super(game, x, y, "text", name);
        this.styles = {
            padding: "3px 5px",
            border: "1px solid #ccc"
        };
    }

});

var HtmlInputPassword = HtmlInput.extend({

    init: function(game, x, y, name) {
        this._super(game, x, y, "password", name);
        this.styles = {
            padding: "3px 5px",
            border: "1px solid #ccc"
        };
    }

});

var HtmlRadio = HtmlInput.extend({

    init: function(game, x, y, name) {
        this._super(game, x, y, "radio", name);
        this.width(0);
        this.height(0);
    }

});

var HtmlCheckbox = HtmlInput.extend({

    init: function(game, x, y, name) {
        this._super(game, x, y, "checkbox", name);
        this.width(0);
        this.height(0);
    }

});

var HtmlButton = HtmlInput.extend({

    init: function(game, x, y, value, name) {
        this._super(game, x, y, "button", name);
        this.width(0);
        this.height(0);
        this.value(value);
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
        this._changeCurrGraphic(this.out);
        this._attachEvents();
    },

    _attachEvents: function() {
        var self = this;
        this.game.addEventListener(Mouse.MOUSE_MOVE, function(e) {
                if (!self.isPressed) {
                    if (self.isOver()) {
                        self._changeCurrGraphic(self.over);
                    } else {
                        self._changeCurrGraphic(self.out);
                    }
                }
            }
        );
        this.game.addEventListener(Mouse.MOUSE_DOWN, function(e) {
                if (self.isOver()) {
                    self.isPressed = true;
                    self._changeCurrGraphic(self.pressed);
                    if (typeof(self.onPress) == "function") {
                        self.onPress();
                    }
                }
            }
        );
        this.game.addEventListener(Mouse.MOUSE_UP, function(e) {
                if (self.isOver()) {
                    self._changeCurrGraphic(self.over);
                    if (typeof(self.onRelease) == "function") {
                        self.onRelease();
                    }
                } else {
                    self._changeCurrGraphic(self.out);
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

    _changeCurrGraphic: function(g) { 
        this.currentGraphic = g;
        this.width(this.currentGraphic.width());
        this.height(this.currentGraphic.height());
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
        this.createProperty('paddingTop', props.padding || props.paddingTop || 10);
        this.createProperty('paddingLeft', props.padding || props.paddingLeft || 0);
        this.createProperty('radius', props.radius || 2);
        this.createProperty('fontSize', props.fontSize || 12);
        this.createProperty('labelWidth', props.label.length * this.fontSize());
        this.createProperty('labelHeight', this.fontSize());
        this.createProperty('label', this._createLabel(game, props.label));
        this._super(game, x, y, {
            out: this._outGroup(game),
            over: this._overGroup(game),
            pressed: this._pressedGroup(game),
            onrelease: props.click
        });
    },
    
    _createLabel: function(game, text) {
        var label = new Text(game.canvas, (this.labelWidth() + this.paddingLeft() * 2) / 2, this.paddingTop() - 2, text);
        label.color("#000");
        label.align("center");
        label.size(this.fontSize());
        return label;
    },
    
    _createRectangle: function(game) {
        var rect = new Rectangle(game.canvas, 0, 0, this.labelWidth() + this.paddingLeft() * 2, this.labelHeight() + this.paddingTop() * 2, this.radius());
        rect.fill().color("#f1f1f1");
        rect.stroke().color("#cccccc");
        rect.stroke().color("#cccccc");
        return rect;
    },
    
    _outGroup: function(game) {
        var group = new GraphicsGroup(game.canvas, 0, 0);
        var rect = this._createRectangle(game);
        group.add(rect);
        group.add(this.label());
        return group;
    },
    
    _overGroup: function(game) {
        var group = new GraphicsGroup(game.canvas, 0, 0);
        var rect = this._createRectangle(game);
        rect.fill().color("#ddd");
        rect.shadow().color("#eee");
        rect.shadow().blur(10);
        rect.shadow().offsetX(1);
        rect.shadow().offsetY(1);
        group.add(rect);
        group.add(this.label());
        return group;
    },
    
    _pressedGroup: function(game, label) {
        var group = new GraphicsGroup(game.canvas, 0, 0);
        var rect = this._createRectangle(game);
        group.add(rect);
        group.add(this.label());
        return group;
    }
    
})
