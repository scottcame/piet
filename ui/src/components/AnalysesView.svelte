<script>

  import { Model } from '../js/model/Model';
  import { Analysis } from '../js/model/Analysis';
  import { DropdownModel } from '../js/ui/model/Dropdown';
  import { DatasetAdapterFactory } from '../js/ui/adapters/DatasetAdapterFactory';
  import IconTrash from './icons/IconTrash.svelte';
  import IconNew from './icons/IconNew.svelte';
  import TreeContainerNode from './TreeContainerNode.svelte';
  import Dropdown from './Dropdown.svelte';
  import Modal from './Modal.svelte';
  import { DefaultObservableChangeEventListener } from '../js/util/Observable';
  import { DefaultListChangeEventListener, ListChangeEvent } from '../js/collections/List';

  export let pietModel;

  let analysesDropdownModel  = new DropdownModel(pietModel.analyses);
  let currentAnalysis = null;

  let datasetRootTreeModelNode = null;
  let datasetRootTreeNodes = [];

  let analysisDeleteEnabled = false;

  let showNewAnalysisModal = false;
  let newAnalysisSelectedDataset;
  let datasetsDropdownModel = new DropdownModel(pietModel.datasets);

  function handleAnalysisSelection() {
    const selectedIndex = analysesDropdownModel.selectedIndex.value;
    currentAnalysis = analysesDropdownModel.selectedItem; // just to give it a better name; maybe not needed...
    if (selectedIndex === null) {
      datasetRootTreeModelNode = null;
    } else {
      // caching these for performance (e.g., the foodmart schema is pretty large)
      if (!datasetRootTreeNodes[selectedIndex]) {
        datasetRootTreeNodes[selectedIndex] = DatasetAdapterFactory.getInstance().createRootTreeModelNode(pietModel.analyses.get(selectedIndex).dataset);
      }
      datasetRootTreeModelNode = datasetRootTreeNodes[selectedIndex];
    }
  }

  analysesDropdownModel.selectedIndex.addChangeEventListener(new DefaultObservableChangeEventListener(e => {
    handleAnalysisSelection();
    analysisDeleteEnabled = analysesDropdownModel.selectedIndex.value !== null;
  }));

  /*

    Unresolved philosophical issue...  Not sure whether these ui components should be directly referencing the pietModel, or whether
    ui components should *only* have reference to ui models, which in turn reference the pietModel. To be determined...

  */

  pietModel.analyses.addChangeEventListener(new DefaultListChangeEventListener(e => {
    if (e.type === ListChangeEvent.DELETE) {
      analysesDropdownModel.selectedIndex.value = null;
      handleAnalysisSelection();
    }
  }));

  function deleteCurrentAnalysis() {
    let removedAnalysis = pietModel.analyses.removeAt(analysesDropdownModel.selectedIndex.value);
    removedAnalysis.getLabel().clearChangeEventListeners();
  }

  function newAnalysis() {
    showNewAnalysisModal = true;
  }

  function closeNewAnalysisModal() {
    showNewAnalysisModal = false;
    datasetsDropdownModel.selectedIndex.value = null;
  }

  function chooseNewAnalysisDataset() {
    let currentAnalysisCount = pietModel.analyses.length;
    pietModel.analyses.add(new Analysis(datasetsDropdownModel.selectedItem, "Analysis " + (currentAnalysisCount+1)));
    closeNewAnalysisModal();
    analysesDropdownModel.selectedIndex.value = currentAnalysisCount;
  }

  function analysisInput(e) {
    analysesDropdownModel.selectedItem.getLabel().value = e.target.value;
  }

</script>

<div class="mt-2 h-screen p-2 bg-gray-100 flex flex-inline">
  <div class="w-1/4 h-screen select-none pt-2 pr-2 border-2">
    <div class="flex flex-inline items-center justify-between mb-2">
      <Dropdown dropdownModel={analysesDropdownModel} defaultLabel="Choose an analysis..."/>
      <div class="h-10 w-10 ml-1 p-1 border items-center flex text-gray-900 border-gray-900" on:click="{newAnalysis}">
        <IconNew/>
      </div>
      <div class={"h-10 w-10 ml-1 p-1 border items-center flex " + (analysisDeleteEnabled ? 'text-gray-900' : 'text-gray-500') + " " + (analysisDeleteEnabled ? 'border-gray-900' : 'border-gray-500')}
        on:click="{deleteCurrentAnalysis}">
        <IconTrash/>
      </div>
    </div>
    <TreeContainerNode treeModelNode={datasetRootTreeModelNode}/>
  </div>
  <div class="w-3/4 h-screen flex flex-col ml-1 mt-1 {currentAnalysis === null ? 'hidden' : ''}">
    <div class="w-full flex flex-inline items-center justify-between mb-1">
      <div class="bg-green-300 w-full mr-1">
        <div class="flex flex-inline items-center">
          <label class="block pr-4" for="input-analysis-title">Title:</label>
          <input class="bg-gray-200 appearance-none border border-gray-900 rounded w-full py-1 px-2 leading-tight focus:outline-none focus:bg-white"
            id="input-analysis-title" type="text" value="{currentAnalysis === null ? '' : currentAnalysis.name.value}"
            on:input="{e => analysisInput(e)}">
        </div>
        <div class="flex flex-inline items-center pt-1">
          <label class="block pr-4" for="input-analysis-description">Description:</label>
          <input class="bg-gray-200 appearance-none border border-gray-900 rounded w-full py-1 px-2 leading-tight focus:outline-none focus:bg-white"
            id="input-analysis-description" type="text" value="{currentAnalysis === null ? '' : (currentAnalysis.description === null ? '' : currentAnalysis.description)}">
        </div>
      </div>
      <div class="flex flex-inline bg-red-300">
        <div class="h-10 w-10 flex items-center"><IconTrash/></div>
        <div class="h-10 w-10 flex items-center"><IconTrash/></div>
      </div>
    </div>
    <div class="flex bg-teal-300">
      <div>Table for {currentAnalysis === null ? "analyses" : currentAnalysis.name} will go here.</div>
    </div>
  </div>
</div>
<div class="{showNewAnalysisModal ? null : 'hidden'}">
  <Modal>
    <span slot="header">New Analysis: Choose Dataset</span>
    <div slot="body">
      <Dropdown dropdownModel={datasetsDropdownModel} defaultLabel="Choose a dataset..."/>
    </div>
    <div slot="buttons">
      <div class="flex flex-inline justify-center mb-4 flex-none">
        <div class="border-2 mr-2 p-2 hover:bg-gray-200" on:click={chooseNewAnalysisDataset}>OK</div>
        <div class="border-2 ml-2 p-2 hover:bg-gray-200" on:click={closeNewAnalysisModal}>Cancel</div>
      </div>
    </div>
  </Modal>
</div>
