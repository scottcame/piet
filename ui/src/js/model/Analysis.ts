import { Dataset } from "./Dataset";
import { Identifiable, Serializable, PersistenceFactory, Editable, EditEventListener, EditEvent, PropertyEditEvent } from "./Persistence";
import { Repository } from "./Repository";

/* eslint-disable @typescript-eslint/no-explicit-any */

class PersistentAnalysis implements Identifiable, Serializable {
  id: number;
  datasetRef: {id: string; cube: string};
  name: string;
  description: string;
  constructor(analysis: Analysis) {
    if (analysis.id) {
      this.id = analysis.id;
    }
    this.datasetRef = {
      id: analysis.dataset.id,
      cube: analysis.dataset.name
    };
    this.name = analysis.name;
    this.description = analysis.description;
  }
}

class AnalysisPersistenceFactory implements PersistenceFactory<Analysis> {

  serialize(analysis: Analysis, _repository: Repository): any {
    return new PersistentAnalysis(analysis);
  }

  deserialize(o: any, repository: Repository): Analysis {
    let d: Dataset = null;
    repository.browseDatasets().forEach((dd: Dataset) => {
      if (dd.id === o.datasetRef.id && dd.name === o.datasetRef.cube) {
        d = dd;
      }
    });
    const ret = new Analysis(d, o.name, o.id);
    ret.description = o.description;
    ret.checkpointEdits();
    return ret;
  }

}

export class Analysis implements Identifiable, Serializable, Editable {

  readonly id: number;
  dataset: Dataset;
  private _name: string = null;
  private _description: string = null;

  private editCheckpoint: Analysis;
  private editEventListeners: EditEventListener[];

  constructor(dataset: Dataset, name: string = null, id: number = undefined) {
    this.editEventListeners = [];
    this.editCheckpoint = null;
    this.id = id;
    this.dataset = dataset;
    this._name = name;
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

  static readonly PERSISTENCE_FACTORY = new AnalysisPersistenceFactory();

}
