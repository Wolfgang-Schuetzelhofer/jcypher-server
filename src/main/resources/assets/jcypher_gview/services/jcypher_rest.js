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
    //alert("jc_rest executing");
    //private
    var jc_rest = function () {

        // public methods
        this.loadSampleData = function (dbName, sampleDataId, callback) {
            var loc = window.location.origin + "/jcypher-api/" + dbName + "/sampleData";
            $.post(loc, sampleDataId, function (data, status) {
                if (status != "success")
                    alert(status);
                else {
                    callback(data);
                }
            }).fail(function (err) {
                alert(err.statusText + ": " + loc); // or whatever
            });
        }
        
        this.loadModel = function (dbName, domainName, callback) {
            var loc = window.location.origin + "/jcypher-api/" + dbName + "/" + domainName + "/model";
            $.get(loc, function (data, status) {
                if (status != "success")
                    alert(status);
                else {
                    callback(data);
                }
            }).fail(function (err) {
                alert(err.statusText + ": " + loc); // or whatever
            });
        }

        this.loadDomains = function (dbName, callback) {
            var loc = window.location.origin + "/jcypher-api/" + dbName + "/domains";
            $.get(loc, function (data, status) {
                if (status != "success")
                    alert(status);
                else {
                    callback(data);
                }
            }).fail(function (err) {
                alert(err.statusText + ": " + loc); // or whatever
            });
        }
        
        this.loadLayout = function (dbName, domainName, callback) {
            var loc = window.location.origin + "/jcypher-api/" + dbName + "/" + domainName + "/layout";
            $.get(loc, function (data, status) {
                if (status != "success")
                    alert(status);
                else {
                    callback(data);
                }
            }).fail(function (err) {
                alert(err.statusText + ": " + loc); // or whatever
            });
        }
        
        this.saveLayout = function (dbName, domainName, layout, callback) {
            var loc = window.location.origin + "/jcypher-api/" + dbName + "/" + domainName + "/layout";
            var dat = JSON.stringify(layout);
            $.post(loc, dat, function (data, status) {
                if (status != "success")
                    alert(status);
                else {
                    callback(data);
                }
            }).fail(function (err) {
                alert(err.statusText + ": " + loc); // or whatever
            });
        }
        
        this.loadGraphDBConfigs = function (callback) {
            var loc = window.location.origin + "/jcypher-api/db-config";
            $.get(loc, function (data, status) {
                if (status != "success")
                    alert(status);
                else {
                    callback(data);
                }
            }).fail(function (err) {
                alert(err.statusText + ": " + loc); // or whatever
            });
        }

        this.setActiveDB = function (dbName, callback) {
            var loc = window.location.origin + "/jcypher-api/" + dbName;
            $.post(loc, function (data, status) {
                if (status != "success")
                    alert(status);
                else {
                    callback(data);
                }
            }).fail(function (err) {
                alert(err.statusText + ": " + loc); // or whatever
            });
        }
    };
    // makes JC_REST global
    JC_REST = new jc_rest();

}();