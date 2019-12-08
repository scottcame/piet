export abstract class TreeModelNode {

  uniqueName: string;
  label: string;
  type: string;

  constructor(uniqueName: string, label: string, type: string) {
    this.uniqueName = uniqueName;
    this.label = label;
    this.type = type;
  }

  abstract hasChildren(): boolean;

}

export class TreeModelLeafNode extends TreeModelNode {

  constructor(uniqueName: string, label: string = null, type: string = null) {
    super(uniqueName, label, type);
  }

  hasChildren(): boolean {
    return false;
  }

}

export class TreeModelContainerNode extends TreeModelNode {

  children: TreeModelNode[];

  constructor(uniqueName: string, label: string = null, type: string = null) {
    super(uniqueName, label, type);
    this.children = [];
  }

  hasChildren(): boolean {
    return this.children.length > 0;
  }

}

export abstract class TreeModelEvent {
  type: string;
  uniqueName: string;
  selected: boolean;
  constructor(type: string, uniqueName: string, selected: boolean) {
    this.type = type;
    this.uniqueName = uniqueName;
    this.selected = selected;
  }
}

export class TreeModelMeasureNodeEvent extends TreeModelEvent {
  constructor(uniqueName: string, selected: boolean) {
    super('measure', uniqueName, selected);
  }
}

export class TreeModelLevelNodeEvent extends TreeModelEvent {
  rowOrientation: boolean;
  filterSelected: boolean;
  sumSelected: boolean;
  constructor(uniqueName: string, selected: boolean, rowOrientation: boolean, filterSelected: boolean, sumSelected: boolean) {
    super('level', uniqueName, selected);
    this.rowOrientation = rowOrientation;
    this.filterSelected = filterSelected;
    this.sumSelected = sumSelected;
  }
}
