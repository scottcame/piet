<script>

  import { TreeLevelNodeEvent } from '../js/ui/model/Tree';
  import { createEventDispatcher } from 'svelte';

  export let treeModelNode;
  export let currentAnalysis;
  export let enabled = true;

  let selected = false;
  let rowOrientation = true;
  let sumSelected = false;
  let filterActive = false;
  const dispatch = createEventDispatcher();

  function toggleSelected() {
    if (enabled) {
      selected = !selected;
      dispatchNodeChangeEvent();
    }
  }

  function orientationClicked() {
    if (enabled) {
      rowOrientation = !rowOrientation;
      dispatchNodeChangeEvent();
    }
  }

  function filterClicked() {
    if (enabled) {
      dispatch('nodeEvent', new TreeLevelNodeEvent(treeModelNode.uniqueName, selected, rowOrientation, true));
    }
  }

  function dispatchNodeChangeEvent() {
    dispatch('nodeEvent', new TreeLevelNodeEvent(treeModelNode.uniqueName, selected, rowOrientation, false));
  }

  $: {
    selected = false;
    rowOrientation = true;
    sumSelected = false;
    if (currentAnalysis) {
      currentAnalysis.query.levels.forEach((level) => {
        if (level.uniqueName === treeModelNode.uniqueName) {
          selected = true;
          rowOrientation = level.rowOrientation;
          filterActive = level.filterActive;
        }
      });
    }
  }

</script>

<div class="flex justify-between items-center text-gray-900 py-px my-px {enabled ? 'hover:bg-gray-200' : ''} { selected ? 'border border-gray-400' : '' }" on:click="{toggleSelected}">

  <div class="items-center flex pl-1">
    <div class="flex inline items-center">
      <span>{treeModelNode.label}</span>
    </div>
  </div>

  <div class="flex flex-inline items-center justify-end {selected ? '' : 'hidden'}">
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
    <div class="items-center mr-1 border border-gray-900 {filterActive ? 'bg-gray-900 text-gray-200' : ''}" on:click|stopPropagation={filterClicked}>
      <svg x="0" y="0" viewBox="0 0 20 20" class="stroke-current" height="14" fill="none" stroke-width="1.4">
        <polygon points="3,3 4,7 8,10 8,17 12,17 12,10 16,7 17,3 3,3"/>
      </svg>
    </div>
  </div>

</div>

