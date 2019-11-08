<script>

  import { Model } from '../js/model/Model';
  import TreeContainerNode from './TreeContainerNode.svelte';

  export let model;

  let analysesCount = model.analyses.length;
  let analysis = model.analyses[0];

</script>

<div class="mt-2 h-screen p-2 bg-gray-100">
  <div class="w-1/4 h-screen bg-gray-100 select-none pt-2 pr-2 border-2">
    <TreeContainerNode treeModelNode={analysis.dataset.rootTreeModelNode}/>
  </div>
</div>
