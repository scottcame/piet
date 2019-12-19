<script>
  
  export let visible = false;
  export let analysisController;

  let queryFilterTableModel;
  let searchText = "";
  let searchRegex;
  
  $: {
    searchRegex = new RegExp(searchText);
  }

  analysisController.queryFilterTableModel.addQueryFilterTableModelListener({
    tableModelUpdated: function(event) {
      queryFilterTableModel = analysisController.queryFilterTableModel;
    }
  });

  function toggleRow(rowIndex) {
    queryFilterTableModel.toggleRowAt(rowIndex);
  }

</script>

{#if queryFilterTableModel} <!-- needed because when first mounted the model doesn't exist yet -->
  <div class="{visible ? '' : 'hidden'}">
    <div class="h-full w-full fixed top-0 left-0 bg-gray-300 opacity-50 z-0">
    </div>
    <div class="h-full w-full fixed flex items-center justify-center top-0 left-0 z-10">
      <div class="bg-white rounded shadow w-1/3 max-h-full select-none border border-gray-500">
        <div class="bg-gray-300 p-2 font-semibold">
            <div name="header">Edit Filter for {queryFilterTableModel.columnHeader}</div>
        </div>
        <div class="mx-2 my-2 text-xxs">
          <div class="font-medium pb-1">Values:</div>
          <div class="flex inline items-center w-full border p-1 mb-1">
            <input class="text-xxs w-full outline-none" type="search" placeholder="Search..." bind:value={searchText}>
          </div>
          <div class="max-h-screen-33 h-screen-33 overflow-y-auto border">
            <table class="table-auto border w-full">
              <tbody>
                {#each [...Array(queryFilterTableModel.rowCount).keys()] as rowIndex}
                  <tr class="border {searchText.trim() === "" || searchRegex.test(queryFilterTableModel.getValueAt(rowIndex)) ? '' : 'hidden'}">
                      <td class="w-5">
                          <div class="mr-2 ml-1 border w-4 h-4 hover:bg-gray-300 {queryFilterTableModel.getRowSelectedAt(rowIndex) ? 'bg-gray-900 hover:bg-gray-900' : ''}" on:click={ e => toggleRow(rowIndex) }></div>
                      </td>
                      <td class="py-1 text-left items-start">{queryFilterTableModel.getValueAt(rowIndex)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
        <div class="border-0 m-1 mt-4 text-xxs">
          <div class="flex flex-inline mb-1">
            <div class="mr-2 ml-1 border w-4 h-4 hover:bg-gray-300 {queryFilterTableModel.filterModeInclude ? 'bg-gray-900 hover:bg-gray-900' : ''}" on:click={ e => queryFilterTableModel.filterModeInclude = true }></div><div>Include only these values in the results</div>
          </div>
          <div class="flex flex-inline">
            <div class="mr-2 ml-1 border w-4 h-4 hover:bg-gray-300 {!queryFilterTableModel.filterModeInclude ? 'bg-gray-900 hover:bg-gray-900' : ''}" on:click={ e => queryFilterTableModel.filterModeInclude = false }></div><div>Exclude these values from the results</div>
          </div>
        </div>
        <div class="flex flex-inline justify-center mb-4 mt-2 flex-none">
          <div class="border-2 mr-2 p-2 hover:bg-gray-200" on:click={e => { analysisController.closeQueryFilterModal(true); }}>OK</div>
          <div class="border-2 ml-2 p-2 hover:bg-gray-200" on:click={e => { analysisController.closeQueryFilterModal(false); }}>Cancel</div>
        </div>
      </div>
    </div>
  </div>
{/if}