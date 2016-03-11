/************************************************************************
 * Copyright (c) 2016 IoT-Solutions e.U.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *  http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ************************************************************************/

! function () {
    var jc_graphTools = function () {

        //private
        //layoutState: 0 .. cleared, 1 .. sync, 2 .. changed
        var layoutState = 100; // need init
        var fullscreen = false;
        var graphViewHeight = 0;

        //public
        this.windowResized = function() {
            if (fullscreen) {
                var gv = document.getElementById("graph_view");
                var gvOffs = gv.offsetTop;
                var h = $(window).height() - gvOffs;
                gv.style.height = h + "px";
            }
        }
        
        this.toggleScreen = function(event) {
            if (!fullscreen) {
                fullscreen = true;
                var gp = document.getElementById("graph_panel");
                var gv = document.getElementById("graph_view");
                gp.style.position = "absolute";
                graphViewHeight = $(gv).height();
                var gvOffs = gv.offsetTop;
                var h = $(window).height() - gvOffs;
                gv.style.height = h + "px";
                var gt = document.getElementById("graph_tools");
                var fs = $(gt).children("span.gt-toggle-screen")[0];
                $(fs).removeClass("glyphicon-resize-full");
                $(fs).addClass("glyphicon-resize-small");
                var jcml = document.getElementById("jc-main-left");
                for (var i = 0; i < jcml.children.length; i++) {
                    jcml.children[i].style.display = "none";
                }
            } else {
                fullscreen = false;
                var gp = document.getElementById("graph_panel");
                var gv = document.getElementById("graph_view");
                gp.style.position = "relative";
                gv.style.height = graphViewHeight + "px";
                var gt = document.getElementById("graph_tools");
                var fs = $(gt).children("span.gt-toggle-screen")[0];
                $(fs).removeClass("glyphicon-resize-small");
                $(fs).addClass("glyphicon-resize-full");
                var jcml = document.getElementById("jc-main-left");
                for (var i = 0; i < jcml.children.length; i++) {
                    if (jcml.children[i].getAttribute("class").indexOf("test-only") < 0 || TEST_MODE)
                        jcml.children[i].style.display = "block";
                }
            }
        }
        
        this.saveLayout = function (event) {
            var cls = event.target.getAttribute("class");
            if (cls != null && cls.indexOf("gt-disabled") >= 0)
                return;
            var actView = JC_MAIN.ACTIVE_TAB.jcvisGraphView;
            var graph = getDecendentWithAttribute(actView, "ng-controller", "D3GraphCtrl");
            var gelem = NEO_DOC.defaultView.angular.element(graph);
            var gview = gelem.controller().getGraphView();
            var layout = {};
            layout.domainName = JC_MAIN.getDomainName();
            layout.typeLayouts = [];
            var nds = gview.graph.nodes();
            for (var i = 0; i < nds.length; i++) {
                nds[i].fixed = 1;
                var tl = {};
                tl.name = nds[i].propertyMap.fullName;
                tl.x = nds[i].x;
                tl.y = nds[i].y;
                layout.typeLayouts.push(tl);
            }
            JC_REST.saveLayout(JC_MAIN.getDBName(), JC_MAIN.getDomainName(), layout,
                function (data) {
                    if (data.length > 0 && data[0] == "success")
                        JC_GRAPH_TOOLS.setLayoutState(1); // sync
                });
        }

        this.nodeDragged = function (nd) {
            if (layoutState != 0) // not cleared
                this.setLayoutState(2);
        }

        this.reloadLayout = function (event) {
            var cls = event.target.getAttribute("class");
            if (cls != null && cls.indexOf("gt-disabled") >= 0)
                return;
            JC_REST.loadLayout(JC_MAIN.getDBName(), JC_MAIN.getDomainName(), function (layout) {
                var actView = JC_MAIN.ACTIVE_TAB.jcvisGraphView;
                var graph = getDecendentWithAttribute(actView, "ng-controller", "D3GraphCtrl");
                var gelem = NEO_DOC.defaultView.angular.element(graph);
                var gview = gelem.controller().getGraphView();
                JC_GRAPH_UTIL.layoutGraph(gview.graph, layout, true); // delete px, py in nodes
                gview.update();
            });
        }

        this.clearLayout = function (event) {
            var cls = event.target.getAttribute("class");
            if (cls != null && cls.indexOf("gt-disabled") >= 0)
                return;
            var actView = JC_MAIN.ACTIVE_TAB.jcvisGraphView;
            var graph = getDecendentWithAttribute(actView, "ng-controller", "D3GraphCtrl");
            var gelem = NEO_DOC.defaultView.angular.element(graph);
            var gview = gelem.controller().getGraphView();
            var nds = gview.graph.nodes();
            for (var i = 0; i < nds.length; i++) {
                nds[i].fixed = 0;
            }
            gview.update();
            JC_REST.saveLayout(JC_MAIN.getDBName(), JC_MAIN.getDomainName(), {},
                function (data) {
                    if (data.length > 0 && data[0] == "success")
                        JC_GRAPH_TOOLS.setLayoutState(0); // cleared
                });
        }

        this.setLayoutState = function (state) {
            if (layoutState != state) {
                layoutState = state;
                if (layoutState == 0) { // cleared
                    var graphTools = document.getElementById("graph_tools");
                    $(graphTools).children(".gt-save").removeClass("gt-disabled");
                    $(graphTools).children(".gt-clear").addClass("gt-disabled");
                    $(graphTools).children(".gt-reload").addClass("gt-disabled");
                } else if (layoutState == 1) { // sync
                    var graphTools = document.getElementById("graph_tools");
                    $(graphTools).children(".gt-save").addClass("gt-disabled");
                    $(graphTools).children(".gt-clear").removeClass("gt-disabled");
                    $(graphTools).children(".gt-reload").addClass("gt-disabled");
                } else if (layoutState == 2) { // changed
                    var graphTools = document.getElementById("graph_tools");
                    $(graphTools).children(".gt-save").removeClass("gt-disabled");
                    $(graphTools).children(".gt-clear").removeClass("gt-disabled");
                    $(graphTools).children(".gt-reload").removeClass("gt-disabled");
                }
            }
        }
    }
    JC_GRAPH_TOOLS = new jc_graphTools();
}();