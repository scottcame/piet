<script>

  import { TreeModelMeasureNodeEvent } from '../js/ui/model/Tree';
  import { createEventDispatcher } from 'svelte';

  export let treeModelNode;

  let selected = false;
  const dispatch = createEventDispatcher();

  function toggleSelected() {
    selected = !selected;
    dispatch('nodeEvent', new TreeModelMeasureNodeEvent(treeModelNode.uniqueName, selected));
  }

</script>

<div class="flex justify-between items-center text-gray-900 py-px hover:bg-gray-200" on:click="{toggleSelected}">

  <div class="items-center flex pl-2">
    <div class="flex inline items-center">
      <span>{treeModelNode.label}</span>
    </div>
  </div>

  <div class="flex flex-inline items-center justify-end text-gray-900 {selected ? '' : 'hidden'}">
      &#x2713;
  </div>

</div>

