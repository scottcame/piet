import { Dataset } from '../../src/js/model/Dataset';
import { FoodmartMetadata } from '../_data/TestData';
import { LocalRepository } from '../../src/js/model/Repository';
import { List } from '../../src/js/collections/List';
import { Analysis } from '../../src/js/model/Analysis';
import { QueryLevel, QueryMeasure, QueryFilter } from '../../src/js/model/Query';

let repository: LocalRepository;
const testDatasets: List<Dataset> = new List();
let foodmartDatasets: Dataset[];

beforeAll(async () => {
  const metadata = await FoodmartMetadata.getInstance().getMetadata();
  foodmartDatasets = Dataset.loadFromMetadata(metadata, "http://localhost:58080/mondrian-rest/getMetadata?connectionName=foodmart");
});

beforeEach(async () => {
  repository = new LocalRepository();
  return repository.init().then(async () => {
    return repository.browseDatasets().then((d: Dataset[]) => {
      return testDatasets.set(d).then();
    });
  });
});

test('query measures', async () => {
  const analysis = new Analysis(testDatasets.get(0), "test-name");
  expect(analysis.query).not.toBeNull();
  expect(analysis.query.measures).toHaveLength(0);
  const queryMeasure = new QueryMeasure(analysis.query);
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
  const queryLevel = new QueryLevel(analysis.query);
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
        });
      });
    });
  });
});

