/* eslint-disable @typescript-eslint/no-explicit-any */

import { Dataset } from '../../src/js/model/Dataset';
import * as metadata from '../_data/test-metadata.json';

//import { Logger } from '../../src/js/util/Logger';
//let logger = Logger.getInstance();

const datasetId = "http://localhost:58080/mondrian-rest/getMetadata?connectionName=test";
const datasets = Dataset.loadFromMetadata(metadata, datasetId);

test('dataset', () => {
  expect(datasets.length).toBe(2);
  datasets.forEach((dataset: Dataset, idx: number) => {
    expect(dataset.schemaName).toBe(metadata.name);
    expect(dataset.id).toBe(datasetId);
    expect(dataset.name).toBe(metadata.cubes[idx].name);
    expect(dataset.description).toBe(metadata.cubes[idx].caption);
  });
});

test('measures', () => {
  metadata.cubes.forEach((mdCube: any, cubeIdx: number): void => {
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
  metadata.cubes.forEach((mdCube: any, cubeIdx: number): void => {
    expect(mdCube.dimensions.length).toBe(datasets[cubeIdx].dimensions.length);
    mdCube.dimensions.forEach((_: any, idx: number): void => {
      expect(datasets[cubeIdx].dimensions[idx].name).toBe(mdCube.dimensions[idx].name);
      expect(datasets[cubeIdx].dimensions[idx].description).toBe(mdCube.dimensions[idx].caption);
      expect(datasets[cubeIdx].dimensions[idx].type).toBe(mdCube.dimensions[idx].type);
    });
  });
});

test('hierarchies', () => {
  metadata.cubes.forEach((mdCube: any, cubeIdx: number): void => {
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
