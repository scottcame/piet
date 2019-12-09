import { Dataset } from '../../src/js/model/Dataset';
import { FoodmartMetadata } from '../_data/TestData';
import { LocalRepository } from '../../src/js/model/Repository';
import { List } from '../../src/js/collections/List';
import { Analysis } from '../../src/js/model/Analysis';
import { QueryLevel, QueryMeasure } from '../../src/js/model/Query';

let repository: LocalRepository;
let testDatasets: List<Dataset>;
let foodmartDatasets: Dataset[];

beforeAll(async () => {
  const metadata = await FoodmartMetadata.getInstance().getMetadata();
  foodmartDatasets = Dataset.loadFromMetadata(metadata, "http://localhost:58080/mondrian-rest/getMetadata?connectionName=foodmart");
});

beforeEach(async () => {
  repository = new LocalRepository();
  await repository.init();
  testDatasets = repository.browseDatasets();
});

test('query measures', async () => {
  const analysis = new Analysis(testDatasets.get(0), "test-name");
  expect(analysis.query).not.toBeNull();
  expect(analysis.query.measures).toHaveLength(0);
  const queryMeasure = new QueryMeasure();
  await analysis.query.measures.add(queryMeasure).then(async () => {
    expect(analysis.query.measures).toHaveLength(1);
    expect(analysis.dirty).toBe(true);
    await analysis.cancelEdits().then(() => {
      expect(analysis.query.measures).toHaveLength(0);
    });
  });
});

test('query levels', async () => {
  const analysis = new Analysis(testDatasets.get(0), "test-name");
  expect(analysis.query.levels).toHaveLength(0);
  const queryLevel = new QueryLevel();
  queryLevel.setRowOrientation(true);
  await analysis.query.levels.add(queryLevel).then(async () => {
    expect(analysis.query.levels).toHaveLength(1);
    expect(analysis.dirty).toBe(true);
    await analysis.cancelEdits().then(async () => {
      expect(analysis.query.levels).toHaveLength(0);
      await analysis.query.levels.add(queryLevel).then(async () => {
        expect(analysis.query.levels).toHaveLength(1);
        expect(analysis.dirty).toBe(true);
        await analysis.checkpointEdits().then(async () => {
          expect(analysis.dirty).toBe(false);
          await analysis.query.levels.get(0).setFilterSelected(true).then(async () => {
            expect(analysis.dirty).toBe(true);
            await analysis.checkpointEdits().then(async () => {
              expect(analysis.dirty).toBe(false);
              });
            });
        });
      });
    });
  });
});

// import * as stringify from 'json-stringify-safe';

test('query MDX 1 measure 1 row dim', async () => {
  const analysis = new Analysis(foodmartDatasets[3], "test");
  const q = analysis.query;
  const queryMeasure = new QueryMeasure();
  queryMeasure.setUniqueName("[Measures].[Store Sqft]");
  await q.measures.add(queryMeasure).then(async () => {
    const queryLevel = new QueryLevel();
    queryLevel.setUniqueName("[Store].[Stores].[Store Country]");
    queryLevel.setRowOrientation(true);
    await q.levels.add(queryLevel).then(() => {
      expect(q.asMDX()).toEqual("SELECT NON EMPTY {[Measures].[Store Sqft]} ON COLUMNS, NON EMPTY {[Store].[Stores].[Store Country].Members} ON ROWS FROM [Store]");
    });
  });
});

test('query MDX 2 measures row dim', async () => {
  const analysis = new Analysis(foodmartDatasets[3], "test");
  const q = analysis.query;
  let queryMeasure = new QueryMeasure();
  queryMeasure.setUniqueName("[Measures].[Store Sqft]");
  await q.measures.add(queryMeasure).then(async () => {
    queryMeasure = new QueryMeasure();
    queryMeasure.setUniqueName("[Measures].[Grocery Sqft]");
    await q.measures.add(queryMeasure).then(async () => {
      const queryLevel = new QueryLevel();
      queryLevel.setUniqueName("[Store].[Stores].[Store Country]");
      queryLevel.setRowOrientation(true);
      await q.levels.add(queryLevel).then(() => {
        expect(q.asMDX()).toEqual("SELECT NON EMPTY {[Measures].[Store Sqft],[Measures].[Grocery Sqft]} ON COLUMNS, NON EMPTY {[Store].[Stores].[Store Country].Members} ON ROWS FROM [Store]");
      });
    });
  });
});

