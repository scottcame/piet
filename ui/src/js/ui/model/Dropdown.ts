import { List } from "../../collections/List";
import { Observable } from "../../util/Observable";

export class DropdownModel {

  items: List<DropdownItem>;
  selectedIndex: Observable<number>;

  constructor(items: List<DropdownItem>) {
    this.items = items;
    this.selectedIndex = new Observable<number>();
  }

  get selectedItem(): DropdownItem {
    return this.selectedIndex.value === null ? null : this.items.get(this.selectedIndex.value);
  }

  removeSelectedItem(): DropdownModel {
    this.items.removeAt(this.selectedIndex.value);
    this.selectedIndex = null;
    return this;
  }

}

export interface DropdownItem {
  getLabel(): string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  getValue(): any;
}
