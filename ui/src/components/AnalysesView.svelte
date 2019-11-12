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

  let rootTreeModelNode = null;
  let trashEnabled = false;
  let analysesDropdownModel  = new DropdownModel(pietModel.analyses);
  let datasetsDropdownModel = new DropdownModel(pietModel.datasets);
  let datasetRootTreeNodes = [];
  let newAnalysisSelectedDataset;

  function updateRootTreeModelNode() {
    const selectedIndex = analysesDropdownModel.selectedIndex.value;
    if (selectedIndex === null) {
      rootTreeModelNode = null;
    } else {
      // caching these for performance (e.g., the foodmart schema is pretty large)
      if (!datasetRootTreeNodes[selectedIndex]) {
        datasetRootTreeNodes[selectedIndex] = DatasetAdapterFactory.getInstance().createRootTreeModelNode(pietModel.analyses.get(selectedIndex).dataset);
      }
      rootTreeModelNode = datasetRootTreeNodes[selectedIndex];
    }
  }

  analysesDropdownModel.selectedIndex.addChangeEventListener(new DefaultObservableChangeEventListener(e => {
    updateRootTreeModelNode();
    trashEnabled = analysesDropdownModel.selectedIndex.value !== null;
  }));

  /*

    Unresolved philosophical issue...  Not sure whether these ui components should be directly referencing the pietModel, or whether
    ui components should *only* have reference to ui models, which in turn reference the pietModel. To be determined...

  */

  pietModel.analyses.addChangeEventListener(new DefaultListChangeEventListener(e => {
    if (e.type === ListChangeEvent.DELETE) {
      analysesDropdownModel.selectedIndex.value = null;
      updateRootTreeModelNode();
    }
  }));

  function deleteCurrentAnalysis() {
    pietModel.analyses.removeAt(analysesDropdownModel.selectedIndex.value);
  }

  let showNewAnalysisModal = true;

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

</script>

<div class="mt-2 h-screen p-2 bg-gray-100">
  <div class="w-1/4 h-screen bg-gray-100 select-none pt-2 pr-2 border-2">
    <div class="flex flex-inline items-center justify-between mb-2">
      <Dropdown dropdownModel={analysesDropdownModel} defaultLabel="Choose an analysis..."/>
      <div class="h-10 w-10 ml-1 p-1 border items-center flex text-gray-900 border-gray-900" on:click="{newAnalysis}">
        <IconNew/>
      </div>
      <div class={"h-10 w-10 ml-1 p-1 border items-center flex " + (trashEnabled ? 'text-gray-900' : 'text-gray-500') + " " + (trashEnabled ? 'border-gray-900' : 'border-gray-500')}
        on:click="{deleteCurrentAnalysis}">
        <IconTrash/>
      </div>
    </div>
    <TreeContainerNode treeModelNode={rootTreeModelNode}/>
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
