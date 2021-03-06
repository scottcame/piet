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

  import TreeContainerNode from './TreeContainerNode.svelte';
  import Dropdown from './Dropdown.svelte';
  import Modal from './Modal.svelte';
  import Menu from './Menu.svelte';
  import SelectTable from './SelectTable.svelte';
  import MondrianResultTable from './MondrianResultTable.svelte';
  import MondrianResultViz from './MondrianResultViz.svelte';
  import QueryFilterModal from './QueryFilterModal.svelte';
  import LabeledCheckbox from './LabeledCheckbox.svelte';
  import IconTable from './icons/IconTable.svelte';
  import IconViz from './icons/IconViz.svelte';

  import { AnalysesController } from '../js/controller/AnalysesController';

  export let repository;

  // reactive properties updated by the controller
  let viewProperties = AnalysesController.VIEW_PROPERTIES;

  // properties that are only referenced within the view
  let analysisTitleInput;
  let analysisDescriptionInput;
  let browseAnalysesSelectedIndex;
  let currentAnalysisDescriptionDisplay;

  $: {
    currentAnalysisDescriptionDisplay = viewProperties.currentAnalysis ? (viewProperties.currentAnalysis.description === null ? viewProperties.currentAnalysis.name + " [no description]" : viewProperties.currentAnalysis.description) : null;
    if (analysisTitleInput) analysisTitleInput.value = viewProperties.currentAnalysis ? viewProperties.currentAnalysis.name : null;
    if (analysisDescriptionInput) analysisDescriptionInput.value = viewProperties.currentAnalysis ? viewProperties.currentAnalysis.description : null;
  }

  // create the controller and pass it the required property updater
  let controller = new AnalysesController(repository, {
    update(field, value) {
      if (viewProperties[field] === undefined) {
        throw new Error('Field ' + field + ' does not exist in analyses view properties');
      }
      if (value !== undefined) {
        viewProperties[field] = value; // this is the key assignment that actually forces the reactivity (controller calls back here to force view updates)
      }
    }
  });

  // note that models (dropdown models, table models, tree nodes, etc.) manage their own reactive properties with their own (explicit or implicit) controllers

  let initPromise = controller.init();

  export const navBarController = {
    handleNewAnalysis: function(e) {
      controller.newAnalysis();
    },
    handleBrowseAnalyses: function(e) {
      controller.browseAnalyses();
    }
  };

  function handleDatasetTreeNodeEvent(event) {
    let detail = event.detail;
    if (detail !== undefined) {
      event = detail;
      while(event instanceof CustomEvent) {
        event = event.detail;
      }
    }
    controller.handleDatasetTreeNodeEvent(event);
  }

  let resultsViewMode = "table";

  function toggleResultsViewMode() {
    if (!viewProperties.executingQuery) {
      if (resultsViewMode === "table") {
        resultsViewMode = "viz";
      } else {
        resultsViewMode = "table";
      }
    }
  }

  function undoLastAnalysisEdit() {
    controller.undoLastAnalysisEdit();
  }

  const sidebarResizeClickListener = (e) => {
    sidebarCollapsed = !sidebarCollapsed;
    const sidebarInside = document.querySelector("#sidebar-inside");
    const sidebar = document.querySelector("#sidebar");
    const main = document.querySelector("#main");
    if (sidebarCollapsed) {
      sidebarInside.classList.add("invisible");
      sidebarInside.classList.remove("visible");
      sidebar.classList.remove("w-1/4");
      sidebar.classList.add("w-0");
      main.classList.remove("w-3/4");
      main.classList.add("w-full");
    } else {
      sidebarInside.classList.remove("invisible");
      sidebarInside.classList.add("visible");
      sidebar.classList.remove("w-0");
      sidebar.classList.add("w-1/4");
      main.classList.add("w-3/4");
      main.classList.remove("w-full");
      sidebar.style.cursor = "default";
      sidebar.removeEventListener("click", sidebarResizeClickListener);
    }
  };

  let sidebarCollapsed = false;

  function sidebarMousemove(e) {
    const sidebarDiv = e.target;
    const rect = sidebarDiv.getBoundingClientRect();
    if (Math.abs(e.clientX - rect.right) < 5) {
      sidebarDiv.style.cursor = "col-resize";
      sidebarDiv.addEventListener("click", sidebarResizeClickListener);
    } else {
      sidebarDiv.style.cursor = "default";
      sidebarDiv.removeEventListener("click", sidebarResizeClickListener);
    }
  }

</script>

