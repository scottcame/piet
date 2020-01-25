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

  import IconMenu from './icons/IconMenu.svelte';

  export let items = [];
  export let enabled = true;

  // each item is: { label: "Item label", action: (e) => { ... }, enabled: true|false }

  let containerDiv;
  let open = false;

  let outsideClickListener = e => {
    if (!containerDiv.contains(e.target)) {
      open = false;
      document.removeEventListener("click", outsideClickListener);
    }
  }

  function toggleOpen(event) {
    if (enabled) {
      open = !open;
      if (open) {
        document.addEventListener("click", outsideClickListener);
      } else {
        document.removeEventListener("click", outsideClickListener);
      }
    }
  }

  function handleClick(item, event) {
    if (enabled) {
      toggleOpen();
      if (item.enabled) {
        item.action(event);
      }
    }
  }

</script>

<div class="relative" bind:this="{containerDiv}">
  <div class="relative flex items-center {enabled ? 'text-black cursor-pointer' : 'text-gray-500'} p-1 rounded border border-gray-700" on:click={toggleOpen}><IconMenu/></div>
  {#if open}
    <div class="absolute right-0 w-48 bg-gray-100 border border-gray-700 shadow-xl cursor-pointer select-none">
      {#each items as item}
        <div class="block px-4 py-1 text-right {item.enabled ? 'text-gray-800 hover:bg-gray-300' : 'text-gray-500'}"
          on:click={e => handleClick(item, e)}>{item.label}</div>
      {/each}
    </div>
  {/if}
</div>
