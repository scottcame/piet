<script>
  import { currentView } from '../js/Stores';
  import AnalysesView from './AnalysesView.svelte';
  import DatasetsView from './DatasetsView.svelte';
  import DashboardsView from './DashboardsView.svelte';
  export let pietModel;
</script>

<div class="uk-container uk-container-expand">
  {#if $currentView === "analyses"}
    <AnalysesView pietModel={pietModel}/>
  {:else if $currentView === "dashboards"}
    <DashboardsView/>
  {:else if $currentView === "datasets"}
    <DatasetsView/>
  {/if}
</div>
