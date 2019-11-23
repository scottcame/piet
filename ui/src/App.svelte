<script>

  import MainNavbar from './components/MainNavbar.svelte';
  import MainContainer from './components/MainContainer.svelte';
  import { currentView } from './js/Stores';
  import { List } from './js/collections/List';
  import { Workspace } from './js/model/Workspace';
  import { LocalRepository } from './js/model/Repository';

  let initialized = false;

  // default nav
  currentView.set("analyses");

  // in future this will change to a remote repo
  const repository = new LocalRepository();
  repository.init().then(() => {
    initialized = true;
    console.log("Initialization complete");
  });

  let navBarController;

</script>

{#if {initialized}}
<MainNavbar
  workspace={repository.workspace}
  on:nav-new-analysis="{e => navBarController.handleNewAnalysis(e)}"
  on:nav-browse-analyses="{e => navBarController.handleBrowseAnalyses(e)}"
/>
<MainContainer repository={repository} bind:navBarController={navBarController}/>
{/if}