test('query filters', async () => {
  const analysis = new Analysis(testDatasets.get(0), "test-name");
  expect(analysis.query.filters).toHaveLength(0);
  expect(analysis.dirty).toBe(false);
  let queryFilter = new QueryFilter("[D1].[D1].[D1_DESCRIPTION]", analysis.query);
  await analysis.query.filters.add(queryFilter).then(async () => {
    expect(analysis.query.filters).toHaveLength(1);
    expect(analysis.dirty).toBe(true);
    await analysis.cancelEdits().then(async () => {
      expect(analysis.query.filters).toHaveLength(0);
      expect(analysis.dirty).toBe(false);
      await analysis.query.filters.add(queryFilter).then(async () => {
        expect(analysis.query.filters).toHaveLength(1);
        expect(analysis.dirty).toBe(true);
        await analysis.checkpointEdits().then(async () => {
          expect(analysis.dirty).toBe(false);
          await queryFilter.setInclude(false).then(async () => {
            expect(analysis.dirty).toBe(true);
            await analysis.checkpointEdits().then(async () => {
              expect(analysis.dirty).toBe(false);
              await queryFilter.levelMemberNames.add("D1 One").then(async () => {
                expect(analysis.dirty).toBe(true);
                expect(queryFilter.levelMemberNames).toHaveLength(1);
                await analysis.checkpointEdits().then(async () => {
                  expect(analysis.dirty).toBe(false);
                  expect(queryFilter.levelMemberNames).toHaveLength(1);
                  await queryFilter.levelMemberNames.add("D1 Two").then(async () => {
                    expect(analysis.dirty).toBe(true);
                    expect(queryFilter.levelMemberNames).toHaveLength(2);
                    await analysis.cancelEdits().then(async () => {
                      queryFilter = analysis.query.filters.get(0);
                      expect(queryFilter.levelMemberNames).toHaveLength(1);
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});

// import * as stringify from 'json-stringify-safe';

test('query MDX 1 measure 1 row dim', async () => {
  const analysis = new Analysis(foodmartDatasets[7], "test");
  const q = analysis.query;
  const queryMeasure = new QueryMeasure(q);
  queryMeasure.setUniqueName("[Measures].[Store Sqft]");
  await q.measures.add(queryMeasure).then(async () => {
    const queryLevel = new QueryLevel(q);
    queryLevel.setUniqueName("[Store].[Stores].[Store Country]");
    queryLevel.setRowOrientation(true);
    await q.levels.add(queryLevel).then(() => {
      expect(q.asMDX()).toEqual("SELECT NON EMPTY {[Measures].[Store Sqft]} ON COLUMNS, NON EMPTY {[Store].[Stores].[Store Country].Members} ON ROWS FROM [Store]");
    });
  });
});

test('query MDX 2 measures row dim', async () => {
  const analysis = new Analysis(foodmartDatasets[7], "test");
  const q = analysis.query;
  let queryMeasure = new QueryMeasure(q);
  queryMeasure.setUniqueName("[Measures].[Store Sqft]");
  await q.measures.add(queryMeasure).then(async () => {
    queryMeasure = new QueryMeasure(q);
    queryMeasure.setUniqueName("[Measures].[Grocery Sqft]");
    await q.measures.add(queryMeasure).then(async () => {
      const queryLevel = new QueryLevel(q);
      queryLevel.setUniqueName("[Store].[Stores].[Store Country]");
      queryLevel.setRowOrientation(true);
      await q.levels.add(queryLevel).then(() => {
        expect(q.asMDX()).toEqual("SELECT NON EMPTY {[Measures].[Store Sqft],[Measures].[Grocery Sqft]} ON COLUMNS, NON EMPTY {[Store].[Stores].[Store Country].Members} ON ROWS FROM [Store]");
      });
    });
  });
});

test('query MDX 1 measure 2 row dims', async () => {
  const analysis = new Analysis(foodmartDatasets[7], "test");
  const q = analysis.query;
  const queryMeasure = new QueryMeasure(q);
  queryMeasure.setUniqueName("[Measures].[Store Sqft]");
  await q.measures.add(queryMeasure).then(async () => {
    let queryLevel = new QueryLevel(q);
    queryLevel.setUniqueName("[Store].[Stores].[Store Country]");
    queryLevel.setRowOrientation(true);
    await q.levels.add(queryLevel).then(async () => {
      queryLevel = new QueryLevel(q);
      queryLevel.setUniqueName("[Store Type].[Store Type].[Store Type]");
      queryLevel.setRowOrientation(true);
      await q.levels.add(queryLevel).then(() => {
        expect(q.asMDX()).toEqual("SELECT NON EMPTY {[Measures].[Store Sqft]} ON COLUMNS, NON EMPTY NonEmptyCrossJoin({[Store].[Stores].[Store Country].Members},{[Store Type].[Store Type].[Store Type].Members}) ON ROWS FROM [Store]");
      });
    });
  });
});

test('query MDX no measures -> null', async () => {
  const analysis = new Analysis(foodmartDatasets[7], "test");
  const q = analysis.query;
  const queryLevel = new QueryLevel(q);
  queryLevel.setRowOrientation(true);
  await q.levels.add(queryLevel).then(() => {
    expect(q.asMDX()).toBeNull();
  });
});

test('query MDX 1 measure 1 row dim 1 col dim', async () => {
  const analysis = new Analysis(foodmartDatasets[7], "test");
  const q = analysis.query;
  const queryMeasure = new QueryMeasure(q);
  queryMeasure.setUniqueName("[Measures].[Store Sqft]");
  await q.measures.add(queryMeasure).then(async () => {
    let queryLevel = new QueryLevel(q);
    queryLevel.setUniqueName("[Store].[Stores].[Store Country]");
    queryLevel.setRowOrientation(true);
    await q.levels.add(queryLevel).then(async () => {
      queryLevel = new QueryLevel(q);
      queryLevel.setUniqueName("[Store Type].[Store Type].[Store Type]");
      queryLevel.setRowOrientation(false);
      await q.levels.add(queryLevel).then(() => {
        expect(q.asMDX()).toEqual("SELECT NON EMPTY NonEmptyCrossJoin({[Store Type].[Store Type].[Store Type].Members},{[Measures].[Store Sqft]}) ON COLUMNS, NON EMPTY {[Store].[Stores].[Store Country].Members} ON ROWS FROM [Store]");
      });
    });
  });
});

test('query MDX 1 measure 1 row dim 2 col dim', async () => {
  const analysis = new Analysis(foodmartDatasets[7], "test");
  const q = analysis.query;
  const queryMeasure = new QueryMeasure(q);
  queryMeasure.setUniqueName("[Measures].[Store Sqft]");
  await q.measures.add(queryMeasure).then(async () => {
    let queryLevel = new QueryLevel(q);
    queryLevel.setUniqueName("[Store].[Stores].[Store Country]");
    queryLevel.setRowOrientation(true);
    await q.levels.add(queryLevel).then(async () => {
      queryLevel = new QueryLevel(q);
      queryLevel.setUniqueName("[Store Type].[Store Type].[Store Type]");
      queryLevel.setRowOrientation(false);
      await q.levels.add(queryLevel).then(async () => {
        queryLevel = new QueryLevel(q);
        queryLevel.setUniqueName("[Has coffee bar].[Has coffee bar].[Has coffee bar]");
        queryLevel.setRowOrientation(false);
        await q.levels.add(queryLevel).then(() => {
          expect(q.asMDX()).toEqual("SELECT NON EMPTY NonEmptyCrossJoin(NonEmptyCrossJoin({[Store Type].[Store Type].[Store Type].Members},{[Has coffee bar].[Has coffee bar].[Has coffee bar].Members}),{[Measures].[Store Sqft]}) ON COLUMNS, NON EMPTY {[Store].[Stores].[Store Country].Members} ON ROWS FROM [Store]");
        });
      });
    });
  });
});

test('query MDX 2 measures 1 row dim 1 col dim', async () => {
  const analysis = new Analysis(foodmartDatasets[7], "test");
  const q = analysis.query;
  let queryMeasure = new QueryMeasure(q);
  queryMeasure.setUniqueName("[Measures].[Store Sqft]");
  await q.measures.add(queryMeasure).then(async () => {
    queryMeasure = new QueryMeasure(q);
    queryMeasure.setUniqueName("[Measures].[Grocery Sqft]");
    await q.measures.add(queryMeasure).then(async () => {
      let queryLevel = new QueryLevel(q);
      queryLevel.setUniqueName("[Store].[Stores].[Store Country]");
      queryLevel.setRowOrientation(true);
      await q.levels.add(queryLevel).then(async () => {
        queryLevel = new QueryLevel(q);
        queryLevel.setUniqueName("[Store Type].[Store Type].[Store Type]");
        queryLevel.setRowOrientation(false);
        await q.levels.add(queryLevel).then(() => {
          expect(q.asMDX()).toEqual("SELECT NON EMPTY NonEmptyCrossJoin({[Store Type].[Store Type].[Store Type].Members},{[Measures].[Store Sqft],[Measures].[Grocery Sqft]}) ON COLUMNS, NON EMPTY {[Store].[Stores].[Store Country].Members} ON ROWS FROM [Store]");
        });
      });
    });
  });
});

test('query MDX simple 2 level hierarchize', async () => {
  const analysis = new Analysis(foodmartDatasets[7], "test");
  const q = analysis.query;
  const queryMeasure = new QueryMeasure(q);
  queryMeasure.setUniqueName("[Measures].[Store Sqft]");
  await q.measures.add(queryMeasure).then(async () => {
    let queryLevel = new QueryLevel(q);
    queryLevel.setUniqueName("[Store].[Stores].[Store Country]");
    queryLevel.setRowOrientation(true);
    await q.levels.add(queryLevel).then(async () => {
      queryLevel = new QueryLevel(q);
      queryLevel.setUniqueName("[Store].[Stores].[Store State]");
      queryLevel.setRowOrientation(true);
      await q.levels.add(queryLevel).then(() => {
        expect(q.asMDX()).toEqual("SELECT NON EMPTY {[Measures].[Store Sqft]} ON COLUMNS, NON EMPTY Hierarchize({{[Store].[Stores].[Store Country].Members},{[Store].[Stores].[Store State].Members}}) ON ROWS FROM [Store]");
      });
    });
  });
});

test('query MDX simple 3 level hierarchize', async () => {
  const analysis = new Analysis(foodmartDatasets[7], "test");
  const q = analysis.query;
  const queryMeasure = new QueryMeasure(q);
  queryMeasure.setUniqueName("[Measures].[Store Sqft]");
  await q.measures.add(queryMeasure).then(async () => {
    let queryLevel = new QueryLevel(q);
    queryLevel.setUniqueName("[Store].[Stores].[Store Country]");
    queryLevel.setRowOrientation(true);
    await q.levels.add(queryLevel).then(async () => {
      queryLevel = new QueryLevel(q);
      queryLevel.setUniqueName("[Store].[Stores].[Store State]");
      queryLevel.setRowOrientation(true);
      await q.levels.add(queryLevel).then(async () => {
        queryLevel = new QueryLevel(q);
        queryLevel.setUniqueName("[Store].[Stores].[Store City]");
        queryLevel.setRowOrientation(true);
        await q.levels.add(queryLevel).then(() => {
          expect(q.asMDX()).toEqual("SELECT NON EMPTY {[Measures].[Store Sqft]} ON COLUMNS, NON EMPTY Hierarchize({{[Store].[Stores].[Store Country].Members},{[Store].[Stores].[Store State].Members},{[Store].[Stores].[Store City].Members}}) ON ROWS FROM [Store]");
        });
      });
    });
  });
});

test('query MDX simple 2 level hierarchize plus additional level', async () => {
  const analysis = new Analysis(foodmartDatasets[7], "test");
  const q = analysis.query;
  const queryMeasure = new QueryMeasure(q);
  queryMeasure.setUniqueName("[Measures].[Store Sqft]");
  await q.measures.add(queryMeasure).then(async () => {
    let queryLevel = new QueryLevel(q);
    queryLevel.setUniqueName("[Store].[Stores].[Store Country]");
    queryLevel.setRowOrientation(true);
    await q.levels.add(queryLevel).then(async () => {
      queryLevel = new QueryLevel(q);
      queryLevel.setUniqueName("[Store].[Stores].[Store State]");
      queryLevel.setRowOrientation(true);
      await q.levels.add(queryLevel).then(async () => {
        queryLevel = new QueryLevel(q);
        queryLevel.setUniqueName("[Store Type].[Store Type].[Store Type]");
        queryLevel.setRowOrientation(true);
        await q.levels.add(queryLevel).then(() => {
          expect(q.asMDX()).toEqual("SELECT NON EMPTY {[Measures].[Store Sqft]} ON COLUMNS, NON EMPTY NonEmptyCrossJoin(Hierarchize({{[Store].[Stores].[Store Country].Members},{[Store].[Stores].[Store State].Members}}),{[Store Type].[Store Type].[Store Type].Members}) ON ROWS FROM [Store]");
        });
      });
    });
  });
});

test('query MDX simple 2 level hierarchize plus 2 additional levels', async () => {
  const analysis = new Analysis(foodmartDatasets[7], "test");
  const q = analysis.query;
  const queryMeasure = new QueryMeasure(q);
  queryMeasure.setUniqueName("[Measures].[Store Sqft]");
  await q.measures.add(queryMeasure).then(async () => {
    let queryLevel = new QueryLevel(q);
    queryLevel.setUniqueName("[Store].[Stores].[Store Country]");
    queryLevel.setRowOrientation(true);
    await q.levels.add(queryLevel).then(async () => {
      queryLevel = new QueryLevel(q);
      queryLevel.setUniqueName("[Store].[Stores].[Store State]");
      queryLevel.setRowOrientation(true);
      await q.levels.add(queryLevel).then(async () => {
        queryLevel = new QueryLevel(q);
        queryLevel.setUniqueName("[Store Type].[Store Type].[Store Type]");
        queryLevel.setRowOrientation(true);
        await q.levels.add(queryLevel).then(async () => {
          queryLevel = new QueryLevel(q);
          queryLevel.setUniqueName("[Has coffee bar].[Has coffee bar].[Has coffee bar]");
          queryLevel.setRowOrientation(true);
          await q.levels.add(queryLevel).then(() => {
            expect(q.asMDX()).toEqual("SELECT NON EMPTY {[Measures].[Store Sqft]} ON COLUMNS, NON EMPTY NonEmptyCrossJoin(Hierarchize({{[Store].[Stores].[Store Country].Members},{[Store].[Stores].[Store State].Members}}),NonEmptyCrossJoin({[Store Type].[Store Type].[Store Type].Members},{[Has coffee bar].[Has coffee bar].[Has coffee bar].Members})) ON ROWS FROM [Store]");
          });
        });
      });
    });
  });
});

test('persistence', async () => {
  const repository = new LocalRepository();
  return repository.init().then(async () => {
    const datasets: List<Dataset> = new List();
    return repository.browseDatasets().then(async (dd: Dataset[]) => {
      return datasets.set(dd).then(async () => {
        const analysis = new Analysis(datasets.get(0), "test-name");
        analysis.setDescription("test-description");
        const queryMeasure = new QueryMeasure(analysis.query);
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
          const queryLevel = new QueryLevel(analysis.query);
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
                _levels: [ { _uniqueName: '[Store].[Stores].[Store Country]', _rowOrientation: true, _sumSelected: false }]
              }
            });
            deserializedAnalysis = await new Analysis().deserialize(serializedAnalysis, repository);
            expect(deserializedAnalysis.query.measures.get(0).uniqueName).toBe(queryMeasure.uniqueName);
            expect(deserializedAnalysis.query.levels.get(0).uniqueName).toBe(queryLevel.uniqueName);
          });
        });
      });
    });
  });
});

test('level filter active', async () => {
  const analysis = new Analysis(testDatasets.get(0), "test-name");
  expect(analysis.query.findFilter("[D1].[D1].[D1_DESCRIPTION]")).toBeNull();
  const queryFilter = new QueryFilter("[D1].[D1].[D1_DESCRIPTION]", analysis.query);
  const queryLevel = new QueryLevel(analysis.query);
  queryLevel.setRowOrientation(true);
  queryLevel.setUniqueName("[D1].[D1].[D1_DESCRIPTION]");
  expect(queryLevel.filterActive).toBe(false);
  await analysis.query.levels.add(queryLevel).then(async () => {
    await analysis.query.filters.add(queryFilter).then(async () => {
      expect(analysis.query.findFilter("[D1].[D1].[D1_DESCRIPTION]")).not.toBeNull();
      expect(queryLevel.filterActive).toBe(false); // still false because we haven't added any level members to the filter yet
      await queryFilter.levelMemberNames.set(["D1 One"]).then(() => {
        expect(queryLevel.filterActive).toBe(true);
      });
    });
  });
});

test('level memberMDXSet', async () => {
  const analysis = new Analysis(testDatasets.get(0), "test-name");
  const queryFilter = new QueryFilter("[D2].[D2].[D2_DESCRIPTION]", analysis.query);
  const queryLevel = new QueryLevel(analysis.query);
  queryLevel.setRowOrientation(true);
  queryLevel.setUniqueName("[D2].[D2].[D2_DESCRIPTION]");
  expect(queryLevel.filterActive).toBe(false);
  await analysis.query.levels.add(queryLevel).then(async () => {
    await analysis.query.filters.add(queryFilter).then(async () => {
      expect(queryLevel.memberMDXSet).toBe("[D2].[D2].[D2_DESCRIPTION].Members");
      expect(queryFilter.include).toBe(true);
      await queryFilter.levelMemberNames.set(["D2 One"]).then(async () => {
        expect(queryLevel.memberMDXSet).toBe("[D2].[D2].[D2_DESCRIPTION].[D2 One]");
        await queryFilter.levelMemberNames.add("D2 Two").then(async () => {
          expect(queryLevel.memberMDXSet).toBe("[D2].[D2].[D2_DESCRIPTION].[D2 One],[D2].[D2].[D2_DESCRIPTION].[D2 Two]");
          await queryFilter.setInclude(false).then(async () => {
            expect(queryLevel.memberMDXSet).toBe("Except([D2].[D2].[D2_DESCRIPTION].Members,{[D2].[D2].[D2_DESCRIPTION].[D2 One],[D2].[D2].[D2_DESCRIPTION].[D2 Two]})");
          });
        });
      });
    });
  });
});