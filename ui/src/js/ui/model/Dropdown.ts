import { List, DefaultListChangeEventListener, ListChangeEvent } from "../../collections/List";
import { Observable, DefaultObservableChangeEventListener } from "../../util/Observable";
import { Editable, EditEventListener, EditEvent, PropertyEditEvent } from "../../model/Persistence";

export class DropdownModel<T extends Editable> {

  items: List<T>;
  private _selectedIndex: Observable<number>;
  private _label: Observable<string>;
  private boundPropertyName: string;
  private _labels: string[] = [];
  private itemPropertyEditListener: LabelUpdateEditEventListener;
  private priorIndexStack: number[];

  constructor(items: List<T>, boundPropertyName: string) {

    this.items = items;
    this._selectedIndex = new Observable<number>();
    this.priorIndexStack = [];
    this._label = new Observable<string>();
    this.boundPropertyName = boundPropertyName;

    this.itemPropertyEditListener = new LabelUpdateEditEventListener(() => {
      this.updateLabels();
    });

    this._selectedIndex.addChangeEventListener(new DefaultObservableChangeEventListener<number>((e) => {
      if (e.oldValue !== null) {
        const idx = this.priorIndexStack.indexOf(e.oldValue);
        if (idx !== -1) {
          this.priorIndexStack.splice(idx, 1);
        }
        this.priorIndexStack.push(e.oldValue);
      }
      this._label.value = this._selectedIndex.value === null ? null : this._labels[this._selectedIndex.value];
    }));

    this.items.addChangeEventListener(new DefaultListChangeEventListener(e => {
      if (e.type === ListChangeEvent.DELETE) {
        if (this.priorIndexStack.indexOf(e.index) !== -1) {
          this.priorIndexStack.splice(this.priorIndexStack.indexOf(e.index), 1);
        }
        this.priorIndexStack = this.priorIndexStack.map((val: number) => {
          return val > e.index ? val-1 : val;
        });
        if (this._selectedIndex.value > e.index) {
          this._selectedIndex.value--;
        }
        if (this.priorIndexStack.length === 0) {
          this._selectedIndex.value =  null;
        } else if (this._selectedIndex.value === e.index) {
          this._selectedIndex.value =  this.priorIndexStack.pop();
        }
      } else if (e.type === ListChangeEvent.ADD) {
        this._selectedIndex.value = e.index === -1 ? null : e.index;
      }
      this.updateLabels();
    }));

    this.updateLabels();

  }

  private updateLabels(): void {
    const newLabels = [];
    this.items.forEach((item: T): void => {
      // clumsy and a bit brute force, but will get the job done
      // if we find later that we need to be more surgical about this, we can
      item.removeEditEventListener(this.itemPropertyEditListener);
      item.addEditEventListener(this.itemPropertyEditListener);
      newLabels.push(item[this.boundPropertyName]);
    });
    this._labels = newLabels; // force reactive update
    this._label.value = this._selectedIndex.value === null ? null : this._labels[this._selectedIndex.value];
  }

  get labels(): string[] {
    return this._labels;
  }

  get selectedItem(): T {
    return this._selectedIndex.value === null ? null : this.getItemAt(this._selectedIndex.value);
  }

  getItemAt(index: number): T {
    return this.items.get(index);
  }

  removeSelectedItem(): DropdownModel<T> {
    if (this._selectedIndex.value !== null) {
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

interface LabelUpdateEditEventListenerCallback {
  (): void;
}

class LabelUpdateEditEventListener implements EditEventListener {
  readonly callback: LabelUpdateEditEventListenerCallback;
  constructor(callback: LabelUpdateEditEventListenerCallback) {
    this.callback = callback;
  }
  /* eslint-disable @typescript-eslint/no-empty-function */
  notifyEdit(_event: EditEvent): void {

  }
  notifyPropertyEdit(_event: PropertyEditEvent): void {
    this.callback();
  }
}
