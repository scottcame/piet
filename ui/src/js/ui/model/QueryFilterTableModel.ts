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

import { Analysis } from "../../model/Analysis";
import { Member, Level } from "../../model/Dataset";
import { QueryFilter } from "../../model/Query";
import { ListChangeEventListener, ListChangeEvent, List } from "../../collections/List";

export class QueryFilterTableModel {

  private _members: string[] = [];
  private _selections: boolean[] = [];
  private _columnHeader = null;
  private analysis: Analysis;
  private level: Level;
  private filterListener: FilterListener;
  private queryFilterTableModelListeners: QueryFilterTableModelListener[] = [];
  private _filterModeInclude = true;

  init(analysis: Analysis, levelUniqueName: string): void {
    if (this.analysis && this.filterListener) {
      this.analysis.query.filters.removeChangeEventListener(this.filterListener);
    }
    this.analysis = analysis;
    this.level = this.analysis.dataset.findLevel(levelUniqueName);
    this.filterListener = new FilterListener(this.analysis.query.filters, () => {
      this.updateData();
    });
    this.analysis.query.filters.addChangeEventListener(this.filterListener);
    this.updateData();
  }

  private updateData(): void {
    this._members = [];
    this._selections = [];
    this._columnHeader = null;
    this._filterModeInclude = true;
    if (this.level) {
      this._columnHeader = this.level.description;
      const matchingFilters = this.analysis.query.filters.asArray().filter((filter: QueryFilter): boolean => {
        return filter.levelUniqueName === this.level.uniqueName;
      });
      let matchingLevelMembers = [];
      if (matchingFilters.length) {
        matchingLevelMembers = matchingFilters[0].levelMemberNames.asArray();
        this._filterModeInclude = matchingFilters[0].include;
      }
      this.level.members.forEach((m: Member): void => {
        this._members.push(m.name);
        this._selections.push(matchingLevelMembers.includes(m.name));
      });
    }
    this.notifyListeners(new QueryFilterTableModelEvent());
  }

  get levelUniqueName(): string {
    return this.level ? this.level.uniqueName : null;
  }

  get columnHeader(): string {
    return this._columnHeader;
  }

  get rowCount(): number {
    return this._members.length;
  }

  getValueAt(rowIndex: number): string {
    return this._members[rowIndex];
  }

  getRowSelectedAt(rowIndex: number): boolean {
    return this._selections[rowIndex];
  }

  toggleRowAt(rowIndex: number): void {
    this._selections[rowIndex] = !this._selections[rowIndex];
    this.notifyListeners(new QueryFilterTableModelEvent());
  }

  get selectedMemberNames(): string[] {
    const ret: string[] = [];
    this._selections.forEach((selection: boolean, idx: number): void => {
      if (selection) {
        ret.push(this._members[idx]);
      }
    });
    return ret;
  }

  get filterModeInclude(): boolean {
    return this._filterModeInclude;
  }

  set filterModeInclude(value: boolean) {
    this._filterModeInclude = value;
    this.notifyListeners(new QueryFilterTableModelEvent());
  }

  private notifyListeners(event: QueryFilterTableModelEvent): void {
    this.queryFilterTableModelListeners.forEach((listener: QueryFilterTableModelListener): void => {
      listener.tableModelUpdated(event);
    });
  }

  addQueryFilterTableModelListener(listener: QueryFilterTableModelListener): void {
    this.queryFilterTableModelListeners.push(listener);
  }

  removeQueryFilterTableModelListener(listener: QueryFilterTableModelListener): void {
    const idx = this.queryFilterTableModelListeners.indexOf(listener);
    if (idx !== -1) {
      this.queryFilterTableModelListeners.splice(idx, 1);
    }
  }

  // todo add a search(regexString) method and wire into a type-ahead box in UI

}

class FilterListener implements ListChangeEventListener {
  private callback: () => void;
  private targetFilterList:  List<QueryFilter>;
  private filterNameListener: FilterNameListener;
  constructor(targetFilterList: List<QueryFilter>, callback: () => void) {
    this.callback = callback;
    this.filterNameListener = new FilterNameListener(callback);
    this.targetFilterList = targetFilterList;
    targetFilterList.forEach((f: QueryFilter): void => {
      f.levelMemberNames.addChangeEventListener(this.filterNameListener);
    });
  }
  listWillChange(_event: ListChangeEvent): Promise<void> {
    this.targetFilterList.forEach((f: QueryFilter): void => {
      f.levelMemberNames.removeChangeEventListener(this.filterNameListener);
    });
    return Promise.resolve();
  }
  listChanged(_event: ListChangeEvent): Promise<void> {
    this.targetFilterList.forEach((f: QueryFilter): void => {
      f.levelMemberNames.addChangeEventListener(this.filterNameListener);
    });
    this.callback();
    return Promise.resolve();
  }
}

class FilterNameListener implements ListChangeEventListener {
  private callback: () => void;
  constructor(callback: () => void) {
    this.callback = callback;
  }
  listWillChange(_event: ListChangeEvent): Promise<void> {
    return Promise.resolve();
  }
  listChanged(_event: ListChangeEvent): Promise<void> {
    this.callback();
    return Promise.resolve();
  }
}

export class QueryFilterTableModelEvent {}

export interface QueryFilterTableModelListener {
  tableModelUpdated(event: QueryFilterTableModelEvent): void;
}
