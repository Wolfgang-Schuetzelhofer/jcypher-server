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
    //alert("script executing");
    NEO_DOC = null;
    NEO_WINDOW = null;
    DOLLAR_Q = null;
    OPEN_MODEL_DLG = null;
    //private
    var jc_main = function () {
        //public vars
        this.INIT_DELETE = false;
        this.ACTIVE_TAB = null;
        this.INIT_INTERCEPTS = false;

        //private vars
        var domainModel = null;
        var domainGraph = null;
        var domainName = null;
        var dbName = null;
        var domainModelActions = {
            org: {},
            nodeDblClicked: function (nd) {
                OPEN_MODEL_DLG = nd.propertyMap.fullName;
            },
            nodeDragToggle: function (nd) {
                JC_GRAPH_TOOLS.nodeDragged(nd);
                return domainModelActions.org.nodeDragToggle(nd);
            }
        };

        // public methods
        this.getDBName = function () {
            return dbName;
        }

        this.getDomainName = function () {
            return domainName;
        }

        this.getDomainModel = function () {
            return domainModel;
        }

        this.getDomainModelElement = function (typeName) {
            var i;
            for (i = 0; i < domainModel.types.length; i++) {
                if (domainModel.types[i].name == typeName)
                    return domainModel.types[i];
            }
            return null;
        }

        this.setGraphDB = function (db) {
            if (db != dbName) {
                JC_UI_UTIL.showGlassPane();
                dbName = db;
                domainModel = null;
                domainGraph = null;
                domainName = null;
                var gv = document.getElementById("graph_view");
                JC_INIT.clearDomainViews();
                JC_OverlayDialog.closeDialogsOfType("typeDialog");
                $(gv).empty();
                // test if we can connect to the neo db
                $.get("/browser", function () {
                    var iframe = document.createElement('iframe');
                    iframe.onload = function (dat) {
                        JC_INIT.initNeo();
                    }; // before setting 'src'
                    iframe.setAttribute("class", "gvis-neo-frame");
                    iframe.setAttribute("id", "neoframe");
                    iframe.setAttribute("src", "/browser/jc__db/" + dbName);
                    gv.appendChild(iframe);
                }).error(function () {
                    //alert('Error connecting to db: ' + dbName);
                    JC_UI_UTIL.hideGlassPane();
                    JC_UI_UTIL.alert("<b>Error</b>", 'Connecting to database: <b>' + dbName + '</b>', 2);
                });
            }
        }

        this.setDomainName = function (dn, container) {
            if (dn != domainName) {
                domainModel = null;
                domainGraph = null;
                domainName = dn;
                if (domainName != null) {
                    if (domainModel == null) {
                        JC_REST.loadModel(dbName, domainName, function (data) {
                            domainModel = data;
                            JC_DomainTypeTree.createModelTree(container, domainModel);
                        });
                    } else {
                        JC_DomainTypeTree.createModelTree(container, domainModel);
                    }
                }
            }
        }

        this.clearDomain = function () {
            domainName = null;
            domainModel = null;
            domainGraph = null;
        }

        this.getDomainGraph = function (ctxt) {
            if (domainGraph == null) {
                if (domainModel == null)
                    alert("No Domain Model available");
                else
                    domainGraph = new DomainGraph(domainModel, ctxt);
            }
            return domainGraph;
        }

        this.getModelNodeActions = function () {
            return domainModelActions;
        }

        this.getScope = function (elem) {
            var cw = document.getElementById("neoframe").contentWindow;
            var scope = cw.angular.element(elem).scope();
            return scope;
        }

        this.getRootScope = function (scope) {
            var scp = scope;
            while (scp.$parent != null)
                scp = scp.$parent;
            return scp;
        }
    };
    // makes JC_MAIN global
    JC_MAIN = new jc_main();
}();