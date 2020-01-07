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
  header = false;
  root = false;

  constructor(uniqueName: string, label: string = null, type: string = null) {
    super(uniqueName, label, type);
    this.children = [];
  }

  hasChildren(): boolean {
    return this.children.length > 0;
  }

}

export enum TreeModelLeafNodeType {
  MEASURE = "measure",
  LEVEL = "level"
}

export abstract class TreeEvent {
  type: TreeModelLeafNodeType;
  uniqueName: string;
  selected: boolean;
  constructor(type: TreeModelLeafNodeType, uniqueName: string, selected: boolean) {
    this.type = type;
    this.uniqueName = uniqueName;
    this.selected = selected;
  }
}

export class TreeMeasureNodeEvent extends TreeEvent {
  constructor(uniqueName: string, selected: boolean) {
    super(TreeModelLeafNodeType.MEASURE, uniqueName, selected);
  }
}

export class TreeLevelNodeEvent extends TreeEvent {
  rowOrientation: boolean;
  filterSelected: boolean;
  constructor(uniqueName: string, selected: boolean, rowOrientation: boolean, filterSelected: boolean) {
    super(TreeModelLeafNodeType.LEVEL, uniqueName, selected);
    this.rowOrientation = rowOrientation;
    this.filterSelected = filterSelected;
  }
}
