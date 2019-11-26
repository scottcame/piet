import { Dataset } from "./Dataset";
import { Identifiable, Serializable, Editable, EditEventListener, EditEvent, PropertyEditEvent } from "./Persistence";
import { Repository } from "./Repository";

/* eslint-disable @typescript-eslint/no-explicit-any */

export class Analysis implements Identifiable, Serializable<Analysis>, Editable {

  id: number;
  dataset: Dataset;
  private _name: string = null;
  private _description: string = null;

  private editCheckpoint: Analysis;
  private editEventListeners: EditEventListener[];

  constructor(dataset: Dataset = null, name: string = null, id: number = undefined) {
    this.editEventListeners = [];
    this.editCheckpoint = null;
    this.id = id;
    this.dataset = dataset;
    this._name = name;
  }

  serialize(repository: Repository): any {
    const ret = {
      id: undefined,
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

  deserialize(o: any, repository: Repository): Analysis {
    let d: Dataset = null;
    repository.browseDatasets().forEach((dd: Dataset) => {
      if (dd.id === o.datasetRef.id && dd.name === o.datasetRef.cube) {
        d = dd;
      }
    });
    this.name = o.name;
    this.id = o.id;
    this.dataset = d;
    this.description = o.description;
    this.editCheckpoint = o.editCheckpoint ? new Analysis().deserialize(o.editCheckpoint, repository) : null;
    if (this.editCheckpoint === null) {
      this.checkpointEdits();
    }
    return this;
  }

  inRepository(): boolean {
    return this.id !== undefined;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this.initCheckpoint();
    this._name = value;
    this.notifyPropertyEditEventListeners("name");
  }

  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this.initCheckpoint();
    this._description = value;
    this.notifyPropertyEditEventListeners("description");
  }

  private initCheckpoint(): void {
    if (!this.editCheckpoint) {
      // id is readonly, so by definition it cannot be edited, and so we don't need to manage it on the checkpoint, either
      this.editCheckpoint = new Analysis(this.dataset, this.name, null);
      this.editCheckpoint._description = this._description;
      this.notifyEditEventListeners(EditEvent.EDIT_BEGIN);
    }
  }

  private notifyPropertyEditEventListeners(property: string): void {
    this.editEventListeners.forEach((listener: EditEventListener) => {
      listener.notifyPropertyEdit(new PropertyEditEvent(this, property));
    });
  }

  private notifyEditEventListeners(type: string): void {
    this.editEventListeners.forEach((listener: EditEventListener) => {
      listener.notifyEdit(new EditEvent(type));
    });
  }

  cancelEdits(): void {
    if (this.editCheckpoint) {
      // set the properties, not the instance variables
      this.description = this.editCheckpoint._description;
      this.name = this.editCheckpoint._name;
    }
    this.editCheckpoint = null;
    this.notifyEditEventListeners(EditEvent.EDIT_CANCEL);
  }

  checkpointEdits(): void {
    this.editCheckpoint = null;
    this.notifyEditEventListeners(EditEvent.EDIT_CHECKPOINT);
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
