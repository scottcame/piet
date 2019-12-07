import { TreeModelContainerNode, TreeModelLeafNode } from '../../../src/js/ui/model/Tree';

import { Dataset } from '../../../src/js/model/Dataset';
import { DatasetAdapterFactory } from '../../../src/js/ui/adapters/DatasetAdapterFactory';
import { TestData } from '../../_data/TestData';

const datasetId = "http://localhost:58080/mondrian-rest/getMetadata?connectionName=test";
const datasets = Dataset.loadFromMetadata(TestData.TEST_METADATA, datasetId);

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
  expect(child.label).toBe("Measures");
  children = (child as TreeModelContainerNode).children;
  expect(children).toHaveLength(5);
  child = children[0];
  expect(child instanceof TreeModelLeafNode).toBeTruthy();
  expect(child.label).toBe("F1_M1");
  child = rootTreeModelNode.children[1];
  expect(child ).toBeTruthy();
  expect(child.label).toBe("Dimensions");
  expect(child.type).toBe('dimensions');
  children = (child as TreeModelContainerNode).children;
  expect(children).toHaveLength(2);
  child = children[1];
  expect(child.type).toBe('dimension');
  expect(child).toBeTruthy();
  expect(child.label).toBe("D2");
  children = (child as TreeModelContainerNode).children;
  expect(children).toHaveLength(1);
  child = children[0];
  expect(child.type).toBe('hierarchy');
  expect(child).toBeTruthy();
  expect(child.label).toBe("D2");
  children = (child as TreeModelContainerNode).children;
  expect(children).toHaveLength(2);
  child = children[0];
  expect(child.type).toBe('level');
  expect(child).toBeTruthy();
  expect(child.label).toBe("D2_ROLLUP");
  expect(child instanceof TreeModelLeafNode).toBeTruthy();
});
