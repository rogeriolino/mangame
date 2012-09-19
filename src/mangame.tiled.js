/**
 * Javascript Game Engine for HTML5 Canvas
 * @author rogeriolino <http://rogeriolino.com>
 */
var Tile = Graphics.extend({

    init: function(tileMap, row, col, tileSetRow, tileSetCol) {
        if (!(tileMap instanceof TileMap)) {
            throw "Invalid TileMap instance passed for Tile constructor";
        }
        this._super(tileMap.game.canvas, col * tileMap.tileWidth(), row * tileMap.tileHeight());
        this.width(tileMap.tileWidth());
        this.height(tileMap.tileHeight());
        this.createProperty('tileMap', tileMap);
        this.createProperty('row', row);
        this.createProperty('col', col);
        this.createProperty('tileSetRow', tileSetRow || 0);
        this.createProperty('tileSetCol', tileSetCol || 0);
        this.createProperty('walkable', true);
    },

    _drawImpl: function() {
        var image = this.tileMap().image();
        image.viewport.pos().x(this.tileSetCol() * this.width());
        image.viewport.pos().y(this.tileSetRow() * this.height());
        image.viewport.width(this.width());
        image.viewport.height(this.height());
        image.draw();
    }

});

var TileMap = GraphicsGroup.extend({
   
    init: function(game, tileWidth, tileHeight, rows, cols, url) {
        this._super(game.canvas, 0, 0);
        this.game = game;
        this.createProperty('tileWidth', tileWidth || 0);
        this.createProperty('tileHeight', tileHeight || 0);
        this.createProperty('rows', rows || 0);
        this.createProperty('cols', cols || 0);
        this.createProperty('showGrid', false);
        this.createProperty('tiles', []);
        this.createProperty('layers', []);
        this.createProperty('image', new Image2D(game.canvas, url, 0, 0));
    },

    _getIndex: function(row, col) {
         return row * this.cols() + col;
    },

    addTile: function(tile) {
        if (!(tile instanceof Tile)) {
            throw "Invalid instance of Tile in TileMap.addTile()";
        }
        if (this._isValidPosition(tile.row(), tile.col())) {
            var i = this._getIndex(tile.row(), tile.col());
            this.childs[i] = tile;
        }
    },

    getTile: function(row, col) {
        if (this._isValidPosition(row, col)) {
            var i = this._getIndex(row, col);
            return this.childs[i];
        }
        return null;
    },

    getTileByPos: function(x, y) {       
        var row = Math.floor((y - this.pos().y()) / this.tileHeight());
        var col = Math.floor((x - this.pos().x()) / this.tileWidth());
        return this.getTile(row, col);
    },

    _isValidPosition: function(row, col) {
        if (isNaN(row) || isNaN(col)) {
            return false;
        }
        if ((row < 0 || row >= this.rows) || (col < 0 || col >= this.cols)) {
            throw "Invalid tile position: row=" + row + ",col=" + col;
        }
        return true;
    },

    _canDrawChild: function(child) {
        if (this.image().loaded) {
            var viewport = this.game.viewport;
            var vx = viewport.pos().x();
            var vy = viewport.pos().y();
            var vw = viewport.width();
            var vh = viewport.height();
            var cw = child.width();
            var ch = child.height();
            var cx = child.pos().x();
            var cy = child.pos().y();
            if (cx + cw >= vx && cx < vw) {
                if (cy + ch >= vy && cy < vh) {
                    return true;
                }
            }
        }
        return false;
    },

    _postDraw: function() {
        if (this.showGrid()) {
            var rows = this.rows();
            var cols = this.cols();
            var width = this.tileWidth();
            var height = this.tileHeight();
            
            var line = new Line(this.game.canvas);
            line.stroke().color("red");
            line.pos().x(0);
            line.pos().y(0);
            line.pos2().x(0);
            line.pos2().y(rows * height);
            line.draw();
            line.pos2().x(cols * width);
            line.pos2().y(0);
            line.draw();
            for (var i = 0; i < rows; i++) {
                for (var j = 0; j < cols; j++) {
                    line.pos().x((j + 1) * width);
                    line.pos().y(0);
                    line.pos2().x((j + 1) * width);
                    line.pos2().y(rows * height);
                    line.draw();
                }
                line.pos().x(0);
                line.pos().y((i + 1) * height);
                line.pos2().x(cols * width);
                line.pos2().y((i + 1) * height);
                line.draw();
            }
        }
    }

});
