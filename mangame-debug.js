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

var Debugger = Class.extend({

    init : function() {
        this.nodeId = "mangameDebugWindow";
        var du = new DebuggerUtils();
        this.output = du.createOutput(this.nodeId + "Output")
        this.debugWindow = du.createDebugWindow(this.nodeId, this.output);
    },

    print : function(data) {
        this.output.innerHTML += data + "\n";
    },

    clear : function(data) {
        this.output.innerHTML = "";
    }

    
})

var DebuggerUtils = Class.extend({

    createOutput : function(id) {
        var pre = document.createElement("pre");
        pre.setAttribute("id", id);
        return pre;
    },

    createDebugWindow : function(id, output) {
        var div = document.createElement("div");
        div.setAttribute("id", id);
        div.appendChild(output);
        document.body.appendChild(div);
        return div;
    }

})
