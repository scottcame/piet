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

<script>

  import { currentView } from '../js/Stores';
  import AnalysesView from './AnalysesView.svelte';
  import DatasetsView from './DatasetsView.svelte';
  import DashboardsView from './DashboardsView.svelte';

  export let repository;

  let analysesNavBarController;

  export const navBarController = {
    handleNewAnalysis: function(e) {
      analysesNavBarController.handleNewAnalysis(e);
    },
    handleBrowseAnalyses: function(e) {
      analysesNavBarController.handleBrowseAnalyses(e);
    }
  };

</script>

<div class="h-full {$currentView === 'analyses' ? '' : 'hidden'}">
  <AnalysesView repository={repository} bind:navBarController={analysesNavBarController}/>
</div>
<div class="{$currentView === 'dashboards' ? '' : 'hidden'}">
  <DashboardsView/>
</div>
<div class="{$currentView === 'datasets' ? '' : 'hidden'}">
  <DatasetsView/>
</div>
