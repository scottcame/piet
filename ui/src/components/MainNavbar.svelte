<!--
  Copyright 2020 National Police Foundation
  Copyright 2020 Scott Came Consulting LLC

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->

<!--
  Top navbar component
-->

<script>

  import { currentView } from '../js/Stores';
  import IconSearch from './icons/IconSearch.svelte';

  import { createEventDispatcher } from 'svelte';

  export let initialized = false;
  export let applicationTitle;
  export let logoImageUrl;

	const dispatch = createEventDispatcher();

  let navs = [
    {
      name: "analyses",
      disabled: false,
      active: true,
      action: () => {},
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
      disabled: true,
      active: false,
      action: () => {},
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
      action: () => {},
      subnav: []
    },
    {
      name: "settings",
      disabled: false,
      active: false,
      action: settings,
      subnav: []
    }
  ];

  let activeNav = navs.filter(nav => nav.active)[0];
  currentView.set(activeNav.name);

	function selectNav(nav) {
	  currentView.set(nav.name);
    activeNav.active = false;
    nav.active = true;
    activeNav = nav;
    navs = navs;
    nav.action()
	}

  function newAnalysis() {
    dispatch('nav-new-analysis', {});
  }

  function browseAnalyses() {
    dispatch('nav-browse-analyses', {});
  }

  function newDashboard() {
    console.log("New dashboard");
  }

  function browseDashboards() {
    console.log("Browse dashboards");
  }

  function settings() {
    dispatch('nav-settings', {});
  }

</script>

<nav class="flex items-center justify-between flex-wrap bg-gray-100 p-4 pt-2 pb-5 select-none">
  {#if initialized}
    <div>
      <a href="/">
        <div class="flex inline items-center">
          <img src='{logoImageUrl}' alt='logo' class="h-12"/>
          <span class='text-2xl pl-2 text-grey-800'>{applicationTitle}</span>
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
            <div class="mt-1 underline border-t absolute inset-below justify-between flex flex-row {nav.active ? '' : 'hidden'}">
              {#each nav.subnav as subnav, idx}
                <div class="px-8 {idx===0 ? 'pl-0' : ''} {idx===(nav.subnav.length-1) ? 'pr-0' : ''} cursor-pointer" on:click={subnav.action}>{subnav.name}</div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
      <div class="flex inline items-center ml-2 bg-white pl-2">
        <IconSearch/>
        <input class="p-2" type="search" placeholder="Search..." disabled>
      </div>
    </div>
  {/if}
</nav>
