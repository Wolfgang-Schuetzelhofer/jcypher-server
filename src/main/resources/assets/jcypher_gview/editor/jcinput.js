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

function jcinput(elem, opts) {
    var options = opts;
    var container = $(elem);

    //public
    this.init = function () {
        var ctrl = container.children(".jc-ctrl");
        var nok = $("<span class='glyphicon glyphicon-remove sel-cancel'></span>");
        var ok = $("<span class='glyphicon glyphicon-ok sel-ok nok'></span>");
        var skip = $("<span class='glyphicon glyphicon-arrow-right sel-skip'></span>");
        container.append(nok);
        container.append(skip);
        container.append(ok);
        nok.on("click", function (e) {
            finished(1); // CANCEL
        });

        ok.on("click", function (e) {
            finished(0); // OK
        });

        skip.on("click", function (e) {
            finished(2); // SKIP
        });

        ctrl.on("keydown", function (e) {
            switch (e.which) {
            //case 37: // left
              //  break;

            case 38: // up
                break;

            case 9: // tab 39..right
                e.stopPropagation();
                finished(2);
                break;

            case 40: // down
                break;

            case 27: // esc
                finished(1);
                break;

            case 13: // enter
                e.stopPropagation();
                finished(0);
                break;

            default:
                return; // exit this handler for other keys
            }
            e.preventDefault(); // prevent the default action (scroll / move caret)
        }).
        on("keyup", function (e) {
            keyPressed();
        });

        keyPressed(); // init nok, ok
        ctrl.show(1, function () {
            container.children(".jc-ctrl").focus();
        })
    }

    //private
    // type: 0..OK, 1..CANCEL, 2..SKIP
    var finished = function (type) {
        var val = container.children(".jc-ctrl").val();
        if (type == 1 || type == 2 || (type == 0 && val.length > 0))
            options.onClose(type, options.editElement.modelElem, val,
                options.editElement);
    }

    var keyPressed = function () {
        var ctrl = container.children(".jc-ctrl");
        var val = ctrl.val();
        if (val.length > 0) {
            ctrl.removeClass("nok").addClass("ok");
            container.children(".sel-ok").removeClass("nok").addClass("ok");
        } else {
            ctrl.removeClass("ok").addClass("nok");
            container.children(".sel-ok").removeClass("ok").addClass("nok");
        }
        return;
    }
}