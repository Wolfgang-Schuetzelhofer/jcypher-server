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

    var queryDialog = function () {

            //public
            this.getCreate = function (queryName, pos, offsetEM) {
                var p;
                if (offsetEM != null) {
                    p = {};
                    var style = window.getComputedStyle(document.body, null).getPropertyValue('font-size');
                    var fontSize = parseFloat(style);
                    p.x = pos.x + offsetEM.x * fontSize;
                    p.y = pos.y + offsetEM.y * fontSize;
                } else
                    p = pos;
                var dlg = JC_OverlayDialog.getOverlayDialog(queryName);
                if (dlg == null) {
                    dlg = JC_OverlayDialog.create(queryName, p, "queryDialog");
                    var dlgElem = dlg.getDialogElement();
                    var headText = $(dlgElem).find(".dlg-head-txt")[0];
                    headText.textContent = queryName;
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
            var createQueryBody = function (mdl) {

            }
        }
        // makes JC_QueryDialog global
    JC_QueryDialog = new queryDialog();

}();