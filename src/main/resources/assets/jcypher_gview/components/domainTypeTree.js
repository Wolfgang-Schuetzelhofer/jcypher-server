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
    var domainTypeTree = function () {

        //public methods
        this.createModelTree = function (container, dm) {
            $(container).empty();
            var treeDiv = document.createElement("div");
            treeDiv.onclick = function (event) {
                var trgt = event.target;
                if (trgt.nodeName == "SPAN") {
                    var txt = trgt.textContent.trim();
                    var par = trgt.parentNode.parentNode.parentNode;
                    if (par.nodeName == "LI") { // I am a type (no package)
                        var pkg = $(par).children("span").eq(1)[0].textContent;
                        var full = pkg + "." + txt;
                        var pos = {};
                        //pos.x = $(trgt).parents("td")[0].getBoundingClientRect().right;
                        pos.y = event.pageY;
                        pos.x = event.pageX;
                        var dlg = JC_TypeDialog.getCreate(full, pos, {
                            x: 2,
                            y: -1
                        });
                    }
                    return;
                }
                return;
            };
            $(treeDiv).addClass("tree");
            container.appendChild(treeDiv);
            var root = document.createElement("ul");
            treeDiv.appendChild(root);
            var map = {};
            var i;
            for (i = 0; i < dm.types.length; i++) {
                var typ = dm.types[i];
                var segs = typ.name.split('.');
                if (segs[0] != "java") { // don't show java internal classes
                    var pkg = "";
                    var j;
                    for (j = 0; j < segs.length - 1; j++) {
                        if (j > 0)
                            pkg = pkg + '.';
                        pkg = pkg + segs[j];
                    }
                    var cul = map[pkg];
                    if (cul == null) { // create package element
                        cul = createTreeListItem(root, "glyphicon glyphicon-minus", "img/package_obj.gif", pkg, true, true);
                        map[pkg] = cul;
                    }
                    var img = JC_TemplateUtil.imageForType(typ.kind);
                    var li = createTreeListItem(cul, null, img, segs[segs.length - 1], false, false);
                }

            }
            initTree();
        }

        //private methods
        var initTree = function () {
            $('.tree li:has(ul)').addClass('parent_li').find(' > span:first-child').attr('title', 'Collapse this branch');
            $('.tree li.parent_li > span:first-child').on('click', function (e) {
                var children = $(this).parent('li.parent_li').find(' > ul > li');
                if (children.is(":visible")) {
                    children.hide('fast');
                    $(this).attr('title', 'Expand this branch').addClass('glyphicon glyphicon-plus').removeClass('glyphicon-minus');
                } else {
                    children.show('fast');
                    $(this).attr('title', 'Collapse this branch').addClass('glyphicon glyphicon-minus').removeClass('glyphicon-plus');
                }
                e.stopPropagation();
            });
        }

        var createTreeListItem = function (par, glyphAttr, imgAttr, text, subElems, inside) {
            var ret;
            var li = document.createElement("li");
            par.appendChild(li);
            if (glyphAttr != null) {
                var span = document.createElement("span");
                li.appendChild(span);
                $(span).addClass(glyphAttr);
            }
            var img = null;
            if (imgAttr != null) {
                img = document.createElement("img");
                img.setAttribute("src", imgAttr);
                if (!inside)
                    li.appendChild(img);
                else
                    img.style.paddingRight = "2px";
            }
            var tspan = document.createElement("span");
            li.appendChild(tspan);
            if (img != null && inside)
                tspan.appendChild(img);
            var txt = document.createTextNode(text);
            tspan.appendChild(txt);
            if (subElems) {
                ret = document.createElement("ul");
                li.appendChild(ret);
            } else
                ret = li;
            return ret;
        }
    };
    // makes JC_DomainTypeTree global
    JC_DomainTypeTree = new domainTypeTree();
}();