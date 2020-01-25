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

  export let tableModel;
  export let selectedIndex = null;
  export let noRowsLabel = "No objects found.";

  let modelRows = [];

  tableModel.addTableChangeEventListener({
    tableChanged(event) {
      modelRows = [...tableModel.rows];
    }
  });

  function selectRow(index) {
    selectedIndex = index;
  }

</script>

{#if modelRows.length}
<table class="table-auto border w-full">
  <tbody>
      {#each modelRows as modelRow, rowIndex}
      <tr class="border">
          <td class="w-5">
              <div class="mr-2 ml-1 border w-5 h-5 hover:bg-gray-300 {selectedIndex === rowIndex ? 'bg-gray-900 hover:bg-gray-900' : ''}" on:click={ e => selectRow(rowIndex) }></div>
          </td>
          {#each tableModel.columnHeaders as columnHeader, columnIndex}
          <td class="py-2 text-left items-start">{modelRow.getValueAt(columnIndex)}</td>
          {/each}
      </tr>
      {/each}
  </tbody>
</table>
{:else}
<div class="text-xs">{noRowsLabel}</div>
{/if}
