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
      <!-- <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="stroke-current h-5 w-5">
        <path d="M9.3 8.7a1 1 0 0 1 1.4-1.4l4 4a1 1 0 0 1 0 1.4l-4 4a1 1 0 0 1-1.4-1.4l3.29-3.3-3.3-3.3z"/>
      </svg> -->
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
