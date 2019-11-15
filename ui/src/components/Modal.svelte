<script>
  export let visible = false;
</script>

<div class="{visible ? '' : 'hidden'}">
  <div class="h-screen w-full fixed top-0 left-0 bg-gray-300 opacity-50 z-0">
  </div>
  <div class="h-screen w-full fixed flex items-center justify-center top-0 left-0 z-10">
    <div class="bg-white rounded shadow w-1/3 max-h-full overflow-visible select-none border border-gray-500">
      <div class="bg-gray-300 p-2 font-semibold">
          <slot name="header">Title</slot>
      </div>
      <div class="p-6">
          <slot name="body">This is the body of the modal dialog, perhaps this line will be long enough to wrap.</slot>
      </div>
      <slot name="buttons">
        <div class="flex flex-inline justify-center mb-4 flex-none">
          <div class="border-2 mr-2 p-2 hover:bg-gray-200">OK</div>
          <div class="border-2 ml-2 p-2 hover:bg-gray-200">Cancel</div>
        </div>
      </slot>
    </div>
  </div>
</div>
