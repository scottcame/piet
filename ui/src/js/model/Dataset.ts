import { Editable, EditEventListener, Cloneable } from "./Persistence";

export abstract class MetadataObject implements Cloneable<MetadataObject> {
  name: string;
  description: string;
  abstract clone(): MetadataObject;
}

export class Measure extends MetadataObject implements Cloneable<Measure> {

  visible: boolean;
  calculated: boolean;
  parentName: string;

  constructor(parentName: string = null) {
    super();
    this.parentName = parentName;
  }

  clone(): Measure {
    const ret = new Measure();
    ret.name = this.name;
    ret.description = this.description;
    ret.visible = this.visible;
    ret.calculated = this.calculated;
    ret.parentName = this.parentName;
    return ret;
  }

  asMdxString(): string {
    return "[Measures].[" + this.name + "]";
  }

}

export class Level extends MetadataObject implements Cloneable<Level> {

  depth: number;
  parent: Hierarchy;

  constructor(parent: Hierarchy = null) {
    super();
    this.parent = parent;
  }

  clone(): Level {
    const ret = new Level();
    // let the parent hierarchy set itself
    ret.name = this.name;
    ret.description = this.description;
    ret.depth = this.depth;
    return ret;
  }

  asMdxString(includeMembers = true): string {
    let ret = "[" + this.parent.parent.name + "].[" + this.parent.name + "].[" + this.name + "]";
    if (includeMembers) {
      ret = ret + ".Members";
    }
    return ret;
  }

}

export class Hierarchy extends MetadataObject implements Cloneable<Hierarchy> {

  hasAll: boolean;
  parent: Dimension;
  levels: Level[];

  constructor(parent: Dimension = null) {
    super();
    this.parent = parent;
    this.levels = [];
  }

  clone(): Hierarchy {
    const ret = new Hierarchy();
    // let the parent dimension set itself
    ret.name = this.name;
    ret.description = this.description;
    ret.hasAll = this.hasAll;
    ret.levels = this.levels.map((l: Level): Level => {
      const newLevel = l.clone();
      newLevel.parent = ret;
      return newLevel;
    });
    return ret;
  }

}

export class Dimension extends MetadataObject implements Cloneable<Dimension> {

  type: string;
  hierarchies: Hierarchy[];
  parentName: string;

  constructor(parentName: string = null) {
    super();
    this.hierarchies = [];
    this.parentName = parentName;
  }

  clone(): Dimension {
    const ret = new Dimension();
    ret.name = this.name;
    ret.description = this.description;
    ret.type = this.type;
    ret.hierarchies = this.hierarchies.map((h: Hierarchy): Hierarchy => {
      const newHierarchy = h.clone();
      newHierarchy.parent = ret;
      return newHierarchy;
    });
    ret.parentName = this.parentName;
    return ret;
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
        const measure = new Measure(dataset.name);
        measure.name = mdMeasure.name;
        measure.description = mdMeasure.caption;
        measure.visible = mdMeasure.visible;
        measure.calculated = mdMeasure.calculated;
        return measure;
      });
      dataset.dimensions = mdCube.dimensions.map((mdDimension: any): Dimension => {
        const dimension = new Dimension(dataset.name);
        dimension.name = mdDimension.name;
        dimension.description = mdDimension.caption;
        dimension.type = mdDimension.type;
        dimension.hierarchies = mdDimension.hierarchies.map((mdHierarchy: any): Hierarchy => {
          const hierarchy = new Hierarchy(dimension);
          hierarchy.name = mdHierarchy.name;
          hierarchy.description = mdHierarchy.caption;
          hierarchy.hasAll = mdHierarchy.hasAll;
          hierarchy.levels = mdHierarchy.levels.map((mdLevel: any): Level => {
            const level = new Level(hierarchy);
            level.name = mdLevel.name;
            level.description = mdLevel.caption;
            level.depth = mdLevel.depth;
            return level;
          });
          return hierarchy;
        });
        return dimension;
      });
      ret.push(dataset);
    });
    return ret;
  }

  get uniqueId(): string {
    return this.id + "+++" + this.name;
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
