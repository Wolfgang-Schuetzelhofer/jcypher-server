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
        var dslModelBase = null;

        //public
        // content may be null
        this.createEditor = function (langModel, content) {
            return new jc_editor(langModel, content, ui_fact);
        }

        this.getDSLModelBase = function () {
            if (dslModelBase == null)
                dslModelBase = new DSLModelBase();
            return dslModelBase;
        }
    }

    /***********************************************/
    // cont (content) may be null
    var jc_editor = function (lmdl, cont, fact) {
        //private
        var DISPLAY_TYPE = {
            L_ADD: "ed-add",
            L_ADD_OPT: "ed-add ed-add-opt",
            L_ADD_REQU: "ed-add ed-add-requ"
        }
        var langModel = lmdl;
        var content = cont;
        var ui_fact = fact;
        var firstLineElem = null;
        var proposalOpen = false;
        var clickListener = null;

        var statementContainer = null;
        var marked = null;
        var prevMarked = null;
        var markAddsOnly = true;

        JC_MAIN.setClickListener(this);
        JC_MAIN.setKeydownListener(this);

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
            JC_MAIN.setClickListener(null);
            JC_MAIN.setKeydownListener(null);
        }

        this.actOnClick = function (e) {
            if (clickListener != null)
                clickListener.actOnClick(e);
            return;
        }

        this.actOnKeydown = function (e) {
            if (!proposalOpen) {
                var c = e.which;
                switch (c) {
                case 37: // left
                    markNext(false);
                    break;

                case 38: // up
                    markFirstInNextLine(false);
                    break;

                case 39: // right
                    markNext(true);
                    break;

                case 40: // down
                    markFirstInNextLine(true);
                    break;

                case 27: // esc
                    break;

                case 13: // enter
                    if (marked != null) {
                        showProposal(marked.uiElements[0]);
                    }
                    break;

                default:
                    return; // exit this handler for other keys
                }
                e.preventDefault(); // prevent the default action (scroll / move caret)
            }
            return;
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
        // type: 0..OK, 1..CANCEL, 2..SKIP; value: id of selected
        var proposalClosed = function (type, mdlElem, prop, edElem) {
            hideProposal();
            if (type == 0) { // OK
                hideMark();
                if (edElem.elemType == JC_EditorFactory.getDSLModelBase().ELEM_TYPE.ADD) { // new content added
                    edElem.elemType = edElem.modelElem.jc__elemType;
                    edElem.tokenName = prop;
                    var prev = $(edElem.uiElements[0]);
                    var par = edElem.uiElements[0].parentElement;
                    var pchlds = $(par).children();
                    var firstInLine = pchlds.length == 1 &&
                        pchlds.index(prev) == 0;
                    var anchr = $("<span>Hi Anchor</span>");
                    anchr.insertBefore(prev);
                    prev = anchr;
                    if (edElem.modelElem.jc__elemType == JC_EditorFactory.getDSLModelBase().ELEM_TYPE.LANG_ELEM ||
                        edElem.modelElem.jc__elemType == JC_EditorFactory.getDSLModelBase().ELEM_TYPE.REF_MODEL_TYPE ||
                        edElem.modelElem.jc__elemType == JC_EditorFactory.getDSLModelBase().ELEM_TYPE.REF_VARIABLE) {
                        edElem.modelElem = mdlElem;
                        // add assignment if required
                        var addAss = mdlElem.assignIfFirst == null ? false : mdlElem.assignIfFirst;
                        if (addAss && edElem.isFirstInLine()) {
                            var assMdl = langModel.createAssignment();
                            var ass = ui_fact.createUIElem("Token", null, null, "glyphicon glyphicon-plus " + DISPLAY_TYPE.L_ADD_REQU);
                            var uis = [ass].concat(createUIElems(assMdl.displayInf));
                            var assElem = new editElement(uis, JC_EditorFactory.getDSLModelBase().ELEM_TYPE.ADD, assMdl);
                            edElem.insertSiblingBeforeMe(assElem);
                            prev = insertUIElements(uis, prev);
                        }

                        $.each(edElem.uiElements, function (idx, val) {
                            val.jc_editElem = null;
                            val.remove();
                        });
                        edElem.uiElements = []; //clear
                        if (mdlElem.displayPref != null)
                            prev = createInsertUIElements(mdlElem.displayPref, prev, edElem);

                        var chlds = edElem.modelElem.children instanceof Function ? edElem.modelElem.children(edElem) :
                            edElem.modelElem.children;
                        if (chlds != null && chlds.length > 0) {
                            var chld = chlds[0];
                            var requ = chld.jc__required;
                            var dTyp = requ ? DISPLAY_TYPE.L_ADD_REQU :
                                DISPLAY_TYPE.L_ADD_OPT;
                            var add = ui_fact.createUIElem("Token", null, null, "glyphicon glyphicon-plus " + dTyp);
                            var eElem = new editElement([add], JC_EditorFactory.getDSLModelBase().ELEM_TYPE.ADD, chld);
                            edElem.addChild(eElem);
                            prev = insertUIElements([add], prev);
                        }

                        if (mdlElem.displayPostf != null)
                            prev = createInsertUIElements(mdlElem.displayPostf, prev, edElem);
                        var nxt = edElem.modelElem.next instanceof Function ? edElem.modelElem.next(edElem) :
                            edElem.modelElem.next;
                        if (nxt != null) {
                            var requ = nxt.jc__required;
                            var dTyp = requ ? DISPLAY_TYPE.L_ADD_REQU :
                                DISPLAY_TYPE.L_ADD_OPT;
                            var add = ui_fact.createUIElem("Token", null, null, "glyphicon glyphicon-plus " + dTyp);
                            var eElem = new editElement([add], JC_EditorFactory.getDSLModelBase().ELEM_TYPE.ADD, nxt);
                            edElem.addConcat(eElem);
                            prev = insertUIElements([add], prev);
                        }
                    } else if (mdlElem.jc__elemType == JC_EditorFactory.getDSLModelBase().ELEM_TYPE.ASSIGNMENT ||
                        mdlElem.jc__elemType == JC_EditorFactory.getDSLModelBase().ELEM_TYPE.LITERAL) {
                        var add = $(edElem.uiElements[0]);
                        add.removeClass();
                        add.addClass(mdlElem.tokenClazz);
                        add.text(edElem.tokenName);
                    }
                    if (firstInLine)
                        addNewLine(statementContainer);
                    if (!editNext(anchr, anchr))
                        markNext(true);
                }
            } else if (type == 2) { // SKIP
                if (edElem.prevModelElem != null) {
                    edElem.modelElem = edElem.prevModelElem;
                    edElem.prevModelElem = null;
                }
                hideMark();
                editNext($(edElem.uiElements[0]), null);
            } else if (type == 1) { // CANCEL
                if (edElem.prevModelElem != null) {
                    edElem.modelElem = edElem.prevModelElem;
                    edElem.prevModelElem = null;
                }
            }
            return;
        }

        var editNext = function (strt, toRemove) {
            var ret = false;
            var nextAdd = strt.nextAll("." + DISPLAY_TYPE.L_ADD).eq(0);
            if (nextAdd.length == 0) { // try again from line start
                nextAdd = $(strt[0].parentElement)
                    .children("." + DISPLAY_TYPE.L_ADD).eq(0);
            }
            if (toRemove != null)
                toRemove.remove();
            if (nextAdd.length > 0) {
                showProposal(nextAdd[0]);
                ret = true;
            }
            return ret;
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
            hideMark();
            marked = edElem;
            showMark();
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
            proposalOpen = true;
        }

        // calculate the proposal based on the model
        var fillBody = function (pBody, edElem) {
            var mdlElem = edElem.modelElem;
            if (mdlElem.jc__elemType == JC_EditorFactory.getDSLModelBase().ELEM_TYPE.LANG_ELEM ||
                mdlElem.jc__elemType == JC_EditorFactory.getDSLModelBase().ELEM_TYPE.REF_MODEL_TYPE ||
                mdlElem.jc__elemType == JC_EditorFactory.getDSLModelBase().ELEM_TYPE.REF_VARIABLE) {
                var sel;
                var selectr;
                var mdlElems = [];
                if (mdlElem.jc__preselect != null) {
                    sel = ui_fact.createUIElem("ProposalRadio");
                    $(sel).css("width", "25em");
                    pBody.appendChild(sel);
                    selectr = $(sel).children(".jcradio-select");
                    var idx = 0;
                    $.each(mdlElem.jc__preselect, function (prop, val) {
                        if (prop.indexOf("jc__") != 0) {
                            var propsl = val.proposal != null ? val.proposal : prop;
                            selectr.append("<label class='radio'><input type='radio' name='group1' value='" + prop + "'>" + propsl + "</label>");
                            mdlElems.push(val);
                            idx++;
                        }
                    });
                    var opts = {
                        onClose: preselected,
                        modelElements: mdlElems,
                        editElement: edElem
                    };
                    new jcradio(sel, opts).init();
                } else {
                    var props = [];

                    sel = ui_fact.createUIElem("ProposalSelect");
                    selectr = $(sel);
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
                    $(sl).css("width", "25em");
                    sl.appendChild(sel);
                    pBody.appendChild(sl);
                    var opts = {
                        onClose: proposalClosed,
                        modelElements: mdlElems,
                        properties: props,
                        editElement: edElem
                    };
                    var tsel = [];
                    $(sl).jctinyselect(opts, tsel);
                    clickListener = tsel[0];
                }
            } else if (mdlElem.jc__elemType == JC_EditorFactory.getDSLModelBase().ELEM_TYPE.ASSIGNMENT ||
                mdlElem.jc__elemType == JC_EditorFactory.getDSLModelBase().ELEM_TYPE.LITERAL) {
                var fill = ui_fact.createUIElem("ProposalFill");
                $(fill).css("width", "25em");
                pBody.appendChild(fill);
                var opts = {
                    onClose: proposalClosed,
                    editElement: edElem
                };
                new jcinput(fill, opts).init();
            }
        }

        // type: 0..OK, 1..CANCEL, 2..SKIP; value: id of selected
        var preselected = function (type, mdlElem, prop, edElem) {
            if (type == 0) {
                var mdl = mdlElem.descriptor(edElem);
                edElem.prevModelElem = edElem.modelElem;
                edElem.modelElem = mdl;
                showProposal(edElem.uiElements[0]);
            } else
                proposalClosed(type, mdlElem, prop, edElem);
        }

        var hideProposal = function () {
            var prop = ui_fact.getProposalDialog();
            if (prop.parentNode != null)
                prop.parentNode.removeChild(prop);
            $(prop).children(".prop-body").empty();
            proposalOpen = false;
            clickListener = null;
        }

        var initStatements = function (stmtContainer) {
            if (content == null) { // empty
                addNewLine(stmtContainer);
            } else { // has content

            }
            markNext(true);
        }

        var hideMark = function () {
            if (marked != null) {
                setUnsetMark(marked, false); // unset
                prevMarked = marked;
                marked = null;
            }
        }

        var showMark = function () {
            if (marked != null)
                setUnsetMark(marked, true); // set
        }

        var markNext = function (forward) {
            hideMark();
            var sel = "." + DISPLAY_TYPE.L_ADD;
            var na = findNextElem(sel, forward);
            if (na != null)
                marked = na;
            else if (prevMarked != null)
                marked = prevMarked;
            showMark();
        }

        var markFirstInNextLine = function (forward) {
            hideMark();
            var sel = "." + DISPLAY_TYPE.L_ADD;
            var mrk = marked != null ? marked : prevMarked;
            var line = null;
            if (mrk == null) {
                line = firstLineElem;
                if (!forward) {
                    while (line.nextSibling != null)
                        line = line.nextSibling;
                }
            } else {
                line = mrk.getMyLine();
                if (forward)
                    line = line.nextSibling;
                else
                    line = line.prevSibling;
            }
            var na = null;
            while (na == null && line != null) {
                na = findFirstInLine(line, sel);
                if (na != null && na.length > 0)
                    na = na[0].jc_editElem;
                else
                    na = null;
                if (forward)
                    line = line.nextSibling;
                else
                    line = line.prevSibling;
            }
            if (na != null)
                marked = na;
            else if (prevMarked != null)
                marked = prevMarked;
            showMark();
        }

        // singleElem may be null (then mark group)
        var setUnsetMark = function (edElem, doSet) {
            var fe = edElem.uiElements[0];
            var isAdd = $(fe).hasClass(DISPLAY_TYPE.L_ADD);
            fe = isAdd ? fe : null;
            var sel = ".ed-marked";
            var isMarked = $(edElem.uiElements[0]).parent(sel).length > 0;
            if ((doSet && !isMarked) || (!doSet && isMarked)) {
                if (fe != null) {
                    markUnmarkGroup([fe], doSet);
                } else {
                    var groups = findGroups(edElem);
                    var i;
                    for (i = 0; i < groups.length; i++) {
                        markUnmarkGroup(groups[i], doSet);
                    }
                }
            }
        }

        var markUnmarkGroup = function (group, doMark) {
            if (doMark) {
                var mark = $("<span></span>").addClass("ed-marked");
                var i;
                for (i = 0; i < group.length; i++) {
                    var elem = $(group[i]);
                    if (i == 0)
                        mark.insertBefore(elem);
                    elem.detach().appendTo(mark);
                }
            } else {
                var mark = $(group[0]).parent(".ed-marked");
                if (mark.length > 0) {
                    var i;
                    for (i = group.length - 1; i >= 0; i--) {
                        var elem = $(group[i]);
                        elem.detach().insertAfter(mark);
                        if (i == 0)
                            mark.detach();
                    }
                }
            }
        }

        var findGroups = function (edElem) {
            var groups = [];
            var group = [];
            var i;
            var prev = null;
            for (i = 0; i < edElem.uiElements.length; i++) {
                var elem = edElem.uiElements[i];
                if (i == 0)
                    group.push(elem);
                else {
                    if (prev.nextElementSibling === elem)
                        group.push(elem);
                    else {
                        groups.push(group);
                        group = [];
                        group.push(elem);
                    }
                }
                prev = elem;
            }
            groups.push(group);
            return groups;
        }

        var findNextElem = function (sel, forward) {
            var mrk = marked != null ? marked : prevMarked;
            var nextElem;
            var line = null;
            if (mrk == null) {
                line = firstLineElem;
                if (forward) {
                    nextElem = findFirstInLine(line, sel);
                } else {
                    while (line.nextSibling != null)
                        line = line.nextSibling;
                    nextElem = findLastInLine(line, sel);
                }
            } else {
                line = mrk.getMyLine();
                if (forward)
                    nextElem = $(mrk.uiElements[0]).nextAll(sel).eq(0);
                else
                    nextElem = $(mrk.uiElements[0]).prevAll(sel).eq(0);
            }
            if (forward)
                line = line.nextSibling;
            else
                line = line.prevSibling;
            while (nextElem.length == 0 && line != null) {
                if (forward) {
                    nextElem = findFirstInLine(line, sel);
                    line = line.nextSibling;
                } else {
                    nextElem = findLastInLine(line, sel);
                    line = line.prevSibling;
                }
            }
            if (nextElem.length > 0)
                return nextElem[0].jc_editElem;
            return null;
        }

        var findFirstInLine = function (line, sel) {
            var el = line.children[0];
            return $(el.uiElements[0]).nextAll(sel).addBack(sel).eq(0);
        }

        var findLastInLine = function (line, sel) {
            var el = line.children[0];
            var elem = $(el.uiElements[0]).nextAll().last();
            if (elem.filter(sel).length == 1) // if the last one matches
                return elem;
            return elem.prevAll(sel).eq(0);
        }

        var addNewLine = function (stmtContainer) {
            var sl = ui_fact.createUIElem("StatementLine");
            var add = ui_fact.createUIElem("Token", null, null, "glyphicon glyphicon-plus " + DISPLAY_TYPE.L_ADD_OPT);
            sl.appendChild(add);
            var mdl;
            var lines = $(stmtContainer).find(".ed-statement-line");
            var prev = null;
            if (lines.length == 0) // first line
                mdl = langModel.getFirstLine();
            else {
                mdl = langModel.getFollowLine();
                prev = lines.last()[0].jc_editElem;
            }
            var sEditElem = new editElement([sl], JC_EditorFactory.getDSLModelBase().ELEM_TYPE.LINE, mdl);
            if (lines.length == 0) // first line
                firstLineElem = sEditElem;
            if (prev != null)
                prev.appendSibling(sEditElem);
            var chld = mdl.children instanceof Function ? mdl.children(sEditElem) : mdl.children;
            chld = chld != null ? chld[0] : null;
            var elem = new editElement([add], JC_EditorFactory.getDSLModelBase().ELEM_TYPE.ADD, chld);
            sEditElem.addChild(elem);
            ui_fact.getTemplateUtil().tmplAppendChildren(stmtContainer, [sl], "ed-statements");
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
        var self = this;
        if (uiElems != null)
            $.each(uiElems, function (idx, val) {
                val.jc_editElem = self
            });

        this.children = null;
        this.prevSibling = null;
        this.nextSibling = null;
        this.nextConcat = null;
        this.prevConcat = null;
        this.parent = null;
        this.uiElements = uiElems;
        this.elemType = el_type;
        // only initialized on line
        this.modelElem = mdlElem;
        this.tokenName = null;

        this.getMyLine = function () {
            if (this.elemType == "LINE")
                return this;
            var par = this.findParent();
            while (par != null && par.elemType != "LINE")
                par = par.findParent();
            return par;
        }

        this.findParent = function () {
            if (this.parent != null)
                return this.parent;
            if (this.prevConcat != null) {
                var pc = this.prevConcat;
                while (pc.prevConcat != null)
                    pc = pc.prevConcat;
                return pc.parent;
            }
            return null;
        }

        this.addChild = function (elem) {
            if (this.children == null)
                this.children = [];
            this.children.push(elem);
            elem.parent = this;
        }

        this.addConcat = function (elem) {
            this.nextConcat = elem;
            elem.prevConcat = this;
        }

        this.insertChildBefore = function (newChild, before) {
            if (this.children == null)
                this.children = [];
            var idx = this.children.indexOf(before);
            if (idx >= 0)
                this.children.splice(idx, 0, newChild);
            else
                this.children.push(newChild);
            newChild.parent = this;
        }

        this.insertChildAfter = function (newChild, after) {
            if (this.children == null)
                this.children = [];
            var idx = this.children.indexOf(after);
            if (idx >= 0 && this.children.length > idx)
                this.children.splice(idx + 1, 0, newChild);
            else
                this.children.push(newChild);
            newChild.parent = this;
        }

        this.isFirstInLine = function () {
            return this.prevConcat == null && this.prevSibling == null &&
                this.parent != null && this.parent.elemType == "LINE";
        }

        this.insertSiblingBeforeMe = function (edElem) {
            if (this.prevSibling != null) {
                this.prevSibling.nextSibling = edElem;
                edElem.prevSibling = this.prevSibling;
            }
            edElem.nextSibling = this;
            this.prevSibling = edElem;
            if (this.parent != null)
                this.parent.insertChildBefore(edElem, this);
        }

        this.appendSibling = function (sibl) {
            this.nextSibling = sibl;
            sibl.prevSibling = this;
            if (this.parent != null)
                this.parent.insertChildAfter(sibl, this);
        }

        this.collectAssignments = function () {
            var line = this.getMyLine();
            var ass = [];
            line = line.prevSibling;
            while (line != null) {
                var chld = line.children[0];
                if (chld.elemType == "ASSIGNMENT") {
                    ass.push(chld);
                }
                line = line.prevSibling;
            }
            return ass;
        }

        this.getLastConcat = function () {
            var conc = this;
            while (conc.nextConcat != null)
                conc = conc.nextConcat;
            return conc;
        }

        this.getReturnValue = function () {
            var retMthd = this.modelElem.returns;
            return retMthd instanceof Function ? retMthd(sEditElem) : retMthd;
        }
    }

    // makes JC_EditorFactory global
    JC_EditorFactory = new editorFactory("ed-templates");

}();