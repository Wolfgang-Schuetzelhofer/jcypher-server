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
    //alert("jc_ui executing");

    /***********************************************/
    var editorFactory = function (importId) {
        //private
        var ui_fact = new ui_factory(importId);

        //public
        // content may be null
        this.createEditor = function (langModel, content) {
            return new jc_editor(langModel, content, ui_fact);
        }
    }

    /***********************************************/
    // cont (content) may be null
    var jc_editor = function (lmdl, cont, fact) {
        //private
        var langModel = lmdl;
        var content = cont;
        var ui_fact = fact;
        var firstLine = null;

        var statementContainer = null;

        //public
        this.getStatementContainer = function () {
            if (statementContainer == null) {
                statementContainer = ui_fact.createUIElem("EditorBody", "500px");
                statementContainer.jc_editor = this;
                $(statementContainer).click(function (event) {
                    var trgt = event.target;
                    var edElem = trgt.jc_editElem;
                    if (edElem != null) {
                        showProposal(edElem);
                    }
                    return;
                });
                initStatements(statementContainer);
            }
            return statementContainer;
        }

        this.editorClosed = function () {
            hideProposal();
        }

        this.editorMoved = function (typ, dx, dy) {
            var prop = ui_fact.getProposalDialog();
            if (prop.parentNode != null) {
                if (typ == 0) {
                    prop.startPos = {};
                    var bodyRect = document.body.getBoundingClientRect(),
                        elemRect = prop.getBoundingClientRect();
                    prop.startPos.sx = elemRect.left - bodyRect.left;
                    prop.startPos.sy = elemRect.top - bodyRect.top;
                } else if (typ == 1) {
                    prop.style.left = prop.startPos.sx + dx + "px";
                    prop.style.top = prop.startPos.sy + dy + "px";
                } else if (typ == 2)
                    prop.startPos = null;
            }
        }

        //private
        var showProposal = function (edElem) {
            var atElem = edElem.uiElement;
            var bodyRect = document.body.getBoundingClientRect();
            var rect = atElem.getBoundingClientRect();
            var px = rect.left + (rect.right - rect.left) / 2 - bodyRect.left;
            var py = rect.bottom - bodyRect.top;

            var prop = ui_fact.getProposalDialog();
            if (prop.parentNode != null)
                prop.parentNode.removeChild(prop);
            var pBody = $(prop).children(".prop-body")[0];
            $(pBody).empty();
            /****** fill body *****/
            fillBody(pBody, edElem);
            /***********/

            $(prop).css("visibility", "hidden");
            document.body.appendChild(prop);
            var ptrRect = $(prop).find(".prop-head-in")[0].getBoundingClientRect();
            var propRect = prop.getBoundingClientRect();
            var dLeft = (ptrRect.left + (ptrRect.right - ptrRect.left) / 2) - propRect.left;
            var dTop = ptrRect.top - propRect.top;

            px = px - dLeft + "px";
            py = py - dTop + "px";

            $(prop).css({
                "left": px,
                "top": py
            });
            $(prop).css("visibility", "visible");
        }
        
        var fillBody = function(pBody, edElem) {
            var sl = ui_fact.createUIElem("StatementLine");
            $(sl).css("width", "300px");
            var add = ui_fact.createUIElem("Token", null, null, "glyphicon glyphicon-asterisk");
            sl.appendChild(add);
            pBody.appendChild(sl);
        }

        var hideProposal = function () {
            var prop = ui_fact.getProposalDialog();
            if (prop.parentNode != null)
                prop.parentNode.removeChild(prop);
        }

        var initStatements = function (stmtContainer) {
            if (content == null) { // empty
                var sl = ui_fact.createUIElem("StatementLine");
                var add = ui_fact.createUIElem("Token", null, null, "glyphicon glyphicon-plus ed-add-opt");
                sl.appendChild(add);
                firstLine = new editElement(sl);
                var elem = new editElement(add);
                add.jc_editElem = elem;
                firstLine.setChild(add);
                ui_fact.getTemplateUtil().tmplAppendChildren(stmtContainer, [sl], "ed-statements");
            } else { // has content

            }
        }
    }

    /***********************************************/
    var ui_factory = function (importId) {
        //private
        var templateUtil = JC_TemplateUtil.createTemplateUtil(importId);
        var refFontSize = null;
        var proposalDialog = null;

        //public
        this.createUIElem = function (templId, width, height, clazzes) {
            var ret = templateUtil.loadTemplate(templId);
            if (width != null)
                ret.style.width = width;
            if (height != null)
                ret.style.height = height;
            if (clazzes != null)
                $(ret).addClass(clazzes);
            return ret;
        }

        this.getTemplateUtil = function () {
            return templateUtil;
        }

        this.getProposalDialog = function () {
            if (proposalDialog == null) {
                proposalDialog = this.createUIElem("ProposalDialog");
            }
            return proposalDialog;
        }

        this.getRefFontSize = function () {
            if (refFontSize == null)
                refFontSize = parseFloat(window.getComputedStyle(document.body, null).getPropertyValue('font-size'));
            return refFontSize;
        }
    }

    /***********************************************/
    var editElement = function (uiElem) {
        var nextOnLevel = null;
        var prevOnLevel = null;
        var firstChild = null;
        var parent = null;
        
        //public
        this.uiElement = uiElem;
        
        this.setChild = function(elem) {
            firstChild = elem;
            elem.parent = this;
        }
    }

    // makes JC_EditorFactory global
    JC_EditorFactory = new editorFactory("ed-templates");

}();