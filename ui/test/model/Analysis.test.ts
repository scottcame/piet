// Copyright 2020 National Police Foundation
// Copyright 2020 Scott Came Consulting LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { LocalRepository } from "../../src/js/model/Repository";
import { Analysis } from "../../src/js/model/Analysis";
import { Dataset } from "../../src/js/model/Dataset";
import { List } from "../../src/js/collections/List";
import { LoggerFactory } from "../../src/js/util/LoggerFactory";
import { QueryMeasure, QueryLevel } from "../../src/js/model/Query";

let repository: LocalRepository;
const datasets: List<Dataset> = new List();

beforeEach(async () => {
  repository = new LocalRepository(LoggerFactory.getLevelForString(process.env.PIET_REPO_LOG_LEVEL));
  return repository.init().then(async () => {
    return repository.browseDatasets().then(async (d: Dataset[]) => {
      return datasets.set(d);
    });
  });
});

test('persistence', async () => {
  const analysis = new Analysis(datasets.get(0), "test-name");
  return analysis.setDescription("test-description").then(async () => {
    const serializedAnalysis = analysis.serialize(repository);
    expect(serializedAnalysis).toMatchObject({
      datasetRef: {
        id: 'http://localhost:58080/mondrian-rest/getMetadata?connectionName=test',
        cube: 'Test_F1'
      },
      name: 'test-name',
      description: 'test-description',
      _query: {
        _measures: [],
        _levels: [],
        nonEmpty: true
      }
    });
    return new Analysis().deserialize(serializedAnalysis, repository).then(async (deserializedAnalysis: Analysis) => {
      expect(deserializedAnalysis.name).toBe(analysis.name);
      expect(deserializedAnalysis.description).toBe(analysis.description);
      expect(deserializedAnalysis.id).toBeUndefined();
    });
  });
});

test('editing', async () => {
  const originalName = "test-name";
  const originalDescription = "test-description";
  const analysis = new Analysis(datasets.get(0), originalName, null);
  return analysis.setDescription(originalDescription).then(async () => {
    return analysis.checkpointEdits().then(async () => {
      expect(analysis.dirty).toBe(false);
      return analysis.setName("new-name").then(async () => {
        expect(analysis.dirty).toBe(true);
        return analysis.cancelEdits().then(async () => {
          expect(analysis.dirty).toBe(false);
          expect(analysis.name).toBe(originalName);
          expect(analysis.description).toBe(originalDescription);
          return analysis.setDescription("new-description").then(async () => {
            expect(analysis.dirty).toBe(true);
            return analysis.cancelEdits().then(async () => {
              expect(analysis.dirty).toBe(false);
              expect(analysis.description).toBe(originalDescription);
              return Promise.all([
                analysis.setName("new-name2"),
                analysis.setDescription("new-description2")
              ]).then(async () => {
                return analysis.checkpointEdits().then(async () => {
                  expect(analysis.dirty).toBe(false);
                  expect(analysis.name).toBe("new-name2");
                  expect(analysis.description).toBe("new-description2");
                });
              });
            });
          });
        });
      });
    });
  });
});

test('deserialization dataset errors', async () => {
  const analysis = new Analysis(datasets.get(0), "test-name");
  analysis.setDescription("test-description");
  const serializedAnalysis = analysis.serialize(repository);
  repository.wipeDatasetsForTesting();
  return expect(new Analysis().deserialize(serializedAnalysis, repository)).rejects.toMatch(/dataset.+not found/);
});

test('undo simple property', async () => {
  const analysis = new Analysis(datasets.get(0), "test-name");
  await expect(analysis.undo()).resolves.not.toThrow();
  return analysis.setNonEmpty(false).then(async () => {
    expect(analysis.nonEmpty).toBe(false);
    return analysis.undo().then(async () => {
      expect(analysis.nonEmpty).toBe(true);
    });
  });
});

test('undo measure add', async () => {
  const analysis = new Analysis(datasets.get(0), "test-name");
  const queryMeasure = new QueryMeasure(analysis.query);
  return analysis.query.measures.add(queryMeasure).then(async () => {
    expect(analysis.query.measures).toHaveLength(1);
    return analysis.undo().then(async () => {
      expect(analysis.query.measures).toHaveLength(0);
    });
  });
});

test('undo level add and edit', async () => {
  const analysis = new Analysis(datasets.get(0), "test-name");
  let queryLevel = new QueryLevel(analysis.query);
  return queryLevel.setUniqueName(datasets.get(0).dimensions[0].hierarchies[0].levels[0].uniqueName).then(async () => {
    return queryLevel.setRowOrientation(true).then(async () => {
      return analysis.query.levels.add(queryLevel).then(async () => {
        expect(analysis.query.levels).toHaveLength(1);
        return analysis.undo().then(async () => {
          expect(analysis.query.levels).toHaveLength(0);
          return analysis.query.levels.add(queryLevel).then(async () => {
            expect(analysis.query.levels).toHaveLength(1);
            queryLevel = analysis.query.levels.get(0);
            return queryLevel.setRowOrientation(false).then(async () => {
              expect(analysis.query.levels.get(0).rowOrientation).toBe(false);
              return analysis.undo().then(async () => {
                expect(analysis.query.levels.get(0).rowOrientation).toBe(true);
              });
            });
          });
        });
      });
    });
  });
});
