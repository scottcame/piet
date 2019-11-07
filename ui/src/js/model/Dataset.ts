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

}

export class Dimension extends MetadataObject {

  type: string;
  hierarchies: Hierarchy[];

  constructor() {
    super();
    this.hierarchies = [];
  }

}

export class Cube extends MetadataObject {

  measures: Measure[];
  dimensions: Dimension[];

  constructor() {
    super();
    this.measures = [];
    this.dimensions = [];
  }

}

export class Dataset {

  readonly id: string;
  name: string;
  description: string;

  cubes: Cube[];

  constructor(id: string) {
    this.id = id;
    this.cubes = [];
  }

  static loadFromMetadata(metadata: any, mondrianRestMetadataUrl: string): Dataset {
    const dataset = new Dataset(mondrianRestMetadataUrl);
    dataset.name = metadata.name;
    dataset.cubes = metadata.cubes.map((mdCube: any): Cube => {
      const cube = new Cube();
      cube.name = mdCube.name;
      cube.description = mdCube.caption;
      cube.measures = mdCube.measures.map((mdMeasure: any): Measure => {
        const measure = new Measure();
        measure.name = mdMeasure.name;
        measure.description = mdMeasure.caption;
        measure.visible = mdMeasure.visible;
        measure.calculated = mdMeasure.calculated;
        return measure;
      });
      cube.dimensions = mdCube.dimensions.map((mdDimension: any): Dimension => {
        const dimension = new Dimension();
        dimension.name = mdDimension.name;
        dimension.description = mdDimension.caption;
        dimension.type = mdDimension.type;
        dimension.hierarchies = mdDimension.hierarchies.map((mdHierarchy: any): Hierarchy => {
          const hierarchy = new Hierarchy();
          hierarchy.name = mdHierarchy.name;
          hierarchy.description = mdHierarchy.caption;
          hierarchy.hasAll = mdHierarchy.hasAll;
          return hierarchy;
        });
        return dimension;
      });
      return cube;
    });
    return dataset;
  }

}
