<script>
  export let treeModelNode;
</script>

<div class="flex justify-between items-center text-gray-900 pb-1 mr-1">

  <div class="items-center flex pl-2">
    <div class="flex inline items-center">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="stroke-current h-5 w-5">
        <path d="M9.3 8.7a1 1 0 0 1 1.4-1.4l4 4a1 1 0 0 1 0 1.4l-4 4a1 1 0 0 1-1.4-1.4l3.29-3.3-3.3-3.3z"/>
      </svg>
      <span>{treeModelNode.label}</span>
    </div>
  </div>

  {#if treeModelNode.type === "dimension"}
    <div class="flex flex-inline items-center justify-end mr-2 text-gray-600">
      <div class="h-4 w-4 items-center flex ml-2 hover:text-gray-900">
        <svg viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="stroke-current h-5 w-5" fill="none" stroke-width="1.5">
    				<path d="M0,3 L20,3 L20,5 L0,5 L0,3 Z M0,9 L20,9 L20,11 L0,11 L0,9 Z M0,15 L20,15 L20,17 L0,17 L0,15 Z"></path>
    		</svg>
      </div>
      <div class="h-4 w-4 items-center flex ml-2 hover:text-gray-900">
        <svg viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="stroke-current h-5 w-5" fill="none" stroke-width="1.5">
            <g transform="rotate(90 10 10)">
    				<path d="M0,3 L20,3 L20,5 L0,5 L0,3 Z M0,9 L20,9 L20,11 L0,11 L0,9 Z M0,15 L20,15 L20,17 L0,17 L0,15 Z"></path>
            </g>
    		</svg>
      </div>
      <div class="h-4 w-4 items-center flex ml-2 hover:text-gray-900">
        <svg viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="stroke-current h-5 w-5" fill="none" stroke-width="1.75">
  					<path d="M12,12 L20,4 L20,0 L0,0 L0,4 L8,12 L8,20 L12,16 L12,12 Z" id="Combined-Shape"></path>
  			</svg>
      </div>
    </div>
  {:else if treeModelNode.type === "measure"}
    <div class="flex flex-inline items-center justify-end mr-2 text-gray-600">
      <div class="h-4 w-4 items-center flex ml-2 hover:text-gray-900">
        <svg viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="stroke-current h-5 w-5">
    				<circle cx="10" cy="10" r="8" fill="none" stroke-width="2"/>
        </svg>
      </div>
    </div>
  {/if}

</div>
