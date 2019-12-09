import { Dataset } from "./Dataset";
import { Identifiable, Serializable, Editable, EditEventListener, EditEvent, PropertyEditEvent } from "./Persistence";
import { Repository } from "./Repository";
import { ListChangeEventListener, ListChangeEvent, List } from "../collections/List";
import { Query, QueryMeasure, QueryLevel } from "./Query";

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
      return Promise.resolve(null);
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
      this.initQueryComponentListListeners();
      return Promise.resolve(this);
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
