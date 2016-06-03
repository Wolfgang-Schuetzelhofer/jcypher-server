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

    /***********************************************/
    var domainQueryModel = function () {
        //private

        //public
        this.EDIT_TYPE = {
            SELECT: 0,
            FILL:   1
        }
        
        /***************************************************/
        this.descriptor = function(nNext, ed_type) {
            this.needNext = nNext;
            this.edit_type = ed_type;
            this.next = null;
        }
        var terminate = new this.descriptor(false);
        
        /***************************************************/
        this.firstLine = new this.descriptor(true, this.EDIT_TYPE.SELECT);
        this.firstLine.next = {
            createMatch: terminate,
        }
        
        /***************************************************/
        this.followLine = new this.descriptor(true, this.EDIT_TYPE.SELECT);
        this.followLine.next = {
            createMatch: terminate,
        }
    }


    // makes JC_DomainQueryModel global
    JC_DomainQueryModel = new domainQueryModel();

}();