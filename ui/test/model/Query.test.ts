import { Dataset } from '../../src/js/model/Dataset';
import { FoodmartMetadata } from '../_data/TestData';
import { LocalRepository } from '../../src/js/model/Repository';
import { List } from '../../src/js/collections/List';
import { Analysis } from '../../src/js/model/Analysis';
import { QueryLevel, QueryMeasure, QueryFilter } from '../../src/js/model/Query';
import { LoggerFactory } from '../../src/js/util/LoggerFactory';

let repository: LocalRepository;
const testDatasets: List<Dataset> = new List();
let foodmartDatasets: Dataset[];

beforeAll(async () => {
  const metadata = await FoodmartMetadata.getInstance().getMetadata();
  foodmartDatasets = Dataset.loadFromMetadata(metadata, "http://localhost:58080/mondrian-rest/getMetadata?connectionName=foodmart");
});

beforeEach(async () => {
  repository = new LocalRepository(LoggerFactory.getLevelForString(process.env.PIET_REPO_LOG_LEVEL));
  return repository.init().then(async () => {
    return repository.browseDatasets().then(async (d: Dataset[]) => {
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
        expect(q.asMDX()).toEqual("SELECT NON EMPTY {[Measures].[Store Sqft]} ON COLUMNS, NON EMPTY VisualTotals(Hierarchize({{[Store].[Stores].[Store Country].Members},{[Store].[Stores].[Store State].Members}})) ON ROWS FROM [Store]");
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
          expect(q.asMDX()).toEqual("SELECT NON EMPTY {[Measures].[Store Sqft]} ON COLUMNS, NON EMPTY VisualTotals(Hierarchize({{[Store].[Stores].[Store Country].Members},{[Store].[Stores].[Store State].Members},{[Store].[Stores].[Store City].Members}})) ON ROWS FROM [Store]");
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
          expect(q.asMDX()).toEqual("SELECT NON EMPTY {[Measures].[Store Sqft]} ON COLUMNS, NON EMPTY NonEmptyCrossJoin(VisualTotals(Hierarchize({{[Store].[Stores].[Store Country].Members},{[Store].[Stores].[Store State].Members}})),{[Store Type].[Store Type].[Store Type].Members}) ON ROWS FROM [Store]");
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
            expect(q.asMDX()).toEqual("SELECT NON EMPTY {[Measures].[Store Sqft]} ON COLUMNS, NON EMPTY NonEmptyCrossJoin(VisualTotals(Hierarchize({{[Store].[Stores].[Store Country].Members},{[Store].[Stores].[Store State].Members}})),NonEmptyCrossJoin({[Store Type].[Store Type].[Store Type].Members},{[Has coffee bar].[Has coffee bar].[Has coffee bar].Members})) ON ROWS FROM [Store]");
          });
        });
      });
    });
  });
});

test('persistence', async () => {
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
                _measures: [ { _uniqueName: '[Measures].[Store Sqft]' } ],
                _levels: [ { _uniqueName: '[Store].[Stores].[Store Country]', _rowOrientation: true }]
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

test('two level query with filtering (include)', async () => {
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
      let queryFilter = new QueryFilter("[Store].[Stores].[Store Country]", q);
      await q.levels.add(queryLevel).then(async () => {
        await analysis.query.filters.add(queryFilter).then(async () => {
          await queryFilter.levelMemberNames.set(["USA"]).then(async () => {
            expect(q.asMDX()).toBe("SELECT NON EMPTY {[Measures].[Store Sqft]} ON COLUMNS, NON EMPTY VisualTotals(Hierarchize({{[Store].[Stores].[Store Country].[USA]},Exists({[Store].[Stores].[Store State].Members},{[Store].[Stores].[Store Country].[USA]})})) ON ROWS FROM [Store]");
            await queryFilter.levelMemberNames.add("Canada").then(async () => {
              expect(q.asMDX()).toBe("SELECT NON EMPTY {[Measures].[Store Sqft]} ON COLUMNS, NON EMPTY VisualTotals(Hierarchize({{[Store].[Stores].[Store Country].[USA],[Store].[Stores].[Store Country].[Canada]},Exists({[Store].[Stores].[Store State].Members},{[Store].[Stores].[Store Country].[USA],[Store].[Stores].[Store Country].[Canada]})})) ON ROWS FROM [Store]");
              queryFilter = new QueryFilter("[Store].[Stores].[Store State]", q);
              await analysis.query.filters.add(queryFilter).then(async () => {
                await queryFilter.levelMemberNames.set(["WA","OR","BC"]).then(async () => {
                  expect(q.asMDX()).toBe("SELECT NON EMPTY {[Measures].[Store Sqft]} ON COLUMNS, NON EMPTY VisualTotals(Hierarchize({{[Store].[Stores].[Store Country].[USA],[Store].[Stores].[Store Country].[Canada]},Exists({[Store].[Stores].[Store State].[WA],[Store].[Stores].[Store State].[OR],[Store].[Stores].[Store State].[BC]},{[Store].[Stores].[Store Country].[USA],[Store].[Stores].[Store Country].[Canada]})})) ON ROWS FROM [Store]");
                });
              });
            });
          });
        });
      });
    });
  });
});

