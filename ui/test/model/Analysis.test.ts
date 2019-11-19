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