{#await initPromise}
<div></div>
{:then _x}

<div class="w-full h-full mt-24 text-center {viewProperties.analysesInWorkspace ? 'hidden' : ''}">
  No analyses in workspace. Choose "New" or "Browse" from analyses menu above to bring analyses into your workspace.
</div>

<div class="w-full h-full mt-24 text-center {viewProperties.errorModalMessage ? '' : 'hidden'}">
  {viewProperties.errorModalMessage}
</div>

<div class="w-full h-full mt-24 text-center {viewProperties.executeQueryErrorModalType ? '' : 'hidden'}">
  {#if viewProperties.executeQueryErrorModalType === "timeout"}
    Query timed out, click <span class="underline cursor-pointer" on:click={undoLastAnalysisEdit}>here</span> to continue.
  {:else}
    Query error, click <span class="underline cursor-pointer" on:click={undoLastAnalysisEdit}>here</span> to continue.
    {#if viewProperties.currentAnalysis && !viewProperties.currentAnalysis.undoAvailable}
    (Unfortunately, error is unrecoverable; current analysis will be closed without saving.)
    {/if}
  {/if}
</div>

<div class="mt-2 p-2 h-full bg-gray-100 flex flex-inline {viewProperties.analysesInWorkspace ? '' : 'hidden'}">
  <div id="sidebar" class="{sidebarCollapsed ? 'w-0' : 'w-1/4'} h-full select-none pt-2 pr-2 border-2 overflow-y-auto {viewProperties.executingQuery ? 'opacity-75' : ''}" on:mousemove|self="{sidebarMousemove}">
    <div class="w-full h-full" id="sidebar-inside">
      <div class="flex flex-inline items-center justify-between mb-2 cursor-default">
        <Dropdown dropdownModel={controller.analysesDropdownModel} showCaret="true" initialSelectionIndex={viewProperties.analysesInWorkspace ? 0 : null} enabled={!viewProperties.executingQuery}/>
      </div>
      <TreeContainerNode treeModelNode={viewProperties.datasetRootTreeModelNode} collapsable={false} on:nodeEvent={handleDatasetTreeNodeEvent} currentAnalysis={viewProperties.currentAnalysis} enabled={!viewProperties.executingQuery}/>
    </div>
  </div>
  <div id="main" class="{sidebarCollapsed ? 'w-full' : 'w-3/4'} flex flex-col ml-1 mt-1 {viewProperties.currentAnalysis === null ? 'hidden' : ''}">
    <div class="w-full flex flex-inline justify-between mb-1 border-gray-500 border-b pb-1">
      <div class="w-full p-1 font-medium">{currentAnalysisDescriptionDisplay}</div>
      <div class="flex flex-inline">
        <div class="relative mr-1" on:click={toggleResultsViewMode}>
          <div class="relative flex items-center p-1 rounded border border-gray-700 {viewProperties.executingQuery ? 'text-gray-500' : 'text-black cursor-pointer'}">
            {#if resultsViewMode === "table"}
              <IconViz/>
            {:else}
              <IconTable/>
            {/if}
          </div>
        </div>
        <Menu items={controller.menuItems} enabled={!viewProperties.executingQuery}/>
      </div>
    </div>
    <div class="overflow-y-auto border border-2 border-gray-500">
    {#if viewProperties.executingQuery}
      <div class="p-2">Executing query...</div>
    {:else if resultsViewMode === "table"}
      <MondrianResultTable tableModel={controller.mondrianResultTableModel} rowHighlight={viewProperties.rowHighlight} tableFontIncrease={viewProperties.tableFontIncrease}/>
    {:else}
      <MondrianResultViz mondrianResultVegaViz={controller.mondrianResultVegaViz}/>
    {/if}
    </div>
  </div>
</div>

<Modal visible={viewProperties.showNewAnalysisModal}>
  <span slot="header">New Analysis: Choose Dataset</span>
  <div slot="body">
    <Dropdown dropdownModel={controller.datasetsDropdownModel} defaultLabel="Choose a dataset..."/>
  </div>
  <div slot="buttons">
    <div class="flex flex-inline justify-center mb-4 flex-none">
      <div class="border-2 mr-2 p-2 {viewProperties.datasetSelected ? 'hover:bg-gray-200' : ''}" on:click={e => {controller.chooseNewAnalysisDataset()}}>OK</div>
      <div class="border-2 ml-2 p-2 hover:bg-gray-200" on:click={e => {controller.closeNewAnalysisModal()}}>Cancel</div>
    </div>
  </div>
</Modal>

<Modal visible={viewProperties.showBrowseAnalysisModal}>
  <span slot="header">Browse Analyses</span>
  <div slot="body">
    <SelectTable tableModel={controller.browseAnalysesTableModel} noRowsLabel="No analyses found in repository." bind:selectedIndex={browseAnalysesSelectedIndex}/>
  </div>
  <div slot="buttons">
    <div class="flex flex-inline justify-center mb-4 flex-none">
      <div class="border-2 mr-2 p-2 { browseAnalysesSelectedIndex === null ? '' : 'hover:bg-gray-200' }"
        on:click={e => {controller.browseAnalysesOpenSelection(browseAnalysesSelectedIndex); browseAnalysesSelectedIndex=null;}}>Open</div>
      <div class="border-2 ml-2 p-2 hover:bg-gray-200" on:click={e => {browseAnalysesSelectedIndex=null; controller.closeBrowseAnalysisModal()}}>Cancel</div>
    </div>
  </div>
</Modal>

<Modal visible={viewProperties.showAnalysisMetadataModal}>
  <span slot="header">Analysis Properties{viewProperties.currentAnalysis ? (": " + viewProperties.currentAnalysis.name) : ''}</span>
  <div slot="body">
    <div class="w-full mr-1 flex flex-col">
      <div class="flex flex-col mb-1">
        <label class="block mb-1" for="input-analysis-title">Title:</label>
        <input class="bg-gray-200 appearance-none border border-gray-900 rounded w-full py-1 px-2 leading-tight focus:outline-none focus:bg-white"
          id="input-analysis-title" type="text" bind:this={analysisTitleInput}/>
      </div>
      <div class="flex flex-col mt-1">
        <label class="block mb-1" for="input-analysis-description">Description:</label>
        <textarea class="bg-gray-200 appearance-none border border-gray-900 rounded w-full py-1 px-2 leading-tight focus:outline-none focus:bg-white"
          id="input-analysis-description" type="text" rows="3"
          bind:this={analysisDescriptionInput}/>
      </div>
    </div>
    <div class="m-1 mt-4">
      {#if viewProperties.currentAnalysis}
        <LabeledCheckbox value={viewProperties.currentAnalysis.filterParentAggregates} on:click={ e => controller.toggleFilterParentAggregates() } label="Filter parent aggregates"/>
        <LabeledCheckbox value={viewProperties.currentAnalysis.nonEmpty} on:click={ e => controller.toggleNonEmpty() } label="Hide empty cells"/>
      {/if}
    </div>
  </div>
  <div slot="buttons">
    <div class="flex flex-inline justify-center mb-4 flex-none">
      <div class="border-2 mr-2 p-2 hover:bg-gray-200" on:click={e => {controller.confirmEditAnalysisMetadata(analysisTitleInput.value, analysisDescriptionInput.value)}}>OK</div>
      <div class="border-2 ml-2 p-2 hover:bg-gray-200" on:click={e => {controller.closeEditAnalysisMetadataModal()}}>Cancel</div>
    </div>
  </div>
</Modal>

<Modal visible={viewProperties.showAbandonEditsModal}>
  <span slot="header">Discard edits</span>
  <div slot="body">
    <p>Closing analysis "{viewProperties.currentAnalysis ? viewProperties.currentAnalysis.name : ''}" without saving will discard the edits you have made. Do you want to continue?</p>
  </div>
  <div slot="buttons">
    <div class="flex flex-inline justify-center mb-4 flex-none">
      <div class="border-2 mr-2 p-2 hover:bg-gray-200" on:click={e => {controller.abandonEdits(true)}}>Yes</div>
      <div class="border-2 ml-2 p-2 hover:bg-gray-200" on:click={e => {controller.abandonEdits(false)}}>No</div>
    </div>
  </div>
</Modal>

<Modal visible={viewProperties.showDeleteConfirmationModal}>
  <span slot="header">Confirm delete</span>
  <div slot="body">
    <p>You are about to delete analysis "{viewProperties.currentAnalysis ? viewProperties.currentAnalysis.name : ''}" from the repository permanently. Do you want to continue?</p>
  </div>
  <div slot="buttons">
    <div class="flex flex-inline justify-center mb-4 flex-none">
      <div class="border-2 mr-2 p-2 hover:bg-gray-200" on:click={e => {controller.confirmDelete(true)}}>Yes</div>
      <div class="border-2 ml-2 p-2 hover:bg-gray-200" on:click={e => {controller.confirmDelete(false)}}>No</div>
    </div>
  </div>
</Modal>

<QueryFilterModal visible={viewProperties.showQueryFilterModal} analysisController={controller}/>

{/await}
