import { Dataset, Measure } from "./Dataset";
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

  constructor(dataset: Dataset = null, name: string = null, id: number = undefined) {

    this.editEventListeners = [];
    this.editCheckpoint = null;
    this.id = id;
    this.dataset = dataset;
    this._name = name;
    this._query = new Query();

    this._query.componentListChangeEventListener = new QueryComponentListChangeEventListener((_event: ListChangeEvent): Promise<void> => {
      return this.initCheckpoint();
    });

  }

  serialize(repository: Repository): any {
    const ret: any = {
      name: this._name,
      description: this._description,
      datasetRef: {
        id: this.dataset.id,
        cube: this.dataset.name
      },
      editCheckpoint: this.editCheckpoint ? this.editCheckpoint.serialize(repository) : null
    };
    if (this.id !== undefined) {
      ret.id = this.id;
    }
    return ret;
  }

  async deserialize(o: any, repository: Repository): Promise<Analysis> {
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
    this.editCheckpoint = o.editCheckpoint ? await new Analysis().deserialize(o.editCheckpoint, repository) : null;
    if (this.editCheckpoint === null) {
      this.checkpointEdits();
    }
    return this;
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
      const queryListener = this._query.componentListChangeEventListener;
      this._query = this.editCheckpoint._query;
      this._query.componentListChangeEventListener = queryListener;
    }
    this.editCheckpoint = null;
    return this.notifyEditEventListeners(EditEvent.EDIT_CANCEL);
  }

  checkpointEdits(): Promise<void> {
    this.editCheckpoint = null;
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

export class Query implements Cloneable<Query> {

  private _measures: CloneableList<Measure>;
  private _parentListener: QueryComponentListChangeEventListener;

  constructor() {
    this._measures = new CloneableList();
    this._parentListener = null;
  }

  set componentListChangeEventListener(listener: QueryComponentListChangeEventListener) {
    if (this._parentListener !== null) {
      this._measures.removeChangeEventListener(this._parentListener);
    }
    this._parentListener = listener;
    this._measures.addChangeEventListener(listener);
  }

  get measures(): List<Measure> {
    return this._measures;
  }

  clone(): Query {
    const ret = new Query();
    ret._measures = this._measures.clone();
    return ret;
  }

}

class QueryComponentListChangeEventListener implements ListChangeEventListener {
  callback: QueryComponentListChangeEventCallback;
  constructor(callback: QueryComponentListChangeEventCallback) {
    this.callback = callback;
  }
  listChanged(_event: ListChangeEvent): Promise<void> {
    // do nothing here...we are only concerned to catch list changes before they happen so we know an edit is happening
    return;
  }
  listWillChange(event: ListChangeEvent): Promise<void> {
    return this.callback(event);
  }
}

interface QueryComponentListChangeEventCallback {
  (event: ListChangeEvent): Promise<void>;
}