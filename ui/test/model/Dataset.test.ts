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

test('hierarchies', () => {
  TestData.TEST_METADATA.cubes.forEach((mdCube: any, cubeIdx: number): void => {
    //logger.log("Cube: " + datasets[cubeIdx].name);
    mdCube.dimensions.forEach((mdDimension: any, dimensionIdx: number): void => {
      //logger.log("Dimension: " + datasets[cubeIdx].dimensions[dimensionIdx].name);
      expect(mdCube.dimensions[dimensionIdx].hierarchies.length).toBe(datasets[cubeIdx].dimensions[dimensionIdx].hierarchies.length);
      mdDimension.hierarchies.forEach((_: any, idx: number): void => {
        //logger.log("Hierarchy: " + datasets[cubeIdx].dimensions[dimensionIdx].hierarchies[idx].name);
        expect(datasets[cubeIdx].dimensions[dimensionIdx].hierarchies[idx].name).toBe(mdCube.dimensions[dimensionIdx].hierarchies[idx].name);
        expect(datasets[cubeIdx].dimensions[dimensionIdx].hierarchies[idx].description).toBe(mdCube.dimensions[dimensionIdx].hierarchies[idx].caption);
      });
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

test('big', () => {
  const md = TestData.FOODMART_METADATA;
  expect(md).not.toBeNull();
});