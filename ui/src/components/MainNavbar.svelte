<!--
  Top navbar component
-->

<script>

  import { currentView } from '../js/Stores';

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
    <div class="flex inline items-center ml-2">
      <div class="p-2 bg-white h-10 items-center flex">
        <svg class="h-3 w-3 stroke-current" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  				<path d="M12.9056439,14.3198574 C11.5509601,15.3729184 9.84871145,16 8,16 C3.581722,16 0,12.418278 0,8 C0,3.581722 3.581722,0 8,0 C12.418278,0 16,3.581722 16,8 C16,9.84871145 15.3729184,11.5509601 14.3198574,12.9056439 L19.6568542,18.2426407 L18.2426407,19.6568542 L12.9056439,14.3198574 Z M8,14 C11.3137085,14 14,11.3137085 14,8 C14,4.6862915 11.3137085,2 8,2 C4.6862915,2 2,4.6862915 2,8 C2,11.3137085 4.6862915,14 8,14 Z" id="Combined-Shape"></path>
  			</svg>
      </div>
      <input class="text-sm p-2" type="search" placeholder="Search..." disabled>
    </div>
  </div>
</nav>
