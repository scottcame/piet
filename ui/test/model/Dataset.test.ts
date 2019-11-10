/* eslint-disable @typescript-eslint/no-explicit-any */

import { Dataset } from '../../src/js/model/Dataset';
import * as metadata from '../_data/test-metadata.json';
import { TreeModelContainerNode, TreeModelLeafNode } from '../../src/js/ui/model/Tree';

//import { Logger } from '../../src/js/util/Logger';
//let logger = Logger.getInstance();

const datasetId = "http://localhost:58080/mondrian-rest/getMetadata?connectionName=test";
const datasets = Dataset.loadFromMetadata(metadata, datasetId);

test('dataset', () => {
  expect(datasets).toHaveLength(2);
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

test('tree model', () => {
  const ds = datasets[0];
  const rootTreeModelNode = ds.rootTreeModelNode;
  expect(rootTreeModelNode instanceof TreeModelContainerNode).toBeTruthy();
  expect(rootTreeModelNode.label).toBe("Dataset: " + ds.description + " [" + ds.schemaName + "]");
  expect(rootTreeModelNode.type).toBe('dataset');
  expect(rootTreeModelNode.hasChildren()).toBeTruthy();
  let children = rootTreeModelNode.children;
  expect(children).toHaveLength(2);
  let child = children[0];
  expect(child instanceof TreeModelContainerNode).toBeTruthy();
  let containerChild = child as TreeModelContainerNode;
  expect(containerChild.label).toBe("Measures");
  children = containerChild.children;
  expect(children).toHaveLength(5);
  child = children[0];
  expect(child instanceof TreeModelLeafNode).toBeTruthy();
  expect(child.label).toBe("F1_M1");
  child = rootTreeModelNode.children[1];
  expect(child instanceof TreeModelContainerNode).toBeTruthy();
  containerChild = child as TreeModelContainerNode;
  expect(containerChild.label).toBe("Dimensions");
  children = containerChild.children;
  expect(children).toHaveLength(2);
  child = children[0];
  expect(child instanceof TreeModelLeafNode).toBeTruthy();
  expect(child.label).toBe("D1");
});
