<script>

  import MainNavbar from './components/MainNavbar.svelte';
  import MainContainer from './components/MainContainer.svelte';
  import { currentView } from './js/Stores';
  import { List } from './js/collections/List';
  import { Workspace } from './js/model/Workspace';
  import { LocalRepository, RemoteRepository } from './js/model/Repository';

  // this file does not exist by default. copy from ConfigurationProperties.template.ts to ConfigurationProperties.ts.
  import { ConfigurationProperties } from './ConfigurationProperties';

  let initialized = false;

  // default nav
  currentView.set("analyses");

  const repository = ConfigurationProperties.MONDRIAN_REST_URL ? new RemoteRepository(ConfigurationProperties.MONDRIAN_REST_URL) : new LocalRepository();

  repository.init().then(() => {
    initialized = true;
    console.log("Initialization complete");
  });

  let navBarController;

</script>

{#if {initialized}}
  <div class="text-sm h-full">
    <MainNavbar
      workspace={repository.workspace}
      on:nav-new-analysis="{e => navBarController.handleNewAnalysis(e)}"
      on:nav-browse-analyses="{e => navBarController.handleBrowseAnalyses(e)}"
    />
    <MainContainer repository={repository} bind:navBarController={navBarController}/>
  </div>
{/if}
