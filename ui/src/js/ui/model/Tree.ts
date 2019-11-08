export abstract class TreeModelNode {

  label: string;
  type: string;

  constructor(label: string, type: string) {
    this.label = label;
    this.type = type;
  }

  abstract hasChildren(): boolean;

}

export class TreeModelLeafNode extends TreeModelNode {

  constructor(label: string = null, type: string = null) {
    super(label, type);
  }

  hasChildren(): boolean {
    return false;
  }

}

export class TreeModelContainerNode extends TreeModelNode {

  children: TreeModelNode[];

  constructor(label: string = null, type: string = null) {
    super(label, type);
    this.children = [];
  }

  hasChildren(): boolean {
    return this.children.length > 0;
  }

}
