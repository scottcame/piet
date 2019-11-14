<script>

  import { DropdownModel } from '../js/ui/model/Dropdown';
  import { DefaultListChangeEventListener } from '../js/collections/List';
  import { DefaultObservableChangeEventListener } from '../js/util/Observable';

  export let dropdownModel;
  export let defaultLabel = "Choose...";
  export let initialSelectionIndex = null;
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

  function toggleOpen(event) {
    open = !open;
    if (open) {
      document.addEventListener("click", outsideClickListener);
    } else {
      document.removeEventListener("click", outsideClickListener);
    }
  }

</script>

<div class="relative ml-2 w-full border border-gray-800" bind:this="{containerDiv}">
  <button type="button" class="w-full block bg-gray-300 font-semibold rounded py-2 focus:outline-none cursor-default" on:click={toggleOpen}>
    {dropdownLabel}
  </button>
  {#if open}
    <div class="absolute w-full mt-1 bg-gray-100 shadow-xl">
      {#each [...dropdownModel.items] as modelItem, idx}
        <div class="block px-4 py-2 text-gray-800 hover:bg-gray-300" on:click="{e => selectItem(idx)}">{modelItem.getLabel().value}</div>
      {/each}
    </div>
  {/if}
</div>
