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