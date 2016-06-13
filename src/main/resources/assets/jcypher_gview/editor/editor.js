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
        var startEditElem = null;

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
                        showProposal(trgt);
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
        // type: 0..OK, 1..CANCEL; value: id of selected
        var proposalClosed = function (type, mdlElem, prop, edElem) {
            hideProposal();
            if (type == 0) { // OK
                if (edElem.elemType == langModel.getELEM_TYPE().ADD) { // new content added
                    edElem.elemType = edElem.modelElem.jc__elemType;
                    edElem.tokenName = prop;
                    var prev = $(edElem.uiElements[0]);
                    var par = edElem.uiElements[0].parentElement;
                    var anchr = $("<span>Hi Anchor</span>");
                    anchr.insertBefore(prev);
                    prev = anchr;
                    if (edElem.modelElem.jc__elemType == langModel.getELEM_TYPE().LANG_ELEM ||
                        edElem.modelElem.jc__elemType == langModel.getELEM_TYPE().REF_MODEL_TYPE) {
                        edElem.modelElem = mdlElem;
                        // add assignment if required
                        var addAss = mdlElem.assignIfFirst == null ? false : mdlElem.assignIfFirst;
                        if (addAss && edElem.isFirstInLine()) {
                            var assMdl = langModel.createAssignment(mdlElem);
                            var ass = ui_fact.createUIElem("Token", null, null, "glyphicon glyphicon-plus " + langModel.getDISPLAY_TYPE().L_ADD_REQU);
                            var uis = [ass].concat(createUIElems(assMdl.displayInf));
                            var assElem = new editElement(uis, langModel.getELEM_TYPE().ADD, assMdl);
                            edElem.insertBeforeMe(assElem);
                            prev = insertUIElements(uis, prev);
                        }

                        $.each(edElem.uiElements, function (idx, val) {
                            val.jc_editElem = null;
                            val.remove();
                        });
                        edElem.uiElements = []; //clear
                        if (mdlElem.displayPref != null)
                            prev = createInsertUIElements(mdlElem.displayPref, prev, edElem);

                        var chlds = edElem.modelElem.next.getChildren();
                        if (chlds != null && chlds.length > 0) {
                            var chld = chlds[0];
                            var requ = chld.jc__required;
                            var dTyp = requ ? langModel.getDISPLAY_TYPE().L_ADD_REQU :
                                langModel.getDISPLAY_TYPE().L_ADD_OPT;
                            var add = ui_fact.createUIElem("Token", null, null, "glyphicon glyphicon-plus " + dTyp);
                            var eElem = new editElement([add], langModel.getELEM_TYPE().ADD, chlds[0]);
                            edElem.addChild(eElem);
                            prev = insertUIElements([add], prev);
                        }

                        if (mdlElem.displayPostf != null)
                            prev = createInsertUIElements(mdlElem.displayPostf, prev, edElem);
                        var nxt = edElem.modelElem.next.getNext();
                        if (nxt != null) {

                        }
                    } else if (mdlElem.jc__elemType == langModel.getELEM_TYPE().ASSIGNMENT) {
                        return;
                    }
                    anchr.remove();
                }
            }
            return;
        }

        var createInsertUIElements = function (elems, prev, edElem) {
            $.each(elems, function (idx, val) {
                var add = $(ui_fact.createUIElem("Token", null, null, val.displayType));
                add.text(val.text);
                edElem.uiElements.push(add[0]);
                add.insertAfter(prev);
                prev = add;
            })
            return prev;
        }

        var createUIElems = function (elems) {
            var ret = [];
            for (var i = 0; i < elems.length; i++) {
                var ui = $(ui_fact.createUIElem("Token", null, null, elems[i].displayType));
                ui.text(elems[i].text);
                ret.push(ui[0]);
            }
            return ret;
        }

        var insertUIElements = function (uiElems, prev) {
            $.each(uiElems, function (idx, val) {
                $(val).insertAfter(prev);
                prev = $(val);
            })
            return prev;
        }

        var showProposal = function (atElem) {
            var edElem = atElem.jc_editElem;
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
            var sbox = $(prop).find(".searchbox");
            sbox.focus();
        }

        // calculate the proposal based on the model
        var fillBody = function (pBody, edElem) {
            var mdlElem = edElem.modelElem;
            if (mdlElem.jc__elemType == langModel.getELEM_TYPE().LANG_ELEM ||
                mdlElem.jc__elemType == langModel.getELEM_TYPE().REF_MODEL_TYPE) {
                var sel;
                var mdlElems = [];
                var props = [];

                sel = ui_fact.createUIElem("ProposalSelect");
                var selectr = $(sel);
                var idx = 0;
                if (mdlElem != null) {
                    $.each(mdlElem, function (prop, val) {
                        if (prop.indexOf("jc__") != 0) {
                            var propsl = val.proposal != null ? val.proposal : prop;
                            selectr.append("<option value='" + idx + "'>" + propsl + "</option>");
                            props.push(prop);
                            mdlElems.push(val);
                            idx++;
                        }
                    });
                }

                var sl = ui_fact.createUIElem("StatementLine");
                $(sl).css("width", "30em");
                sl.appendChild(sel);
                pBody.appendChild(sl);
                var opts = {
                    onClose: proposalClosed,
                    modelElements: mdlElems,
                    properties: props,
                    editElement: edElem
                };
                $(sl).jctinyselect(opts);
            } else if (mdlElem.jc__elemType == langModel.getELEM_TYPE().ASSIGNMENT) {
                var fill = ui_fact.createUIElem("ProposalFill");
                $(fill).css("width", "20em");
                pBody.appendChild(fill);
                var opts = {
                    onClose: proposalClosed,
                    editElement: edElem
                };
                new jcinput(fill, opts).init();
            }
        }

        var hideProposal = function () {
            var prop = ui_fact.getProposalDialog();
            if (prop.parentNode != null)
                prop.parentNode.removeChild(prop);
            $(prop).children(".prop-body").empty();
        }

        var initStatements = function (stmtContainer) {
            if (content == null) { // empty
                var sl = ui_fact.createUIElem("StatementLine");
                var add = ui_fact.createUIElem("Token", null, null, "glyphicon glyphicon-plus " + langModel.getDISPLAY_TYPE().L_ADD_OPT);
                sl.appendChild(add);
                startEditElem = new editElement([sl], langModel.getELEM_TYPE().LINE, langModel.firstLine); // first line
                var elem = new editElement([add], langModel.getELEM_TYPE().ADD, langModel.firstLine.getChildren()[0]);
                startEditElem.addChild(elem);
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
    var editElement = function (uiElems, el_type, mdlElem) {
        var nextConcat = null;
        var prevConcat = null;
        var prevSibling = null;
        var nextSibling = null;
        var children = null;
        var parent = null;

        //public
        var self = this;
        if (uiElems != null)
            $.each(uiElems, function (idx, val) {
                val.jc_editElem = self
            });
        this.uiElements = uiElems;
        this.elemType = el_type;
        // only initialized on line
        this.modelElem = mdlElem;
        this.tokenName = null;

        this.addChild = function (elem) {
            if (children == null)
                children = [];
            children.push(elem);
            elem.parent = this;
        }

        this.insertChildBefore = function (newChild, before) {
            if (children == null)
                children = [];
            var idx = children.indexOf(before);
            if (idx >= 0)
                children.splice(idx, 0, newChild);
            else
                children.push(newChild);
            newChild.parent = this;
        }

        this.isFirstInLine = function () {
            return this.prevConcat == null && this.prevSibling == null &&
                this.parent != null && this.parent.elemType == "LINE";
        }

        this.insertBeforeMe = function (edElem) {
            if (this.prevSibling != null) {
                this.prevSibling.nextSibling = edElem;
                edElem.prevSibling = this.prevSibling;
            }
            edElem.nextSibling = this;
            this.prevSibling = edElem;
            if (this.parent != null)
                this.parent.insertChildBefore(edElem, this);
        }
    }

    // makes JC_EditorFactory global
    JC_EditorFactory = new editorFactory("ed-templates");

}();