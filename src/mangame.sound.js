/**
 * Javascript Game Engine for HTML5 Canvas
 *
 * Copyright 2011 Rogerio A Lino Filho <http://rogeriolino.com>
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
var Sound = Class.extend({

    init: function(url) {
        var self = this;
        this.url = url;
        this.autoplay = false;
        this.loop = false;
        this.loaded = false;
        this.playing = false;
        this.type = this._mimetype(url);
        this.audio = this._createAudio(function() { self.loaded = true; });
    },
    
    _mimetype: function(url) {
        // TODO: get correct type
        return "audio/ogg";
    },
    
    _createAudio: function(onload) {
        var audio = new Audio(this.url);
        if (this.autoplay) {
            audio.autoplay = "autoplay";
        }
        if (this.loop) {
            audio.loop = "loop";
        }
        if (typeof(onload) == "function") {
            var loader = window.setInterval(function() {
                if (audio.readyState >= 4) {
                    onload();
                    clearInterval(loader);
                }
            }, 100);
        }
        return audio;
    },
    
    play: function() {
        if (this.loaded && !this.playing) {
            this.audio.play();
            this.playing = true;
        }
    },
    
    pause: function() {
        if (this.playing) {
            this.audio.pause();
            this.playing = false;
        }
    },
    
    stop: function() {
        if (this.playing) {
            this.pause();
            this.audio = this._createAudio();
        }
    }
    
})
