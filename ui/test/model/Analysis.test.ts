import { LocalRepository } from "../../src/js/model/Repository";
import { Analysis } from "../../src/js/model/Analysis";
import { Dataset } from "../../src/js/model/Dataset";
import { List } from "../../src/js/collections/List";

let repository: LocalRepository;
let datasets: List<Dataset>;

beforeEach(async () => {
  repository = new LocalRepository();
  await repository.init();
  datasets = repository.browseDatasets();
});

test('persistence', () => {
  const persistenceFactory = Analysis.PERSISTENCE_FACTORY;
  const analysis = new Analysis(datasets.get(0), "test-name");
  analysis.description = "test-description";
  const serializedAnalysis = persistenceFactory.serialize(analysis, repository);
  expect(serializedAnalysis).toMatchObject({
    datasetRef: {
      id: 'http://localhost:58080/mondrian-rest/getMetadata?connectionName=test',
      cube: 'Test'
    },
    name: 'test-name',
    description: 'test-description'
  });
  const deserializedAnalysis = Analysis.PERSISTENCE_FACTORY.deserialize(serializedAnalysis, repository);
  expect(deserializedAnalysis.name.value).toBe(analysis.name.value);
  expect(deserializedAnalysis.description).toBe(analysis.description);
  expect(deserializedAnalysis.id).toBeUndefined();
});

test('editing', () => {
  const originalName = "test-name";
  const originalDescription = "test-description";
  const analysis = new Analysis(datasets.get(0), originalName, null);
  analysis.description = originalDescription;
  analysis.checkpointEdits();
  expect(analysis.dirty).toBe(false);
  analysis.name.value = "new-name";
  expect(analysis.dirty).toBe(true);
  analysis.cancelEdits();
  expect(analysis.dirty).toBe(false);
  expect(analysis.name.value).toBe(originalName);
  expect(analysis.description).toBe(originalDescription);
  analysis.description = "new-description";
  expect(analysis.dirty).toBe(true);
  analysis.cancelEdits();
  expect(analysis.dirty).toBe(false);
  expect(analysis.description).toBe(originalDescription);
  analysis.name.value = "new-name";
  analysis.description = "new-description";
  analysis.checkpointEdits();
  expect(analysis.dirty).toBe(false);
  expect(analysis.name.value).toBe("new-name");
  expect(analysis.description).toBe("new-description");
});
