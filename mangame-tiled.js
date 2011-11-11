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

var Tile = Graphics.extend({

    init : function(tileMap, row, col, tileSetRow, tileSetCol) {
        if (!(tileMap instanceof TileMap)) {
            throw "Invalid TileMap instance passed for Tile constructor";
        }
        this._super(tileMap.game.canvas, col * tileMap.tileWidth, row * tileMap.tileHeight);
        this.tileMap = tileMap;
        this.row = row;
        this.col = col;
        this.tileSetRow = tileSetRow || 0;
        this.tileSetCol = tileSetCol || 0;
        this.width = tileMap.tileWidth;
        this.height = tileMap.tileHeight;
        this.walkable = true;
    },

    _drawImpl : function() {
        this.tileMap.image.viewport.x = this.tileSetCol * this.width;
        this.tileMap.image.viewport.y = this.tileSetRow * this.height;
        this.tileMap.image.viewport.width = this.width;
        this.tileMap.image.viewport.height = this.height;
        this.tileMap.image.draw();
    }

});

var TileMap = GraphicsGroup.extend({
   
    init : function(game, tileWidth, tileHeight, rows, cols, url) {
        this._super(game.canvas, 0, 0);
        this.game = game;
        this.tileWidth = tileWidth || 0;
        this.tileHeight = tileHeight || 0;
        this.rows = rows || 0;
        this.cols = cols || 0;
        this.showGrid = false;
        this.tiles = new Array();
        this.layers = new Array();
        this.image = new Image2D(game.canvas, 0, 0, url);
    },

    _getIndex : function(row, col) {
         return row * this.cols + col;
    },

    addTile : function(tile) {
        if (!(tile instanceof Tile)) {
            throw "Invalid instance of Tile in TileMap.addTile()";
        }
        if (this._isValidPosition(tile.row, tile.col)) {
            var i = this._getIndex(tile.row, tile.col);
            this.childNodes[i] = tile;
        }
    },

    getTile : function(row, col) {
        if (this._isValidPosition(row, col)) {
            var i = this._getIndex(row, col);
            return this.childNodes[i];
        }
        return null;
    },

    getTileByPos : function(x, y) {
        var row = Math.floor((y - this.y) / this.tileHeight);
        var col = Math.floor((x - this.x) / this.tileWidth);
        return this.getTile(row, col);
    },

    _isValidPosition : function(row, col) {
        if ((row < 0 || row >= this.rows) || (col < 0 || col >= this.cols)) {
            throw "Invalid tile position: row=" + row + ",col=" + col;
        }
        return true;
    },

    _canDrawChild : function(child) {
        if (this.image.loaded) {
            var viewport = this.game.viewport;
            if (child.x + child.width >= viewport.x && child.x < viewport.width) {
                if (child.y + child.height >= viewport.y && child.y < viewport.height) {
                    return true;
                }
            }
        }
        return false;
    },

    _postDraw : function() {
        if (this.showGrid) {
            var line = new Line(this.game.canvas);
            line.stroke.color = "red";
            line.x = 0;
            line.y = 0;
            line.x2 = 0;
            line.y2 = this.rows * this.tileHeight;
            line.draw();
            line.x2 = this.cols * this.tileWidth;
            line.y2 = 0;
            line.draw();
            for (var i = 0; i < this.rows; i++) {
                for (var j = 0; j < this.cols; j++) {
                    line.x = (j + 1) * this.tileWidth;
                    line.y = 0;
                    line.x2 = (j + 1) * this.tileWidth;
                    line.y2 = this.rows * this.tileHeight;
                    line.draw();
                }
                line.x = 0;
                line.y = (i + 1) * this.tileHeight;
                line.x2 = this.cols * this.tileWidth;
                line.y2 = (i + 1) * this.tileHeight;
                line.draw();
            }
        }
    }

});
