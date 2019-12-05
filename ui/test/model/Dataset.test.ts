/* eslint-disable @typescript-eslint/no-explicit-any */

import { Dataset, Measure, Dimension } from '../../src/js/model/Dataset';
import { TestData } from '../_data/TestData';

const datasetId = "http://localhost:58080/mondrian-rest/getMetadata?connectionName=test";
const datasets = Dataset.loadFromMetadata(TestData.TEST_METADATA, datasetId);

test('dataset', () => {
  expect(datasets).toHaveLength(2);
  datasets.forEach((dataset: Dataset, idx: number) => {
    expect(dataset.schemaName).toBe(TestData.TEST_METADATA.name);
    expect(dataset.id).toBe(datasetId);
    expect(dataset.name).toBe(TestData.TEST_METADATA.cubes[idx].name);
    expect(dataset.description).toBe(TestData.TEST_METADATA.cubes[idx].caption);
  });
});

test('measures', () => {
  TestData.TEST_METADATA.cubes.forEach((mdCube: any, cubeIdx: number): void => {
    expect(mdCube.measures.length).toBe(datasets[cubeIdx].measures.length);
    mdCube.measures.forEach((_: any, idx: number): void => {
      expect(datasets[cubeIdx].measures[idx].name).toBe(mdCube.measures[idx].name);
      expect(datasets[cubeIdx].measures[idx].description).toBe(mdCube.measures[idx].caption);
      expect(datasets[cubeIdx].measures[idx].visible).toBe(mdCube.measures[idx].visible);
      expect(datasets[cubeIdx].measures[idx].calculated).toBe(mdCube.measures[idx].calculated);
    });
  });
});

test('dimensions', () => {
  TestData.TEST_METADATA.cubes.forEach((mdCube: any, cubeIdx: number): void => {
    expect(mdCube.dimensions.length).toBe(datasets[cubeIdx].dimensions.length);
    mdCube.dimensions.forEach((_: any, idx: number): void => {
      expect(datasets[cubeIdx].dimensions[idx].name).toBe(mdCube.dimensions[idx].name);
      expect(datasets[cubeIdx].dimensions[idx].description).toBe(mdCube.dimensions[idx].caption);
      expect(datasets[cubeIdx].dimensions[idx].type).toBe(mdCube.dimensions[idx].type);
    });
  });
});

test('hierarchies and levels', () => {
  TestData.TEST_METADATA.cubes.forEach((mdCube: any, cubeIdx: number): void => {
    mdCube.dimensions.forEach((mdDimension: any, dimensionIdx: number): void => {
      expect(mdCube.dimensions[dimensionIdx].hierarchies.length).toBe(datasets[cubeIdx].dimensions[dimensionIdx].hierarchies.length);
      mdDimension.hierarchies.forEach((mdHierarchy: any, hierarchyIdx: number): void => {
        expect(datasets[cubeIdx].dimensions[dimensionIdx].hierarchies[hierarchyIdx].name).toBe(mdCube.dimensions[dimensionIdx].hierarchies[hierarchyIdx].name);
        expect(datasets[cubeIdx].dimensions[dimensionIdx].hierarchies[hierarchyIdx].description).toBe(mdCube.dimensions[dimensionIdx].hierarchies[hierarchyIdx].caption);
        mdHierarchy.levels.forEach((_: any, levelIdx: number): void => {
          expect(datasets[cubeIdx].dimensions[dimensionIdx].hierarchies[hierarchyIdx].levels[levelIdx].name).toBe(mdCube.dimensions[dimensionIdx].hierarchies[hierarchyIdx].levels[levelIdx].name);
          expect(datasets[cubeIdx].dimensions[dimensionIdx].hierarchies[hierarchyIdx].levels[levelIdx].description).toBe(mdCube.dimensions[dimensionIdx].hierarchies[hierarchyIdx].levels[levelIdx].caption);
          expect(datasets[cubeIdx].dimensions[dimensionIdx].hierarchies[hierarchyIdx].levels[levelIdx].depth).toBe(mdCube.dimensions[dimensionIdx].hierarchies[hierarchyIdx].levels[levelIdx].depth);
        });
      });
    });
  });
});

test('level mdx string', () => {
  expect(datasets[0].dimensions[1].hierarchies[0].levels[1].asMdxString()).toBe("[D1].[D1].[D1_DESCRIPTION].Members"); 
  expect(datasets[0].dimensions[1].hierarchies[0].levels[1].asMdxString(false)).toBe("[D1].[D1].[D1_DESCRIPTION]"); 
});

test('measures mdx string', () => {
  expect(datasets[0].measures[0].asMdxString()).toBe("[Measures].[F1_M1]");
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

test('foodmart (big)', () => {
  const datasets = Dataset.loadFromMetadata(TestData.FOODMART_METADATA, "http://localhost:58080/mondrian-rest/getMetadata?connectionName=foodmart");
  expect(datasets).not.toBeNull();
  expect(datasets.length).toBe(6);
  const storeDataset = datasets[3];
  expect(storeDataset.name).toBe("Store");
  expect(storeDataset.measures).toHaveLength(2);
  expect(storeDataset.dimensions).toHaveLength(4);
});