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

function jcradio(elem, opts) {
    var options = opts;
    var container = $(elem);
    var size = container.find(".jcradio-select .radio input").length;

    //public
    this.init = function () {
        var ctrl = container.children(".jcradio-head");
        var nok = $("<span class='glyphicon glyphicon-remove sel-cancel'></span>");
        var ok = $("<span class='glyphicon glyphicon-ok sel-ok nok'></span>");
        var skip = $("<span class='glyphicon glyphicon-arrow-right sel-skip'></span>");
        ctrl.append(nok);
        ctrl.append(skip);
        ctrl.append(ok);
        nok.on("click", function (e) {
            finished(1); // CANCEL
        });

        ok.on("click", function (e) {
            finished(0); // OK
        });

        skip.on("click", function (e) {
            finished(2); // SKIP
        });

        container.on("keydown", function (e) {
            switch (e.which) {
            case 37: // left
                break;

            case 38: // up
                next(1);
                break;

            case 39: // right
                finished(2);
                break;

            case 40: // down
                next(0);
                break;

            case 27: // esc
                finished(1);
                break;

            case 13: // enter
                finished(0);
                break;

            default:
                return; // exit this handler for other keys
            }
            e.preventDefault(); // prevent the default action (scroll / move caret)
        });

        var rads = container.find(".jcradio-select .radio input").eq(0);
        if (rads.length > 0)
            rads.attr("checked", "checked");

        ctrl.show(1, function () {
            container.find(".jcradio-select .radio input").eq(0).focus();
        })
    }

    //private
    // type: 0..OK, 1..CANCEL
    var finished = function (type) {
        return;
    }

    var next = function (direction) {
        $.each(container.find(".jcradio-select .radio input"), function (idx, val) {
            if (val.checked) {
                val.checked = false;
                var actIdx;
                if (direction == 0) // down
                    actIdx = (idx < size - 1) ? (idx + 1) : 0;
                else
                    actIdx = (idx > 0) ? (idx - 1) : (size - 1);
                act = container.find(".jcradio-select .radio input").eq(actIdx);
                act[0].checked = true;
                act.focus();
                return false;
            }
        })
    }
}