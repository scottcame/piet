import { Editable, EditEventListener } from "./Persistence";

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

export class Dataset implements Editable {

  readonly id: string;
  private _name: string;
  private _schemaName: string;
  private _label: string;
  schemaDescription: string;
  description: string;
  measures: Measure[];
  dimensions: Dimension[];
  dirty: boolean;

  constructor(id: string) {
    this.id = id;
    this.measures = [];
    this.dimensions = [];
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
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

  set name(name: string) {
    this._name = name;
    this.updateLabel();
  }

  get name(): string {
    return this._name;
  }

  set schemaName(schemaName: string) {
    this._schemaName = schemaName;
    this.updateLabel();
  }

  get schemaName(): string {
    return this._schemaName;
  }

  private updateLabel(): void {
    this._label = this.schemaName + " [" + this.name + "]";
  }

  get label(): string {
    return this._label;
  }

  cancelEdits(): void {
    throw new Error("Editing is not currently implemented for Dataset.");
  }
  checkpointEdits(): void {
    throw new Error("Editing is not currently implemented for Dataset.");
  }

  addEditEventListener(_listener: EditEventListener): EditEventListener {
    // no-op for now... Datasets do not currently emit edit events
    return null;
  }
  removeEditEventListener(_listener: EditEventListener): EditEventListener {
    // no-op for now... Datasets do not currently emit edit events
    return null;
  }

}
