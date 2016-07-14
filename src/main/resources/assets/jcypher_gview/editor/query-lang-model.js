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
var JC_DomainQueryModel = function (domModel) {
    //private
    var DISPLAY_TYPE = {
        L_TOKEN: "ed-lang-token",
        L_KEYWORD: "ed-lang-keyword",
        L_BRACKET: "ed-lang-bracket",
        L_SEPARATOR: "ed-lang-sep",
        L_ADD: "ed-add",
        L_ADD_OPT: "ed-add ed-add-opt",
        L_ADD_REQU: "ed-add ed-add-requ"
    }

    var domainModel = domModel;
    var dslBase = JC_EditorFactory.getDSLModelBase();
    var helper = dslBase.Helper;
    var firstLine = null;
    var followLine = null;
    var initDSLBase = function () {
        if (dslBase == null)
            dslBase = JC_EditorFactory.getDSLModelBase();
    }

    /***************************************************/
    var display_BR_OPEN = new dslBase.DisplayUnit("(", DISPLAY_TYPE.L_BRACKET);
    var display_BR_CLOSE = new dslBase.DisplayUnit(")", DISPLAY_TYPE.L_BRACKET);

    var returnFirstChildResult = function (editElem) {
        return editElem.children[0].getReturnValue();
    };
    
    var returnDomainType = function (editElem) {
        return editElem.modelElem.sourceElement;
    };

    // returns a Descriptor
    var getDomainTypes = function (editElem) {
        var ret = new dslBase.Descriptor(dslBase.ELEM_TYPE.REF_MODEL_TYPE);
        $.each(domainModel.types, function (idx, typ) {
            var spl = typ.name.split(".");
            var displ = spl[spl.length - 1];
            var prop = {
                proposal: displ,
                displayPref: [new dslBase.DisplayUnit(displ)],
                sourceElement: typ,
                returns: returnDomainType,
            };
            var mdl = helper.createModelElem(prop);
            ret[typ.name] = mdl;
        });
        return ret;
    };
    
    // returns a list with one Descriptor
    var getDomainTypesAsChild = function (editElem) {
        return [getDomainTypes(editElem)];
    };

    var createModelElem = function (tokenName, children, next, returns) {
        var chlds = typeof children !== 'undefined' ? children : null;
        var nxt = typeof next !== 'undefined' ? next : null;
        var ret = typeof returns !== 'undefined' ? returns : null;
        var props = {
            displayPref: [new dslBase.DisplayUnit(tokenName, DISPLAY_TYPE.L_TOKEN), display_BR_OPEN],
            displayPostf: [display_BR_CLOSE],
            children: chlds,
            next: nxt,
            returns: ret
        };
        var mdl = helper.createModelElem(props, tokenName);
        return mdl;
    };
    var createModelElemAss = function (tokenName, children, next) {
        var mdl = createModelElem(tokenName, children, next);
        mdl.assignIfFirst = true;
        return mdl;
    };
    this.createAssignment = function () {
        var descr = new dslBase.Descriptor(dslBase.ELEM_TYPE.ASSIGNMENT);
        descr.displayInf = [new dslBase.DisplayUnit(" = ", DISPLAY_TYPE.L_TOKEN)];
        descr.tokenClazz = DISPLAY_TYPE.L_TOKEN;
        return descr;
    };
    var createLiteral = function () {
        var descr = new dslBase.Descriptor(dslBase.ELEM_TYPE.LITERAL);
        descr.tokenClazz = DISPLAY_TYPE.L_TOKEN;
        return descr;
    };

    /***************************************************/
    this.getFirstLine = function () {
        if (firstLine == null) {
            firstLine = new dslBase.ModelElement(null);
            firstLine.children = [
                new dslBase.Descriptor(dslBase.ELEM_TYPE.LANG_ELEM, false).

                jc__addElement("createMatch", createModelElemAss("createMatch", getDomainTypesAsChild))
            ];
        }
        return firstLine;
    }

    /***************************************************/
    this.getFollowLine = function () {
        if (followLine == null) {
            followLine = new dslBase.ModelElement(null);
            followLine.children = [
                new dslBase.Descriptor(dslBase.ELEM_TYPE.LANG_ELEM, false).

                jc__addElement("createMatch", createModelElemAss("createMatch", getDomainTypesAsChild)).
                jc__addElement("WHERE", createModelElem("WHERE"))
            ];
        }
        return followLine;
    }
}