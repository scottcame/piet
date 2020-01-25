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
