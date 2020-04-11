<!--
  Copyright 2020 Scott Came Consulting LLC

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->

<script>

  import LabeledCheckbox from './LabeledCheckbox.svelte';

  export let repository;
  let rowHighlightValue = repository.workspace.settings.rowHighlight;
  let tableFontIncrease = repository.workspace.settings.tableFontIncrease;

  repository.workspace.settings.addEditEventListener({
    notifyEdit: (event) => {
    },
    notifyPendingPropertyEdit: (event) => {
    },
    notifyPropertyEdit: (event) => {
      if (event.propertyName==="rowHighlight") {
        rowHighlightValue = repository.workspace.settings.rowHighlight;
      } else if (event.propertyName==="tableFontIncrease") {
        tableFontIncrease = repository.workspace.settings.tableFontIncrease;
      }
    },
  });

  function toggleRowHighlightValue() {
    repository.workspace.settings.setRowHighlight(!repository.workspace.settings.rowHighlight);
  }

  function setTableFontIncrease(value) {
    repository.workspace.settings.setTableFontIncrease(value);
  }

</script>

<div class="h-full w-full bg-gray-100">
  <div class="p-4 mt-1">
    <div class="text-xl mb-8">Piet Application Settings</div>
    <div class="flex flex-col w-full border border-gray-800 p-4">
      <div class="text-lg mb-2 underline">Results Table Formatting</div>
      <div class="w-full mb-2 ml-2">
        <LabeledCheckbox value={rowHighlightValue} on:click={ e => toggleRowHighlightValue() } label="Highlight alternating rows"/>
      </div>
      <div class="flex flex-inline w-full ml-2">
        <div>Font size:</div>
        <div class="ml-2"><LabeledCheckbox value={tableFontIncrease===1} on:click={ e => setTableFontIncrease(1) } label="Normal"/></div>
        <div class="ml-2"><LabeledCheckbox value={tableFontIncrease===2} on:click={ e => setTableFontIncrease(2) } label="Large"/></div>
        <div class="ml-2"><LabeledCheckbox value={tableFontIncrease===3} on:click={ e => setTableFontIncrease(3) } label="X-Large"/></div>
      </div>
    </div>
  </div>
</div>
