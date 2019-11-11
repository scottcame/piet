import { List } from "../../collections/List";

export class DropdownModel {

  items: List<DropdownItem>;
  selectedIndex: number;

  constructor(items: List<DropdownItem>) {
    this.items = items;
    this.selectedIndex = null;
  }

  get selectedItem(): DropdownItem {
    return this.selectedIndex === null ? null : this.items.get(this.selectedIndex);
  }

  removeSelectedItem(): DropdownModel {
    this.items.removeAt(this.selectedIndex);
    this.selectedIndex = null;
    return this;
  }

}

export interface DropdownItem {
  getLabel(): string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  getValue(): any;
}
