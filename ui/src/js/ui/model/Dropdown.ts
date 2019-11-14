import { List, DefaultListChangeEventListener, ListChangeEvent } from "../../collections/List";
import { Observable, DefaultObservableChangeEventListener } from "../../util/Observable";

export class DropdownModel {

  items: List<DropdownItem>;
  private _selectedIndex: Observable<number>;
  private _label: Observable<string>;

  constructor(items: List<DropdownItem>) {

    this.items = items;
    this._selectedIndex = new Observable<number>();
    this._label = new Observable<string>();

    const selectedItemLabelChangeListener = new DefaultObservableChangeEventListener<string>((e) => {
      this._label.value = e.newValue;
    });

    this._selectedIndex.addChangeEventListener(new DefaultObservableChangeEventListener<number>((e) => {
      const priorSelectedItem = e.oldValue !== null ? this.getItemAt(e.oldValue) : null;
      if (priorSelectedItem) {
        priorSelectedItem.getLabel().removeChangeEventListener(selectedItemLabelChangeListener);
      }
      if (this.selectedItem) {
        this._label.value = this.selectedItem.getLabel().value;
        this.selectedItem.getLabel().addChangeEventListener(selectedItemLabelChangeListener);
      } else {
        this._label.value = null;
      }
    }));

    this.items.addChangeEventListener(new DefaultListChangeEventListener(e => {
      if (e.type === ListChangeEvent.DELETE) {
        this._selectedIndex.value = null;
      }
    }));

  }

  get selectedItem(): DropdownItem {
    return this._selectedIndex.value === null ? null : this.getItemAt(this._selectedIndex.value);
  }

  getItemAt(index: number): DropdownItem {
    return this.items.get(index);
  }

  removeSelectedItem(): DropdownModel {
    if (this._selectedIndex.value !== null) {
      this._selectedIndex.value = null;
      this.items.removeAt(this._selectedIndex.value);
    }
    return this;
  }

  get selectedIndex(): Observable<number> {
    return this._selectedIndex;
  }

  get label(): Observable<string> {
    return this._label;
  }

}

export interface DropdownItem {
  getLabel(): Observable<string>;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  getValue(): any;
}
