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
    var jc_init = function () {
        TEST_MODE = false;

        // public methods
        this.loadSampleData = function () {
            JC_INIT.clearDomainViews();
            JC_REST.loadSampleData(JC_MAIN.getDBName(), "sample_01", function (data) {
                JC_REST.loadDomains(JC_MAIN.getDBName(), function (data) {
                    var ui = JC_ListSelExpandUI.getListSelExpandUI("jcvis-dmodel");
                    ui.setModelList(data);
                });
            });
        }

        this.clearDomainViews = function () {
            JC_MAIN.clearDomain();
            JC_ListSelExpandUI.getListSelExpandUI("jcvis-dmodel").initModelList();
            var tab = JC_UI_UTIL.findTab("domain model");
            if (tab != null)
                JC_UI_UTIL.closeTab(tab);
        }

        this.init = function () {
            JC_UI_UTIL.showGlassPane();
            if (TEST_MODE) {
                var to = $(document.body).find(".test-only");
                for (var i = 0; i < to.length; i++) {
                    to[i].style.display = "block";
                }
            }

            $('#dlg-confirm').on('show.bs.modal', function (e) {
                $(this).focus(function () {
                    $(this).find('.btn-ok').focus();
                });
                var clk = $(e.relatedTarget).data('clk');
                $(this).find('.modal-header').html($(e.relatedTarget).data('head'));
                $(this).find('.modal-body').html($(e.relatedTarget).data('body'));
                $(this).find('.btn-ok').attr('onclick', clk);
                return;
            })

            JC_ListSelExpandUI.create("Graph Database(s)", "jcvis-graphDBs", function (list) {
                // the function to return list items
                var ret = [];
                var i;
                for (i = 0; i < list.length; i++) {
                    ret.push(list[i].name);
                }
                return ret;
            }, function (mdl) {
                // the function called when a list item is selected
                JC_MAIN.setGraphDB(mdl.name);
            }, function (idx, mdlList, container) {
                // build the expandable model view
                $(container).empty();
                var root = document.createElement("ul");
                $(root).addClass("list-group");
                container.appendChild(root);
                var i;
                for (i = 0; i < mdlList.length; i++) {
                    var li = document.createElement("li");
                    var div = document.createElement("div");
                    div.textContent = mdlList[i].name;
                    li.appendChild(div);
                    div = document.createElement("div");
                    div.textContent = mdlList[i].url;
                    li.appendChild(div);
                    $(li).addClass("list-group-item");
                    root.appendChild(li);
                }
            });

            JC_ListSelExpandUI.create("Domain Model(s)", "jcvis-dmodel", function (list) {
                // the function to return list items
                return list;
            }, function (mdl) {
                // the function called when a list item is selected
                // all is done in the next function
            }, function (idx, mdlList, container) {
                // build the expandable model view
                JC_MAIN.setDomainName(mdlList[idx], container);
            }, function (additions) {
                var sg = JC_TemplateUtil.loadTemplate("ShowGraph");
                $(sg).click(function (event) {
                    JC_CommandExecutor.execDomainModel();
                });
                additions.parentNode.insertBefore(sg, additions);
                additions.parentNode.removeChild(additions);
            });

            JC_REST.loadGraphDBConfigs(function (data) {
                var ui = JC_ListSelExpandUI.getListSelExpandUI("jcvis-graphDBs");
                ui.setModelList(data);
            });

            $(window).resize(function () {
                JC_GRAPH_TOOLS.windowResized();
            });
        }

        this.initNeo = function () {
            NEO_DOC = neoFrameRef();
            NEO_WINDOW = NEO_DOC.defaultView;
            var cw = document.getElementById("neoframe").contentWindow;
            $(NEO_DOC).on("dblclick", function (evt) {
                if (OPEN_MODEL_DLG != null) {
                    var full = OPEN_MODEL_DLG;
                    OPEN_MODEL_DLG = null;
                    var pos = {};
                    var gv = $('#graph_view');
                    pos.x = evt.pageX - $(document.documentElement).scrollLeft() + gv.offset().left - gv.scrollLeft();
                    pos.y = evt.pageY - $(document.documentElement).scrollTop() + gv.offset().top - gv.scrollTop();
                    //var style = window.getComputedStyle(trgt, null).getPropertyValue('font-size');
                    //var fontSize = parseFloat(style);
                    //pos.x = pos.x + fontSize * 2;
                    var dlg = JC_TypeDialog.getCreate(full, pos, {
                        x: 2,
                        y: -1
                    });
                }
            });
            var html = NEO_DOC.documentElement;
            var app_inj = cw.angular.element(html).injector();
            DOLLAR_Q = app_inj.get('$q');
            document.getElementById("test_button_all").disabled = false;
            document.getElementById("test_button_person").disabled = false;
            document.getElementById("test_button_test").disabled = false;
            JC_MAIN.INIT_DELETE = false;
            JC_MAIN.INIT_INTERCEPTS = false;
            JC_REST.loadDomains(JC_MAIN.getDBName(), function (data) {
                var ui = JC_ListSelExpandUI.getListSelExpandUI("jcvis-dmodel");
                ui.setModelList(data);
            });
            // intercept layout
            var jcForce = new JC_GRAPH_UTIL.jc_layoutForce();
            JC_UI_UTIL.hideGlassPane();
        }

        //private mathods
        var neoFrameRef = function () {
            var frameRef = document.getElementById("neoframe");
            return frameRef.contentWindow ? frameRef.contentWindow.document : frameRef.contentDocument
        }
    };
    // makes JC_INIT global
    JC_INIT = new jc_init();
}();