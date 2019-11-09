<script>

  import { createEventDispatcher } from 'svelte';

  export let model;
  let open = false;
  let containerDiv;
  const dispatch = createEventDispatcher();

  document.addEventListener("click", e => {
    if (!containerDiv.contains(e.target)) {
      open = false;
    }
  });

  function selectItem(idx) {
    let old = model.selectedIndex;
    model.selectedIndex = idx;
    open = false;
    dispatch("dropdownIndexChange", {
      old: old,
      new: idx
    });
  }

</script>

<div class="relative ml-2 mb-3" bind:this="{containerDiv}">
  <button type="button" class="w-full block bg-gray-300 font-semibold rounded py-2 focus:outline-none border-gray-800" on:click="{e => open = !open}">
    {model.selectedItem === null ? "Choose an analysis..." : model.selectedItem.label}
  </button>
  {#if open}
    <div class="absolute w-full mt-1 bg-gray-100 shadow-xl">
      {#each model.items as modelItem, idx}
        <div class="block px-4 py-2 text-gray-800 hover:bg-gray-300" on:click="{e => selectItem(idx)}">{modelItem.label}</div>
      {/each}
    </div>
  {/if}
</div>
