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

var UIComponent = Graphics.extend({

    init : function(game, x, y) {
        this._super(game.canvas, x, y);
        this.game = game;
    },

    isOver : function() {
        if (this.game.mouse.x >= this.x && this.game.mouse.x <= this.x + this.getWidth()) {
            if (this.game.mouse.y >= this.y && this.game.mouse.y <= this.y + this.getHeight()) {
                return true;
            }
        }
        return false;
    },

})

var InputTag = UIComponent.extend({

    init : function(game, x, y, type, name) {
        this._super(game, x, y);
        this.type = type || "text";
        this.name = name || "";
        this.width = 100;
        this.height = 20;
        this._tag = null;
    },

    _createTag : function() {
        var input = document.createElement("input");
        input.setAttribute("type", this.type);
        input.style.position = "absolute";
        input.value = "";
        return input;
    },

    update : function(elapsedTime) {
        if (this._tag != null) {
            var pos = DomUtils.getElementPosition(this.canvas._canvas);
            with (this._tag.style) {
                top = (pos.y + this.y) + "px";
                left = (pos.x + this.x) + "px";
                width = this.width + "px";
                height = this.height + "px";
            }
        }
    },

    _drawImpl : function() {
        if (this._tag == null) {
            this._tag = this._createTag();
            this.update(0);
            document.body.appendChild(this._tag);
        }
    },

    getValue : function() {
        return this._tag.value;
    },

    setValue : function(value) {
        this._tag.value = value;
    }

});

var InputText = InputTag.extend({

    init : function(game, x, y, name) {
        this._super(game, x, y, "text", name);
    }

});

var InputPassword = InputTag.extend({

    init : function(game, x, y, name) {
        this._super(game, x, y, "password", name);
    }

});

var Button = UIComponent.extend({

    init : function(game, x, y, props) {
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

    _attachEvents : function() {
        var self = this;
        this.game.mouse.addEventListener(Mouse.MOUSE_MOVE, function(e) {
                if (!self.isPressed) {
                    if (self.isOver()) {
                        self.currentGraphic = self.over;
                    } else {
                        self.currentGraphic = self.out;
                    }
                }
            }
        );
        this.game.mouse.addEventListener(Mouse.MOUSE_DOWN, function(e) {
                if (self.isOver()) {
                    self.isPressed = true;
                    self.currentGraphic = self.pressed;
                    if (typeof(self.onPress) == "function") {
                        self.onPress();
                    }
                }
            }
        );
        this.game.mouse.addEventListener(Mouse.MOUSE_UP, function(e) {
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

    getStateGraphics : function(props, key) {
        return this.isValidStateGraphics(props[key]) ? props[key] : null;
    },

    isValidStateGraphics : function(graphic) {
        return (graphic instanceof GraphicsGroup || graphic instanceof Graphics);
    },

    getWidth : function() { return this.currentGraphic.getWidth(); },

    getHeight : function() { return this.currentGraphic.getHeight(); },

     _drawImpl : function() {
         this.currentGraphic.canvas = this.canvas;
         this.currentGraphic.draw();
     }
    
})
Button.ON_PRESS = "onpress";
Button.ON_RELEASE = "onrelease";
