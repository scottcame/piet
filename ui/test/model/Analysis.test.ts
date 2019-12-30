import { LocalRepository } from "../../src/js/model/Repository";
import { Analysis } from "../../src/js/model/Analysis";
import { Dataset } from "../../src/js/model/Dataset";
import { List } from "../../src/js/collections/List";

let repository: LocalRepository;
const datasets: List<Dataset> = new List();

beforeEach(async () => {
  repository = new LocalRepository();
  return repository.init().then(async () => {
    return repository.browseDatasets().then(async (d: Dataset[]) => {
      return datasets.set(d);
    });
  });
});

test('persistence', async () => {
  const analysis = new Analysis(datasets.get(0), "test-name");
  analysis.setDescription("test-description");
  const serializedAnalysis = analysis.serialize(repository);
  expect(serializedAnalysis).toMatchObject({
    datasetRef: {
      id: 'http://localhost:58080/mondrian-rest/getMetadata?connectionName=test',
      cube: 'Test'
    },
    name: 'test-name',
    description: 'test-description',
    _query: {
      _measures: [],
      _levels: [],
      nonEmpty: true
    }
  });
  const deserializedAnalysis = await new Analysis().deserialize(serializedAnalysis, repository);
  expect(deserializedAnalysis.name).toBe(analysis.name);
  expect(deserializedAnalysis.description).toBe(analysis.description);
  expect(deserializedAnalysis.id).toBeUndefined();
});

test('editing', () => {
  const originalName = "test-name";
  const originalDescription = "test-description";
  const analysis = new Analysis(datasets.get(0), originalName, null);
  analysis.setDescription(originalDescription);
  analysis.checkpointEdits();
  expect(analysis.dirty).toBe(false);
  analysis.setName("new-name");
  expect(analysis.dirty).toBe(true);
  analysis.cancelEdits();
  expect(analysis.dirty).toBe(false);
  expect(analysis.name).toBe(originalName);
  expect(analysis.description).toBe(originalDescription);
  analysis.setDescription("new-description");
  expect(analysis.dirty).toBe(true);
  analysis.cancelEdits();
  expect(analysis.dirty).toBe(false);
  expect(analysis.description).toBe(originalDescription);
  analysis.setName("new-name");
  analysis.setDescription("new-description");
  analysis.checkpointEdits();
  expect(analysis.dirty).toBe(false);
  expect(analysis.name).toBe("new-name");
  expect(analysis.description).toBe("new-description");
});

test('deserialization dataset errors', async () => {
  const analysis = new Analysis(datasets.get(0), "test-name");
  analysis.setDescription("test-description");
  const serializedAnalysis = analysis.serialize(repository);
  repository.wipeDatasetsForTesting();
  return expect(new Analysis().deserialize(serializedAnalysis, repository)).rejects.toMatch(/dataset.+not found/);
});