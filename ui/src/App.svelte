<script>

  import MainNavbar from './components/MainNavbar.svelte';
  import MainContainer from './components/MainContainer.svelte';
  import { current_view } from './js/stores.js';

  // default nav
  current_view.set("analyses");

</script>

<MainNavbar/>
<MainContainer/>
