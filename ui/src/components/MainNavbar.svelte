<!--
  Top navbar component
-->

<script>

  import { currentView } from '../js/Stores';
  import IconSearch from './icons/IconSearch.svelte';

  let navs = [
    {
      name: "analyses",
      disabled: false,
      default: true
    },
    {
      name: "dashboards",
      disabled: true,
      default: false
    },
    {
      name: "datasets",
      disabled: true,
      default: false
    },
  ];

  currentView.set(navs.filter(nav => nav.default)[0].name);

	function handleClicks(e) {
    console.log("Nav clicked " + e.target.id);
    let new_nav = e.target.id;
	  currentView.set(new_nav.replace(/btn\-/, ''));
	}

</script>

<style>
</style>

<nav class="flex items-center justify-between flex-wrap bg-gray-100 p-4">
  <div>
		<a href="/">
      <div class="flex inline items-center">
        <img src='img/piet-logo.jpg' alt='logo'/>
        <span class='text-2xl pl-2 text-grey-800'>Piet</span>
      </div>
		</a>
	</div>
  <div class="flex flex-inline justify-end items-center text-gray-500">
    <div>
      {#each navs as nav}
        <a
          class="block inline-block mr-5 cursor-default {nav.disabled ? '' : 'hover:text-gray-900 cursor-pointer'}"
          on:click={nav.disabled ? () => {} : handleClicks}
          id="btn-{nav.name}"
          href="#foo">{nav.name}
        </a>
      {/each}
    </div>
    <div class="flex inline items-center ml-2 bg-white pl-2">
      <IconSearch/>
      <input class="text-sm p-2" type="search" placeholder="Search..." disabled>
    </div>
  </div>
</nav>
