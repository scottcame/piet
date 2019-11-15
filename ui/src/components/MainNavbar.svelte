<!--
  Top navbar component
-->

<script>

  import { currentView } from '../js/Stores';
  import IconSearch from './icons/IconSearch.svelte';

  import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

  export let workspace;

  let navs = [
    {
      name: "analyses",
      disabled: false,
      active: true,
      subnav: [
        {
          name: "New",
          action: newAnalysis
        },
        {
          name: "Browse",
          action: browseAnalyses
        }
      ]
    },
    {
      name: "dashboards",
      disabled: false,
      active: false,
      subnav: [
        {
          name: "New",
          action: newDashboard
        },
        {
          name: "Browse",
          action: browseDashboards
        }
      ]
    },
    {
      name: "datasets",
      disabled: true,
      active: false,
      subnav: []
    },
  ];

  let activeNav = navs.filter(nav => nav.active)[0];
  currentView.set(activeNav.name);

	function selectNav(nav) {
	  currentView.set(nav.name);
    activeNav.active = false;
    nav.active = true;
    activeNav = nav;
    navs = navs;
	}

  function newAnalysis() {
    dispatch('nav-new-analysis', {});
  }

  function browseAnalyses() {
    console.log("Browse analyses");
  }

  function newDashboard() {
    console.log("New dashboard");
  }

  function browseDashboards() {
    console.log("Browse dashboards");
  }

</script>

<nav class="flex items-center justify-between flex-wrap bg-gray-100 p-4 pt-2 pb-5 select-none">
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
        <div
          class="relative block inline-block mr-5 cursor-default {nav.disabled ? '' : (nav.active ? 'text-gray-900' : 'hover:text-gray-900 cursor-pointer')}"
          on:click={nav.disabled ? () => {} : () => {selectNav(nav)}}>
          <div>{nav.name}</div>
          <div class="text-sm mt-1 underline border-t absolute inset-below justify-between flex flex-row {nav.active ? '' : 'hidden'}">
            {#each nav.subnav as subnav, idx}
              <div class="px-8 {idx===0 ? 'pl-0' : ''} {idx===(nav.subnav.length-1) ? 'pr-0' : ''} cursor-pointer" on:click={subnav.action}>{subnav.name}</div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
    <div class="flex inline items-center ml-2 bg-white pl-2">
      <IconSearch/>
      <input class="text-sm p-2" type="search" placeholder="Search..." disabled>
    </div>

  </div>
</nav>
