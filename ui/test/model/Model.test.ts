import { Model } from '../../src/js/model/Model';
import * as metadata from '../_data/test-metadata.json';
import { Dataset } from '../../src/js/model/Dataset';
import { Analysis } from '../../src/js/model/Analysis';
import { DropdownItem, DropdownModel } from '../../src/js/ui/model/Dropdown';

const m = new Model();
const datasetId = "http://localhost:58080/mondrian-rest/getMetadata?connectionName=test";
const datasets = Dataset.loadFromMetadata(metadata, datasetId);

test('model initialization', () => {
  expect(m.analyses.length).toBe(0);
});

test('analyses select model', () => {
  m.datasets = datasets;
  datasets.forEach((dataset, idx) => {
    m.analyses.add(new Analysis(dataset, "Analysis " + idx));
  });
  const dropdownModel = new DropdownModel(m.analyses);
  expect(dropdownModel.items).toHaveLength(m.analyses.length);
  dropdownModel.items.forEach((val: DropdownItem, idx: number) => {
    expect(val.getLabel()).toBe(m.analyses.get(idx).name);
  });
});
