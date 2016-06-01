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

    var overlayDialog = function () {
            //private
            var overlayDialogs = {};

            //public
            this.create = function (dlgId, pos, dlgType, onClose) {
                overlayDialogs[dlgId] = new component(dlgId, function (olDlgId) {
                    overlayDialogs[olDlgId] = null;
                    if (onClose != null)
                        onClose();
                }, dlgType);
                if (pos != null) {
                    var elem = overlayDialogs[dlgId].getDialogElement();
                    elem.style.left = pos.x + "px";
                    elem.style.top = pos.y + "px";
                }
                return overlayDialogs[dlgId];
            }

            this.getOverlayDialog = function (dlgId) {
                return overlayDialogs[dlgId];
            }

            this.closeDialogsOfType = function (dlgType) {
                Object.keys(overlayDialogs).forEach(function (key, index) {
                    var dlg = overlayDialogs[key];
                    if (dlg != null && dlg.getDialogType() == dlgType) {
                        dlg.closeDlg();
                    }
                });
            }

            //private
            // object constructor
            var component = function (dlgId, closeFunc, type) {
                var dialogId = dlgId;
                var dialogType = type;
                var closeFunction = closeFunc;
                var dialog = JC_TemplateUtil.loadTemplate("OverlayDialog");
                if (dialog != null) {
                    document.body.appendChild(dialog);
                    var startPos = null;
                    $(dialog).children(".dlg-head")[0].onmousedown = function (event) {
                        if (startPos == null) {
                            startPos = {}
                            startPos.sx = event.clientX;
                            startPos.sy = event.clientY;
                            var bodyRect = document.body.getBoundingClientRect(),
                                elemRect = dialog.getBoundingClientRect();
                            startPos.dlgX = elemRect.left - bodyRect.left;
                            startPos.dlgY = elemRect.top - bodyRect.top;
                            return;
                        }
                    };
                    $(dialog).children(".dlg-head")[0].onmousemove = function (event) {
                        if (startPos != null) {
                            var dx = event.clientX - startPos.sx;
                            var dy = event.clientY - startPos.sy;
                            dialog.style.left = startPos.dlgX + dx + "px";
                            dialog.style.top = startPos.dlgY + dy + "px";
                        }
                    };
                    $(dialog).children(".dlg-head")[0].onmouseup = function (event) {
                        startPos = null;
                    };

                    $(dialog).find(".dlg-close")[0].onclick = function (event) {
                        dialog.parentNode.removeChild(dialog);
                        if (closeFunction != null)
                            closeFunction(dialogId);
                    }
                }

                //public
                this.getDialogElement = function () {
                    return dialog;
                }

                this.getDialogType = function () {
                    return dialogType;
                }

                this.closeDlg = function () {
                    dialog.parentNode.removeChild(dialog);
                    if (closeFunction != null)
                        closeFunction(dialogId);
                }
            }
        }
        // makes JC_OverlayDialog global
    JC_OverlayDialog = new overlayDialog();

}();