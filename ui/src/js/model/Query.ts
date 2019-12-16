import { Serializable, Editable, EditEventListener, EditEvent, PropertyEditEvent, Cloneable } from "./Persistence";
import { Repository } from "./Repository";
import { List, CloneableList, ListChangeEventListener, ListChangeEvent } from "../collections/List";

/* eslint-disable @typescript-eslint/no-explicit-any */

export class Query implements Cloneable<Query>, Serializable<Query> {
  private _measures: CloneableList<QueryMeasure>;
  private _levels: CloneableList<QueryLevel>;
  private _filters: CloneableList<QueryFilter>;
  nonEmpty: boolean;
  private datasetName: string;

  constructor(datasetName = null) {
    this._measures = new CloneableList();
    this._levels = new CloneableList();
    this._filters = new CloneableList();
    this.nonEmpty = true;
    this.datasetName = datasetName;
  }

  get measures(): List<QueryMeasure> {
    return this._measures;
  }

  get levels(): List<QueryLevel> {
    return this._levels;
  }

  get filters(): List<QueryFilter> {
    return this._filters;
  }

  serialize(repository: Repository): any {
    const mArray: any[] = [];
    this._measures.forEach((measure: QueryMeasure): void => {
      mArray.push(measure.serialize(repository));
    });
    const lArray: any[] = [];
    this._levels.forEach((level: QueryLevel): void => {
      lArray.push(level.serialize(repository));
    });
    const fArray: any[] = [];
    this._filters.forEach((filter: QueryFilter): void => {
      fArray.push(filter.serialize(repository));
    });
    return {
      nonEmpty: this.nonEmpty,
      datasetName: this.datasetName,
      _measures: mArray,
      _levels: lArray,
      _filters: fArray
    };
  }

  async deserialize(o: any, repository: Repository): Promise<Query> {
    if (o === null) {
      return Promise.resolve(null);
    }
    const ret = new Query();
    ret.datasetName = o.datasetName;
    ret.nonEmpty = o.nonEmpty;
    const mPromises: Promise<QueryMeasure>[] = o._measures.map((m: any): Promise<QueryMeasure> => {
      return new QueryMeasure().deserialize(m, repository);
    });
    const qq = await Promise.all(mPromises);
    const lPromises: Promise<QueryLevel>[] = o._levels.map((l: any): Promise<QueryLevel> => {
      return new QueryLevel().deserialize(l, repository);
    });
    const ll = await Promise.all(lPromises);
    const fPromises: Promise<QueryFilter>[] = o._filters.map((f: any): Promise<QueryFilter> => {
      return new QueryFilter().deserialize(f, repository);
    });
    const ff = await Promise.all(fPromises);
    ret._levels = new CloneableList();
    ret._levels.addAll(ll);
    ret._measures = new CloneableList();
    ret._measures.addAll(qq);
    ret._filters = new CloneableList();
    ret._filters.addAll(ff);
    return Promise.resolve(ret);
  }

  clone(): Query {
    const ret = new Query();
    ret._measures = this._measures.clone();
    ret._levels = this._levels.clone();
    ret._filters = this._filters.clone();
    ret.datasetName = this.datasetName;
    return ret;
  }

  private static levelsString(levelsList: List<QueryLevel>, nonEmpty: boolean): string {
    return Query.crossJoinLevels(levelsList.asArray(), nonEmpty);
  }

  private static crossJoinLevels(levels: QueryLevel[], nonEmpty: boolean): string {
    const joinVerb = nonEmpty ? "NonEmptyCrossJoin" : "CrossJoin";
    let ret = null;
    if (levels && levels.length) {
      ret = "";
      if (levels.length === 1) {
        ret = "{" + levels[0].uniqueName + ".Members}";
      } else {
        const sibs: QueryLevel[] = [];
        let newLevels: QueryLevel[] = [];
        const firstLevelHierarchyName: string = levels[0].hierarchyName;
        levels.slice(1).forEach((level: QueryLevel): void => {
          if (level.hierarchyName === firstLevelHierarchyName) {
            sibs.push(level);
          } else {
            newLevels.push(level);
          }
        });
        if (sibs.length) {
          sibs.push(levels[0]);
        } else {
          newLevels = [levels[0]].concat(newLevels);
        }
        if (levels.length === 2) {
          const twoLevelBase = "{" + levels[0].uniqueName + ".Members},{" + levels[1].uniqueName + ".Members}";
          if (sibs.length) {
            ret = "Hierarchize({" + twoLevelBase + "})";
          } else {
            ret = joinVerb + "(" + twoLevelBase + ")";
          }
        } else {
          let base = "{" + levels[0].uniqueName + ".Members}";
          let subsequentLevels = levels.slice(1);
          if (sibs.length) {
            base = "Hierarchize({";
            base += sibs.map((level: QueryLevel): string => {
              return "{" + level.uniqueName + ".Members}";
            }).join(",");
            base += "})";
            subsequentLevels = newLevels;
          }
          const rest = Query.crossJoinLevels(subsequentLevels, nonEmpty);
          if (rest) {
            ret = joinVerb + "(" + base + "," + rest + ")";
          } else {
            ret = base;
          }
        }
      }
    }
    return ret;
  }