test('two level query with filtering (exclude)', async () => {
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
      const queryFilter = new QueryFilter("[Store].[Stores].[Store Country]", q);
      await q.levels.add(queryLevel).then(async () => {
        await analysis.query.filters.add(queryFilter).then(async () => {
          await queryFilter.levelMemberNames.set(["USA"]).then(async () => {
            await queryFilter.setInclude(false).then(async () => {
              expect(q.asMDX()).toBe("SELECT NON EMPTY {[Measures].[Store Sqft]} ON COLUMNS, NON EMPTY VisualTotals(Hierarchize({{Except([Store].[Stores].[Store Country].Members,{[Store].[Stores].[Store Country].[USA]})},Exists({[Store].[Stores].[Store State].Members},{Except([Store].[Stores].[Store Country].Members,{[Store].[Stores].[Store Country].[USA]})})})) ON ROWS FROM [Store]");
              await queryFilter.levelMemberNames.add("Canada").then(async () => {
                expect(q.asMDX()).toBe("SELECT NON EMPTY {[Measures].[Store Sqft]} ON COLUMNS, NON EMPTY VisualTotals(Hierarchize({{Except([Store].[Stores].[Store Country].Members,{[Store].[Stores].[Store Country].[USA],[Store].[Stores].[Store Country].[Canada]})},Exists({[Store].[Stores].[Store State].Members},{Except([Store].[Stores].[Store Country].Members,{[Store].[Stores].[Store Country].[USA],[Store].[Stores].[Store Country].[Canada]})})})) ON ROWS FROM [Store]");
              });
            });
          });
        });
      });
    });
  });
});

