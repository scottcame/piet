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

  import { TreeMeasureNodeEvent } from '../js/ui/model/Tree';
  import { createEventDispatcher } from 'svelte';

  export let treeModelNode;
  export let currentAnalysis;
  export let enabled = true;

  let selected = false;
  const dispatch = createEventDispatcher();

  function toggleSelected() {
    if (enabled) {
      selected = !selected;
      dispatch('nodeEvent', new TreeMeasureNodeEvent(treeModelNode.uniqueName, selected));
    }
  }

  $: {
    selected = false;
    if (currentAnalysis) {
      currentAnalysis.query.measures.forEach((measure) => {
        if (measure.uniqueName === treeModelNode.uniqueName) {
          selected = true;
        }
      });
    }
  }

</script>

<div class="flex justify-between items-center text-gray-900 my-px { enabled ? 'hover:bg-gray-200' : ''} { selected ? 'border border-gray-400' : '' }" on:click="{toggleSelected}">

  <div class="items-center flex pl-1">
    <div class="flex inline items-center">
      <span>{treeModelNode.label}</span>
    </div>
  </div>

  <div class="flex flex-inline items-center justify-end pr-1 text-gray-900 {selected ? '' : 'hidden'}">
      &#x2713;
  </div>

</div>
