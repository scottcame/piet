<script>

  import { TreeMeasureNodeEvent } from '../js/ui/model/Tree';
  import { createEventDispatcher } from 'svelte';

  export let treeModelNode;
  export let currentAnalysis;

  let selected = false;
  const dispatch = createEventDispatcher();

  function toggleSelected() {
    selected = !selected;
    dispatch('nodeEvent', new TreeMeasureNodeEvent(treeModelNode.uniqueName, selected));
  }

  $: {
    selected = false;
    currentAnalysis.query.measures.forEach((measure) => {
      if (measure.uniqueName === treeModelNode.uniqueName) {
        selected = true;
      }
    });
  }

</script>

<div class="flex justify-between items-center text-gray-900 ml-1 my-px hover:bg-gray-200 { selected ? 'border border-gray-400' : '' }" on:click="{toggleSelected}">

  <div class="items-center flex pl-1">
    <div class="flex inline items-center">
      <span>{treeModelNode.label}</span>
    </div>
  </div>

  <div class="flex flex-inline items-center justify-end pr-1 text-gray-900 {selected ? '' : 'hidden'}">
      &#x2713;
  </div>

</div>

