/**
 * Javascript Game Engine for HTML5 Canvas
 * @author rogeriolino <http://rogeriolino.com>
 */

var Debugger = Class.extend({

    init: function() {
        this.nodeId = "mangameDebugWindow";
        var du = new DebuggerUtils();
        this.output = du.createOutput(this.nodeId + "Output")
        this.debugWindow = du.createDebugWindow(this.nodeId, this.output);
    },

    print: function(data) {
        this.output.innerHTML += data + "\n";
    },

    clear: function(data) {
        this.output.innerHTML = "";
    }

})

var DebuggerUtils = Class.extend({

    createOutput: function(id) {
        var pre = document.createElement("pre");
        pre.setAttribute("id", id);
        return pre;
    },

    createDebugWindow: function(id, output) {
        var div = document.createElement("div");
        div.setAttribute("id", id);
        div.add(output);
        document.body.add(div);
        return div;
    }

})
