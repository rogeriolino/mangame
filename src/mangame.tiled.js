/**
 * Javascript Game Engine for HTML5 Canvas
 *
 * @author rogeriolino <http://rogeriolino.com>
 * @version 0.2.0
 */

var Tile = Graphics.extend({

    init: function(tileMap, row, col, tileSetRow, tileSetCol) {
        if (!(tileMap instanceof TileMap)) {
            throw "Invalid TileMap instance passed for Tile constructor";
        }
        this._super(tileMap.game.canvas, col * tileMap.tileWidth, row * tileMap.tileHeight);
        this.tileMap = tileMap;
        this.row = row;
        this.col = col;
        this.tileSetRow = tileSetRow || 0;
        this.tileSetCol = tileSetCol || 0;
        this.width(tileMap.tileWidth);
        this.height(tileMap.tileHeight);
        this.walkable = true;
    },

    _drawImpl: function() {
        this.tileMap.image.viewport.pos.x(this.tileSetCol * this.width());
        this.tileMap.image.viewport.pos.y(this.tileSetRow * this.height());
        this.tileMap.image.viewport.width(this.width());
        this.tileMap.image.viewport.height(this.height());
        this.tileMap.image.draw();
    }

});

var TileMap = GraphicsGroup.extend({
   
    init: function(game, tileWidth, tileHeight, rows, cols, url) {
        this._super(game.canvas, 0, 0);
        this.game = game;
        this.tileWidth = tileWidth || 0;
        this.tileHeight = tileHeight || 0;
        this.rows = rows || 0;
        this.cols = cols || 0;
        this.showGrid = false;
        this.tiles = [];
        this.layers = [];
        this.image = new Image2D(game.canvas, 0, 0, url);
    },

    _getIndex: function(row, col) {
         return row * this.cols + col;
    },

    addTile: function(tile) {
        if (!(tile instanceof Tile)) {
            throw "Invalid instance of Tile in TileMap.addTile()";
        }
        if (this._isValidPosition(tile.row, tile.col)) {
            var i = this._getIndex(tile.row, tile.col);
            this.childNodes[i] = tile;
        }
    },

    getTile: function(row, col) {
        if (this._isValidPosition(row, col)) {
            var i = this._getIndex(row, col);
            return this.childNodes[i];
        }
        return null;
    },

    getTileByPos: function(x, y) {
        var row = Math.floor((y - this.pos.y()) / this.tileHeight);
        var col = Math.floor((x - this.pos.x()) / this.tileWidth);
        return this.getTile(row, col);
    },

    _isValidPosition: function(row, col) {
        if ((row < 0 || row >= this.rows) || (col < 0 || col >= this.cols)) {
            throw "Invalid tile position: row=" + row + ",col=" + col;
        }
        return true;
    },

    _canDrawChild: function(child) {
        if (this.image.loaded) {
            var viewport = this.game.viewport;
            if (child.pos.x() + child.width() >= viewport.pos.x() && child.pos.x() < viewport.width()) {
                if (child.pos.y() + child.height() >= viewport.pos.y() && child.pos.y() < viewport.height()) {
                    return true;
                }
            }
        }
        return false;
    },

    _postDraw: function() {
        if (this.showGrid) {
            var line = new Line(this.game.canvas);
            line.stroke.color("red");
            line.pos.x(0);
            line.pos.y(0);
            line.pos2.x(0);
            line.pos2.y(this.rows * this.tileHeight);
            line.draw();
            line.pos2.x(this.cols * this.tileWidth);
            line.pos2.y(0);
            line.draw();
            for (var i = 0; i < this.rows; i++) {
                for (var j = 0; j < this.cols; j++) {
                    line.pos.x((j + 1) * this.tileWidth);
                    line.pos.y(0);
                    line.pos2.x((j + 1) * this.tileWidth);
                    line.pos2.y(this.rows * this.tileHeight);
                    line.draw();
                }
                line.pos.x(0);
                line.pos.y((i + 1) * this.tileHeight);
                line.pos2.x(this.cols * this.tileWidth);
                line.pos2.y((i + 1) * this.tileHeight);
                line.draw();
            }
        }
    }

});
