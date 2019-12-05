import { Dataset, Measure, Level } from '../../src/js/model/Dataset';
import { TestData } from '../_data/TestData';
import { LocalRepository } from '../../src/js/model/Repository';
import { List } from '../../src/js/collections/List';
import { Analysis } from '../../src/js/model/Analysis';

let repository: LocalRepository;
let testDatasets: List<Dataset>;
let foodmartDatasets: Dataset[];

beforeAll(() => {
  foodmartDatasets = Dataset.loadFromMetadata(TestData.FOODMART_METADATA, "http://localhost:58080/mondrian-rest/getMetadata?connectionName=foodmart");
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
  await analysis.query.measures.add(new Measure()).then(async () => {
    expect(analysis.query.measures).toHaveLength(1);
    expect(analysis.dirty).toBe(true);
    await analysis.cancelEdits().then(() => {
      expect(analysis.query.measures).toHaveLength(0);
    });
  });
});

test('query levels', async () => {
  const analysis = new Analysis(testDatasets.get(0), "test-name");
  expect(analysis.query.rowLevels).toHaveLength(0);
  await analysis.query.rowLevels.add(new Level(testDatasets.get(0).dimensions[0].hierarchies[0])).then(async () => {
    expect(analysis.query.rowLevels).toHaveLength(1);
    expect(analysis.dirty).toBe(true);
    await analysis.cancelEdits().then(() => {
      expect(analysis.query.rowLevels).toHaveLength(0);
    });
  });
});

// import * as stringify from 'json-stringify-safe';

test('query MDX 1 measure 1 row dim', async () => {
  const analysis = new Analysis(foodmartDatasets[3], "test");
  const q = analysis.query;
  await q.measures.add(analysis.dataset.measures[0]).then(async () => {
    expect(q.measures.get(0).name).toBe("Store Sqft");
    await q.rowLevels.add(analysis.dataset.dimensions[2].hierarchies[0].levels[1]).then(() => {
      expect(q.rowLevels.get(0).name).toBe("Store Country");
      expect(q.asMDX()).toEqual("SELECT NON EMPTY {[Measures].[Store Sqft]} ON COLUMNS, NON EMPTY {[Store].[Stores].[Store Country].Members} ON ROWS FROM [Store]");
    });
  });
});

test('query MDX 2 measures row dim', async () => {
  const analysis = new Analysis(foodmartDatasets[3], "test");
  const q = analysis.query;
  await q.measures.add(analysis.dataset.measures[0]).then(async () => {
    await q.measures.add(analysis.dataset.measures[1]).then(async () => {
      expect(q.measures.get(0).name).toBe("Store Sqft");
      expect(q.measures.get(1).name).toBe("Grocery Sqft");
      await q.rowLevels.add(analysis.dataset.dimensions[2].hierarchies[0].levels[1]).then(() => {
        expect(q.rowLevels.get(0).name).toBe("Store Country");
        expect(q.asMDX()).toEqual("SELECT NON EMPTY {[Measures].[Store Sqft],[Measures].[Grocery Sqft]} ON COLUMNS, NON EMPTY {[Store].[Stores].[Store Country].Members} ON ROWS FROM [Store]");
      });
    });
  });
});

test('query MDX 1 measure 2 row dims', async () => {
  const analysis = new Analysis(foodmartDatasets[3], "test");
  const q = analysis.query;
  await q.measures.add(analysis.dataset.measures[0]).then(async () => {
    expect(q.measures.get(0).name).toBe("Store Sqft");
    await q.rowLevels.add(analysis.dataset.dimensions[2].hierarchies[0].levels[1]).then(async () => {
      await q.rowLevels.add(analysis.dataset.dimensions[1].hierarchies[0].levels[1]).then(() => {
        expect(q.rowLevels.get(1).name).toBe("Store Type");
        expect(q.asMDX()).toEqual("SELECT NON EMPTY {[Measures].[Store Sqft]} ON COLUMNS, NON EMPTY CrossJoin({[Store].[Stores].[Store Country].Members},{[Store Type].[Store Type].[Store Type].Members}) ON ROWS FROM [Store]");
      });
    });
  });
});