test('query MDX 1 measure 2 row dims', async () => {
  const analysis = new Analysis(foodmartDatasets[3], "test");
  const q = analysis.query;
  const queryMeasure = new QueryMeasure();
  queryMeasure.setUniqueName("[Measures].[Store Sqft]");
  await q.measures.add(queryMeasure).then(async () => {
    let queryLevel = new QueryLevel();
    queryLevel.setUniqueName("[Store].[Stores].[Store Country]");
    queryLevel.setRowOrientation(true);
    await q.levels.add(queryLevel).then(async () => {
      queryLevel = new QueryLevel();
      queryLevel.setUniqueName("[Store Type].[Store Type].[Store Type]");
      queryLevel.setRowOrientation(true);
      await q.levels.add(queryLevel).then(() => {
        expect(q.asMDX()).toEqual("SELECT NON EMPTY {[Measures].[Store Sqft]} ON COLUMNS, NON EMPTY CrossJoin({[Store].[Stores].[Store Country].Members},{[Store Type].[Store Type].[Store Type].Members}) ON ROWS FROM [Store]");
      });
    });
  });
});

test('query MDX no measures -> null', async () => {
  const analysis = new Analysis(foodmartDatasets[3], "test");
  const q = analysis.query;
  const queryLevel = new QueryLevel();
  queryLevel.setRowOrientation(true);
  await q.levels.add(queryLevel).then(() => {
    expect(q.asMDX()).toBeNull();
  });
});

test('query MDX 1 measure 1 row dim 1 col dim', async () => {
  const analysis = new Analysis(foodmartDatasets[3], "test");
  const q = analysis.query;
  const queryMeasure = new QueryMeasure();
  queryMeasure.setUniqueName("[Measures].[Store Sqft]");
  await q.measures.add(queryMeasure).then(async () => {
    let queryLevel = new QueryLevel();
    queryLevel.setUniqueName("[Store].[Stores].[Store Country]");
    queryLevel.setRowOrientation(true);
    await q.levels.add(queryLevel).then(async () => {
      queryLevel = new QueryLevel();
      queryLevel.setUniqueName("[Store Type].[Store Type].[Store Type]");
      queryLevel.setRowOrientation(false);
      await q.levels.add(queryLevel).then(() => {
        expect(q.asMDX()).toEqual("SELECT NON EMPTY CrossJoin({[Store Type].[Store Type].[Store Type].Members},{[Measures].[Store Sqft]}) ON COLUMNS, NON EMPTY {[Store].[Stores].[Store Country].Members} ON ROWS FROM [Store]");
      });
    });
  });
});

test('query MDX 1 measure 1 row dim 2 col dim', async () => {
  const analysis = new Analysis(foodmartDatasets[3], "test");
  const q = analysis.query;
  const queryMeasure = new QueryMeasure();
  queryMeasure.setUniqueName("[Measures].[Store Sqft]");
  await q.measures.add(queryMeasure).then(async () => {
    let queryLevel = new QueryLevel();
    queryLevel.setUniqueName("[Store].[Stores].[Store Country]");
    queryLevel.setRowOrientation(true);
    await q.levels.add(queryLevel).then(async () => {
      queryLevel = new QueryLevel();
      queryLevel.setUniqueName("[Store Type].[Store Type].[Store Type]");
      queryLevel.setRowOrientation(false);
      await q.levels.add(queryLevel).then(async () => {
        queryLevel = new QueryLevel();
        queryLevel.setUniqueName("[Has coffee bar].[Has coffee bar].[Has coffee bar]");
        queryLevel.setRowOrientation(false);
        await q.levels.add(queryLevel).then(() => {
          expect(q.asMDX()).toEqual("SELECT NON EMPTY CrossJoin(CrossJoin({[Store Type].[Store Type].[Store Type].Members},{[Has coffee bar].[Has coffee bar].[Has coffee bar].Members}),{[Measures].[Store Sqft]}) ON COLUMNS, NON EMPTY {[Store].[Stores].[Store Country].Members} ON ROWS FROM [Store]");
        });
      });
    });
  });
});

