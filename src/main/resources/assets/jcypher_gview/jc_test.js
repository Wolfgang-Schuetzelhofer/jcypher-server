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

function node_dbl_click(orgFunct) {
    // private
    var orgFunction = orgFunct;

    //public
    this.doubleClicked = function (nd) {
        alert("node: " + nd.id + " double clicked");
        orgFunction(nd);
    }
}

function test() {
    var doc = NEO_DOC;
    var leftbar = NEO_DOC.getElementById("leftbar");
    var scp = JC_MAIN.getScope(leftbar);
    // see controllers/Sidebar.coffee
    // scp has functions playDocument and importDocument(content, name)
    // importDocument must have name with extension .grass !!

    var fullscreenContainer = getDecendentWithAttribute(NEO_DOC.body, "class", "fullscreen-container");
    var cypherres = getDecendentWithAttribute(fullscreenContainer, "ng-controller", "CypherResultCtrl");
    var inner = getDecendentWithAttribute(
        getChildWithAttribute(cypherres, "class", "outer"),
        "class", "inner");
    var graph = getDecendentWithAttribute(inner, "ng-controller", "D3GraphCtrl");
    var inspect = getDecendentWithAttribute(inner, "ng-controller", "InspectorCtrl");
    var gscope = JC_MAIN.getScope(graph);

    var iscope = JC_MAIN.getScope(inspect);
    var rootScope = JC_MAIN.getRootScope(gscope);
    var cw = document.getElementById("neoframe").contentWindow;

    // get angular element (e.g from an element with ng-controller)
    var gelem = cw.angular.element(graph);

    // get and call service
    var inj = gelem.injector();
    var srv = inj.get("GraphExplorer");
    var module = cw.angular.module('neo4jApp')
    var module_2 = cw.angular.module('neo4jApp.services');

    var html = cw.document.documentElement;
    var app_inj = cw.angular.element(html).injector();
    var mdule_2_inj = module_2.injector;
    var cypher = app_inj.get('Cypher');
    var frame = app_inj.get('Frame');

    // get controller, call controller functions
    var ctrl = gelem.controller();
    var gview = ctrl.getGraphView();
    var callbacks = gview.callbacks;
    var dblClicked = callbacks["nodeDblClicked"];
    var dbclAct = new node_dbl_click(dblClicked[0]);
    dblClicked[0] = dbclAct.doubleClicked;

    var neo = cw.neo;
    var frc = new neo.layout.force();
    var d3Force = cw.d3.layout.force();
    if (gscope != null) {
        /*
                var styl = JC_GRAPH_UTIL.findStyleFor("node", "Collection", gscope.style);
                if (styl != null) {
                    styl.props.diameter = "10px";
                }*/
    }
    return;
}

function testAll() {
    JC_CommandExecutor.execCypherQuery("MATCH (n) RETURN n LIMIT 100");
    return;
}

function testQuery() {
    var pos = {x: 300, y: 150};
    var dlg = JC_QueryDialog.getCreate("TestQuery", pos, {
        x: 0,
        y: 0
    });
    return;
}

function testPerson() {
    JC_CommandExecutor.execCypherQuery("MATCH (n:Person) RETURN n LIMIT 100");
}