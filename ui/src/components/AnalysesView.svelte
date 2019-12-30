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
      viewProperties[field] = value; // this is the key assignment that actually forces the reactivity (controller calls back here to force view updates)
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
    if (resultsViewMode === "table") {
      resultsViewMode = "viz";
    } else {
      resultsViewMode = "table";
    }
  }

</script>

{#await initPromise}
<div></div>
{:then _x}

<div class="w-full h-full mt-24 text-center {viewProperties.analysesInWorkspace ? 'hidden' : ''}">
  No analyses in workspace. Choose "New" or "Browse" from analyses menu above to bring analyses into your workspace.
</div>

<div class="mt-2 p-2 h-full bg-gray-100 flex flex-inline {viewProperties.analysesInWorkspace ? '' : 'hidden'}">
  <div class="w-1/4 h-full select-none pt-2 pr-2 border-2 overflow-y-auto">
    <div class="flex flex-inline items-center justify-between mb-2">
      <Dropdown dropdownModel={controller.analysesDropdownModel} showCaret="true"/>
    </div>
    <TreeContainerNode treeModelNode={viewProperties.datasetRootTreeModelNode} collapsable={false} on:nodeEvent={handleDatasetTreeNodeEvent} currentAnalysis={viewProperties.currentAnalysis}/>
  </div>
  <div class="w-3/4 flex flex-col ml-1 mt-1 {viewProperties.currentAnalysis === null ? 'hidden' : ''}">
    <div class="w-full flex flex-inline justify-between mb-1 border-gray-500 border-b pb-1">
      <div class="w-full p-1 font-medium">{currentAnalysisDescriptionDisplay}</div>
      <div class="flex flex-inline">
        <div class="relative mr-1" on:click={toggleResultsViewMode}>
          <div class="relative flex items-center text-black p-1 rounded border border-gray-700 cursor-pointer">
            {#if resultsViewMode === "table"}
              <IconTable/>
            {:else}
              <IconViz/>
            {/if}
          </div>
        </div>
        <Menu items={controller.menuItems}/>
      </div>
    </div>
    {#if resultsViewMode === "table"}
      <div class="overflow-y-auto border border-2 border-gray-500"><MondrianResultTable tableModel={controller.mondrianResultTableModel}/></div>
    {:else}
      <div class="overflow-y-auto border border-2 border-gray-500"><MondrianResultViz mondrianResultVegaViz={controller.mondrianResultVegaViz}/></div>
    {/if}
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