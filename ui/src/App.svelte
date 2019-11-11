<script>

  import MainNavbar from './components/MainNavbar.svelte';
  import MainContainer from './components/MainContainer.svelte';
  import { currentView } from './js/Stores';
  import { List } from './js/collections/List';
  import { Model } from './js/model/Model';
  import { Dataset } from './js/model/Dataset';
  import { Analysis } from './js/model/Analysis';

  // default nav
  currentView.set("analyses");

  // for now, get the dataset metadata from static json
  import * as metadata from '../test/_data/test-metadata.json';

  const datasetId = "http://localhost:58080/mondrian-rest/getMetadata?connectionName=test";
  const datasets = Dataset.loadFromMetadata(metadata, datasetId);

  const model = new Model();
  model.datasets = datasets;
  model.analyses = new List();
  datasets.forEach((dataset, idx) => {
    model.analyses.add(new Analysis(dataset, "Analysis " + idx));
  });

</script>

<MainNavbar/>
<MainContainer model={model}/>
