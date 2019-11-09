<script>
  import IconCircle from './icons/IconCircle.svelte';
  import IconRows from './icons/IconRows.svelte';
  import IconColumns from './icons/IconColumns.svelte';
  import IconFunnel from './icons/IconFunnel.svelte';
  import IconSquareBullet from './icons/IconSquareBullet.svelte'
  export let treeModelNode;
</script>

<div class="flex justify-between items-center text-gray-900 pb-1 mr-1">

  <div class="items-center flex pl-2">
    <div class="flex inline items-center">
      <IconSquareBullet/>
      <span class="ml-1">{treeModelNode.label}</span>
    </div>
  </div>

  {#if treeModelNode.type === "dimension"}
    <div class="flex flex-inline items-center justify-end mr-2 text-gray-600">
      <IconRows/>
      <IconColumns/>
      <IconFunnel/>
    </div>
  {:else if treeModelNode.type === "measure"}
    <div class="flex flex-inline items-center justify-end mr-2 text-gray-600">
      <IconCircle/>
    </div>
  {/if}

</div>
