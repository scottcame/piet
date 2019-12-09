import { Dataset } from "./Dataset";
import { Identifiable, Serializable, Editable, EditEventListener, EditEvent, PropertyEditEvent, Cloneable } from "./Persistence";
import { Repository } from "./Repository";
import { ListChangeEventListener, ListChangeEvent, List, CloneableList } from "../collections/List";

/* eslint-disable @typescript-eslint/no-explicit-any */

export class Analysis implements Identifiable, Serializable<Analysis>, Editable {

  id: number;
  dataset: Dataset;
  private _name: string = null;
  private _description: string = null;
  private _query: Query;

  private editCheckpoint: Analysis;
  private editEventListeners: EditEventListener[];
  private queryMeasuresListChangeEventListener: QueryDirtyListListener<QueryMeasure>;
  private queryLevelsListChangeEventListener: QueryDirtyListListener<QueryLevel>;

  constructor(dataset: Dataset = null, name: string = null, id: number = undefined) {

    this.editEventListeners = [];
    this.editCheckpoint = null;
    this.id = id;
    this.dataset = dataset;
    this._name = name;
    this._query = dataset ? new Query(dataset.name) : new Query();

    this.initQueryComponentListListeners();

  }

  serialize(repository: Repository): any {
    const ret: any = {
      name: this._name,
      description: this._description,
      datasetRef: {
        id: this.dataset.id,
        cube: this.dataset.name
      },
      _query: this._query ? this._query.serialize(repository) : new Query(this.dataset.name),
      editCheckpoint: this.editCheckpoint ? this.editCheckpoint.serialize(repository) : null
    };
    if (this.id !== undefined) {
      ret.id = this.id;
    }
    return ret;
  }

  async deserialize(o: any, repository: Repository): Promise<Analysis> {

    if (o === null) {
      return new Promise<Analysis>((resolve, _reject): void => {
        resolve(null);
      });
    }

    let d: Dataset = null;
    repository.browseDatasets().forEach((dd: Dataset) => {
      if (dd.id === o.datasetRef.id && dd.name === o.datasetRef.cube) {
        d = dd;
      }
    });
    this._name = o.name;
    this.id = o.id;
    this.dataset = d;
    this._description = o.description;

    return new Analysis().deserialize(o.editCheckpoint, repository).then(async (ec: Analysis): Promise<any> => {
      this.editCheckpoint = ec;
      if (this.editCheckpoint === null) {
        this.checkpointEdits();
      }
      const q: Query =  await new Query().deserialize(o._query, repository);
      this._query = q;
      return new Promise<Analysis>((resolve, _reject) => {
        this.initQueryComponentListListeners();
        resolve(this);
      });
    });

  }

  inRepository(): boolean {
    return this.id !== undefined;
  }

  get query(): Query {
    return this._query;
  }

  get name(): string {
    return this._name;
  }

  async setName(value: string): Promise<void> {
    this.initCheckpoint();
    this._name = value;
    return this.notifyPropertyEditEventListeners("name");
  }

  get description(): string {
    return this._description;
  }

  async setDescription(value: string): Promise<void> {
    this.initCheckpoint();
    this._description = value;
    return this.notifyPropertyEditEventListeners("description");
  }

  private initQueryComponentListListeners(): void {
    this.queryMeasuresListChangeEventListener = new QueryDirtyListListener((): Promise<void> => {
      return this.initCheckpoint();
    }, (): Promise<void> => {
      return this.notifyPropertyEditEventListeners("query");
    }, this._query.measures, new QueryDirtyEditEventListener((): Promise<void> => {
      this.initCheckpoint();
      return this.notifyPropertyEditEventListeners("query");
    }));
    this.queryLevelsListChangeEventListener = new QueryDirtyListListener((): Promise<void> => {
      return this.initCheckpoint();
    }, (): Promise<void> => {
      return this.notifyPropertyEditEventListeners("query");
    }, this._query.levels, new QueryDirtyEditEventListener((): Promise<void> => {
      this.initCheckpoint();
      return this.notifyPropertyEditEventListeners("query");
    }));
  }

