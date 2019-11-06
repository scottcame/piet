import { Dataset } from '../../src/js/model/Dataset';
import * as metadata from '../_data/test-metadata.json';
import { Logger } from '../../src/js/util/Logger';

const datasetId = "http://localhost:58080/mondrian-rest/getMetadata?connectionName=test";
let dataset = Dataset.loadFromMetadata(metadata, datasetId);
let logger = Logger.getInstance();

test('dataset', () => {
  expect(dataset.name).toBe(metadata.name);
  expect(dataset.id).toBe(datasetId);
});

test('cubes', () => {
  expect(dataset.cubes.length).toBe(metadata.cubes.length);
  metadata.cubes.forEach((_:any, idx:number):void => {
    expect(dataset.cubes[idx].name).toBe(metadata.cubes[idx].name);
    expect(dataset.cubes[idx].description).toBe(metadata.cubes[idx].caption);
  });
});

test('measures', () => {
  metadata.cubes.forEach((mdCube:any, cubeIdx:number):void => {
    expect(mdCube.measures.length).toBe(dataset.cubes[cubeIdx].measures.length);
    mdCube.measures.forEach((_:any, idx:number):void => {
      expect(dataset.cubes[cubeIdx].measures[idx].name).toBe(mdCube.measures[idx].name);
      expect(dataset.cubes[cubeIdx].measures[idx].description).toBe(mdCube.measures[idx].caption);
      expect(dataset.cubes[cubeIdx].measures[idx].visible).toBe(mdCube.measures[idx].visible);
      expect(dataset.cubes[cubeIdx].measures[idx].calculated).toBe(mdCube.measures[idx].calculated);
    });
  });
});

test('dimensions', () => {
  metadata.cubes.forEach((mdCube:any, cubeIdx:number):void => {
    expect(mdCube.dimensions.length).toBe(dataset.cubes[cubeIdx].dimensions.length);
    mdCube.dimensions.forEach((_:any, idx:number):void => {
      expect(dataset.cubes[cubeIdx].dimensions[idx].name).toBe(mdCube.dimensions[idx].name);
      expect(dataset.cubes[cubeIdx].dimensions[idx].description).toBe(mdCube.dimensions[idx].caption);
      expect(dataset.cubes[cubeIdx].dimensions[idx].type).toBe(mdCube.dimensions[idx].type);
    });
  });
});

test('hierarchies', () => {
  metadata.cubes.forEach((mdCube:any, cubeIdx:number):void => {
    logger.log("Cube: " + dataset.cubes[cubeIdx].name);
    mdCube.dimensions.forEach((mdDimension:any, dimensionIdx:number):void => {
      logger.log("Dimension: " + dataset.cubes[cubeIdx].dimensions[dimensionIdx].name);
      expect(mdCube.dimensions[dimensionIdx].hierarchies.length).toBe(dataset.cubes[cubeIdx].dimensions[dimensionIdx].hierarchies.length);
      mdDimension.hierarchies.forEach((_:any, idx:number):void => {
        logger.log("Hierarchy: " + dataset.cubes[cubeIdx].dimensions[dimensionIdx].hierarchies[idx].name);
        expect(dataset.cubes[cubeIdx].dimensions[dimensionIdx].hierarchies[idx].name).toBe(mdCube.dimensions[dimensionIdx].hierarchies[idx].name);
        expect(dataset.cubes[cubeIdx].dimensions[dimensionIdx].hierarchies[idx].description).toBe(mdCube.dimensions[dimensionIdx].hierarchies[idx].caption);
      });
    });
  });
});
