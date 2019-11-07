<script>
  import { currentView } from '../js/Stores';
  import AnalysesView from './AnalysesView.svelte';
  import DatasetsView from './DatasetsView.svelte';
  import DashboardsView from './DashboardsView.svelte';
  export let model;
</script>

<div class="uk-container uk-container-expand">
  {#if $currentView === "analyses"}
    <AnalysesView model={model}/>
  {:else if $currentView === "dashboards"}
    <DashboardsView/>
  {:else if $currentView === "datasets"}
    <DatasetsView/>
  {/if}
</div>
