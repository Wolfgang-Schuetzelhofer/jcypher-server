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

    var ELEM_TYPE = {
        ADD: 0,
        LANG_ELEM: 1,
        LINE: 2,
        ASSIGNMENT: 3
    }

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
                edElem.modelElem = mdlElem.next;
                edElem.tokenName = prop;
                edElem.display = {
                    displayPref: mdlElem.displayPref,
                    displayPostf: mdlElem.displayPostf
                }
                var prev = edElem.uiElements[0].previousElementSibling;
                var par = edElem.uiElements[0].parentElement;

                // add assignment if required
                var addAss = mdlElem.assignIfFirst == null ? false : mdlElem.assignIfFirst;
                if (addAss && edElem.isFirstInLine()) {
                    var assMdl = langModel.createAssignment(mdlElem);
                    var ass = ui_fact.createUIElem("Token", null, null, "glyphicon glyphicon-plus " + langModel.getDISPLAY_TYPE().L_ADD_REQU);
                    var uis = [ass].concat(createUIElems(assMdl.displayInf));
                    var assElem = new editElement(uis, ELEM_TYPE.ASSIGNMENT, langModel.firstLine.getChildren()[0]);
                    $.each(uis, function (idx, val) {
                        val.jc_editElem = assElem;
                    })
                    edElem.insertBeforeMe(assElem);
                }

                edElem.elemType = ELEM_TYPE.LANG_ELEM;
                $.each(edElem.uiElements, function (idx, val) {
                    val.remove();
                });
                if (edElem.display.displayPref != null)
                    prev = insertUIElements(edElem.display.displayPref, prev, par, edElem);

                var nextAdd = null;
                var chlds = edElem.modelElem.getChildren();
                if (chlds != null && chlds.length > 0) {
                    var chld = chlds[0];
                    var requ = (chld.jc_required == null) ? true : chld.jc_required;
                    var dTyp = requ ? langModel.getDISPLAY_TYPE().L_ADD_REQU :
                        langModel.getDISPLAY_TYPE().L_ADD_OPT;
                    var add = ui_fact.createUIElem("Token", null, null, "glyphicon glyphicon-plus " + dTyp);
                    var eElem = new editElement([add], ELEM_TYPE.ADD, chlds[0]);
                    add.jc_editElem = eElem;
                    edElem.addChild(eElem);
                    prev = insertUIElement(add, prev, par);
                    nextAdd = add;
                }

                if (edElem.display.displayPostf != null)
                    prev = insertUIElements(edElem.display.displayPostf, prev, par, edElem);
                var nxt = edElem.modelElem.getNext();
                if (nxt != null) {

                }

                if (nextAdd != null)
                    showProposal(nextAdd);

            }
            return;
        }

        var insertUIElements = function (elems, prev, par, edElem) {
            $.each(elems, function (idx, val) {
                var add = $(ui_fact.createUIElem("Token", null, null, val.displayType));
                add.text(val.text);
                add[0].jc_editElem = edElem;
                if (prev != null)
                    add.insertAfter($(prev));
                else
                    $(par).append(add);
                prev = add[0];
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

        var insertUIElement = function (uiElem, prev, par) {
            if (prev != null)
                $(uiElem).insertAfter($(prev));
            else
                $(par).append(uiElem);
            prev = uiElem;
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
            if (edElem.elemType == ELEM_TYPE.ADD) {
                var mdlElem = edElem.modelElem;
                var sel;
                var mdlElems = [];
                var props = [];

                sel = ui_fact.createUIElem("ProposalSelect");
                var selectr = $(sel);
                var idx = 0;
                if (mdlElem != null) {
                    $.each(mdlElem, function (prop, val) {
                        if (prop != "jc_required") {
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
                startEditElem = new editElement([sl], ELEM_TYPE.LINE, langModel.firstLine); // first line
                var elem = new editElement([add], ELEM_TYPE.ADD, langModel.firstLine.getChildren()[0]);
                add.jc_editElem = elem;
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
        this.uiElements = uiElems;
        this.elemType = el_type;
        // only initialized on line
        this.modelElem = mdlElem;
        this.tokenName = null;
        this.displayInfo = null;

        this.addChild = function (elem) {
            if (children == null)
                children = [];
            children.push(elem);
            elem.parent = this;
        }
        
        this.insertChildBefore(newChild, before) {
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
                this.parent != null && this.parent.elemType == ELEM_TYPE.LINE;
        }

        this.insertBeforeMe function (edElem) {
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