<script>

  import { DefaultTableChangeEventListener } from '../js/ui/model/Table';

  export let tableModel;
  export let selectedIndex = null;

  let modelRows = [];

  tableModel.addTableChangeEventListener(new DefaultTableChangeEventListener(event => {
    modelRows = [...tableModel.rows];
  }));

  function selectRow(index) {
    selectedIndex = index;
  }

</script>

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