  private initCheckpoint(): Promise<void> {
    if (!this.editCheckpoint) {
      // id is readonly, so by definition it cannot be edited, and so we don't need to manage it on the checkpoint, either
      this.editCheckpoint = new Analysis(this.dataset, this.name, null);
      this.editCheckpoint._description = this._description;
      this.editCheckpoint._query = this.query.clone();
      return this.notifyEditEventListeners(EditEvent.EDIT_BEGIN);
    }
  }

  private async notifyPropertyEditEventListeners(property: string): Promise<void> {
    const promises: Promise<void>[] = [];
    this.editEventListeners.forEach((listener: EditEventListener) => {
      promises.push(listener.notifyPropertyEdit(new PropertyEditEvent(this, property)));
    });
    return Promise.all(promises).then();
  }

  private async notifyEditEventListeners(type: string): Promise<void> {
    const promises: Promise<void>[] = [];
    this.editEventListeners.forEach((listener: EditEventListener) => {
      promises.push(listener.notifyEdit(new EditEvent(type)));
    });
    return Promise.all(promises).then();
  }

  cancelEdits(): Promise<void> {
    if (this.editCheckpoint) {
      // set the properties, not the instance variables
      this.setDescription(this.editCheckpoint._description);
      this.setName(this.editCheckpoint._name);
      this._query = this.editCheckpoint._query;
      this.initQueryComponentListListeners();
    }
    this.editCheckpoint = null;
    this._query.levels.forEach((level: QueryLevel): void => {
      level.cancelEdits();
    });
    this._query.measures.forEach((m: QueryMeasure): void => {
      m.cancelEdits();
    });
    return this.notifyEditEventListeners(EditEvent.EDIT_CANCEL);
  }

  checkpointEdits(): Promise<void> {
    this.editCheckpoint = null;
    this._query.levels.forEach((level: QueryLevel): void => {
      level.checkpointEdits();
    });
    this._query.measures.forEach((m: QueryMeasure): void => {
      m.checkpointEdits();
    });
    return this.notifyEditEventListeners(EditEvent.EDIT_CHECKPOINT);
  }

  get dirty(): boolean {
    return this.editCheckpoint !== null;
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

}

class QueryDirtyEditEventListener implements EditEventListener {
  private editCallback: () => Promise<void>;
  constructor(editCallback: () => Promise<void>) {
    this.editCallback = editCallback;
  }
  notifyEdit(_event: EditEvent): Promise<void> {
    return this.editCallback();
  }
  notifyPropertyEdit(_event: PropertyEditEvent): Promise<void> {
    return this.editCallback();
  }
}

class QueryDirtyListListener<T extends Editable> implements ListChangeEventListener {
  private pendingEditCallback: () => Promise<void>;
  private editCompleteCallback: () => Promise<void>;
  private targetList: List<T>;
  private queryDirtyEditEventListener: QueryDirtyEditEventListener;
  constructor(pendingEditCallback: () => Promise<void>, editCompleteCallback: () => Promise<void>, targetList: List<T>, queryDirtyEditEventListener: QueryDirtyEditEventListener) {
    this.pendingEditCallback = pendingEditCallback;
    this.editCompleteCallback = editCompleteCallback;
    this.targetList = targetList;
    this.queryDirtyEditEventListener = queryDirtyEditEventListener;
    targetList.addChangeEventListener(this);
    this.targetList.forEach((item: T): void => {
      item.addEditEventListener(this.queryDirtyEditEventListener);
    });
  }
  listWillChange(_event: ListChangeEvent): Promise<void> {
    this.targetList.forEach((item: T): void => {
      item.removeEditEventListener(this.queryDirtyEditEventListener);
    });
    return this.pendingEditCallback();
  }
  listChanged(_event: ListChangeEvent): Promise<void> {
    this.targetList.forEach((item: T): void => {
      item.addEditEventListener(this.queryDirtyEditEventListener);
    });
    return this.editCompleteCallback();
  }
}

export class Query implements Cloneable<Query>, Serializable<Query> {
  private _measures: CloneableList<QueryMeasure>;
  private _levels: CloneableList<QueryLevel>;
  nonEmpty: boolean;
  private datasetName: string;

