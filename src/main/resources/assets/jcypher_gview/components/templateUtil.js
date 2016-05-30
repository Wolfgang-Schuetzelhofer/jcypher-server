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
    //alert("templateUtil executing");

    var templateUtil = function () {
            //public
            this.imageForType = function (typ) {
                var img = null;
                if (typ == "CLASS")
                    img = "img/class_obj.gif";
                else if (typ == "ENUM")
                    img = "img/enum_obj.gif";
                else if (typ == "INTERFACE")
                    img = "img/int_obj.gif";
                else if (typ == "ABSTRACT_CLASS")
                    img = "img/abstr_class_obj.gif";
                return img;
            }

            this.loadTemplate = function (templId) {
                if (!('content' in document.createElement('template'))) {
                    alert("templates not supported by browser!");
                } else {
                    var cont = document.getElementById(templId).content;
                    var chld = getFirstElem(cont.childNodes);
                    return document.importNode(chld, true);
                }
            }

            this.tmplFillText = function (elem, text, at) {
                var span = $(elem).find("." + at)[0];
                span.textContent = text;
            }

            this.tmplReplaceList = function (elem, list, at) {
                var repl = $(elem).find("." + at)[0];
                var par = repl.parentNode;
                var i;
                for (i = 0; i < list.length; i++) {
                    par.insertBefore(list[i], repl);
                }
                par.removeChild(repl);
            }
            
            // private
            var getFirstElem = function(nodes) {
                for (var i = 0; i < nodes.length; i++) {
                    var elem = nodes[i];
                    if (elem.nodeType == elem.ELEMENT_NODE)
                        return elem;
                }
            }
        }
        // makes JC_TemplateUtil global
    JC_TemplateUtil = new templateUtil();

}();