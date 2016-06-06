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
    var getDomainTypes = function() {
        var ret = $map(domainModel.types, function(typ){
            return typ.name;
        });
        return ret;
    }

    //public
    this.EDIT_TYPE = {
        SELECT: 0,
        FILL: 1
    }
    
    var DISPLAY_TYPE = {
        L_TOKEN: "ed-lang-token",
        L_KEYWORD: "ed-lang-keyword",
        L_BRACKET: "ed-lang-bracket"
    }
    
    this.displayUnit = function(txt, d_type) {
        this.text = txt;
        this.displayType = typeof d_type !== 'undefined' ? d_type : DISPLAY_TYPE.L_TOKEN;
    }
    var display_BR_OPEN = new this.displayUnit("(", DISPLAY_TYPE.L_BRACKET);
    var display_BR_CLOSE = new this.displayUnit(")", DISPLAY_TYPE.L_BRACKET);

    /***************************************************/
    this.descriptor = function (nNext, nChlds, ed_type) {
        this.edit_type = ed_type;
        this.needNext = nNext;
        this.needChildren = nChlds;

        var next = null;
        var chidren = null;

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
            return chidren;
        }
    }
    var terminate = new this.descriptor(false, false);

    /***************************************************/
    var modelTypesAsChildren = new this.descriptor(false, true);
    modelTypesAsChildren.getChildren = getDomainTypes;

    /***************************************************/
    this.firstLine = new this.descriptor(true, false, this.EDIT_TYPE.SELECT);
    this.firstLine.setNext({
        createMatch: {
            displayPref: [new this.displayUnit("createMatch"), display_BR_OPEN],
            displayPostf: [display_BR_CLOSE],
            next: modelTypesAsChildren
        }
    });

    /***************************************************/
    this.followLine = new this.descriptor(true, false, this.EDIT_TYPE.SELECT);
    this.followLine.setNext({
        createMatch: {
            displayPref: [new this.displayUnit("createMatch"), display_BR_OPEN],
            displayPostf: [display_BR_CLOSE],
            next: modelTypesAsChildren
        }
    });
}