test('three level query with filtering (include)', async () => {
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
        let queryFilter = new QueryFilter("[Store].[Stores].[Store Country]", q);
        await q.levels.add(queryLevel).then(async () => {
          await analysis.query.filters.add(queryFilter).then(async () => {
            await queryFilter.levelMemberNames.set(["USA"]).then(async () => {
              expect(q.asMDX()).toBe("SELECT NON EMPTY {[Measures].[Store Sqft]} ON COLUMNS, NON EMPTY VisualTotals(Hierarchize({{[Store].[Stores].[Store Country].[USA]},Exists({[Store].[Stores].[Store State].Members},{[Store].[Stores].[Store Country].[USA]}),Exists({[Store].[Stores].[Store City].Members},{[Store].[Stores].[Store Country].[USA]})})) ON ROWS FROM [Store]");
              queryFilter = new QueryFilter("[Store].[Stores].[Store State]", q);
              await analysis.query.filters.add(queryFilter).then(async () => {
                await queryFilter.levelMemberNames.set(["WA"]).then(async () => {
                  expect(q.asMDX()).toBe("SELECT NON EMPTY {[Measures].[Store Sqft]} ON COLUMNS, NON EMPTY VisualTotals(Hierarchize({{[Store].[Stores].[Store Country].[USA]},Exists({[Store].[Stores].[Store State].[WA]},{[Store].[Stores].[Store Country].[USA]}),Exists({[Store].[Stores].[Store City].Members},Exists({[Store].[Stores].[Store State].[WA]},{[Store].[Stores].[Store Country].[USA]}))})) ON ROWS FROM [Store]");
                  queryFilter = new QueryFilter("[Store].[Stores].[Store City]", q);
                  await analysis.query.filters.add(queryFilter).then(async () => {
                    await queryFilter.levelMemberNames.set(["Bellingham","Tacoma"]).then(async () => {
                      expect(q.asMDX()).toBe("SELECT NON EMPTY {[Measures].[Store Sqft]} ON COLUMNS, NON EMPTY VisualTotals(Hierarchize({{[Store].[Stores].[Store Country].[USA]},Exists({[Store].[Stores].[Store State].[WA]},{[Store].[Stores].[Store Country].[USA]}),Exists({[Store].[Stores].[Store City].[Bellingham],[Store].[Stores].[Store City].[Tacoma]},Exists({[Store].[Stores].[Store State].[WA]},{[Store].[Stores].[Store Country].[USA]}))})) ON ROWS FROM [Store]");
                      await analysis.query.filters.get(0).levelMemberNames.clear().then(async () => {
                        expect(q.asMDX()).toBe("SELECT NON EMPTY {[Measures].[Store Sqft]} ON COLUMNS, NON EMPTY VisualTotals(Hierarchize({{[Store].[Stores].[Store Country].Members},{[Store].[Stores].[Store State].[WA]},Exists({[Store].[Stores].[Store City].[Bellingham],[Store].[Stores].[Store City].[Tacoma]},{[Store].[Stores].[Store State].[WA]})})) ON ROWS FROM [Store]");
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
});

test('three level query with filtering on <3 levels (include)', async () => {
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
        let queryFilter = new QueryFilter("[Store].[Stores].[Store Country]", q);
        await q.levels.add(queryLevel).then(async () => {
          await analysis.query.filters.add(queryFilter).then(async () => {
            await queryFilter.levelMemberNames.set(["USA"]).then(async () => {
              queryFilter = new QueryFilter("[Store].[Stores].[Store City]", q);
              await analysis.query.filters.add(queryFilter).then(async () => {
                await queryFilter.levelMemberNames.set(["Bellingham","Tacoma"]).then(async () => {
                  expect(q.asMDX()).toBe("SELECT NON EMPTY {[Measures].[Store Sqft]} ON COLUMNS, NON EMPTY VisualTotals(Hierarchize({{[Store].[Stores].[Store Country].[USA]},Exists({[Store].[Stores].[Store State].Members},{[Store].[Stores].[Store Country].[USA]}),Exists({[Store].[Stores].[Store City].[Bellingham],[Store].[Stores].[Store City].[Tacoma]},{[Store].[Stores].[Store Country].[USA]})})) ON ROWS FROM [Store]");
                  await analysis.query.filters.clear().then(async () => {
                    queryFilter = new QueryFilter("[Store].[Stores].[Store City]", q);
                    await analysis.query.filters.add(queryFilter).then(async () => {
                      await queryFilter.levelMemberNames.set(["Bellingham","Tacoma"]).then(async () => {
                        expect(q.asMDX()).toBe("SELECT NON EMPTY {[Measures].[Store Sqft]} ON COLUMNS, NON EMPTY VisualTotals(Hierarchize({{[Store].[Stores].[Store Country].Members},{[Store].[Stores].[Store State].Members},{[Store].[Stores].[Store City].[Bellingham],[Store].[Stores].[Store City].[Tacoma]}})) ON ROWS FROM [Store]");
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
});

test('changing axis orientation within a hierarchy', async () => {
  const analysis = new Analysis(foodmartDatasets[7], "test");
  const q = analysis.query;
  const queryMeasure = new QueryMeasure(q);
  queryMeasure.setUniqueName("[Measures].[Store Sqft]");
  await q.measures.add(queryMeasure).then(async () => {
    const queryLevel1 = new QueryLevel(q);
    await queryLevel1.setUniqueName("[Store].[Stores].[Store Country]").then(async () => {
      await q.levels.add(queryLevel1).then(async () => {
        const queryLevel2 = new QueryLevel(q);
        await queryLevel2.setUniqueName("[Store].[Stores].[Store State]").then(async () => {
          await q.levels.add(queryLevel2).then(async () => {
            await queryLevel2.setRowOrientation(false).then(async () => {
              expect(queryLevel1.rowOrientation).toBe(false);
              const queryLevel3 = new QueryLevel(q);
              expect(queryLevel3.rowOrientation).toBe(true); 
              await queryLevel3.setUniqueName("[Store].[Stores].[Store City]").then(async () => {
                expect(queryLevel3.rowOrientation).toBe(false); 
              });
            });
          });
        });
      });
    });
  });
});