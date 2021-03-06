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

import { Observable } from "../../util/Observable";

export class TableModel<T> {

  private rowList: TableRow<T>[];
  readonly columnHeaders: string[];
  private tableChangeEventListeners: TableChangeEventListener[];

  constructor(columnHeaders: string[]) {
    this.rowList = [];
    this.columnHeaders = columnHeaders;
    this.tableChangeEventListeners = [];
  }

  setRowList(rowList: TableRow<T>[]): void {
    this.rowList = rowList;
    this.notifyListeners(new TableChangeEvent());
  }

  get rows(): Iterable<TableRow<T>> {
    return this.rowList;
  }

  getRowAt(index: number): TableRow<T> {
    return this.rowList[index];
  }

  getColumnCount(): Observable<number> {
    const ret: Observable<number> = new Observable();
    ret.value = this.columnHeaders.length;
    return ret;
  }

  get rowCount(): number {
    return this.rowList.length;
  }

  notifyListeners(event: TableChangeEvent): void {
    this.tableChangeEventListeners.forEach((listener: TableChangeEventListener) => {
      listener.tableChanged(event);
    });
  }

  addTableChangeEventListener(listener: TableChangeEventListener): TableChangeEventListener {
    this.tableChangeEventListeners.push(listener);
    return listener;
  }

  removeTableChangeEventListener(listener: TableChangeEventListener): TableChangeEventListener {
    let ret: TableChangeEventListener = null;
    this.tableChangeEventListeners.forEach((thisListener: TableChangeEventListener, index: number): boolean => {
      if (listener == thisListener) {
        this.tableChangeEventListeners.splice(index, 1);
        ret = thisListener;
        return true;
      }
      return false;
    });
    return ret;
  }

}

export interface TableRow<T> {
  getValueAt(columnIndex: number): string;
  getItem(): T;
}

export class TableChangeEvent {
}

export interface TableChangeEventListener {
  tableChanged(event: TableChangeEvent): void;
}
