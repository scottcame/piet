<!--
  Top navbar component
-->

<script>

  import { current_view } from '../js/stores.js';
  import { onMount } from 'svelte';

  let navs = [
    {
      name: "analyses",
      disabled: false
    },
    {
      name: "dashboards",
      disabled: true
    },
    {
      name: "datasets",
      disabled: true
    },
  ];

  let selected_nav = $current_view;

	function handleClicks(e) {
    let new_nav = e.target.id;
    if (new_nav !== selected_nav) {
	    current_view.set(new_nav.replace(/btn\-/, ''));
    }
	}

</script>

<style>
  ul.navitem-margin {
    /* needed to make nav items align w bottom of search box */
    margin-bottom: 7px;
  }
</style>

<div uk-sticky="media: 960" class="uk-navbar-container uk-sticky uk-active uk-sticky-below uk-sticky-fixed" style="position: fixed; top: 0px; width: 1813px;">
  <div class="uk-container uk-container-expand">
    <nav class="uk-navbar">
      <div class="uk-navbar-left">
        <a href="/" class="uk-navbar-item uk-logo">
          <div><img src='img/piet-logo.jpg' alt='logo'/>
            <span class='uk-padding-small'>Piet</span>
          </div>
        </a>
      </div>
      <div class="uk-navbar-right">
        <div class="uk-navbar-item">
          <ul uk-tab class="navitem-margin">
          {#each navs as nav}
            <li class="uk-padding uk-padding-remove-vertical uk-margin-small-top {nav.disabled ? 'uk-disabled' : 'uk-active'}" on:click={handleClicks}><a id="btn-{nav.name}" href="#foo">{nav.name}</a></li>
          {/each}
          </ul>
        </div>
        <div class="uk-navbar-item">
          <form class="uk-search uk-search-default">
            <span class="uk-search-icon-flip" uk-search-icon></span>
            <input class="uk-search-input" type="search" placeholder="Search..." disabled>
          </form>
        </div>
      </div>
    </nav>
  </div>
</div>