  private measuresString(): string {
    let ret = null;
    if (this._measures.length) {
      const measuresStrings: string[] = [];
      this._measures.forEach((measure: QueryMeasure): void => {
        measuresStrings.push(measure.uniqueName);
      });
      ret = "{" + measuresStrings.join() + "}";
    }
    return ret;
  }

  asMDX(): string {

    let ret = null;

    if (this._measures.length) {

      const cubeName = this.datasetName;
      let colsString = this.measuresString();

      const columnLevels = this._levels.filter((level: QueryLevel): boolean => {
        return !level.rowOrientation;
      });

      if (columnLevels.length) {
        colsString = (this.nonEmpty ? "NonEmpty" : "") + "CrossJoin(" + Query.levelsString(columnLevels, this.nonEmpty) + "," + this.measuresString() + ")";
      }

      ret = "SELECT " +
      (this.nonEmpty ? "NON EMPTY " : "") +
      colsString + " ON COLUMNS";
      
      const rowLevels = this._levels.filter((level: QueryLevel): boolean => {
        return level.rowOrientation;
      });

      if (rowLevels.length) {
        ret += ((this.nonEmpty ? ", NON EMPTY " : "") + Query.levelsString(rowLevels, this.nonEmpty) + " ON ROWS");
      }
      
      ret += " FROM [" + cubeName + "]";

    }

    return ret;

  }

}

