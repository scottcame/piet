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

import { Dataset, Hierarchy, Dimension, Measure, Level } from "../../model/Dataset";
import { TreeModelContainerNode, TreeModelLeafNode } from "../model/Tree";

export class DatasetAdapterFactory {

  private static instance: DatasetAdapterFactory;

  private constructor() {}

  static getInstance(): DatasetAdapterFactory {
    if (!DatasetAdapterFactory.instance) {
      DatasetAdapterFactory.instance = new DatasetAdapterFactory();
    }
    return DatasetAdapterFactory.instance;
  }

  createRootTreeModelNode(dataset: Dataset): TreeModelContainerNode {
    const ret = new TreeModelContainerNode("Dataset", DatasetAdapterFactory.buildRootLabel(dataset), 'dataset');
    ret.root = true;
    const measuresChild = new TreeModelContainerNode("Measures", "Measures", 'measures');
    measuresChild.header = true;
    measuresChild.children = dataset.measures
      .filter((measure: Measure): boolean => {
        return measure.visible;
      })
      .map((measure: Measure) => {
        return new TreeModelLeafNode(measure.uniqueName, measure.description, "measure");
      });
    const dimensionsChild = new TreeModelContainerNode("Dimensions", "Dimensions", 'dimensions');
    dimensionsChild.children = [];
    dimensionsChild.header = true;
    dataset.dimensions
      .filter(dimension => dimension.name !== "Measures")
      .forEach((dimension: Dimension): void => {
        const dimensionChild = new TreeModelContainerNode(dimension.uniqueName, dimension.description, "dimension");
        dimensionChild.children = [];
        dimensionsChild.children.push(dimensionChild);
        dimension.hierarchies.forEach((hierarchy: Hierarchy): void => {
          const hierarchyChild = new TreeModelContainerNode(hierarchy.uniqueName, hierarchy.description, "hierarchy");
          hierarchyChild.children = [];
          dimensionChild.children.push(hierarchyChild);
          hierarchy.levels
            .filter((level: Level): boolean => {
              return level.name !== "(All)";
            })
            .forEach((level: Level): void => {
              hierarchyChild.children.push(new TreeModelLeafNode(level.uniqueName, level.description, "level"));
            });
        });
      });
    ret.children = [measuresChild, dimensionsChild];
    return ret;
  }

  static buildRootLabel(dataset: Dataset): string {
    return "Dataset: " + dataset.schemaName + " [" + dataset.name + "]";
  }

}
