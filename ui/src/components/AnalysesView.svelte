<script>

  import IconMenu from './icons/IconMenu.svelte';
  import TreeContainerNode from './TreeContainerNode.svelte';
  import Dropdown from './Dropdown.svelte';
  import Modal from './Modal.svelte';
  import Menu from './Menu.svelte';
  import SelectTable from './SelectTable.svelte';

  import { Analysis } from '../js/model/Analysis';
  import { DropdownModel } from '../js/ui/model/Dropdown';
  import { TableModel } from '../js/ui/model/Table';
  import { DatasetAdapterFactory } from '../js/ui/adapters/DatasetAdapterFactory';
  import { AnalysisAdapterFactory } from '../js/ui/adapters/AnalysisAdapterFactory';
  import { DefaultObservableChangeEventListener } from '../js/util/Observable';
  import { DefaultListChangeEventListener, ListChangeEvent } from '../js/collections/List';

  export let workspace;
  export let repository;

  export const navBarController = {
    handleNewAnalysis: function(e) {
      newAnalysis();
    },
    handleBrowseAnalyses: function(e) {
      browseAnalyses();
    }
  };

  let analysesDropdownModel  = new DropdownModel(workspace.analyses);
  let analysesInWorkspace = workspace.analyses.length;
  let currentAnalysis = null;
  let currentAnalysisDescriptionDisplay;

  let datasetRootTreeModelNode = null;
  let datasetRootTreeNodes = [];

  let showNewAnalysisModal = false;
  let newAnalysisSelectedDataset;
  let datasets = repository.browseDatasets();
  let datasetsDropdownModel = new DropdownModel(datasets);

  let showBrowseAnalysisModal = false;
  let browseAnalysesTableModel = AnalysisAdapterFactory.getInstance().getTableModel(repository.analyses);
  let browseAnalysesSelectedIndex;

  let showAnalysisMetadataModal = false;
  let analysisTitleInput;
  let analysisDescriptionInput;

  workspace.analyses.addChangeEventListener(new DefaultListChangeEventListener(e => {
    analysesInWorkspace = workspace.analyses.length;
  }));

  function handleAnalysisSelection() {
    const selectedIndex = analysesDropdownModel.selectedIndex.value;
    currentAnalysis = analysesDropdownModel.selectedItem; // just to give it a better name; maybe not needed...
    if (selectedIndex === null) {
      datasetRootTreeModelNode = null;
    } else {
      // caching these for performance (e.g., the foodmart schema is pretty large)
      if (!datasetRootTreeNodes[selectedIndex]) {
        datasetRootTreeNodes[selectedIndex] = DatasetAdapterFactory.getInstance().createRootTreeModelNode(workspace.analyses.get(selectedIndex).dataset);
      }
      datasetRootTreeModelNode = datasetRootTreeNodes[selectedIndex];
    }
  }

  analysesDropdownModel.selectedIndex.addChangeEventListener(new DefaultObservableChangeEventListener(e => handleAnalysisSelection()));

  let datasetSelected = false;
  datasetsDropdownModel.selectedIndex.addChangeEventListener(new DefaultObservableChangeEventListener(e => {
    datasetSelected = e.newValue !== null;
  }));

  /*

    Unresolved philosophical issue...  Not sure whether these ui components should be directly referencing the workspace object, or whether
    ui components should *only* have reference to ui models, which in turn reference the workspace. To be determined...

  */

  function closeCurrentAnalysis() {
    let removedAnalysis = workspace.analyses.removeAt(analysesDropdownModel.selectedIndex.value);
    removedAnalysis.getLabel().clearChangeEventListeners();
  }

  function newAnalysis() {
    showNewAnalysisModal = true;
  }

  function closeNewAnalysisModal() {
    showNewAnalysisModal = false;
    datasetsDropdownModel.selectedIndex.value = null;
  }

  function browseAnalyses() {
    repository.browseAnalyses().then(() => {
      showBrowseAnalysisModal = true;
    });
  }

  function closeBrowseAnalysisModal() {
    showBrowseAnalysisModal = false;
  }

  function browseAnalysesOpenSelection() {
    if (browseAnalysesSelectedIndex !== null) {
      closeBrowseAnalysisModal();
      workspace.analyses.add(repository.analyses.get(browseAnalysesSelectedIndex));
      analysesDropdownModel.selectedIndex.value = workspace.analyses.length-1;
      browseAnalysesSelectedIndex = null;
    }
  }

  function chooseNewAnalysisDataset() {
    if (datasetsDropdownModel.selectedItem) {
      let currentAnalysisCount = workspace.analyses.length;
      workspace.analyses.add(new Analysis(datasetsDropdownModel.selectedItem, "Analysis " + (currentAnalysisCount+1)));
      closeNewAnalysisModal();
      analysesDropdownModel.selectedIndex.value = currentAnalysisCount;
    }
  }

  function analysisInput(e) {
    analysesDropdownModel.selectedItem.getLabel().value = e.target.value;
  }

  function getCurrentAnalysisTitleDisplay() {
    return currentAnalysis === null ? '' : currentAnalysis.name.value;
  }

  $: currentAnalysisDescriptionDisplay = currentAnalysis === null ? '' :
    (currentAnalysis.description === null ? (getCurrentAnalysisTitleDisplay() + " [no description]") : currentAnalysis.description)

  let menuItems = [
    { label: "Edit metadata...", action: (e) => { openEditAnalysisMetadataModal(); }, enabled: true },
    { label: "Cancel edits", action: (e) => { console.log(e); }, enabled: false },
    { label: "Close", action: (e) => { closeCurrentAnalysis(); }, enabled: true },
  ];

  function closeEditAnalysisMetadataModal() {
    showAnalysisMetadataModal = false;
  }

  function openEditAnalysisMetadataModal() {
    analysisTitleInput.value = currentAnalysis.name.value;
    analysisDescriptionInput.value = currentAnalysis.description;
    showAnalysisMetadataModal = true;
  }

  function confirmEditAnalysisMetadata() {
    // todo: handle validation logic...Modal.svelte needs to be passed some kind of validation class...
    currentAnalysis.name.value = analysisTitleInput.value;
    let newDescription = analysisDescriptionInput.value;
    if (!newDescription || !newDescription.trim().length) {
      currentAnalysis.description = null;;
    } else {
      currentAnalysis.description = newDescription.trim();
    }
    closeEditAnalysisMetadataModal();
  }


