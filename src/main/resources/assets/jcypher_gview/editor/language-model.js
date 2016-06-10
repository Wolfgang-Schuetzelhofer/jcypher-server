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
    var getDomainTypes = function () {
        var ret = new Descriptor();
        $.each(domainModel.types, function (idx, typ) {
            var obj = {};
            var spl = typ.name.split(".");
            var displ = spl[spl.length - 1];
            obj.proposal = displ;
            obj.displayPref = [new displayUnit(displ)];
            obj.next = terminate;
            ret[typ.name] = obj;
            return;
        });
        return [ret];
    }

    var DISPLAY_TYPE = {
        L_TOKEN: "ed-lang-token",
        L_KEYWORD: "ed-lang-keyword",
        L_BRACKET: "ed-lang-bracket",
        L_ADD_OPT: "ed-add-opt",
        L_ADD_REQU: "ed-add-requ"
    }

    var ELEM_TYPE = {
        ADD: "ADD",
        LANG_ELEM: "LANG_ELEM",
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
    this.createAssignment = function (to) {
        var struct = new Structure();
        struct.setNext(to);
        var descr = new Descriptor(ELEM_TYPE.ASSIGNMENT);
        descr.displayInf = [new displayUnit(" = ")];
        descr.next = struct;
        return descr;
    }

    /*this.createAssignment_1 = function (to) {
        var descr = new Structure();
        descr.setNext(to);
        var ass = {
            displayInf: [new displayUnit(" = ")],
            next: descr
        };
        return ass;
    }*/

    /***************************************************/
    this.firstLine = new Structure();
    this.firstLine.setChildren([
        new Descriptor(
            ELEM_TYPE.LANG_ELEM, false).

            jc__addElement("createMatch", {
            proposal: "createMatch", // optional
            assignIfFirst: true, // optional, default: false
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
            displayPref: [new displayUnit("createMatch"), display_BR_OPEN],
            displayPostf: [display_BR_CLOSE],
            next: modelTypesAsChildren
        })
    ]);
}