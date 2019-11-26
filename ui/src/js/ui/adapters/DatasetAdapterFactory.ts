import { Dataset, Hierarchy, Dimension, Measure } from "../../model/Dataset";
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
    const ret = new TreeModelContainerNode(DatasetAdapterFactory.buildRootLabel(dataset.label), 'dataset');
    const measuresChild = new TreeModelContainerNode("Measures", 'measures');
    measuresChild.children = dataset.measures.map((measure: Measure) => {
      return new TreeModelLeafNode(measure.description, "measure");
    });
    const dimensionsChild = new TreeModelContainerNode("Dimensions", 'dimensions');
    dimensionsChild.children = [];
    dataset.dimensions
      .filter(dimension => dimension.name !== "Measures")
      .forEach((dimension: Dimension): void => {
        dimension.hierarchies.forEach((hierarchy: Hierarchy): void => {
          dimensionsChild.children.push(new TreeModelLeafNode(hierarchy.description, "dimension"));
        });
      });
    ret.children = [measuresChild, dimensionsChild];
    return ret;
  }

  static buildRootLabel(datasetLabel: string): string {
    return "Dataset: " + datasetLabel;
  }

}
