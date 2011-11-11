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

var Line = Graphics.extend({

    init : function(canvas, x1, y1, x2, y2) {
        this._super(canvas, x1, y1);
        this.x2 = x2 || this.x;
        this.y2 = y2 || this.y;
    },

    getWidth : function() {return this.stroke.size;},

    getHeight : function() {return this.stroke.size;},

    _drawImpl : function() {
        this.canvas.context.moveTo(0, 0);
        this.canvas.context.lineTo(this.x2 - this.x, this.y2 - this.y);
    }

})

var Rectangle = Graphics.extend({

    init : function(canvas, x, y, width, height, radius) {
        this._super(canvas, x, y);
        this.width = width || 0;
        this.height = height || 0;
        this.radius = radius || 0;
    },

    getWidth : function() {return this.width;},

    getHeight : function() {return this.height;},

    _drawImpl : function() {
        this.canvas.context.moveTo(0, this.radius);
        this.canvas.context.lineTo(0, this.height - this.radius);
        if (this.radius > 0) {
            this.canvas.context.quadraticCurveTo(0, this.height, this.radius, this.height);
        }
        this.canvas.context.lineTo(this.width - this.radius, this.height);
        if (this.radius > 0) {
            this.canvas.context.quadraticCurveTo(this.width, this.height, this.width, this.height - this.radius);
        }
        this.canvas.context.lineTo(this.width, this.radius);
        if (this.radius > 0) {
            this.canvas.context.quadraticCurveTo(this.width, 0, this.width - this.radius, 0);
        }
        this.canvas.context.lineTo(this.radius, 0);
        if (this.radius > 0) {
            this.canvas.context.quadraticCurveTo(0, 0, 0, this.radius);
        }
    }

})

var Triangle = Graphics.extend({

    init : function(canvas, x1, y1, x2, y2, x3, y3) {
        this._super(canvas, x1, y1);
        this.x2 = x2 || 0;
        this.y2 = y2 || 0;
        this.x3 = x3 || 0;
        this.y3 = y3 || 0;
    },

    _drawImpl : function() {
        this.canvas.context.moveTo(0, 0);
        this.canvas.context.lineTo(this.x2, this.y2);
        this.canvas.context.lineTo(this.x3, this.y3);
        this.canvas.context.lineTo(0, 0);
    }

})

var Circle = Graphics.extend({

    init : function(canvas, x, y, radius) {
        this._super(canvas, x, y);
        this.radius = radius || 0;
    },

    getWidth : function() {return this.radius * 2;},

    getHeight : function() {return this.radius * 2;},

    _drawImpl : function() {
        this.canvas.context.moveTo(this.radius , 0);
        this.canvas.context.arc(0, 0, this.radius, 0, Math.PI * 2, false);
    }

})
