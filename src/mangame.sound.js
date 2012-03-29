/**
 * Javascript Game Engine for HTML5 Canvas
 *
 * @author rogeriolino <http://rogeriolino.com>
 */
var Sound = Class.extend({

    init: function(url, loop) {
        var self = this;
        this.url = url;
        this.loop = (loop == true);
        this.autoplay = false;
        this.loaded = false;
        this.playing = false;
        this.type = this._mimetype(url);
        this.audio = this._createAudio(function() { self.loaded = true; if (self.autoplay) { self.play(); } });
    },
    
    _mimetype: function(url) {
        // TODO: get correct type
        return "audio/ogg";
    },
    
    _createAudio: function(onload) {
        var audio = new Audio(this.url);
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
