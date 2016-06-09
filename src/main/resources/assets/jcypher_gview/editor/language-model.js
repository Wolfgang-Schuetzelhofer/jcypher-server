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
        var ret = {};
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

    this.getDISPLAY_TYPE = function () {
        return DISPLAY_TYPE;
    }

    var displayUnit = function (txt, d_type) {
        this.text = txt;
        this.displayType = typeof d_type !== 'undefined' ? d_type : DISPLAY_TYPE.L_TOKEN;
    }
    var display_BR_OPEN = new displayUnit("(", DISPLAY_TYPE.L_BRACKET);
    var display_BR_CLOSE = new displayUnit(")", DISPLAY_TYPE.L_BRACKET);

    /***************************************************/
    var descriptor = function () {
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
    var terminate = new descriptor();

    /***************************************************/
    var modelTypesAsChildren = new descriptor();
    modelTypesAsChildren.getChildren = getDomainTypes;

    /***************************************************/
    this.createAssignment = function (to) {
        var descr = new descriptor();
        descr.setNext(to);
        var ass = {
            displayInf: [new displayUnit(" = ")],
            next: descr
        };
        return ass;
    }

    /***************************************************/
    this.firstLine = new descriptor();
    this.firstLine.setChildren([{
        jc_required: false, //optional, default: true
        createMatch: {
            proposal: "createMatch", // optional
            assignIfFirst: true, // optional, default: false
            displayPref: [new displayUnit("createMatch"), display_BR_OPEN],
            displayPostf: [display_BR_CLOSE],
            // optional display infix
            //displayInf: [new this.displayUnit("+")]
            next: modelTypesAsChildren
        }
    }]);

    /***************************************************/
    this.followLine = new descriptor();
    this.followLine.setChildren([{
        createMatch: {
            proposal: "createMatch", // optional
            assignIfFirst: true,
            displayPref: [new displayUnit("createMatch"), display_BR_OPEN],
            displayPostf: [display_BR_CLOSE],
            next: modelTypesAsChildren
        }
    }]);
}