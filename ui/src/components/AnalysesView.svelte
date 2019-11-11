<script>

  import { Model } from '../js/model/Model';
  import { DropdownModel } from '../js/ui/model/Dropdown';
  import IconTrash from './icons/IconTrash.svelte';
  import IconNew from './icons/IconNew.svelte';
  import TreeContainerNode from './TreeContainerNode.svelte';
  import Dropdown from './Dropdown.svelte';
  import { DefaultObservableChangeEventListener } from '../js/util/Observable';
  import { DefaultListChangeEventListener, ListChangeEvent } from '../js/collections/List';

  export let pietModel;

  let rootTreeModelNode = null;
  let trashEnabled = false;
  let dropdownModel  = new DropdownModel(pietModel.analyses);

  function updateRootTreeModelNode() {
    const selectedIndex = dropdownModel.selectedIndex.value;
    rootTreeModelNode = selectedIndex === null ? null : pietModel.analyses.get(selectedIndex).dataset.rootTreeModelNode;
  }

  dropdownModel.selectedIndex.addChangeEventListener(new DefaultObservableChangeEventListener(e => {
    updateRootTreeModelNode();
    trashEnabled = dropdownModel.selectedIndex.value !== null;
  }));

  /*

    Unresolved philosophical issue...  Not sure whether these ui components should be directly referencing the pietModel, or whether
    ui components should *only* have reference to ui models, which in turn reference the pietModel. To be determined...

  */

  pietModel.analyses.addChangeEventListener(new DefaultListChangeEventListener(e => {
    if (e.type === ListChangeEvent.DELETE) {
      dropdownModel.selectedIndex.value = null;
      updateRootTreeModelNode();
    }
  }));

  function deleteCurrentAnalysis() {
    pietModel.analyses.removeAt(dropdownModel.selectedIndex.value);
  }

</script>

<div class="mt-2 h-screen p-2 bg-gray-100">
  <div class="w-1/4 h-screen bg-gray-100 select-none pt-2 pr-2 border-2">
    <div class="flex flex-inline items-center justify-between mb-2">
      <Dropdown dropdownModel={dropdownModel}/>
      <div class="h-10 w-10 ml-1 p-1 border items-center flex text-gray-900 border-gray-900">
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
