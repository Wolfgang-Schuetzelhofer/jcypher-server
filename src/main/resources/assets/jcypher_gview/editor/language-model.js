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

/***********************************************/
var jc_DomainQueryModel = function (domModel) {
    //private
    var domainModel = domModel;

    var returnFirstChildResult = function (editElem) {
        return editElem.children[0].getReturnValue();
    }

    var returnDomainType = function (editElem) {
        return editElem.modelElem.sourceElement;
    }

    var getDomainTypes = function (editElem) {
        var ret = new Descriptor(ELEM_TYPE.REF_MODEL_TYPE);
        $.each(domainModel.types, function (idx, typ) {
            var spl = typ.name.split(".");
            var displ = spl[spl.length - 1];
            var obj = {
                proposal: displ,
                displayPref: [new displayUnit(displ)],
                sourceElement: typ,
                returnMethod: returnDomainType,
                next: terminate
            };
            ret[typ.name] = obj;
        });
        return [ret];
    }

    var getDOMatches = function (editElem) {
        var ass = editElem.collectAssignments();
        var ret = new Descriptor(ELEM_TYPE.REF_VARIABLE);
        $.each(ass, function (idx, edElem) {
            var obj = {
                proposal: edElem.tokenName,
                displayPref: [new displayUnit(edElem.tokenName)],
                sourceElement: edElem,
                next: modelFields
            };
            ret[edElem.tokenName] = obj;
        });
        return [ret];
    }

    var getModelFields = function (editElem) {
        if (editElem.elemType == ELEM_TYPE.REF_VARIABLE) {
            var ass = editElem.modelElem.sourceElement;
            var assigned = ass.nextSibling;
            assigned = assigned.getLastConcat();
            var typ = assigned.getReturnValue();
            var ret = new Descriptor(ELEM_TYPE.REF_MODEL_TYPE);
            $.each(typ.fields, function (idx, fld) {
                var obj = {
                    proposal: fld.name,
                    displayPref: [new displayUnit(".", DISPLAY_TYPE.L_SEPARATOR),
                                  new displayUnit(fld.name)],
                    sourceElement: fld,
                    next: terminate
                };
                ret[fld.name] = obj;
            });
        }
        return ret;
    }

    var DISPLAY_TYPE = {
        L_TOKEN: "ed-lang-token",
        L_KEYWORD: "ed-lang-keyword",
        L_BRACKET: "ed-lang-bracket",
        L_SEPARATOR: "ed-lang-sep",
        L_ADD: "ed-add",
        L_ADD_OPT: "ed-add ed-add-opt",
        L_ADD_REQU: "ed-add ed-add-requ"
    }

    var ELEM_TYPE = {
        ADD: "ADD",
        LANG_ELEM: "LANG_ELEM",
        REF_MODEL_TYPE: "REF_MODEL_TYPE",
        REF_VARIABLE: "REF_VARIABLE",
        LINE: "LINE",
        ASSIGNMENT: "ASSIGNMENT"
    }

    this.getDISPLAY_TYPE = function () {
        return DISPLAY_TYPE;
    }

    this.getELEM_TYPE = function () {
        return ELEM_TYPE;
    }

    var displayUnit = function (txt, d_type) {
        this.text = txt;
        this.displayType = typeof d_type !== 'undefined' ? d_type : DISPLAY_TYPE.L_TOKEN;
    }
    var display_BR_OPEN = new displayUnit("(", DISPLAY_TYPE.L_BRACKET);
    var display_BR_CLOSE = new displayUnit(")", DISPLAY_TYPE.L_BRACKET);

    /***************************************************/
    var Structure = function () {
            var next = null;
            var children = null;

            this.setNext = function (nxt) {
                next = nxt;
            }
            this.getNext = function () {
                return next;
            }
            this.setChildren = function (chlds) {
                children = chlds;
            }
            this.getChildren = function () {
                return children;
            }
        }
        /***************************************************/
    var terminate = new Structure();

    /***************************************************/
    var Descriptor = function (elemType, requ) {
            this.jc__required = typeof requ !== 'undefined' ? requ : true;
            this.jc__elemType = typeof elemType !== 'undefined' ? elemType : ELEM_TYPE.LANG_ELEM;
            this.jc__addElement = function (key, value) {
                this[key] = value;
                return this;
            }
        }
        /***************************************************/

    /***************************************************/
    var modelTypesAsChildren = new Structure();
    modelTypesAsChildren.getChildren = getDomainTypes;

    /***************************************************/
    var doMatchesAsChildren = new Structure();
    doMatchesAsChildren.getChildren = getDOMatches;

    /***************************************************/
    var modelFields = new Structure();
    modelFields.getNext = getModelFields;

    /***************************************************/
    this.createAssignment = function () {
        var descr = new Descriptor(ELEM_TYPE.ASSIGNMENT);
        descr.displayInf = [new displayUnit(" = ")];
        descr.tokenClazz = DISPLAY_TYPE.L_TOKEN;
        descr.next = null;
        return descr;
    }

    /***************************************************/
    this.firstLine = new Structure();
    this.firstLine.setChildren([
        new Descriptor(
            ELEM_TYPE.LANG_ELEM, false).

            jc__addElement("createMatch", {
            proposal: "createMatch", // optional
            assignIfFirst: true, // optional, default: false
            returnMethod: returnFirstChildResult, // optional, default return the editElement itself
            displayPref: [new displayUnit("createMatch"), display_BR_OPEN],
            displayPostf: [display_BR_CLOSE],
            // optional display infix
            //displayInf: [new this.displayUnit("+")]
            next: modelTypesAsChildren
        })
    ]);

    /***************************************************/
    this.followLine = new Structure();
    this.followLine.setChildren([
        new Descriptor(
            ELEM_TYPE.LANG_ELEM, false).

            jc__addElement("createMatch", {
            proposal: "createMatch", // optional
            assignIfFirst: true, // optional, default: false
            returnMethod: returnFirstChildResult, // optional, default return the editElement itself
            displayPref: [new displayUnit("createMatch"), display_BR_OPEN],
            displayPostf: [display_BR_CLOSE],
            next: modelTypesAsChildren
        }).
            jc__addElement("WHERE", {
            proposal: "WHERE", // optional
            displayPref: [new displayUnit("WHERE"), display_BR_OPEN],
            displayPostf: [display_BR_CLOSE],
            next: doMatchesAsChildren
        })
    ]);
}