<script>

  import { MondrianResult } from './js/model/MondrianResult';
  import * as resultData from '../test/_data/mondrian-results-1m2h2r0c.json';
  import MondrianResultTable from './components/MondrianResultTable.svelte';
  import { MondrianResultTableModel } from './js/ui/model/MondrianResultTable';

  const result = MondrianResult.fromJSON(resultData);
  const tableModel = new MondrianResultTableModel();
  tableModel.result = result;

</script>

<div class="text-sm mb-8 mt-1 ml-1">This is the playground. You can use it to experiment with UI elements without breaking the main app code. Access it by running <span class="font-mono inline bg-gray-200 p-1">npm run playground</span>. Typically, we don't
  commit changes to this file to git...</div>

<div class="m-1">
  <MondrianResultTable tableModel={tableModel}/>
</div>
