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

var DomainGraph = function (domainModel, ctxt) {

    //public methods
    this.getGraph = function () {
        return graph;
    }

    this.styleDomainGraph = function (cypherres) {
        var inner = getDecendentWithAttribute(
            getChildWithAttribute(cypherres, "class", "outer"),
            "class", "inner");
        var graph = getDecendentWithAttribute(inner, "ng-controller", "D3GraphCtrl");
        var gelem = NEO_DOC.defaultView.angular.element(graph);
        //var ctrl = gelem.controller();
        //var gview = ctrl.getGraphView();
        var gscope = gelem.scope();
        if (gscope != null) {
            var app_inj = gelem.injector();
            var gStyle = app_inj.get("GraphStyle");
            if (gscope.style != null) {
                //nodes
                JC_GRAPH_UTIL.setStyle("node", ["CLASS"], [["color", "#019a01"], ["diameter", "60px"]], gscope, gStyle);
                JC_GRAPH_UTIL.setStyle("node", ["ABSTRACT_CLASS"], [["color", "#7b8000"]], gscope, gStyle);
                JC_GRAPH_UTIL.setStyle("node", ["INTERFACE"], [["color", "#904aaa"]], gscope, gStyle);
                JC_GRAPH_UTIL.setStyle("node", ["ENUM"], [["color", "#b27b12"]], gscope, gStyle);

                // relationships
                JC_GRAPH_UTIL.setStyle("relationship", ["extends"], [["font-size", "18px"], ["shaft-width", "5px"], ["color", "#019a01"]],
                    gscope, gStyle);
                JC_GRAPH_UTIL.setStyle("relationship", ["implements"], [["font-size", "18px"], ["shaft-width", "5px"], ["color", "#904aaa"]],
                    gscope, gStyle);
            } else {
                var worker = new Worker("jcypher_gview/worker.js");
                worker.onmessage = function (e) {
                    JC_MAIN.getDomainGraph().styleDomainGraph(cypherres);
                };
                worker.postMessage(20);
            }
        }
        return;
    }

    //private methods
    var getCreateNode = function (fullName, nodes) {
        var node = nodes.get(fullName);
        if (node == null) {
            node = {};
            node.id = nodes.size;
            nodes.set(fullName, node);
        }
        return node;
    }

    var createLink = function (sourceNd, target, nodes, links, typ) {
        if (!target.startsWith("java")) {
            var link = {};
            link.id = links.length;
            link.startNode = sourceNd.id;
            link.endNode = getCreateNode(target, nodes).id;
            link.type = typ;
            link.properties = {
                modelElem: true
            };
            links.push(link);
        }
    }

    var createGNode = function (typ, nodes, links) {
        var node = null;
        var segs = typ.name.split('.');
        if (segs[0] != "java") { // don't show java internal classes
            node = getCreateNode(typ.name, nodes);
            var pkg = "";
            var nm = segs[segs.length - 1];
            var j;
            for (j = 0; j < segs.length - 1; j++) {
                if (j > 0)
                    pkg = pkg + '.';
                pkg = pkg + segs[j];
            }
            node.labels = [typ.kind];
            var kv = {};
            kv["name"] = nm;
            kv["fullName"] = typ.name;
            kv["modelElem"] = true;
            node.properties = kv;
            if (typ.extends != null) {
                for (j = 0; j < typ.extends.length; j++)
                    createLink(node, typ.extends[j], nodes, links, "extends");
            }
            if (typ.implements != null) {
                for (j = 0; j < typ.implements.length; j++)
                    createLink(node, typ.implements[j], nodes, links, "implements");
            }
            if (typ.fields != null && typ.kind != "ENUM") {
                for (j = 0; j < typ.fields.length; j++) {
                    var buildIn = typ.fields[j].buildIn;
                    if (!buildIn) {
                        var trgt = typ.fields[j].componentType != null ? typ.fields[j].componentType : typ.fields[j].type;
                        createLink(node, trgt, nodes, links, typ.fields[j].name);
                    }
                }
            }
        }
        return node;
    }

    // init the domain graph
    var graph = new NEO_DOC.defaultView.neo.models.Graph();
    var conv = ctxt.cypherGraphModel.convertNode();
    var rconv = ctxt.cypherGraphModel.convertRelationship(graph);
    var gnds = [];
    var nodes = new Map();
    var links = [];
    var i;
    for (i = 0; i < domainModel.types.length; i++) {
        var nd = createGNode(domainModel.types[i], nodes, links);
        if (nd != null) {
            var gnd = conv(nd);
            gnds.push(gnd);
        }
    }
    graph.addNodes(gnds);
    graph.addRelationships(links.map(rconv));
}