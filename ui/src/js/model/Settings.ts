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

import { Editable, Serializable, EditEventListener, PropertyEditEvent } from "./Persistence";
import { Repository } from "./Repository";

export class Settings implements Serializable<Settings>, Editable {

  private _rowHighlight = true;
  private _tableFontIncrease: 1|2|3 = 1;
  private editEventListeners: EditEventListener[] = [];
  dirty: boolean;

  setRowHighlight(value: boolean): Promise<void> {
    this._rowHighlight = value;
    return this.notifyOfPropertyEdit("rowHighlight");
  }

  get rowHighlight(): boolean {
    return this._rowHighlight;
  }

  setTableFontIncrease(value: 1|2|3): Promise<void> {
    this._tableFontIncrease = value;
    return this.notifyOfPropertyEdit("tableFontIncrease");
  }

  get tableFontIncrease(): 1|2|3 {
    return this._tableFontIncrease;
  }

  serialize(_repository: Repository): { rowHighlight: boolean; tableFontIncrease: 1|2|3 } {
    return {
      rowHighlight: this._rowHighlight,
      tableFontIncrease: this._tableFontIncrease
    };
  }

  deserialize(o: { rowHighlight: boolean; tableFontIncrease: 1|2|3 }, _repository: Repository): Promise<Settings> {
    let tfi: 1|2|3 = 1;
    if (o.tableFontIncrease) {
      tfi = o.tableFontIncrease;
    }
    const ret = new Settings();
    ret._rowHighlight = o.rowHighlight;
    ret._tableFontIncrease = tfi;
    return Promise.resolve(ret);
  }

  cancelEdits(): void {
    throw new Error("Method not implemented.");
  }

  checkpointEdits(): void {
    throw new Error("Method not implemented.");
  }

  addEditEventListener(listener: EditEventListener): EditEventListener {
    this.editEventListeners.push(listener);
    return listener;
  }

  removeEditEventListener(listener: EditEventListener): EditEventListener {
    let ret: EditEventListener = null;
    this.editEventListeners.forEach((thisListener: EditEventListener, index: number): boolean => {
      if (listener == thisListener) {
        this.editEventListeners.splice(index, 1);
        ret = thisListener;
        return true;
      }
      return false;
    });
    return ret;
  }

  private async notifyOfPropertyEdit(property: string): Promise<void> {
    const promises: Promise<void>[] = [];
    this.editEventListeners.forEach((listener: EditEventListener) => {
      promises.push(listener.notifyPropertyEdit(new PropertyEditEvent(this, property)));
    });
    return Promise.all(promises).then();
  }
  
}