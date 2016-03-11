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
    var graphUtil = function () {

        // public methods
        this.layoutGraph = function (graph, layout, del) {
            addLayoutMap(layout);
            var nds = graph.nodes();
            for (var i = 0; i < nds.length; i++) {
                nds[i].fixed = 1;
                var nl = layout.map.get(nds[i].propertyMap.fullName);
                nds[i].x = nl.x;
                nds[i].y = nl.y;
                if (del) {
                    delete nds[i].px;
                    delete nds[i].py;
                }
            }
            JC_GRAPH_TOOLS.setLayoutState(1); // sync
        }

        this.setStyle = function (tag, clazz, styles, gScope, gStyle) {
            var styl = findStyleFor(tag, clazz[0], gScope.style);
            if (styl == null) {
                var sel = gStyle.newSelector(tag, clazz);
                var sElem = gStyle.calculateStyle(sel);
                gStyle.changeForSelector(sel, sElem.props);
                styl = findStyleFor(tag, clazz[0], gScope.style);
            }
            for (var i = 0; i < styles.length; i++) {
                styl.props[styles[i][0]] = styles[i][1];
            }
        }

        // return true if activated, else return false
        this.activateGraph = function (name) {
            var tab = JC_UI_UTIL.findTab(name);
            if (tab != null) {
                var cypherres = tab.jcvisGraphView;
                var actView = JC_MAIN.ACTIVE_TAB.jcvisGraphView;
                if (cypherres != actView) {
                    JC_UI_UTIL.toggleFromFullScreen(actView);
                    JC_UI_UTIL.toggleToFullScreen(cypherres);
                    JC_MAIN.ACTIVE_TAB = tab;
                    JC_UI_UTIL.activateTab(tab, tab.parentNode);
                }
                return true;
            }
            return false;
        }

        this.closeGraph = function (cypherres) {
            var actlist = JC_UI_UTIL.getActionsList(cypherres);
            var close = getDecendentWithAttribute(actlist, "ng-click", "frames.close", false);
            if (close != null)
                close.click();
        }

        // object constructor
        this.jc_layoutForce = function () {
            //private
            var d3ForceF = NEO_WINDOW.d3.layout.force;
            var d3Force = null;
            var d3LinkDistanceF = null;
            var d3XF = null;

            var force = function () {
                d3Force = d3ForceF();
                d3LinkDistanceF = d3Force.linkDistance;
                d3Force.linkDistance = linkDistance;
                return d3Force;
            }
            NEO_WINDOW.d3.layout.force = force;

            var linkDistance = function (x) { // x is a function
                d3XF = x;
                var ret = d3LinkDistanceF(xF);
                return ret;
            }

            var xF = function (relationship) {
                var ret = d3XF(relationship);
                if (relationship.propertyMap.modelElem) {
                    if (relationship.caption == "extends")
                        ret = ret + 40;
                    else if (relationship.caption == "implements")
                        ret = ret + 60;
                }
                return ret;
            }
        }

        //private methods
        var addLayoutMap = function (layout) {
            if (layout.map == null) {
                layout.map = new Map();
                for (var i = 0; i < layout.typeLayouts.length; i++) {
                    if (layout.map.get(layout.typeLayouts[i].name) == null)
                        layout.map.set(layout.typeLayouts[i].name, layout.typeLayouts[i]);
                }
            }
        }

        var findStyleFor = function (tag, cls, styles) {
            for (var i = 0; i < styles.length; i++) {
                if (styles[i].selector.tag == tag) {
                    for (var j = 0; j < styles[i].selector.classes.length; j++) {
                        if (styles[i].selector.classes[j] == cls)
                            return styles[i];
                    }
                }
            }
            return null;
        }
    };
    // makes JC_GRAPH_UTIL global
    JC_GRAPH_UTIL = new graphUtil();
}();