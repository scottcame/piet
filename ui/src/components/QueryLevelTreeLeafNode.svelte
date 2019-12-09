<script>

  import { TreeModelLevelNodeEvent } from '../js/ui/model/Tree';
  import { createEventDispatcher } from 'svelte';

  export let treeModelNode;
  export let currentAnalysis;

  let selected = false;
  let rowOrientation = true;
  let sumSelected = false;
  let filterSelected = false;
  const dispatch = createEventDispatcher();

  function toggleSelected() {
    selected = !selected;
    dispatchNodeChangeEvent();
  }

  function sumClicked() {
    sumSelected = !sumSelected;
    dispatchNodeChangeEvent();
  }

  function orientationClicked() {
    rowOrientation = !rowOrientation;
    dispatchNodeChangeEvent();
  }

  function filterClicked() {
    filterSelected = !filterSelected;
    dispatchNodeChangeEvent();
  }

  function dispatchNodeChangeEvent() {
    dispatch('nodeEvent', new TreeModelLevelNodeEvent(treeModelNode.uniqueName, selected, rowOrientation, filterSelected, sumSelected));
  }

  $: {
    selected = false;
    rowOrientation = true;
    sumSelected = false;
    filterSelected = false;
    currentAnalysis.query.levels.forEach((level) => {
      if (level.uniqueName === treeModelNode.uniqueName) {
        selected = true;
        rowOrientation = level.rowOrientation;
        sumSelected = level.sumSelected;
        filterSelected = level.filterSelected;
      }
    });
  }

</script>

<div class="flex justify-between items-center text-gray-900 py-px hover:bg-gray-200" on:click="{toggleSelected}">

  <div class="items-center flex pl-2">
    <div class="flex inline items-center">
      <span>{treeModelNode.label}</span>
    </div>
  </div>

  <div class="flex flex-inline items-center justify-end py-px {selected ? '' : 'hidden'}">
    <div class="items-center mr-1 border border-gray-900" on:click|stopPropagation={orientationClicked}>
      <svg viewBox="0 0 20 20" class="stroke-current" height="14" fill="none" stroke-width="1.3">
        {#if rowOrientation}
          <rect x="6" y="2.1" width="8" height="8"/>
          <rect x="6" y="10.0" width="8" height="8"/>
        {:else}
          <rect x="2.1" y="6" width="8" height="8"/>
          <rect x="10.1" y="6" width="8" height="8"/>
        {/if}
      </svg>
    </div>
    <div class="{sumSelected ? 'bg-gray-900 text-gray-200' : 'text-gray-900 bg-transparent'} border border-gray-900 px-px leading-none py-px mr-1" on:click|stopPropagation={sumClicked}>
      &#x03A3;
    </div>
    <div class="items-center mr-1 border border-gray-900 {filterSelected ? 'bg-gray-900 text-gray-200' : ''}" on:click|stopPropagation={filterClicked}>
      <svg x="0" y="0" viewBox="0 0 20 20" class="stroke-current" height="14" fill="none" stroke-width="1.4">
        <polygon points="3,3 4,7 8,10 8,17 12,17 12,10 16,7 17,3 3,3"/>
      </svg>
    </div>
  </div>

</div>

