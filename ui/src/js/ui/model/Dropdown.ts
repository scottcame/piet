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

import { List, ListChangeEvent, ListChangeEventType } from "../../collections/List";
import { Observable, DefaultObservableChangeEventListener } from "../../util/Observable";
import { Editable, EditEventListener, EditEvent, PropertyEditEvent } from "../../model/Persistence";

export class DropdownModel<T extends Editable> {

  items: List<T>;
  private _selectedIndex: Observable<number>;
  private _label: Observable<string>;
  private boundPropertyName: string;
  private _labels: string[] = [];
  private itemPropertyEditListener: EditEventListener;
  private priorIndexStack: number[];

  constructor(items: List<T>, boundPropertyName: string) {

    this.items = items;
    this._selectedIndex = new Observable<number>();
    this.priorIndexStack = [];
    this._label = new Observable<string>();
    this.boundPropertyName = boundPropertyName;

    /* eslint-disable @typescript-eslint/no-this-alias */
    const self = this;

    this.itemPropertyEditListener = {
      notifyEdit(_event: EditEvent): Promise<void> {
        return Promise.resolve();
      },
      notifyPendingPropertyEdit(_event: PropertyEditEvent): Promise<void> {
        return Promise.resolve();
      },
      notifyPropertyEdit(_event: PropertyEditEvent): Promise<void> {
        self.updateLabels();
        return Promise.resolve();
      }
    };

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

    this.items.addChangeEventListener({
      async listChanged(e: ListChangeEvent): Promise<void> {
        if (e.type === ListChangeEventType.DELETE) {
          if (self.priorIndexStack.indexOf(e.index) !== -1) {
            self.priorIndexStack.splice(self.priorIndexStack.indexOf(e.index), 1);
          }
          self.priorIndexStack = self.priorIndexStack.map((val: number) => {
            return val > e.index ? val-1 : val;
          });
          if (self.items.length == 1) {
            self._selectedIndex.value = 0;
            self.priorIndexStack = [0];
          } else if (self.items.length === 0) {
            self._selectedIndex.value = null;
            self.priorIndexStack = [];
          } else {
            if (self._selectedIndex.value > e.index) {
              self._selectedIndex.value--;
            }
            if (self.priorIndexStack.length === 0) {
              self._selectedIndex.value =  null;
            } else if (self._selectedIndex.value === e.index) {
              self._selectedIndex.value =  self.priorIndexStack.pop();
            }
          }
        } else if (e.type === ListChangeEventType.ADD) {
          self._selectedIndex.value = e.index === -1 ? null : e.index;
        }
        self.updateLabels();
        return Promise.resolve();
      },
      listWillChange(_event: ListChangeEvent): Promise<void> {
        return Promise.resolve();
      }
    });

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

  async removeSelectedItem(): Promise<DropdownModel<T>> {
    const ret: Promise<DropdownModel<T>> = Promise.resolve(this);
    if (this._selectedIndex.value !== null) {
      return this.items.removeAt(this._selectedIndex.value).then(() => {
        return ret;
      });
    } else {
      return ret;
    }
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