test('query MDX no measures -> null', async () => {
  const analysis = new Analysis(foodmartDatasets[3], "test");
  const q = analysis.query;
  await q.rowLevels.add(analysis.dataset.dimensions[2].hierarchies[0].levels[1]).then(() => {
    expect(q.asMDX()).toBeNull();
  });
});

test('query MDX no row levels -> null MDX string', async () => {
  const analysis = new Analysis(foodmartDatasets[3], "test");
  const q = analysis.query;
  await q.measures.add(analysis.dataset.measures[0]).then(async () => {
    expect(q.asMDX()).toBeNull();
    await q.columnLevels.add(analysis.dataset.dimensions[2].hierarchies[0].levels[1]).then(async () => {
      expect(q.asMDX()).toBeNull();
    });
  });
});

test('query MDX 1 measure 1 row dim 1 col dim', async () => {
  const analysis = new Analysis(foodmartDatasets[3], "test");
  const q = analysis.query;
  await q.measures.add(analysis.dataset.measures[0]).then(async () => {
    expect(q.measures.get(0).name).toBe("Store Sqft");
    await q.rowLevels.add(analysis.dataset.dimensions[2].hierarchies[0].levels[1]).then(async () => {
      expect(q.rowLevels.get(0).name).toBe("Store Country");
      await q.columnLevels.add(analysis.dataset.dimensions[1].hierarchies[0].levels[1]).then(() => {
        expect(q.columnLevels.get(0).name).toBe("Store Type");
        expect(q.asMDX()).toEqual("SELECT NON EMPTY CrossJoin({[Store Type].[Store Type].[Store Type].Members},{[Measures].[Store Sqft]}) ON COLUMNS, NON EMPTY {[Store].[Stores].[Store Country].Members} ON ROWS FROM [Store]");
      });
    });
  });
});

test('query MDX 1 measure 1 row dim 2 col dim', async () => {
  const analysis = new Analysis(foodmartDatasets[3], "test");
  const q = analysis.query;
  await q.measures.add(analysis.dataset.measures[0]).then(async () => {
    expect(q.measures.get(0).name).toBe("Store Sqft");
    await q.rowLevels.add(analysis.dataset.dimensions[2].hierarchies[0].levels[1]).then(async () => {
      expect(q.rowLevels.get(0).name).toBe("Store Country");
      await q.columnLevels.add(analysis.dataset.dimensions[1].hierarchies[0].levels[1]).then(async () => {
        expect(q.columnLevels.get(0).name).toBe("Store Type");
        await q.columnLevels.add(analysis.dataset.dimensions[3].hierarchies[0].levels[1]).then(() => {
          expect(q.columnLevels.get(1).name).toBe("Has coffee bar");
          expect(q.asMDX()).toEqual("SELECT NON EMPTY CrossJoin(CrossJoin({[Store Type].[Store Type].[Store Type].Members},{[Has coffee bar].[Has coffee bar].[Has coffee bar].Members}),{[Measures].[Store Sqft]}) ON COLUMNS, NON EMPTY {[Store].[Stores].[Store Country].Members} ON ROWS FROM [Store]");
        });
      });
    });
  });
});

test('query MDX 2 measures 1 row dim 1 col dim', async () => {
  const analysis = new Analysis(foodmartDatasets[3], "test");
  const q = analysis.query;
  await q.measures.add(analysis.dataset.measures[0]).then(async () => {
    expect(q.measures.get(0).name).toBe("Store Sqft");
    await q.rowLevels.add(analysis.dataset.dimensions[2].hierarchies[0].levels[1]).then(async () => {
      expect(q.rowLevels.get(0).name).toBe("Store Country");
      await q.columnLevels.add(analysis.dataset.dimensions[1].hierarchies[0].levels[1]).then(async () => {
        expect(q.columnLevels.get(0).name).toBe("Store Type");
        await q.measures.add(analysis.dataset.measures[1]).then(async () => {
          expect(q.asMDX()).toEqual("SELECT NON EMPTY CrossJoin({[Store Type].[Store Type].[Store Type].Members},{[Measures].[Store Sqft],[Measures].[Grocery Sqft]}) ON COLUMNS, NON EMPTY {[Store].[Stores].[Store Country].Members} ON ROWS FROM [Store]");
        });
      });
    });
  });
});


