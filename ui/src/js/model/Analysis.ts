import { Dataset } from "./Dataset";
import { DropdownItem } from "../ui/model/Dropdown";
import { Observable } from "../util/Observable";
import { Identifiable, Serializable, PersistenceFactory, Editable, EditEventListener, EditEvent } from "./Persistence";
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
    this.name = analysis.name.value;
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

export class Analysis implements DropdownItem, Identifiable, Serializable, Editable {

  readonly id: number;
  dataset: Dataset;
  private _name: Observable<string>;
  private _description: string = null;

  private editCheckpoint: Analysis;
  private editEventListeners: EditEventListener[];

  constructor(dataset: Dataset, name: string = null, id: number = undefined) {
    this.editEventListeners = [];
    this.editCheckpoint = null;
    this.id = id;
    this.dataset = dataset;
    this._name = new Observable();
    this._name.value = name;
  }

  get name(): Observable<string> {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this.edit();
    this._description = value;
  }

  getLabel(): Observable<string> {
    return this.name;
  }

  getValue(): any {
    return this;
  }

  private edit(): void {
    if (!this.editCheckpoint) {
      // name (and other observables) track their own edits, so no need to manage that on the checkpoint
      // id is readonly, so by definition it cannot be edited, and so we don't need to manage it on the checkpoint, either
      this.editCheckpoint = new Analysis(this.dataset, null, null);
      this.editCheckpoint._description = this._description;
      this.notifyEditEventListeners(EditEvent.EDIT_BEGIN);
    }
  }

  private notifyEditEventListeners(type: string): void {
    this.editEventListeners.forEach((listener: EditEventListener) => {
      listener.notify(new EditEvent(type));
    });
  }

  cancelEdits(): void {
    if (this.editCheckpoint) {
      this._description = this.editCheckpoint._description;
    }
    this._name.cancelEdits();
    this.editCheckpoint = null;
    this.notifyEditEventListeners(EditEvent.EDIT_CANCEL);
  }

  checkpointEdits(): void {
    this.editCheckpoint = null;
    this._name.checkpointEdits();
    this.notifyEditEventListeners(EditEvent.EDIT_CHECKPOINT);
  }

  get dirty(): boolean {
    return this.editCheckpoint !== null || this._name.dirty;
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
