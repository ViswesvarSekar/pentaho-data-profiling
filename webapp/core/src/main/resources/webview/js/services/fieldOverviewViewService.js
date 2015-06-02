/*******************************************************************************
 *
 * Pentaho Data Profiling
 *
 * Copyright (C) 2002-2015 by Pentaho : http://www.pentaho.com
 *
 *******************************************************************************
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 ******************************************************************************/

define(['./services'], function (appServices) {
  appServices.factory('FieldOverviewViewService', [
    function () {
      function FieldOverviewViewService() {
        this.selectedTab;
        this.stateFormDisplay = true;
        this.physicalName;
        this.currentFieldRow;
      }

      FieldOverviewViewService.prototype = {
        constructor: FieldOverviewViewService,
        setCurrentFieldRow: function (fieldRows, physicalName) {
          angular.forEach(fieldRows, function(fieldRow) {
            if (fieldRow["[\"physicalName\"]"] === physicalName){
              fieldOverviewViewService.currentFieldRow = fieldRow;
            }
          });
        }
      };
      var fieldOverviewViewService = new FieldOverviewViewService();
      return fieldOverviewViewService;
    }])
});