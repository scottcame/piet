<script>
  import { current_view } from '../js/Stores';
  import AnalysesView from './AnalysesView.svelte';
  import DatasetsView from './DatasetsView.svelte';
  import DashboardsView from './DashboardsView.svelte';
</script>

<div class="uk-container uk-container-expand">
  {#if $current_view === "analyses"}
    <AnalysesView/>
  {:else if $current_view === "dashboards"}
    <DashboardsView/>
  {:else if $current_view === "datasets"}
    <DatasetsView/>
  {/if}
</div>
