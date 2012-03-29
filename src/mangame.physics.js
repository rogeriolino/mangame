/**
 * Javascript Game Engine for HTML5 Canvas
 *
 * @author rogeriolino <http://rogeriolino.com>
 */

var PhysicsScene2D = Scene2D.extend({

    init: function(game) {
        this._super(game);
        this.bodies = [];
        this.collisionGroups = [];
    },
    
    updateScene: function(elapsedTime) {
        this.update(elapsedTime);
        this._updateImpl(elapsedTime);
        this.checkCollitions();
    },
    
    checkCollitions: function() {
        for (var i = 0; i < this.collisionGroups.length; i++) {
            var group = this.collisionGroups[i];
            for (var j = 0; j < group.childNodes.length; j++) {
                var a = group.childNodes[j];
                for (var k = j + 1; k < group.childNodes.length; k++) {
                    var b = group.childNodes[k];
                    if (CollisionResolver.checkCollision(a, b)) {
                        if (!CollisionResolver.containsCollisionBetween(a, b)) {
                            var ca = new Collision(a, b);
                            a.collisions.push(ca);
                            a.onCollide(ca);
                            var cb = new Collision(b, a);
                            b.collisions.push(cb);
                            b.onCollide(cb);
                        }
                    } else {
                        CollisionResolver.removeCollisionsBetween(a, b);
                    }
                }
            }
        }
    }
    
});

var Collision = Class.extend({
    
    init: function(a, b) {
        this.a = a;
        this.b = b;
        this.date = new Date();
    }
    
});

var CollisionResolver = Class.extend({});
CollisionResolver.checkCollision = function(a, b) {
    if (a instanceof RectangleParticle && b instanceof RectangleParticle) {
        var leftA = a.node.left();
        var rightA = a.node.right();
        var topA = a.node.top();
        var bottomA = a.node.bottom();
        
        var leftB = b.node.left();
        var rightB = b.node.right();
        var topB = b.node.top();
        var bottomB = b.node.bottom();
        
        return !(rightA < leftB || leftA > rightB || topA > bottomB || bottomA < topB);
    }
    else if (a instanceof CircleParticle && b instanceof CircleParticle) {
        var dx = Math.abs(b.node.left() - a.node.left());
        var dy = Math.abs(b.node.top() - a.node.top());
        var radii = a.radius + b.radius;
        return ((dx * dx) + (dy * dy) < radii * radii);
    }
    else if ((a instanceof CircleParticle && b instanceof RectangleParticle) || (a instanceof RectangleParticle && b instanceof CircleParticle)) {
        var circle, rect;
        if (a instanceof CircleParticle) {
            circle = a;
            rect = b;
        } else {
            circle = b;
            rect = a;
        }
        var dx = Math.abs(circle.node.pos.x() - rect.node.pos.x() - rect.node.width() / 2);
        var dy = Math.abs(circle.node.pos.y() - rect.node.pos.y() - rect.node.height() / 2);

        if (dx > (rect.node.width() / 2 + circle.radius)) { 
            return false; 
        }
        if (dy > (rect.node.height() / 2 + circle.radius)) { 
            return false; 
        }
        if (dx <= (rect.node.width() / 2)) { 
            return true; 
        } 
        if (dy <= (rect.node.height() / 2)) { 
            return true; 
        }
        var cornerDistanceSq = Math.pow((dx - rect.node.width() / 2) + (dy - rect.node.height() / 2), 2);
        return (cornerDistanceSq <= Math.pow(circle.radius, 2));
    }
}
CollisionResolver.removeCollisionsBetween = function(a, b) {
    this.removeCollisionBetween(a, b);
    this.removeCollisionBetween(b, a);
}

CollisionResolver.removeCollisionBetween = function(a, b) {
    var collisions = [];
    for (var i = 0; i < a.collisions.length; i++) {
        if (a.collisions[i].b != b) {
            collisions.push(a.collisions[i]);
        }
    }
    a.collisions = collisions;
}

CollisionResolver.containsCollisionBetween = function(a, b) {
    for (var i = 0; i < a.collisions.length; i++) {
        if (a.collisions[i].b == b) {
            return true;
        }
    }
    return false;
}

var CollisionGroup = Class.extend({
    
    init: function() {
        this.clear();
    },

    appendChild: function(particle) {
        if (particle instanceof Particle) {
            particle.canvas = this.canvas;
            this.childNodes.push(particle);
        } else {
            throw "Invalid child: must be a Particle instance, given " + ((particle) ? particle.constructor : particle);
        }
    },

    clear: function() {
        this.childNodes = [];
    }
    
});

var Particle = Class.extend({
    
    init: function(canvasNode) {
        this.node = canvasNode;
        this.collisions = [];
        this.onCollide = function(particle) {};
    },
    
    isCollision: function() {
        return this.collisions.length > 0;
    }
    
});

var RectangleParticle = Particle.extend({
    
    init: function(canvasNode) {
        this._super(canvasNode);
    }
    
});

var CircleParticle = Particle.extend({
    
    init: function(canvasNode) {
        this._super(canvasNode);
        if (canvasNode instanceof Circle) {
            this.radius = canvasNode.radius;
        } else {
            this.radius = canvasNode.width() / 2;
        }
    }
    
    
});

