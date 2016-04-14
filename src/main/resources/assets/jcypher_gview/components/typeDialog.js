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

    var typeDialog = function () {

            //public
            this.getCreate = function (typeName, pos, offsetEM) {
                var p;
                if (offsetEM != null) {
                    p = {};
                    var style = window.getComputedStyle(document.body, null).getPropertyValue('font-size');
                    var fontSize = parseFloat(style);
                    p.x = pos.x + offsetEM.x * fontSize;
                    p.y = pos.y + offsetEM.y * fontSize;
                } else
                    p = pos;
                var dlg = JC_OverlayDialog.getOverlayDialog(typeName);
                if (dlg == null) {
                    dlg = JC_OverlayDialog.create(typeName, p, "typeDialog");
                    var mdl = JC_MAIN.getDomainModelElement(typeName);
                    var tBody = createTypeBody(mdl);
                    $(tBody).click(function (event) {
                        if (event.target.mdlType != null) {
                            var pos = {};
                            //pos.x = $(trgt).parents("td")[0].getBoundingClientRect().right;
                            pos.y = event.pageY;
                            pos.x = event.pageX;
                            JC_TypeDialog.getCreate(event.target.mdlType, pos, {
                                x: 2,
                                y: -1
                            });
                        }
                    });
                    var dlgElem = dlg.getDialogElement();
                    var img = $(dlgElem).find(".dlg-head-img")[0];
                    img.setAttribute("src", JC_TemplateUtil.imageForType(mdl.kind));
                    var bodyDiv = $(dlgElem).children(".dlg-body")[0];
                    var spl = typeName.split(".");
                    var txt = spl[spl.length - 1];
                    var headText = $(dlgElem).find(".dlg-head-txt")[0];
                    headText.textContent = txt;
                    if (mdl.kind == "ABSTRACT_CLASS")
                        $(headText).addClass("dlg-text-i");
                    bodyDiv.appendChild(tBody);
                } else {
                    var elem = dlg.getDialogElement();
                    var par = elem.parentNode;
                    par.removeChild(elem);
                    par.appendChild(elem);
                    var px = p.x + "px";
                    var py = p.y + "px";
                    $(elem).animate({
                        left: px,
                        top: py
                    });
                }
                return dlg;
            }

            //private
            var createTypeBody = function (mdl) {
                var tBody = JC_TemplateUtil.loadTemplate("TypeBody");
                if (tBody != null) {
                    var empty = true;
                    if (mdl.fields != null) {
                        empty = false;
                        var flds = [];
                        var i;
                        for (i = 0; i < mdl.fields.length; i++) {
                            if (mdl.kind != "ENUM") {
                                var fld = JC_TemplateUtil.loadTemplate("TField");
                                JC_TemplateUtil.tmplFillText(fld, mdl.fields[i].name, "dlg-field-name");
                                var spl = mdl.fields[i].type.split(".");
                                var txt = ":" + spl[spl.length - 1];
                                if (mdl.fields[i].componentType != null) {
                                    spl = mdl.fields[i].componentType.split(".");
                                    txt = txt + "[" + spl[spl.length - 1] + "]";
                                }
                                JC_TemplateUtil.tmplFillText(fld, txt, "dlg-field-type");
                                if (!mdl.fields[i].buildIn) {
                                    var elem = $(fld).find("span.dlg-field-type")[0];
                                    if (mdl.fields[i].componentType != null)
                                        elem.mdlType = mdl.fields[i].componentType;
                                    else
                                        elem.mdlType = mdl.fields[i].type;
                                    $(elem).addClass("dlg-link");
                                }
                                flds.push(fld);
                            } else { // fill enum values
                                var txt = mdl.fields[i].name;
                                var vspan;
                                if (i == 0)
                                    vspan = $(tBody).find(".dlg-values-content")[0];
                                else if (i % 3 == 0)
                                    flds.push(document.createElement("div"));
                                if (i < mdl.fields.length - 1)
                                    txt = txt + ",";
                                var clone = document.importNode(vspan, true);
                                clone.textContent = txt;
                                flds.push(clone);
                            }
                        }
                        var rem;
                        if (mdl.kind != "ENUM") {
                            var compart = $(tBody).find(".dlg-fields")[0];
                            JC_TemplateUtil.tmplReplaceList(compart, flds, "dlg-fields-content");
                            rem = $(tBody).find(".dlg-values")[0];
                        } else {
                            var compart = $(tBody).find(".dlg-values")[0];
                            JC_TemplateUtil.tmplReplaceList(compart, flds, "dlg-values-content");
                            rem = $(tBody).find(".dlg-fields")[0];
                        }
                        rem.parentNode.removeChild(rem);
                    } else {
                        rem = $(tBody).find(".dlg-fields")[0];
                        rem.parentNode.removeChild(rem);
                    }

                    var modif = function (elem, txt) {
                        elem.mdlType = txt;
                        $(elem).addClass("dlg-link");
                    };
                    var doRem = true;
                    if (mdl.extends != null)
                        doRem = !fillTexts(mdl.extends, "dlg-extends-content", "dlg-extends", tBody, true, modif);
                    if (doRem) {
                        var rem = $(tBody).find(".dlg-extends")[0];
                        rem.parentNode.removeChild(rem);
                    } else
                        empty = false;

                    doRem = true;
                    if (mdl.implements != null)
                        doRem = !fillTexts(mdl.implements, "dlg-implements-content", "dlg-implements", tBody, true, modif);
                    if (doRem) {
                        var rem = $(tBody).find(".dlg-implements")[0];
                        rem.parentNode.removeChild(rem);
                    } else
                        empty = false;
                    if (!empty) {
                        var rem = $(tBody).find(".dlg-values")[0];
                        if (rem != null && mdl.kind != "ENUM")
                            rem.parentNode.removeChild(rem);
                    }
                }
                return tBody;
            }

            var fillTexts = function (list, replaceClass, compartClass, tBody,
                noJava, modifyFunc) {
                var ret = false; // if ret == false, nothing was filled
                var repl = "." + replaceClass;
                var flds = [];
                var i;
                for (i = 0; i < list.length; i++) {
                    var txt = list[i];
                    var spl = txt.split(".");
                    if (!noJava || spl[0] != "java") {
                        txt = spl[spl.length - 1];
                        var vspan;
                        if (i == 0)
                            vspan = $(tBody).find(repl)[0];
                        else if (i % 3 == 0)
                            flds.push(document.createElement("div")); // new line
                        if (i < list.length - 1)
                            txt = txt + ",";
                        var clone = document.importNode(vspan, true);
                        if (modifyFunc != null)
                            modifyFunc(clone, list[i]);
                        clone.textContent = txt;
                        flds.push(clone);
                    }
                }
                var compart = $(tBody).find("." + compartClass)[0];
                if (flds.length > 0) {
                    JC_TemplateUtil.tmplReplaceList(compart, flds, replaceClass);
                    ret = true;
                }
                return ret;
            }
        }
        // makes JC_TypeDialog global
    JC_TypeDialog = new typeDialog();

}();