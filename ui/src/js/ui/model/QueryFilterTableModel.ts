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

  // next up: write a test for this bad boy
  // then... wire into the modal ui
  // then... add a select(index) method
  // then... add a search(regexString) method
  //  ... and wire those ^^^ into the UI too

  // change bespoke filter component into just ordinary use of <Modal> in analyses view. shouldn't be a big deal to add the "include/exclude" checkbox and "hide level from results" checkbox.

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