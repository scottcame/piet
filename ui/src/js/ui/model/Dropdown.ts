export class DropdownModel {

  items: DropdownItem[];
  selectedIndex: number;

  constructor() {
    this.items = [];
    this.selectedIndex = null;
  }

  get selectedItem(): DropdownItem {
    return this.selectedIndex === null ? null : this.items[this.selectedIndex];
  }

}

export class DropdownItem {
  label: string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  value: any;
}

export interface ModelChangeListener {
  (message: string, event: Event): void;
}
