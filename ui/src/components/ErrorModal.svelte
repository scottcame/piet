<script>
  export let message;
</script>

<div class="absolute top-0 left-0 h-full w-full items-center">
  <div class="h-full w-full absolute flex items-center justify-center top-0 left-0 text-center z-10">
    <div class="flex flex-col p-8 border border-gray-500">
      <div class="ml-4">{message}</div>
      <div class="ml-4">Once the problem is resolved, refresh the page to restore your workspace.</div>
    </div>
  </div>
</div>