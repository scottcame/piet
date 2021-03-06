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
  expect(rootTreeModelNode.label).toBe("Dataset: " + ds.schemaName + " [" + ds.name + "]");
  expect(rootTreeModelNode.type).toBe('dataset');
  expect(rootTreeModelNode.hasChildren()).toBeTruthy();
  let children = rootTreeModelNode.children;
  expect(children).toHaveLength(2);
  let child = children[0];
  expect(child instanceof TreeModelContainerNode).toBeTruthy();
  expect(child.label).toBe("Measures");
  children = (child as TreeModelContainerNode).children;
  expect(children).toHaveLength(1);
  child = children[0];
  expect(child instanceof TreeModelLeafNode).toBeTruthy();
  expect(child.label).toBe("F1_M1");
  child = rootTreeModelNode.children[1];
  expect(child ).toBeTruthy();
  expect(child.label).toBe("Dimensions");
  expect(child.type).toBe('dimensions');
  children = (child as TreeModelContainerNode).children;
  expect(children).toHaveLength(1);
  child = children[0];
  expect(child.type).toBe('dimension');
  expect(child).toBeTruthy();
  expect(child.label).toBe("D1");
  children = (child as TreeModelContainerNode).children;
  expect(children).toHaveLength(1);
  child = children[0];
  expect(child.type).toBe('hierarchy');
  expect(child).toBeTruthy();
  expect(child.label).toBe("D1");
  children = (child as TreeModelContainerNode).children;
  expect(children).toHaveLength(1);
  child = children[0];
  expect(child.type).toBe('level');
  expect(child).toBeTruthy();
  expect(child.label).toBe("D1_DESCRIPTION");
  expect(child instanceof TreeModelLeafNode).toBeTruthy();
});

test('hidden and calculated measures', () => {
  const ds = datasets[2];
  const rootTreeModelNode = DatasetAdapterFactory.getInstance().createRootTreeModelNode(ds);
  let children = rootTreeModelNode.children;
  const child = children[0];
  expect(child.label).toBe("Measures");
  children = (child as TreeModelContainerNode).children;
  expect(children).toHaveLength(3);
  expect(children[0].label).toBe("F3_M1");
  expect(children[1].label).toBe("F3_M2");
  // F3_MH is hidden
  // F3_M3 is a calculated measure assigned, by annotation, to Measure Group F3
  expect(children[2].label).toBe("F3_M3");
});
