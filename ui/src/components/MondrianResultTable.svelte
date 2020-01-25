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

  tableModel.addMondrianTableModelChangeListener({
    mondrianTableModelChanged: function(event) {
      tableModel = event.target; // will trigger reactive block below
    }
  });

  let rowIterator, columnIterator, topLeftRightBorderCellIndex, headerRows;

  $: {
    rowIterator = [...Array(tableModel.dataRowCount).keys()];
    columnIterator = [...Array(tableModel.dataColumnCount).keys()];
    topLeftRightBorderCellIndex = tableModel.columnCount - tableModel.dataColumnCount - 1;
    headerRows = tableModel.headerRows;
  }

  const rightCaret = '\u25B6';
  const downCaret = '\u25BC';

  function formatColumnHeaderCell(cell, cellIndex, headerRowIndex) {
    let ret = "";
    if (cell) {
      ret = cell;
      if (cellIndex === topLeftRightBorderCellIndex && headerRowIndex < tableModel.headerRows.length-1) {
        ret += (" " + rightCaret);
      } else if (headerRowIndex === tableModel.headerRows.length-1 && cellIndex <= topLeftRightBorderCellIndex) {
        ret += (" " + downCaret);
      }
    }
    return ret;
  }

  function formatRowHeaderCell(cell) {
    let ret = "Total";
    if (cell) {
      ret = cell;
    }
    return ret;
  }

</script>

<div class="text-xxs m-0">
  {#if rowIterator.length}
    <table class="border w-full overflow-x-auto overflow-y-auto">
      <thead class="border border-b-2 border-t-2 border-l-2 border-r-2 border-gray-500">
        {#each headerRows as headerRow, headerRowIndex}
        <tr>
          {#each headerRow as cell, cellIndex}
            <th class="p-1 bg-gray-200 border-2 border-gray-500">
              {formatColumnHeaderCell(cell, cellIndex, headerRowIndex)}
            </th>
          {/each}
        </tr>
        {/each}
      </thead>
      <tbody class="border border-b-2 border-t-2 border-l-2 border-r-2 border-gray-500">
        {#each rowIterator as rowIndex}
          <tr>
            {#if tableModel.rowHeaders.length}
              {#each tableModel.rowHeaders[rowIndex] as rowHeader, rowHeaderIndex}
                <th class="border-2 bg-gray-200 border-gray-500 { rowHeaderIndex ===  tableModel.rowHeaders[rowIndex].length - 1 ? 'border-r-2' : ''  }">{formatRowHeaderCell(rowHeader)}</th>
              {/each}
            {/if}
            {#each columnIterator as columnIndex}
              <td class="border-2 text-right bg-gray-100 pr-1">{tableModel.getFormattedValueAt(rowIndex, columnIndex)}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <div class="p-2">No results available. Make sure you have added a measure to your analysis, and that your filters haven't removed all results.</div>
  {/if}
</div>
