<script>

  import MainNavbar from './components/MainNavbar.svelte';
  import MainContainer from './components/MainContainer.svelte';
  import { currentView } from './js/Stores';
  import { List } from './js/collections/List';
  import { Workspace } from './js/model/Workspace';
  import { LocalRepository } from './js/model/Repository';

  // default nav
  currentView.set("analyses");

  const workspace = new Workspace();

  // in future this will change to a remote repo
  const repository = new LocalRepository.loadFromTestMetadata();

  let navBarController;

  function newAnalysis(e) {
    navBarController.handleNewAnalysis(e);
  }

</script>

<MainNavbar workspace={workspace} on:nav-new-analysis="{newAnalysis}"/>
<MainContainer workspace={workspace} repository={repository} bind:navBarController={navBarController}/>