test('query MDX 2 measures 1 row dim 1 col dim', async () => {
  const analysis = new Analysis(foodmartDatasets[3], "test");
  const q = analysis.query;
  let queryMeasure = new QueryMeasure();
  queryMeasure.setUniqueName("[Measures].[Store Sqft]");
  await q.measures.add(queryMeasure).then(async () => {
    queryMeasure = new QueryMeasure();
    queryMeasure.setUniqueName("[Measures].[Grocery Sqft]");
    await q.measures.add(queryMeasure).then(async () => {
      let queryLevel = new QueryLevel();
      queryLevel.setUniqueName("[Store].[Stores].[Store Country]");
      queryLevel.setRowOrientation(true);
      await q.levels.add(queryLevel).then(async () => {
        queryLevel = new QueryLevel();
        queryLevel.setUniqueName("[Store Type].[Store Type].[Store Type]");
        queryLevel.setRowOrientation(false);
        await q.levels.add(queryLevel).then(() => {
          expect(q.asMDX()).toEqual("SELECT NON EMPTY CrossJoin({[Store Type].[Store Type].[Store Type].Members},{[Measures].[Store Sqft],[Measures].[Grocery Sqft]}) ON COLUMNS, NON EMPTY {[Store].[Stores].[Store Country].Members} ON ROWS FROM [Store]");
        });
      });
    });
  });
});

test('persistence', async () => {
  const repository = new LocalRepository();
  await repository.init();
  const datasets = repository.browseDatasets();
  const analysis = new Analysis(datasets.get(0), "test-name");
  analysis.setDescription("test-description");
  const queryMeasure = new QueryMeasure();
  queryMeasure.setUniqueName("[Measures].[Store Sqft]");
  await analysis.query.measures.add(queryMeasure).then(async () => {
    const serializedAnalysis = analysis.serialize(repository);
    expect(serializedAnalysis).not.toBeNull();
    expect(serializedAnalysis).toMatchObject({
      datasetRef: {
        id: 'http://localhost:58080/mondrian-rest/getMetadata?connectionName=test',
        cube: 'Test'
      },
      name: 'test-name',
      description: 'test-description',
      _query: {
        nonEmpty: true,
        datasetName: 'Test',
        _measures: [ { _uniqueName: '[Measures].[Store Sqft]' } ],
        _levels: []
      }
    });
    let deserializedAnalysis = await new Analysis().deserialize(serializedAnalysis, repository);
    expect(deserializedAnalysis.name).toBe(analysis.name);
    expect(deserializedAnalysis.description).toBe(analysis.description);
    expect(deserializedAnalysis.id).toBeUndefined();
    expect(deserializedAnalysis.query.measures.get(0).uniqueName).toBe(queryMeasure.uniqueName);
    expect(deserializedAnalysis.query.levels).toHaveLength(0);
    const queryLevel = new QueryLevel();
    queryLevel.setUniqueName("[Store].[Stores].[Store Country]");
    queryLevel.setRowOrientation(true);
    await analysis.query.levels.add(queryLevel).then(async () => {
      const serializedAnalysis = analysis.serialize(repository);
      expect(serializedAnalysis).not.toBeNull();
      expect(serializedAnalysis).toMatchObject({
        datasetRef: {
          id: 'http://localhost:58080/mondrian-rest/getMetadata?connectionName=test',
          cube: 'Test'
        },
        name: 'test-name',
        description: 'test-description',
        _query: {
          nonEmpty: true,
          datasetName: 'Test',
          _measures: [ { _uniqueName: '[Measures].[Store Sqft]' } ],
          _levels: [ { _uniqueName: '[Store].[Stores].[Store Country]', _rowOrientation: true, _sumSelected: false, _filterSelected: false }]
        }
      });
      deserializedAnalysis = await new Analysis().deserialize(serializedAnalysis, repository);
      expect(deserializedAnalysis.query.measures.get(0).uniqueName).toBe(queryMeasure.uniqueName);
      expect(deserializedAnalysis.query.levels.get(0).uniqueName).toBe(queryLevel.uniqueName);
    });
  });
});