export abstract class AbstractQueryObject implements Editable {
  protected _dirty: boolean;
  private editEventListeners: EditEventListener[] = [];
  get dirty(): boolean {
    return this._dirty;
  }
  cancelEdits(): void {
    // no-op...handled by parent Analysis
    this._dirty = false;
  }
  checkpointEdits(): void {
    // no-op...handled by parent Analysis
    this._dirty = false;
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
  protected async notifyListenersOfEdit(type: string): Promise<void> {
    if (!this._dirty) {
      this._dirty = true;
      const promises: Promise<void>[] = [];
      this.editEventListeners.forEach((listener: EditEventListener): void => {
        promises.push(listener.notifyEdit(new EditEvent(type)));
      });
      return Promise.all(promises).then();
    }
    return Promise.resolve();
  }
  protected async notifyListenersOfPropertyEdit(property: string): Promise<void> {
    const promises: Promise<void>[] = [];
    this.editEventListeners.forEach((listener: EditEventListener): void => {
      promises.push(listener.notifyPropertyEdit(new PropertyEditEvent(this, property)));
    });
    return Promise.all(promises).then();
  }
}

export class QueryLevel extends AbstractQueryObject implements Cloneable<QueryLevel>, Serializable<QueryLevel> {
  private _uniqueName: string;
  private _sumSelected = false;
  private _filterSelected = false;
  private _rowOrientation = true;
  clone(): QueryLevel {
    const ret = new QueryLevel();
    ret._uniqueName = this._uniqueName;
    ret._sumSelected = this._sumSelected;
    ret._filterSelected = this._filterSelected;
    ret._rowOrientation = this._rowOrientation;
    return ret;
  }
  serialize(_repository: Repository): any {
    return {
      _uniqueName: this._uniqueName,
      _sumSelected: this._sumSelected,
      _filterSelected: this._filterSelected,
      _rowOrientation: this._rowOrientation
    };
  }
  deserialize(o: any, _repository: Repository): Promise<QueryLevel> {
    const ret = new QueryLevel();
    ret._uniqueName = o._uniqueName;
    ret._filterSelected = o._filterSelected;
    ret._sumSelected = o._sumSelected;
    ret._rowOrientation = o._rowOrientation;
    return Promise.resolve(ret);
  }
  get uniqueName(): string {
    return this._uniqueName;
  }
  get sumSelected(): boolean {
    return this._sumSelected;
  }
  get filterSelected(): boolean {
    return this._filterSelected;
  }
  get rowOrientation(): boolean {
    return this._rowOrientation;
  }
  get hierarchyName(): string {
    return this._uniqueName.split(".").slice(0,2).join(".");
  }
  async setUniqueName(value: string): Promise<void> {
    this._uniqueName = value;
    return super.notifyListenersOfEdit(EditEvent.EDIT_BEGIN);
  }
  async setSumSelected(value: boolean): Promise<void> {
    if (this._sumSelected !== value) {
      return super.notifyListenersOfEdit(EditEvent.EDIT_BEGIN).then(() => {
        this._sumSelected = value;
        return super.notifyListenersOfPropertyEdit("sumSelected");
      });
    }
    return Promise.resolve();
  }
  async setFilterSelected(value: boolean): Promise<void> {
    if (this._filterSelected !== value) {
      return super.notifyListenersOfEdit(EditEvent.EDIT_BEGIN).then(() => {
        this._filterSelected = value;
        return super.notifyListenersOfPropertyEdit("filterSelected");
      });
    }
    return Promise.resolve();
  }
  async setRowOrientation(value: boolean): Promise<void> {
    if (this._rowOrientation !== value) {
      return super.notifyListenersOfEdit(EditEvent.EDIT_BEGIN).then(() => {
        this._rowOrientation = value;
        return super.notifyListenersOfPropertyEdit("rowOrientation");
      });
    }
    return Promise.resolve();
  }
}

export class QueryMeasure extends AbstractQueryObject implements Cloneable<QueryMeasure>, Serializable<QueryMeasure> {
  private _uniqueName: string;
  clone(): QueryMeasure {
    const ret = new QueryMeasure();
    ret._uniqueName = this._uniqueName;
    return ret;
  }
  serialize(_repository: Repository): any {
    return {
      _uniqueName: this._uniqueName
    };
  }
  deserialize(o: any, _repository: Repository): Promise<QueryMeasure> {
    const ret = new QueryMeasure();
    ret._uniqueName = o._uniqueName;
    return Promise.resolve(ret);
  }
  get uniqueName(): string {
    return this._uniqueName;
  }
  async setUniqueName(value: string): Promise<void> {
    this._uniqueName = value;
    return super.notifyListenersOfEdit(EditEvent.EDIT_BEGIN);
  }
}

export class QueryFilter extends AbstractQueryObject implements Cloneable<QueryFilter>, Serializable<QueryFilter> {
  readonly levelMemberNames: List<string>;
  private _filterOnlyHierarchy: boolean;
  private _include: boolean;
  private _levelUniqueName: string;
  constructor(levelUniqueName: string = null) {
    super();
    this.levelMemberNames = new List<string>();
    this._filterOnlyHierarchy = false;
    this._include = true;
    this._levelUniqueName = levelUniqueName;
    this.levelMemberNames.addChangeEventListener(new FilterMemberNameListEventListener(
      (_event: ListChangeEvent): Promise<void> => {
        return super.notifyListenersOfEdit(EditEvent.EDIT_BEGIN);
      },
      (_event: ListChangeEvent): Promise<void> => {
        return super.notifyListenersOfPropertyEdit("levelMemberNames");
      }
    ));
  }
  serialize(_repository: Repository): any {
    return {
      _levelUniqueName: this._levelUniqueName,
      _filterOnlyHierarchy: this._filterOnlyHierarchy,
      _include: this._include,
      levelMemberNames: this.levelMemberNames.map((name: string): string => {
        return name;
      })
    };
  }
  deserialize(o: any, _repository: Repository): Promise<QueryFilter> {
    const ret = new QueryFilter();
    ret._levelUniqueName = o._levelUniqueName;
    ret._include = o._include;
    ret._filterOnlyHierarchy = o._filterOnlyHierarchy;
    const newNames: string[] = [];
    o.levelMemberNames.forEach((name: any): void => {
      newNames.push(name);
    });
    ret.levelMemberNames.set(newNames);
    return Promise.resolve(ret);
  }
  clone(): QueryFilter {
    const ret = new QueryFilter();
    ret._levelUniqueName = this._levelUniqueName;
    ret._include = this._include;
    ret._filterOnlyHierarchy = this._filterOnlyHierarchy;
    const newNames: string[] = [];
    this.levelMemberNames.forEach((name: any): void => {
      newNames.push(name);
    });
    ret.levelMemberNames.set(newNames);
    return ret;
  }
  get filterOnlyHierarchy(): boolean {
    return this._filterOnlyHierarchy;
  }
  get include(): boolean {
    return this._include;
  }
  async setFilterOnlyHierarchy(value: boolean): Promise<void> {
    if (value !== this._filterOnlyHierarchy) {
      return super.notifyListenersOfEdit(EditEvent.EDIT_BEGIN).then(() => {
        this._filterOnlyHierarchy = value;
        return super.notifyListenersOfPropertyEdit("filterOnlyHierarchy");
      });
    }
    return Promise.resolve();
  }
  async setInclude(value: boolean): Promise<void> {
    if (value !== this._include) {
      return super.notifyListenersOfEdit(EditEvent.EDIT_BEGIN).then(() => {
        this._include = value;
        return super.notifyListenersOfPropertyEdit("include");
      });
    }
    return Promise.resolve();
  }
}

class FilterMemberNameListEventListener implements ListChangeEventListener {
  private listWillChangeCallback: (event: ListChangeEvent) => Promise<void>;
  private listChangedCallback: (event: ListChangeEvent) => Promise<void>;
  constructor(listWillChangeCallback: (event: ListChangeEvent) => Promise<void>, listChangedCallback: (event: ListChangeEvent) => Promise<void>) {
    this.listWillChangeCallback = listWillChangeCallback;
    this.listChangedCallback = listChangedCallback;
  }
  listWillChange(event: ListChangeEvent): Promise<void> {
    return this.listWillChangeCallback(event);
  }
  listChanged(event: ListChangeEvent): Promise<void> {
    return this.listChangedCallback(event);
  }
}