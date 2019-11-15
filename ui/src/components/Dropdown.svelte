<script>

  import { DropdownModel } from '../js/ui/model/Dropdown';
  import { DefaultListChangeEventListener } from '../js/collections/List';
  import { DefaultObservableChangeEventListener } from '../js/util/Observable';

  export let dropdownModel;
  export let defaultLabel = "Choose...";
  export let initialSelectionIndex = null;
  export let showCaret = false;
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
    open = !open;
    if (open) {
      document.addEventListener("click", outsideClickListener);
      document.addEventListener("keydown", escapeKeyListener);
    } else {
      document.removeEventListener("click", outsideClickListener);
      document.removeEventListener("keydown", escapeKeyListener);
    }
  }

</script>

<div class="relative ml-2 w-full border border-gray-700" bind:this="{containerDiv}">
  <button type="button" class="w-full flex flex-inline items-center bg-gray-300 font-semibold rounded py-1 focus:outline-none cursor-default" on:click={toggleOpen}>
    <div class="w-full">{dropdownLabel}</div>
    <div class="w-8 h-8 items-center {showCaret ? '' : 'hidden'}">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M15.3 9.3a1 1 0 0 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.4l3.3 3.29 3.3-3.3z"/>
      </svg>
    </div>
  </button>
  {#if open}
    <div class="absolute w-full bg-gray-100 border border-gray-700 shadow-xl">
      {#each [...dropdownModel.items] as modelItem, idx}
        <div class="block px-4 py-1 text-gray-800 hover:bg-gray-300" on:click="{e => selectItem(idx)}">{modelItem.getLabel().value}</div>
      {/each}
    </div>
  {/if}
</div>
