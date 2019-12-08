<script>

  export let tableModel;
  let rowIterator = [...Array(tableModel.dataRowCount).keys()];
  let columnIterator = [...Array(tableModel.dataColumnCount).keys()];
  let topLeftRightBorderCellIndex = tableModel.columnCount - tableModel.dataColumnCount - 1;

  const rightCaret = '\u25B6';
  const downCaret = '\u25BC';

</script>

<div class="text-xxs">
  <table class="border w-full overflow-x-auto">
    <thead class="border border-b-2 border-t-2 border-l-2 border-r-2 border-gray-500">
      {#each tableModel.headerRows as headerRow, headerRowIndex}
      <tr>
        {#each headerRow as cell, cellIndex}
          <th class="p-1 bg-gray-200 { cell === null ? 'border-0' : 'border border-gray-500' } { cellIndex === topLeftRightBorderCellIndex ? 'border-r-2 ' : '' }">
            {(cell === null ? "" : cell) + " " + (cellIndex === topLeftRightBorderCellIndex && headerRowIndex < tableModel.headerRows.length-1 ? rightCaret : "") + (headerRowIndex === tableModel.headerRows.length-1 && cellIndex <= topLeftRightBorderCellIndex ? downCaret : "")}
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
              <th class="border bg-gray-200 border-gray-500 { rowHeaderIndex === tableModel.rowHeaders[rowIndex].length - 1 ? 'border-r-2' : '' }">{rowHeader}</th>
            {/each}
          {/if}
          {#each columnIterator as columnIndex}
            <td class="border text-right bg-gray-100 pr-1">{tableModel.getFormattedValueAt(rowIndex, columnIndex)}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>