  constructor(datasetName = null) {
    this._measures = new CloneableList();
    this._levels = new CloneableList();
    this.nonEmpty = true;
    this.datasetName = datasetName;
  }

  get measures(): List<QueryMeasure> {
    return this._measures;
  }

  get levels(): List<QueryLevel> {
    return this._levels;
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
    return {
      nonEmpty: this.nonEmpty,
      datasetName: this.datasetName,
      _measures: mArray,
      _levels: lArray
    };
  }

  async deserialize(o: any, repository: Repository): Promise<Query> {
    if (o === null) {
      return new Promise((resolve, _reject) => {
        resolve(null);
      });
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
    ret._levels = new CloneableList();
    ret._levels.addAll(ll);
    ret._measures = new CloneableList();
    ret._measures.addAll(qq);
    return new Promise<any>((resolve, _reject) => {
      resolve(ret);
    });
  }

  clone(): Query {
    const ret = new Query();
    ret._measures = this._measures.clone();
    ret._levels = this._levels.clone();
    ret.datasetName = this.datasetName;
    return ret;
  }

  private static levelsString(levelsList: List<QueryLevel>): string {
    let ret = null;
    if (levelsList.length === 1) {
      ret = "{" + levelsList.get(0).uniqueName + ".Members}";
    } else if (levelsList.length > 1) {
      const levelStrings: string[] = [];
      levelsList.forEach((level: QueryLevel): void => {
        levelStrings.push("{" + level.uniqueName + ".Members}");
      });
      ret = "CrossJoin(" + levelStrings.join() + ")";
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
        colsString = "CrossJoin(" + Query.levelsString(columnLevels) + "," + this.measuresString() + ")";
      }

      ret = "SELECT " +
      (this.nonEmpty ? "NON EMPTY " : "") +
      colsString + " ON COLUMNS";
      
      const rowLevels = this._levels.filter((level: QueryLevel): boolean => {
        return level.rowOrientation;
      });

      if (rowLevels.length) {
        ret += ((this.nonEmpty ? ", NON EMPTY " : "") + Query.levelsString(rowLevels) + " ON ROWS");
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
    return;
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
    return new Promise((resolve, _reject) => {
      const ret = new QueryLevel();
      ret._uniqueName = o._uniqueName;
      ret._filterSelected = o._filterSelected;
      ret._sumSelected = o._sumSelected;
      ret._rowOrientation = o._rowOrientation;
      resolve(ret);
    });
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
    return;
  }
  async setFilterSelected(value: boolean): Promise<void> {
    if (this._filterSelected !== value) {
      return super.notifyListenersOfEdit(EditEvent.EDIT_BEGIN).then(() => {
        this._filterSelected = value;
        return super.notifyListenersOfPropertyEdit("filterSelected");
      });
    }
    return;
  }
  async setRowOrientation(value: boolean): Promise<void> {
    if (this._rowOrientation !== value) {
      return super.notifyListenersOfEdit(EditEvent.EDIT_BEGIN).then(() => {
        this._rowOrientation = value;
        return super.notifyListenersOfPropertyEdit("rowOrientation");
      });
    }
    return;
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
    return new Promise((resolve, _reject) => {
      const ret = new QueryMeasure();
      ret._uniqueName = o._uniqueName;
      resolve(ret);
    });
  }
  get uniqueName(): string {
    return this._uniqueName;
  }
  async setUniqueName(value: string): Promise<void> {
    this._uniqueName = value;
    return super.notifyListenersOfEdit(EditEvent.EDIT_BEGIN);
  }
}
