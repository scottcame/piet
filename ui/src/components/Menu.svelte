<script>

  import IconMenu from './icons/IconMenu.svelte';

  export let items = [];

  // each item is: { label: "Item label", action: (e) => { ... }, enabled: true|false }

  let containerDiv;
  let open = false;

  let outsideClickListener = e => {
    if (!containerDiv.contains(e.target)) {
      open = false;
      document.removeEventListener("click", outsideClickListener);
    }
  }

  function toggleOpen(event) {
    open = !open;
    if (open) {
      document.addEventListener("click", outsideClickListener);
    } else {
      document.removeEventListener("click", outsideClickListener);
    }
  }

  function handleClick(item, event) {
    toggleOpen();
    if (item.enabled) {
      item.action(event);
    }
  }

</script>

<div class="relative" bind:this="{containerDiv}">
  <div class="relative h-8 w-8 flex items-center text-black p-1 border border-gray-900 cursor-default" on:click={toggleOpen}><IconMenu/></div>
  {#if open}
    <div class="absolute right-0 w-48 mt-1 bg-gray-100 shadow-xl cursor-default select-none">
      {#each items as item}
        <div class="block px-4 py-1 text-right {item.enabled ? 'text-gray-800 hover:bg-gray-300' : 'text-gray-500'}"
          on:click={e => handleClick(item, e)}>{item.label}</div>
      {/each}
    </div>
  {/if}
</div>
