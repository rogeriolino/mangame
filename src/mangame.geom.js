/**
 * Javascript Game Engine for HTML5 Canvas
 * @author rogeriolino <http://rogeriolino.com>
 */

var Line = Graphics.extend({

    init: function(canvas, x1, y1, x2, y2) {
        this._super(canvas, x1, y1);
        this.createProperty('pos2', new Point(x2 || this.x, y2 || this.y));
    },
    
    width: function() {
        if (this.pos && this.pos2) {
            return Math.abs(this.pos().x() - this.pos2().x());
        }
        return 0;
    },

    height: function() {
        if (this.pos && this.pos2) {
            return Math.abs(this.pos().y() - this.pos2().y());
        }
        return 0;
    },

    _drawImpl: function() {
        this.canvas.context.moveTo(0, 0);
        this.canvas.context.lineTo(this.pos2().x() - this.pos().x(), this.pos2().y() - this.pos().y());
    }

});

var Rectangle = Graphics.extend({

    init: function(canvas, x, y, width, height, radius) {
        this._super(canvas, x, y);
        this.width(width || 0);
        this.height(height || 0);
        this.createProperty('radius', radius || 0);
    },

    _drawImpl: function() {
        this.canvas.context.moveTo(0, this.radius());
        this.canvas.context.lineTo(0, this.height() - this.radius());
        var radius = this.radius();
        if (radius > 0) {
            this.canvas.context.quadraticCurveTo(0, this.height(), radius, this.height());
        }
        this.canvas.context.lineTo(this.width() - radius, this.height());
        if (radius > 0) {
            this.canvas.context.quadraticCurveTo(this.width(), this.height(), this.width(), this.height() - radius);
        }
        this.canvas.context.lineTo(this.width(), radius);
        if (radius > 0) {
            this.canvas.context.quadraticCurveTo(this.width(), 0, this.width() - radius, 0);
        }
        this.canvas.context.lineTo(radius, 0);
        if (radius > 0) {
            this.canvas.context.quadraticCurveTo(0, 0, 0, radius);
        }
    }

});

var Triangle = Graphics.extend({

    init: function(canvas, x1, y1, x2, y2, x3, y3) {
        this._super(canvas, x1, y1);
        this.pos2(x2, y2);
        this.pos3(x3, y3);
    },
    
    pos2: function() {
        if (arguments.length) {
            if (arguments[0] instanceof Point) {
                this._pos2 = arguments[0];
            } else {
                this._pos2 = new Point(arguments[0], arguments[1]);
            }
        }
        return this._pos2;
    },
    
    pos3: function() {
        if (arguments.length) {
            if (arguments[0] instanceof Point) {
                this._pos3 = arguments[0];
            } else {
                this._pos3 = new Point(arguments[0], arguments[1]);
            }
        }
        return this._pos3;
    },

    _drawImpl: function() {
        this.canvas.context.moveTo(0, 0);
        this.canvas.context.lineTo(this.pos2().x() - this.pos().x(), this.pos2().y() - this.pos().y());
        this.canvas.context.lineTo(this.pos3().x() - this.pos().x(), this.pos3().y() - this.pos().y());
        this.canvas.context.lineTo(0, 0);
    }

});

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

});

var Polygon = Graphics.extend({

    init: function(canvas, points) {
        points = points || [];
        if (!(points instanceof Array)) {
            throw "The polygon poins must be a array with 3 or more points (x, y)";
        }
        if (points.length < 3) {
            throw "The polygon need 3 or more points,  " + points.length + " given.";
        }
        this.points = [];
        for (var i = 0; i < points.length; i++) {
            this.points[i] = {};
            this.points[i].x = points[i].x || points[i][0];
            this.points[i].y = points[i].y || points[i][1];
        }
        if (this.points.length == 3) {
            this.wrapped = new Triangle(canvas, this.points[0].x, this.points[0].y, this.points[1].x, this.points[1].y, this.points[2].x, this.points[2].y);
        } else {
            this.wrapped = null;
        }
        this._super(canvas, this.points[0].x, this.points[0].y);
    },

    _drawImpl: function() {
        if (this.wrapped) {
            this.wrapped._drawImpl();
        } else {
            this.canvas.context.moveTo(0, 0);
            var x = this.points[0].x;
            var y = this.points[0].y;
            for (var i = 1; i < this.points.length; i++) {
                var point = this.points[i];
                this.canvas.context.lineTo(point.x - x, point.y - y);
            }
            this.canvas.context.lineTo(0, 0);
        }
    }
    
});