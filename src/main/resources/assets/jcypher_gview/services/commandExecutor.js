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
    var commandExecutor = function () {

        //public methods
        this.execDomainModel = function () {
            if (!JC_MAIN.INIT_DELETE) {
                if (JC_UI_UTIL.closeGraphView())
                    execDM_int()
            } else
                execDM_int();
        }

        this.execCypherQuery = function (query) {
            if (!JC_MAIN.INIT_DELETE) {
                if (JC_UI_UTIL.closeGraphView(query))
                    execQuery_int(query)
            } else
                execQuery_int(query);
        }

        //private methods
        var execDM_int = function () {
            var act = JC_GRAPH_UTIL.activateGraph("domain model");
            if (!act) {
                document.getElementById("graph_view").style.overflow = "hidden";
                document.getElementById("graph_tools").style.display = "none";
                document.getElementById("neoframe").style.display = "none";
                loadDMGraph();

                if (window.Worker) {
                    var worker = new Worker("jcypher_gview/worker.js");
                    worker.onmessage = function (e) {
                        JC_UI_UTIL.createGraphView("domain model", JC_MAIN.getDomainGraph().styleDomainGraph, JC_MAIN.getModelNodeActions());
                    };
                    worker.postMessage(0);
                    //console.log('Message posted to worker');
                }
            }
        }

        var execQuery_int = function (query) {
            document.getElementById("graph_view").style.overflow = "hidden";
            document.getElementById("graph_tools").style.display = "none";
            document.getElementById("neoframe").style.display = "none";
            var leftbar = NEO_DOC.getElementById("leftbar");
            var scp = JC_MAIN.getScope(leftbar);
            // see controllers/Sidebar.coffee
            // scp has functions playDocument and importDocument(content, name)
            // importDocument must have name with extension .grass !!

            scp.playDocument(query);

            if (window.Worker) {
                var worker = new Worker("jcypher_gview/worker.js");
                worker.onmessage = function (e) {
                    JC_UI_UTIL.createGraphView();
                };
                worker.postMessage(0);
                //console.log('Message posted to worker');
            }
        }

        var loadDMGraph = function () {
            var dat = {};

            var cw = document.getElementById("neoframe").contentWindow;
            var ndoc = NEO_DOC;
            var html = ndoc.documentElement;
            var app_inj = cw.angular.element(html).injector();
            var cypher = app_inj.get('Cypher');
            var frame = app_inj.get('Frame');
            if (!JC_MAIN.INIT_INTERCEPTS) {
                JC_MAIN.INIT_INTERCEPTS = true;
                var inter = frame.interpreterFor("MATCH n RETURN n"); // simply get a Cypher command interpreter
                var exec = inter.exec[4];
                inter.exec[4] = function (Cypher, CypherGraphModel, CypherParser, Timer) {
                    var ret = exec(Cypher, CypherGraphModel, CypherParser, Timer);
                    var ctxt = {};
                    ctxt.cypher = Cypher;
                    ctxt.cypherGraphModel = CypherGraphModel;
                    ctxt.cypherParser = CypherParser;
                    ctxt.timer = Timer;
                    return function (input, q) {
                        if (input == "jc_domainModel") {
                            var graph = JC_MAIN.getDomainGraph(ctxt).getGraph();
                            var nm = JC_MAIN.getDomainName();
                            nm = nm.replace(/-/g, "_").replace(/ /g, "_") + "_layout";
                            var prom = ret("MERGE (n:" + nm + ") RETURN n", q); // load the layout, also needed to fill result correctly
                            var myProm = prom.then(function (result) {
                                result.graph = graph;
                                var nd = result.table.nodes[0];
                                if (nd.properties.layout != null) {
                                    JC_GRAPH_UTIL.layoutGraph(graph, JSON.parse(nd.properties.layout));
                                } else
                                    JC_GRAPH_TOOLS.setLayoutState(0); // cleared
                                return result;
                            }, function (err) {
                                return err;
                            });
                            return myProm;
                        } else
                            return ret(input, q);
                    }
                }
                var intFor = frame.interpreterFor;
                frame.interpreterFor = function (input) {
                    var ipf;
                    if (input == "jc_domainModel")
                        ipf = intFor("MATCH n RETURN n");
                    else
                        ipf = intFor(input);
                    return ipf;
                }
            }

            dat.input = "jc_domainModel";
            var res = frame.create(dat);

            return;
        }
    };
    // makes JC_CommandExecutor global
    JC_CommandExecutor = new commandExecutor();
}();