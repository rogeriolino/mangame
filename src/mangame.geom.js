/**
 * Javascript Game Engine for HTML5 Canvas
 *
 * @author rogeriolino <http://rogeriolino.com>
 */

var Line = Graphics.extend({

    init: function(canvas, x1, y1, x2, y2) {
        this._super(canvas, x1, y1);
        this.pos2 = new Point(x2 || this.x, y2 || this.y);
    },

    width: function() {
        if (this.pos && this.pos2) {
            return Math.abs(this.pos.x() - this.pos2.x());
        }
        return 0;
    },

    height: function() {
        if (this.pos && this.pos2) {
            return Math.abs(this.pos.y() - this.pos2.y());
        }
        return 0;
    },

    _drawImpl: function() {
        this.canvas.context.moveTo(0, 0);
        this.canvas.context.lineTo(this.pos2.x() - this.pos.x(), this.pos2.y() - this.pos.y());
    }

})

var Rectangle = Graphics.extend({

    init: function(canvas, x, y, width, height, radius) {
        this._super(canvas, x, y);
        this.width(width || 0);
        this.height(height || 0);
        this.radius = radius || 0;
    },

    _drawImpl: function() {
        this.canvas.context.moveTo(0, this.radius);
        this.canvas.context.lineTo(0, this.height() - this.radius);
        if (this.radius > 0) {
            this.canvas.context.quadraticCurveTo(0, this.height(), this.radius, this.height());
        }
        this.canvas.context.lineTo(this.width() - this.radius, this.height());
        if (this.radius > 0) {
            this.canvas.context.quadraticCurveTo(this.width(), this.height(), this.width(), this.height() - this.radius);
        }
        this.canvas.context.lineTo(this.width(), this.radius);
        if (this.radius > 0) {
            this.canvas.context.quadraticCurveTo(this.width(), 0, this.width() - this.radius, 0);
        }
        this.canvas.context.lineTo(this.radius, 0);
        if (this.radius > 0) {
            this.canvas.context.quadraticCurveTo(0, 0, 0, this.radius);
        }
    }

})

var Triangle = Graphics.extend({

    init: function(canvas, x1, y1, x2, y2, x3, y3) {
        this._super(canvas, x1, y1);
        this.pos2 = new Point(x2, y2);
        this.pos3 = new Point(x3, y3);
    },

    _drawImpl: function() {
        this.canvas.context.moveTo(0, 0);
        this.canvas.context.lineTo(this.pos2.x(), this.pos2.y());
        this.canvas.context.lineTo(this.pos3.x(), this.pos3.y());
        this.canvas.context.lineTo(0, 0);
    }

})

var Circle = Graphics.extend({

    init: function(canvas, x, y, radius) {
        this._super(canvas, x, y);
        this.radius = radius || 0;
    },

    width: function() {
        return this.radius * 2;
    },

    height: function() {
        return this.radius * 2;
    },

    _drawImpl: function() {
        this.canvas.context.moveTo(this.radius , 0);
        this.canvas.context.arc(0, 0, this.radius, 0, Math.PI * 2, false);
    }

})
