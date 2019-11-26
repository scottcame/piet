import { TreeModelContainerNode, TreeModelLeafNode } from '../../../src/js/ui/model/Tree';

import { Dataset } from '../../../src/js/model/Dataset';
import * as metadata from '../../_data/test-metadata.json';
import { DatasetAdapterFactory } from '../../../src/js/ui/adapters/DatasetAdapterFactory';

const datasetId = "http://localhost:58080/mondrian-rest/getMetadata?connectionName=test";
const datasets = Dataset.loadFromMetadata(metadata, datasetId);
test('tree model', () => {
  const ds = datasets[0];
  const rootTreeModelNode = DatasetAdapterFactory.getInstance().createRootTreeModelNode(ds);
  expect(rootTreeModelNode instanceof TreeModelContainerNode).toBeTruthy();
  expect(rootTreeModelNode.label).toBe("Dataset: " + ds.label);
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
