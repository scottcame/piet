/* eslint-disable @typescript-eslint/no-explicit-any */

abstract class MetadataObject {
  name: string;
  description: string;
}

export class Measure extends MetadataObject {

  visible: boolean;
  calculated: boolean;

}

export class Hierarchy extends MetadataObject {

  hasAll: boolean;
  parent: Dimension;

  constructor(parent: Dimension) {
    super();
    this.parent = parent;
  }

}

export class Dimension extends MetadataObject {

  type: string;
  hierarchies: Hierarchy[];

  constructor() {
    super();
    this.hierarchies = [];
  }

}

export class Dataset {

  readonly id: string;
  schemaName: string;
  schemaDescription: string;
  name: string;
  description: string;
  measures: Measure[];
  dimensions: Dimension[];

  constructor(id: string) {
    this.id = id;
    this.measures = [];
    this.dimensions = [];
  }

  static loadFromMetadata(metadata: any, mondrianRestMetadataUrl: string): Dataset[] {
    const ret = [];
    metadata.cubes.forEach((mdCube: any): void => {
      const dataset = new Dataset(mondrianRestMetadataUrl);
      dataset.schemaName = metadata.name;
      dataset.schemaDescription = metadata.name;
      dataset.name = mdCube.name;
      dataset.description = mdCube.caption;
      dataset.measures = mdCube.measures.map((mdMeasure: any): Measure => {
        const measure = new Measure();
        measure.name = mdMeasure.name;
        measure.description = mdMeasure.caption;
        measure.visible = mdMeasure.visible;
        measure.calculated = mdMeasure.calculated;
        return measure;
      });
      dataset.dimensions = mdCube.dimensions.map((mdDimension: any): Dimension => {
        const dimension = new Dimension();
        dimension.name = mdDimension.name;
        dimension.description = mdDimension.caption;
        dimension.type = mdDimension.type;
        dimension.hierarchies = mdDimension.hierarchies.map((mdHierarchy: any): Hierarchy => {
          const hierarchy = new Hierarchy(dimension);
          hierarchy.name = mdHierarchy.name;
          hierarchy.description = mdHierarchy.caption;
          hierarchy.hasAll = mdHierarchy.hasAll;
          return hierarchy;
        });
        return dimension;
      });
      ret.push(dataset);
    });
    return ret;
  }

}
