/* 
 * Mangame Examples util
 */

function createTopDownChar(game, x, y) {
    var chr = new Rectangle(game.canvas, x, y, 40, 40, 10);
    chr.stroke.color("black");
    chr.fill.color("yellow");
    chr.walkingX = 0;
    chr.walkingY = 0;
    chr.speed = 5;
    chr.move = function(e) {
        switch (e.originalEvent.keyCode) {
        case 37:
            this.walkingX = -1;
            break;
        case 38:
            this.walkingY = -1;
            break;
        case 39:
            this.walkingX = 1;
            break;
        case 40:
            this.walkingY = 1;
            break;
        }
        if (this.walkingY != 0) {
            e.originalEvent.preventDefault(); // prevent scroll
        }
    };

    chr.stop = function(e) {
        switch (e.originalEvent.keyCode) {
        case 38:
        case 40:
            this.walkingY = 0;
            break;
        case 37:
        case 39:
            this.walkingX = 0;
            break;
        }
    };
    
    chr.update = function(maxX, maxY) {
        var currSpeed = this.speed;
        if (Math.abs(this.walkingX) + Math.abs(this.walkingY) == 2) { // diagonal moves
            currSpeed /= 1.5;
        }
        var newX = this.pos().x() + currSpeed * this.walkingX;
        var newY = this.pos().y() + currSpeed * this.walkingY;
        if (newX >= 1 && newX + this.width() < maxX) {
            this.pos().x(newX);
        }
        if (newY >= 1 && newY + this.height() < maxY) {
            this.pos().y(newY);
        }
    }
    return chr;
}

