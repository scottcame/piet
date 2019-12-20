<script>

  import { createEventDispatcher } from 'svelte';

  export let value;
  export let label = "Checkbox label";

  const dispatch = createEventDispatcher();

  function handleClick() {
    dispatch('click');
  }


</script>

<div class="flex flex-inline">
  <div class="mr-2 ml-1 border w-4 h-4 hover:bg-gray-300 {value ? 'bg-gray-900 hover:bg-gray-900' : ''}" on:click={ e => handleClick() }></div>
  <div>{label}</div>
</div>