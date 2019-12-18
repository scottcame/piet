import { Editable, EditEventListener, Cloneable } from "./Persistence";

export abstract class MetadataObject implements Cloneable<MetadataObject> {
  name: string;
  description: string;
  uniqueName: string;
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
    ret.uniqueName = this.uniqueName;
    return ret;
  }

  asMdxString(): string {
    return this.uniqueName;
  }

}

export class Level extends MetadataObject implements Cloneable<Level> {

  depth: number;
  parent: Hierarchy;
  members: Member[];

  constructor(parent: Hierarchy = null) {
    super();
    this.parent = parent;
    this.members = [];
  }

  clone(): Level {
    const ret = new Level();
    // let the parent hierarchy set itself
    ret.name = this.name;
    ret.description = this.description;
    ret.depth = this.depth;
    ret.uniqueName = this.uniqueName;
    ret.members = this.members.map((member: Member): Member => {
      return member.clone();
    });
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
    ret.uniqueName = this.uniqueName;
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
    ret.uniqueName = this.uniqueName;
    ret.hierarchies = this.hierarchies.map((h: Hierarchy): Hierarchy => {
      const newHierarchy = h.clone();
      newHierarchy.parent = ret;
      return newHierarchy;
    });
    ret.parentName = this.parentName;
    return ret;
  }

}

export class Member implements Cloneable<Member> {
  name: string = null;
  description: string = null;
  children: Member[] = [];
  parent: Level;
  constructor(parent: Level = null) {
    this.parent = parent;
  }
  clone(): Member {
    const ret = new Member(this.parent);
    ret.name = this.name;
    ret.description = this.description;
    ret.children = this.children.map((child: Member): Member => {
      return child.clone();
    });
    return ret;
  }
}

export class Dataset implements Editable {

  readonly id: string;
  private _name: string;
  private _schemaName: string;
  private _label: string;
  private _connectionName: string;
  private _measureGroupName: string;
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
    const physicalDatasets = [];
    const measureGroupRefs = [];
    const ret: Dataset[] = [];
    metadata.cubes.forEach((mdCube: any): void => {
      const dataset = new Dataset(mondrianRestMetadataUrl);
      dataset.schemaName = metadata.name;
      dataset.schemaDescription = metadata.name;
      dataset.name = mdCube.name;
      dataset.description = mdCube.caption;
      dataset._connectionName = metadata.connectionName;
      dataset.measures = mdCube.measures.map((mdMeasure: any): Measure => {
        const measure = new Measure(dataset.name);
        measure.name = mdMeasure.name;
        measure.description = mdMeasure.caption;
        measure.visible = mdMeasure.visible;
        measure.calculated = mdMeasure.calculated;
        measure.uniqueName = "[Measures].[" + mdMeasure.name + "]";
        return measure;
      });
      dataset.dimensions = mdCube.dimensions.map((mdDimension: any): Dimension => {
        const dimension = new Dimension(dataset.name);
        dimension.name = mdDimension.name;
        dimension.description = mdDimension.caption;
        dimension.type = mdDimension.type;
        dimension.uniqueName = "[" + mdDimension.name + "]";
        dimension.hierarchies = mdDimension.hierarchies.map((mdHierarchy: any): Hierarchy => {
          const hierarchy = new Hierarchy(dimension);
          hierarchy.name = mdHierarchy.name;
          hierarchy.description = mdHierarchy.caption;
          hierarchy.hasAll = mdHierarchy.hasAll;
          hierarchy.uniqueName = dimension.uniqueName + ".[" + mdHierarchy.name + "]";
          hierarchy.levels = mdHierarchy.levels.map((mdLevel: any): Level => {
            const level = new Level(hierarchy);
            level.name = mdLevel.name;
            level.description = mdLevel.caption;
            level.depth = mdLevel.depth;
            level.uniqueName = hierarchy.uniqueName + ".[" + mdLevel.name + "]";
            level.members = mdLevel.members.map((mdMember: any): Member => {
              return Dataset.loadMember(mdMember, level);
            });
            return level;
          });
          return hierarchy;
        });
        return dimension;
      });
      physicalDatasets.push(dataset);
      measureGroupRefs.push(mdCube.measureGroups);
    });
    physicalDatasets.forEach((dataset: Dataset, datasetIdx: number): void => {
      if (measureGroupRefs[datasetIdx]) {
        measureGroupRefs[datasetIdx].forEach((measureGroup: any): void => {
          const constrainedDataset = new Dataset(dataset.id);
          constrainedDataset.schemaName = dataset.schemaName;
          constrainedDataset.schemaDescription = dataset.schemaDescription;
          constrainedDataset._measureGroupName = measureGroup.name;
          constrainedDataset.name = dataset.name;
          constrainedDataset.description = dataset.description;
          constrainedDataset._connectionName = dataset.connectionName;
          measureGroup.measureReferences.forEach((ref: string): void => {
            constrainedDataset.measures.push(dataset.findMeasure(ref));
          });
          // we put the measures dimension in here just for consistency; we don't actually show it in the UI
          // todo: consider taking the measures dimension out of the Dataset object
          constrainedDataset.dimensions.push(dataset.findDimension("Measures"));
          measureGroup.dimensionReferences.forEach((ref: string): void => {
            constrainedDataset.dimensions.push(dataset.findDimension(ref));
          });
          ret.push(constrainedDataset);
        });
      } else {
        ret.push(dataset);
      }
    });
    return ret;
  }

  private static loadMember(mdMember: any, parent: Level): Member {
    const ret = new Member(parent);
    ret.name = mdMember.name;
    ret.description = mdMember.caption;
    ret.children = mdMember.childMembers.map((mdChildMember: any): Member => {
      return this.loadMember(mdChildMember, parent);
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

  get measureGroupName(): string {
    return this._measureGroupName;
  }

  private updateLabel(): void {
    this._label = this.schemaName + " [" + this.name + "]" + (this._measureGroupName ? " [" + this._measureGroupName + "]" : "");
  }

  get label(): string {
    return this._label;
  }

  get connectionName(): string {
    return this._connectionName;
  }

  findLevel(levelUniqueName: string): Level {
    let ret = null;
    const names = levelUniqueName.split(".");
    const dimName = names[0].replace(/\[(.+)\]/, "$1");
    const dimension = this.findDimension(dimName);
    if (dimension) {
      const hierarchyUniqueName = names[0] + "." + names[1];
      const hierarchies = dimension.hierarchies.filter((h: Hierarchy): boolean => {
        return h.uniqueName === hierarchyUniqueName;
      });
      if (hierarchies.length) {
        const levels = hierarchies[0].levels.filter((level: Level): boolean => {
          return level.uniqueName === levelUniqueName;
        });
        if (levels.length) {
          ret = levels[0];
        }
      }
    }
    return ret;
  }

  private findMeasure(name: string): Measure {
    let ret: Measure = null;
    this.measures.forEach((measure: Measure): void => {
      if (measure.name === name) {
        ret = measure;
      }
    });
    return ret;
  }

  private findDimension(name: string): Dimension {
    let ret: Dimension = null;
    this.dimensions.forEach((dimension: Dimension): void => {
      if (dimension.name === name) {
        ret = dimension;
      }
    });
    return ret;
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
