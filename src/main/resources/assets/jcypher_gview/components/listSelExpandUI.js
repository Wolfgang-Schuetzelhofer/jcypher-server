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

    var listSelExpandUI = function () {
            //private
            var listSelExpandUIs = {};

            //public
            this.create = function (name, fieldSetId, listItemExtr, itemSel, buildMdl, addits) {
                listSelExpandUIs[fieldSetId] = new component(name, fieldSetId, listItemExtr, itemSel, buildMdl, addits);
                return listSelExpandUIs[fieldSetId];
            }

            this.getListSelExpandUI = function (fieldSetId) {
                return listSelExpandUIs[fieldSetId];
            }

            //private
            // object constructor
            var component = function (name, fldSetId, listItemExtr, itemSel, buildMdl, addits) {
                //private
                var initItem = "-------------";
                var modelList = null;
                var listItemExtract = listItemExtr; // a function
                var itemSelected = itemSel; // a function
                var buildModel = buildMdl; // a function to build the expandable model view
                var additions = addits; // a function to add additions (optional),
                //parameter given to the function is the additions placeholder

                var expandModelId = fldSetId + "-expnd";

                var replace = function (oldElem, newElem, theId) {
                    oldElem.removeAttribute("id");
                    newElem.setAttribute("id", theId);
                    oldElem.parentNode.replaceChild(newElem, oldElem);
                    return newElem;
                }

                var fieldSet = replace(document.getElementById(fldSetId),
                    JC_TemplateUtil.loadTemplate("ListSelExpandUI"),
                    fldSetId);

                $(fieldSet).children("legend")[0].textContent = name;
                var modelView = $(fieldSet).children(".p-explore-c")[0];
                //the data-toggle = "collapse"
                var toggle_collapse = $(fieldSet).children(".p-explore-t")[0];
                toggle_collapse.setAttribute("data-target", "#" + expandModelId);
                var collapse = toggle_collapse.nextElementSibling;
                collapse.setAttribute("id", expandModelId);

                var dropDownClicked = function (event) {
                    if (event.target.tagName == "LI") {
                        var mdl = event.target.innerHTML;
                        var span = dropDown.firstElementChild.firstElementChild;
                        span.textContent = mdl;
                        var par = event.target.parentNode;
                        var idx = $(event.target.parentNode).children("li").index(event.target);
                        if (modelList[idx] != initItem) {
                            itemSelected(modelList[idx]);
                            buildModel(idx, modelList, modelView);
                        }
                    }
                }
                var dropDown = $(fieldSet).children(".p-select")[0];
                dropDown.onclick = dropDownClicked;

                var expandClicked = function (event) {
                    var exp = this.nextElementSibling;
                    var el = event.target;
                    if (el.nodeName != "DIV")
                        el = el.parentNode;
                    el = $(el).children("span.glyphicon")[0];
                    if ($(exp).hasClass("in")) {
                        $(el).removeClass("glyphicon glyphicon-folder-open");
                        $(el).addClass("glyphicon glyphicon-folder-close");
                    } else {
                        $(el).removeClass("glyphicon glyphicon-folder-close");
                        $(el).addClass("glyphicon glyphicon-folder-open");
                    }
                    return;
                }
                toggle_collapse.onclick = expandClicked;

                if (additions != null)
                    additions($(fieldSet).children(".p-additions")[0]);

                //public
                this.setModelList = function (mdlList, init) {
                    modelList = mdlList;
                    var ul = $(fieldSet).children().eq(1).children().eq(1)[0];
                    $(ul).empty();
                    var itemList;
                    if (!init)
                        itemList = listItemExtract(modelList);
                    else
                        itemList = modelList;
                    var i;
                    var first = null;
                    for (i = 0; i < itemList.length; i++) {
                        var li = document.createElement("li");
                        if (first == null)
                            first = li;
                        $(li).addClass("jcvis-clickable well well-sm");
                        li.textContent = itemList[i];
                        ul.appendChild(li);
                    }
                    if (first != null)
                        first.click();
                    return;
                }
                
                this.initModelList = function() {
                    this.setModelList([initItem], true);
                    $(modelView).empty();
                }
                
                this.initModelList();
            }
        }
        // makes JC_ListSelExpandUI global
    JC_ListSelExpandUI = new listSelExpandUI();
}();