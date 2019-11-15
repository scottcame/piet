<script>

  import { currentView } from '../js/Stores';
  import AnalysesView from './AnalysesView.svelte';
  import DatasetsView from './DatasetsView.svelte';
  import DashboardsView from './DashboardsView.svelte';

  export let workspace;
  export let repository;

  let analysesNavBarController;

  export const navBarController = {
    handleNewAnalysis: function(e) {
      analysesNavBarController.handleNewAnalysis(e);
    }
  };

</script>

<div class="{$currentView === 'analyses' ? '' : 'hidden'}">
  <AnalysesView workspace={workspace} repository={repository} bind:navBarController={analysesNavBarController}/>
</div>
<div class="{$currentView === 'dashboards' ? '' : 'hidden'}">
  <DashboardsView/>
</div>
<div class="{$currentView === 'datasets' ? '' : 'hidden'}">
  <DatasetsView/>
</div>