</script>

<div class="w-full mt-24 text-center {analysesInWorkspace ? 'hidden' : ''}">
  No analyses in workspace. Choose "New" or "Browse" from analyses menu above to bring analyses into your workspace.
</div>

<div class="mt-2 h-screen p-2 bg-gray-100 flex flex-inline {analysesInWorkspace ? '' : 'hidden'}">
  <div class="w-1/4 h-screen select-none pt-2 pr-2 border-2">
    <div class="flex flex-inline items-center justify-between mb-2">
      <Dropdown dropdownModel={analysesDropdownModel} showCaret="true"/>
    </div>
    <TreeContainerNode treeModelNode={datasetRootTreeModelNode}/>
  </div>
  <div class="w-3/4 h-screen flex flex-col ml-1 mt-1 {currentAnalysis === null ? 'hidden' : ''}">
    <div class="w-full flex flex-inline justify-between mb-1">
      <div class="w-full p-1 text-lg font-medium">{currentAnalysisDescriptionDisplay}</div>
      <Menu items={menuItems}/>
    </div>
    <div class="flex bg-teal-300">
      <div>Table for {currentAnalysis === null ? "analyses" : currentAnalysis.name.value} will go here.</div>
    </div>
  </div>
</div>
<Modal visible={showNewAnalysisModal}>
  <span slot="header">New Analysis: Choose Dataset</span>
  <div slot="body">
    <Dropdown dropdownModel={datasetsDropdownModel} defaultLabel="Choose a dataset..."/>
  </div>
  <div slot="buttons">
    <div class="flex flex-inline justify-center mb-4 flex-none">
      <div class="border-2 mr-2 p-2 {datasetSelected ? 'hover:bg-gray-200' : ''}" on:click={chooseNewAnalysisDataset}>OK</div>
      <div class="border-2 ml-2 p-2 hover:bg-gray-200" on:click={closeNewAnalysisModal}>Cancel</div>
    </div>
  </div>
</Modal>
<Modal visible={showBrowseAnalysisModal}>
  <span slot="header">Browse Analyses</span>
  <div slot="body">
    <SelectTable tableModel={browseAnalysesTableModel} bind:selection={browseAnalysesSelectedIndex}/>
  </div>
  <div slot="buttons">
    <div class="flex flex-inline justify-center mb-4 flex-none">
      <div class="border-2 mr-2 p-2 { browseAnalysesSelectedIndex === null ? '' : 'hover:bg-gray-200' }" on:click={browseAnalysesOpenSelection}>Open</div>
      <div class="border-2 ml-2 p-2 hover:bg-gray-200" on:click={closeBrowseAnalysisModal}>Cancel</div>
    </div>
  </div>
</Modal>
<Modal visible={showAnalysisMetadataModal}>
  <span slot="header">Edit Analysis Metadata</span>
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
  </div>
  <div slot="buttons">
    <div class="flex flex-inline justify-center mb-4 flex-none">
      <div class="border-2 mr-2 p-2 hover:bg-gray-200" on:click={confirmEditAnalysisMetadata}>OK</div>
      <div class="border-2 ml-2 p-2 hover:bg-gray-200" on:click={closeEditAnalysisMetadataModal}>Cancel</div>
    </div>
  </div>
</Modal>
