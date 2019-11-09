<script>

  import { Model } from '../js/model/Model';
  import TreeContainerNode from './TreeContainerNode.svelte';
  import Dropdown from './Dropdown.svelte';

  export let model;
  let rootTreeModelNode = null;

  function selectAnalysis(idx) {
    rootTreeModelNode = model.analyses[idx].dataset.rootTreeModelNode;
  }

</script>

<div class="mt-2 h-screen p-2 bg-gray-100">
  <div class="w-1/4 h-screen bg-gray-100 select-none pt-2 pr-2 border-2">
    <Dropdown model={model.analysesSelectModel} on:dropdownIndexChange={(e) => {selectAnalysis(e.detail.new)}}/>
    <TreeContainerNode treeModelNode={rootTreeModelNode}/>
  </div>
</div>
