import { LocalRepository } from "../../src/js/model/Repository";
import { Analysis } from "../../src/js/model/Analysis";
import { Dataset, Measure, Dimension } from "../../src/js/model/Dataset";
import { List } from "../../src/js/collections/List";

let repository: LocalRepository;
let datasets: List<Dataset>;

beforeEach(async () => {
  repository = new LocalRepository();
  await repository.init();
  datasets = repository.browseDatasets();
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
    description: 'test-description'
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

test('measures', async () => {
  const analysis = new Analysis(datasets.get(0), "test-name");
  expect(analysis.query).not.toBeNull();
  expect(analysis.query.measures).toHaveLength(0);
  await analysis.query.measures.add(new Measure()).then(async () => {
    expect(analysis.query.measures).toHaveLength(1);
    expect(analysis.dirty).toBe(true);
    await analysis.cancelEdits().then(() => {
      expect(analysis.query.measures).toHaveLength(0);
    });
  });
});

test('cloning', () => {
  datasets.forEach((d: Dataset): void => {
    d.measures.forEach((m: Measure): void => {
      expect(m).toStrictEqual(m.clone());
    });
  });
  datasets.forEach((d: Dataset): void => {
    d.dimensions.forEach((dim: Dimension): void => {
      expect(dim).toStrictEqual(dim.clone());
    });
  });
});