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
        this.createEditor = function (model, content) {
            return new jc_editor(model, content, ui_fact);
        }
    }

    /***********************************************/
    // cont (content) may be null
    var jc_editor = function (mdl, cont, fact) {
        //private
        var model = mdl;
        var content = cont;
        var ui_fact = fact;

        var statementContainer = null;

        //public
        this.getStatementContainer = function () {
            if (statementContainer == null) {
                statementContainer = ui_fact.createStatementContainer();
                statementContainer.jc_editor = this;
                initStatements(statementContainer);
            }
            return statementContainer;
        }
        
        //private
        var initStatements = function(stmtContainer) {
            if (content == null) { // empty
                var sl = [ui_fact.createStatementLine("500px")];
                ui_fact.getTemplateUtil().tmplAppendChildren(stmtContainer, sl, "ed-statements");
            } else { // has content
                
            }
        }
    }
    
    /***********************************************/
    var ui_factory = function (importId) {
        //private
        var templateUtil = JC_TemplateUtil.createTemplateUtil(importId);
        var refFontSize = null;

        //public
        this.createStatementContainer = function () {
            var ret = templateUtil.loadTemplate("EditorBody");
            return ret;
        }
        
        this.createStatementLine = function (width) {
            var ret = templateUtil.loadTemplate("StatementLine");
            if (width != null)
                ret.style.width = width;
            return ret;
        }
        
        this.getTemplateUtil = function() {
            return templateUtil;
        }
        
        this.getRefFontSize = function() {
            if (refFontSize == null)
                refFontSize = parseFloat(window.getComputedStyle(document.body, null).getPropertyValue('font-size'));
            return refFontSize;
        }
    }

    // makes JC_EditorFactory global
    JC_EditorFactory = new editorFactory("ed-templates");

}();