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
var DSLModelBase = function () {

    this.ELEM_TYPE = {
        ADD: "ADD",
        LANG_ELEM: "LANG_ELEM",
        REF_MODEL_TYPE: "REF_MODEL_TYPE",
        REF_VARIABLE: "REF_VARIABLE",
        LINE: "LINE",
        ASSIGNMENT: "ASSIGNMENT",
        LITERAL: "LITERAL"
    }

    /***************************************************/
    this.DisplayUnit = function (txt, d_type) {
        this.text = txt;
        this.displayType = d_type;
    }

    /***************************************************/
    this.Descriptor = function (elemType, requ) {
        this.jc__required = typeof requ !== 'undefined' ? requ : true;
        this.jc__elemType = typeof elemType !== 'undefined' ? elemType : ELEM_TYPE.LANG_ELEM;
        this.jc__addElement = function (key, value) {
            this[key] = value;
            return this;
        }
    }

    /***************************************************/
    this.ModelElement = function (propsl) {
        this.proposal = propsl; // optional
        this.assignIfFirst = false;
        this.displayPref = null;
        this.displayPostf = null;
        this.displayInf = null;
        this.next = null; //can be a function, returns a Descriptor or null
        this.children = null; //can be a function, returns a list of Descriptors or null
        this.returns = null; // optional, default returns the editElement itself (a function or value)
    }

    /***************************************************/
    var helper = function (self_) {
            var self = self_;
            this.createModelElem = function (properties, propsl) {
                var p = typeof propsl !== 'undefined' ? propsl : null;
                var mdl = new self.ModelElement(p);
                $.extend(mdl, properties);
                return mdl;
            };
            this.createPreselect = function (choices) {
                var pres = new self.Descriptor(self.ELEM_TYPE.LANG_ELEM).
                jc__addElement("jc__preselect", choices);
                return pres;
            };
            this.createChoice = function (proposal, model) {
                return {
                    proposal: proposal,
                    descriptor: model
                };
            };
            // display ... define how to display an assignment
            // tokenClass ... class attribute to display the variable
            this.createAssignment = function (display, tokenClass) {
                var descr = new self.Descriptor(self.ELEM_TYPE.ASSIGNMENT);
                $.extend(descr, display);
                descr.tokenClazz = tokenClass;
                return descr;
            };
            this.selectAssigned = function (next) {
                var nxt = next;
                var selAss = function (editElem) {
                    var ass = editElem.collectAssignments();
                    var ret = new self.Descriptor(self.ELEM_TYPE.REF_VARIABLE);
                    $.each(ass, function (idx, assElem) {
                        var prop = {
                            proposal: assElem.tokenName,
                            displayPref: [new self.DisplayUnit(assElem.tokenName, assElem.modelElem.tokenClazz)],
                            sourceElement: assElem,
                            next: nxt
                        };
                        var mdl = self.Helper.createModelElem(prop);
                        ret[assElem.tokenName] = mdl;
                    });
                    return ret;
                };
                return selAss;
            }
        }
        /***************************************************/
    this.Helper = new helper(this);
}