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
    var uiUtil = function () {
        
        // private vars
        var hideGP = true;

        // public methods
        this.showGlassPane = function () {
            var gp = document.getElementById("dlg-glasspane");
            if (gp.style.display != "block") {
                hideGP = false;
                var h = $(window).height();
                var w = $(window).width();
                gp.style.height = h + "px";
                gp.style.width = w + "px";
                gp.style.display = "block";
                var worker = new Worker("jcypher_gview/worker.js");
                worker.onmessage = function (e) {
                    JC_UI_UTIL.hideGlassPane();
                };
                worker.postMessage(2000);
            }
        }
        
        this.hideGlassPane = function () {
            var gp = document.getElementById("dlg-glasspane");
            if (gp.style.display != "none") {
                if (hideGP)
                    gp.style.display = "none";
                else
                    hideGP = true;
            }
        }

        this.findTab = function (name) {
            var navTabs = document.getElementById("jcvis-nav-tabs");
            for (var i = 0; i < navTabs.children.length; i++) {
                if (navTabs.children[i].children[0].childNodes[0].textContent == name)
                    return navTabs.children[i];
            }
            return null;
        }

        this.toggleFromFullScreen = function (cypherres) {
            if (cypherres != null) { // only if there is already a graph rendered (then it must be in fullscreen)
                var codebar = getChildWithAttribute(
                    getChildWithAttribute(cypherres, "class", "outer"),
                    "class", "code-bar");
                var fullScreen = getChildWithAttribute(codebar, "ng-click", "toggleFullscreen", false);
                if (fullScreen != null)
                    fullScreen.click(); // toggle away from fullscreen
            }
        }

        this.toggleToFullScreen = function (cypherres) {
            var actlist = JC_UI_UTIL.getActionsList(cypherres);
            var fullScreen = getDecendentWithAttribute(actlist, "ng-click", "toggleFullscreen", false);
            fullScreen.click();
        }

        this.activateTab = function (tab, navTabs) {
            var i;
            var span;
            var cls;
            if (tab.getAttribute("class") == null || tab.getAttribute("class").indexOf("active") < 0) { // else the tab is already active
                for (i = 0; i < navTabs.children.length; i++) {
                    navTabs.children[i].removeAttribute("class");
                    span = navTabs.children[i].children[0].children[0];
                    cls = span.getAttribute("class");
                    cls = cls.replace("jcvis-tab-close-act", "jcvis-tab-close-inact");
                    span.setAttribute("class", cls);
                }
                tab.setAttribute("class", "active");
                span = tab.children[0].children[0];
                cls = span.getAttribute("class");
                cls = cls.replace("jcvis-tab-close-inact", "jcvis-tab-close-act");
                span.setAttribute("class", cls);
            }
        }

        this.closeTab = function (tab) {
            var cl = $(tab).children("a").children("*")[0];
            cl.click();
        }

        this.tabClicked = function (event) {
            //alert("tab clicked");
            var par = event.target.parentNode;
            if (par.tagName == "A") { // close was clicked
                var actTab = JC_MAIN.ACTIVE_TAB;
                var tab = par.parentNode;
                // toggle from fullscreen
                var fullscreenContainer = getDecendentWithAttribute(NEO_DOC.body, "class", "fullscreen-container");
                var cypherres = getDecendentWithAttribute(fullscreenContainer, "ng-controller", "CypherResultCtrl");
                JC_UI_UTIL.toggleFromFullScreen(cypherres);
                cypherres = tab.jcvisGraphView;
                tab.jcvisGraphView = null;
                cypherres.jcviewTab = null;
                JC_GRAPH_UTIL.closeGraph(cypherres);
                if (tab == actTab) { // I am the active tab, find another one to activate
                    var newAct = tab.previousElementSibling;
                    if (newAct == null)
                        newAct = tab.nextElementSibling;
                    if (newAct == null) { // I am the last one (hide me)
                        setVisibility(tab, "hidden");
                        document.getElementById("graph_view").style.overflow = "hidden";
                        document.getElementById("graph_tools").style.display = "none";
                        document.getElementById("neoframe").style.display = "none";
                        actTab.children[0].childNodes[0].textContent = "_";
                    } else { // remove me, activate another one
                        var navTabs = actTab.parentNode;
                        navTabs.removeChild(tab);
                        newAct.children[0].click();
                        JC_UI_UTIL.activateTab(newAct, navTabs);
                    }
                } else { // closing a non-active tab
                    // remove me
                    var navTabs = actTab.parentNode;
                    navTabs.removeChild(tab);
                    // reactivate active tab
                    JC_UI_UTIL.toggleToFullScreen(actTab.jcvisGraphView);
                    //JC_UI_UTIL.activateTab(actTab, navTabs);
                }
            } else { // activate tab
                var cypherres = par.jcvisGraphView;
                var actView = JC_MAIN.ACTIVE_TAB.jcvisGraphView;
                JC_UI_UTIL.toggleFromFullScreen(actView);
                JC_UI_UTIL.toggleToFullScreen(cypherres);
                JC_MAIN.ACTIVE_TAB = par;
                JC_UI_UTIL.activateTab(par, par.parentNode);
            }
        }

        this.createGraphView = function (name, doStyle, actions) {
            var fullscreenContainer = getDecendentWithAttribute(NEO_DOC.body, "class", "fullscreen-container");
            var cypherres = getDecendentWithAttribute(fullscreenContainer, "ng-controller", "CypherResultCtrl");
            JC_UI_UTIL.toggleFromFullScreen(cypherres);

            var stream = NEO_DOC.getElementById('stream');
            cypherres = getDecendentsWithAttribute(stream, "ng-controller", "CypherResultCtrl");
            var done = false;
            var i;
            for (i = 0; i < cypherres.length; i++) {
                if (cypherres[i].jcviewTab == null) { // now that's the new one
                    var legend = getDecendentWithAttribute(cypherres[i], "ng-controller", "LegendCtrl");
                    var lnks = $(legend).children("div").eq(1)[0];
                    if (lnks != null) {
                        lnks.style.display = "none";
                        done = true;
                    }
                    if (done) {
                        done = false;
                        if (actions != null) {
                            var graph = getDecendentWithAttribute(cypherres[i], "ng-controller", "D3GraphCtrl");
                            var gelem = NEO_DOC.defaultView.angular.element(graph);
                            var gview = gelem.controller().getGraphView();
                            if (gview != null) {
                                Object.keys(actions).forEach(function (key, index) {
                                    var cb = gview.callbacks[key];
                                    if (cb != null) {
                                        var act = cb[0];
                                        actions.org[key] = act;
                                        cb[0] = actions[key];
                                    }
                                });
                                done = true;
                            }
                        } else
                            done = true;
                    }
                    if (done) {
                        var tabElem = null;
                        var navTabs = document.getElementById("jcvis-nav-tabs");
                        if (navTabs.children.length == 1) // the remaining one (hidden)
                            if (navTabs.children[0].jcvisGraphView == null)
                                tabElem = navTabs.children[0];
                        if (tabElem == null) // create a new tab
                            tabElem = createTabIn(navTabs, name != null ? name : "Graph");
                        else
                            tabElem.children[0].childNodes[0].textContent = name != null ? name : "Graph";
                        JC_UI_UTIL.activateTab(tabElem, navTabs);
                        JC_MAIN.ACTIVE_TAB = tabElem;
                        setVisibility(tabElem, "visible");
                        // connect graphView and tab
                        tabElem.jcvisGraphView = cypherres[i];
                        cypherres[i].jcviewTab = tabElem;

                        // toggle to fullscreen
                        JC_UI_UTIL.toggleToFullScreen(cypherres[i]);
                        if (doStyle != null)
                            doStyle(cypherres[i]);

                        document.getElementById("neoframe").style.display = "inline";
                        document.getElementById("graph_view").style.overflow = "scroll";
                        document.getElementById("graph_tools").style.display = "-webkit-flex";
                        document.getElementById("graph_tools").style.display = "flex";
                    }
                }
            }
            if (!done) {
                var worker = new Worker("jcypher_gview/worker.js");
                worker.onmessage = function (e) {
                    JC_UI_UTIL.createGraphView(name, doStyle, actions);
                };
                worker.postMessage(20);
            }
        }

        this.closeGraphView = function (query, toDelete) {
            //document.getElementById("neoframe").style.display = "none";
            var stream = NEO_DOC.getElementById('stream');
            var divsFullscreen = null;
            var fullscreenContainer = getDecendentWithAttribute(NEO_DOC.body, "class", "fullscreen-container");
            var cypherres = getDecendentWithAttribute(fullscreenContainer, "ng-controller", "CypherResultCtrl");
            JC_UI_UTIL.toggleFromFullScreen(cypherres);
            // this will contain 'CypherResultCtrl' controllers and the default frame
            // (if available)
            divsFullscreen = getDecendentsWithAttribute(stream, "fullscreen", "fullscreen");
            for (i = 0; i < divsFullscreen.length; i++) {
                var divFullscreen = divsFullscreen[i];
                if (divFullscreen.jcviewTab == null || divFullscreen == toDelete) {
                    // frame not displayed by jcypher or is the one to be deleted
                    if (divFullscreen.jcviewTab == null)
                        JC_MAIN.INIT_DELETE = true;
                    var actlist = JC_UI_UTIL.getActionsList(divFullscreen);
                    var close = getDecendentWithAttribute(actlist, "ng-click", "frames.close", false);
                    if (close != null) {
                        close.click();
                        if (query != null) {
                            var worker = new Worker("jcypher_gview/worker.js");
                            worker.onmessage = function (e) {
                                JC_CommandExecutor.execCypherQuery(query);
                            };
                            worker.postMessage(20);
                            return false; //don't continue
                        }
                    }
                }
            }
            return true; // continue
        }

        this.getActionsList = function (cypherres) {
            var codebar = getChildWithAttribute(
                getChildWithAttribute(cypherres, "class", "outer"),
                "class", "code-bar");
            var inner = getDecendentWithAttribute(
                getChildWithAttribute(cypherres, "class", "outer"),
                "class", "inner");
            var vres = getChildWithAttribute(inner, "class", "view-result");
            if (codebar != null)
                codebar.style.display = "none";
            if (vres != null)
                vres.style.top = "0px";
            var actlist = getChildWithAttribute(codebar, "class", "actions list-inline");
            return actlist;
        }

        //private methods
        var createTabIn = function (navTabs, text) {
            var li = document.createElement("li");
            var a = document.createElement("a");
            li.appendChild(a);
            a.setAttribute("data-toggle", "tab");
            a.setAttribute("href", "#graph_view");
            a.textContent = text;
            var span = document.createElement("span");
            span.setAttribute("class", "glyphicon glyphicon-remove jcvis-tab-close-inact");
            a.appendChild(span);
            navTabs.appendChild(li);
            return li;
        }

        var setVisibility = function (tabElem, vis) {
            tabElem.children[0].style.visibility = vis;
            var i;
            for (i = 0; i < tabElem.children[0].children.length; i++) {
                tabElem.children[0].children[i].style.visibility = vis;
            }
        }
    };
    // makes JC_GRAPH_UTIL global
    JC_UI_UTIL = new uiUtil();
}();