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
    return this.selectedIndex.value === null ? null : this.getItemAt(this.selectedIndex.value);
  }

  getItemAt(index: number): DropdownItem {
    return this.items.get(index);
  }

  removeSelectedItem(): DropdownModel {
    if (this.selectedIndex.value !== null) {
      this.items.removeAt(this.selectedIndex.value);
      this.selectedIndex.value = null;
    }
    return this;
  }

}

export interface DropdownItem {
  getLabel(): Observable<string>;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  getValue(): any;
}
