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

function getChildWithAttribute(elem, attribName, attribValue, exact) {
    var exct = exact == null ? true : exact;
    if (elem != null) {
        for (var i = 0; i < elem.children.length; i++) {
            var chld = elem.children[i];
            var attrib = chld.getAttribute(attribName);
            if (attrib != null) {
                if (exct) {
                    if (attrib == attribValue)
                        return chld;
                } else {
                    if (attrib.indexOf(attribValue) >= 0)
                        return chld;
                }
            }
        }
    }
    return null;
}

function getChildrenWithAttribute(elem, attribName, attribValue, exact) {
    var exct = exact == null ? true : exact;
    var ret = [];
    if (elem != null) {
        for (var i = 0; i < elem.children.length; i++) {
            var chld = elem.children[i];
            var attrib = chld.getAttribute(attribName);
            if (attrib != null) {
                if (exct) {
                    if (attrib == attribValue)
                        ret.push(chld);
                } else {
                    if (attrib.indexOf(attribValue) >= 0)
                        ret.push(chld);
                }
            }
        }
    }
    return ret;
}

function getDecendentWithAttribute(elem, attribName, attribValue, exact) {
    var res = getChildWithAttribute(elem, attribName, attribValue, exact);
    if (res != null)
        return res;
    if (elem != null) {
        for (var i = 0; i < elem.children.length; i++) {
            var chld = elem.children[i];
            res = getDecendentWithAttribute(chld, attribName, attribValue, exact);
            if (res != null)
                return res;
        }
    }
    return null;
}

function getDecendentsWithAttribute(elem, attribName, attribValue, exact) {
    var res = getChildrenWithAttribute(elem, attribName, attribValue, exact);
    if (res.length > 0)
        return res;
    if (elem != null) {
        for (var i = 0; i < elem.children.length; i++) {
            var chld = elem.children[i];
            res = getDecendentsWithAttribute(chld, attribName, attribValue, exact);
            if (res.length > 0)
                return res;
        }
    }
    return [];
}