<!--
  Copyright 2020 National Police Foundation
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

  import { DropdownModel } from '../js/ui/model/Dropdown';
  import { DefaultObservableChangeEventListener } from '../js/util/Observable';

  export let dropdownModel;
  export let defaultLabel = "Choose...";
  export let initialSelectionIndex = null;
  export let showCaret = false;
  export let enabled = true;

  let dropdownLabel = defaultLabel;
  let open = false;
  let containerDiv;

  dropdownModel.label.addChangeEventListener(new DefaultObservableChangeEventListener(e => {
    dropdownLabel = e.newValue === null ? defaultLabel : e.newValue;
  }));

  dropdownModel.selectedIndex.value = initialSelectionIndex;

  function selectItem(idx) {
    dropdownModel.selectedIndex.value = idx;
    open = false;
  }

  let outsideClickListener = e => {
    if (!containerDiv.contains(e.target)) {
      open = false;
      document.removeEventListener("click", outsideClickListener);
    }
  }

  let escapeKeyListener = e => {
    if (e.key==="Escape") {
      open = false;
      document.removeEventListener("keydown", escapeKeyListener);
    }
  }

  function toggleOpen(event) {
    if (enabled) {
      open = !open;
      if (open) {
        document.addEventListener("click", outsideClickListener);
        document.addEventListener("keydown", escapeKeyListener);
      } else {
        document.removeEventListener("click", outsideClickListener);
        document.removeEventListener("keydown", escapeKeyListener);
      }
    }
  }

</script>

<div class="relative ml-2 w-full border border-gray-700" bind:this="{containerDiv}">
  <button type="button" class="w-full flex flex-inline items-center bg-gray-300 font-semibold rounded focus:outline-none cursor-default" on:click={toggleOpen}>
    <div class="w-full">{dropdownLabel}</div>
    <div class="w-8 h-8 items-center mr-1 {showCaret ? '' : 'hidden'}">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="mt-1">
        <path d="M15.3 9.3a1 1 0 0 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.4l3.3 3.29 3.3-3.3z"/>
      </svg>
    </div>
  </button>
  {#if open}
    <div class="absolute w-full bg-gray-100 border border-gray-700 shadow-xl max-h-128 overflow-y-auto">
      <div>
        {#each dropdownModel.labels as label, idx}
          <div class="block px-4 py-1 text-gray-800 hover:bg-gray-300" on:click="{e => selectItem(idx)}">{label}</div>
        {/each}
      </div>
    </div>
  {/if}
</div>
