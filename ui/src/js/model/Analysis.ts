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

import { Dataset } from "./Dataset";
import { Identifiable, Serializable, Editable, EditEventListener, EditEvent, PropertyEditEvent } from "./Persistence";
import { Repository } from "./Repository";
import { ListChangeEventListener, ListChangeEvent, List } from "../collections/List";
import { Query, QueryMeasure, QueryLevel, QueryFilter } from "./Query";

/* eslint-disable @typescript-eslint/no-explicit-any */

export class Analysis implements Identifiable, Serializable<Analysis>, Editable {

  id: string;
  dataset: Dataset;
  private _name: string = null;
  private _description: string = null;
  private _query: Query;

  private editCheckpoint: Analysis;
  private undoAction: () => Promise<void>;
  private editEventListeners: EditEventListener[];
  private queryMeasuresListChangeEventListener: QueryDirtyListListener<QueryMeasure>;
  private queryLevelsListChangeEventListener: QueryDirtyListListener<QueryLevel>;
  private queryFiltersListChangeEventListener: QueryDirtyListListener<QueryFilter>;

  constructor(dataset: Dataset = null, name: string = null, id: string = undefined) {

    this.editEventListeners = [];
    this.editCheckpoint = null;
    this.id = id;
    this.dataset = dataset;
    this._name = name;
    this._query = new Query(this);

    this.initQueryComponentListListeners();
    this.undoAction = null;

  }

  async undo(): Promise<void> {
    if (this.undoAction === null) {
      return Promise.resolve();
    }
    const action = this.undoAction();
    this.undoAction = null;
    return action;
  }

  get undoAvailable(): boolean {
    return this.undoAction !== null;
  }

  serialize(repository: Repository): any {
    const ret: any = {
      name: this._name,
      description: this._description,
      datasetRef: {
        id: this.dataset.id,
        cube: this.dataset.name
      },
      _query: this._query ? this._query.serialize(repository) : new Query(this),
      editCheckpoint: this.editCheckpoint ? this.editCheckpoint.serialize(repository) : null
    };
    if (this.dataset.measureGroupName !== undefined) {
      ret.datasetRef.measureGroupName = this.dataset.measureGroupName;
    }
    if (this.id !== undefined) {
      ret.id = this.id;
    }
    return ret;
  }

  async deserialize(o: any, repository: Repository): Promise<Analysis> {

    if (o === null) {
      return Promise.resolve(null);
    }

    return repository.browseDatasets().then(async (datasets: Dataset[]) => {

      let d: Dataset = null;

      datasets.forEach((dd: Dataset) => {
        if (dd.id === o.datasetRef.id && dd.name === o.datasetRef.cube && (o.datasetRef.measureGroupName === undefined || (o.datasetRef.measureGroupName === dd.measureGroupName))) {
          d = dd;
        }
      });

      if (d === null) {
        return Promise.reject("dataset " + o.datasetRef.id + ":" + o.datasetRef.cube + " not found deserializing Analysis " + o.name);
      }

      this._name = o.name;
      this.id = o.id;
      this.dataset = d;
      this._description = o.description;

      if (!o.editCheckpoint) {
        o.editCheckpoint = null;
      }

      return new Analysis().deserialize(o.editCheckpoint, repository).then(async (ec: Analysis): Promise<any> => {
        this.editCheckpoint = ec;
        if (this.editCheckpoint === null) {
          this.checkpointEdits();
        }
        const q: Query =  await new Query(this).deserialize(o._query, repository);
        this._query = q;
        this.initQueryComponentListListeners();
        return Promise.resolve(this);
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

  get nonEmpty(): boolean {
    return this.query.nonEmpty;
  }

  get filterParentAggregates(): boolean {
    return this.query.filterParentAggregates;
  }

  get description(): string {
    return this._description;
  }

  async setNonEmpty(value: boolean): Promise<void> {
    return this.initCheckpoint().then(async () => {
      return this.notifyOfPendingPropertyEdit("nonEmpty").then(async () => {
        const currentValue = this.nonEmpty;
        this.undoAction = (): Promise<void> => {
          return this.setNonEmpty(currentValue);
        };
        this.query.nonEmpty = value;
        return this.notifyOfPropertyEdit("nonEmpty");
      });
    });
  }

  async setFilterParentAggregates(value: boolean): Promise<void> {
    return this.initCheckpoint().then(async () => {
      return this.notifyOfPendingPropertyEdit("filterParentAggregates").then(async () => {
        const currentValue = this.filterParentAggregates;
        this.undoAction = (): Promise<void> => {
          return this.setFilterParentAggregates(currentValue);
        };
        this.query.filterParentAggregates = value;
        return this.notifyOfPropertyEdit("filterParentAggregates");
      });
    });
  }

  async setName(value: string): Promise<void> {
    return this.initCheckpoint().then(async () => {
      return this.notifyOfPendingPropertyEdit("name").then(async () => {
        const currentValue = this._name;
        this.undoAction = (): Promise<void> => {
          return this.setName(currentValue);
        };
        this._name = value;
        return this.notifyOfPropertyEdit("name");
      });
    });
  }

  async setDescription(value: string): Promise<void> {
    return this.initCheckpoint().then(async () => {
      return this.notifyOfPendingPropertyEdit("description").then(async () => {
        const currentValue = this._description;
        this.undoAction = (): Promise<void> => {
          return this.setDescription(currentValue);
        };
        this._description = value;
        return this.notifyOfPropertyEdit("description");
      });
    });
  }

  private initQueryComponentListListeners(): void {
    this.queryMeasuresListChangeEventListener = new QueryDirtyListListener((): Promise<void> => {
      const listClone = this.query.measures.clone();
      this.undoAction = async (): Promise<void> => {
        return this.query.measures.setFromList(listClone).then((_n: number): Promise<void> => {
          return Promise.resolve();
        });
      };
      return this.initCheckpoint().then(async () => {
        return this.notifyOfPendingPropertyEdit("query");
      });
    }, (): Promise<void> => {
      return this.notifyOfPropertyEdit("query");
    }, this._query.measures);
    this.queryLevelsListChangeEventListener = new QueryDirtyListListener(async (): Promise<void> => {
      const listClone = this.query.levels.clone();
      this.undoAction = async (): Promise<void> => {
        return this.query.levels.setFromList(listClone).then((_n: number): Promise<void> => {
          return Promise.resolve();
        });
      };
      return this.initCheckpoint().then(async () => {
        return this.notifyOfPendingPropertyEdit("query");
      });
    }, (): Promise<void> => {
      return this.notifyOfPropertyEdit("query");
    }, this._query.levels);
    this.queryFiltersListChangeEventListener = new QueryDirtyListListener((): Promise<void> => {
      const listClone = this.query.filters.clone();
      this.undoAction = async (): Promise<void> => {
        return this.query.filters.setFromList(listClone).then((_n: number): Promise<void> => {
          return Promise.resolve();
        });
      };
      return this.initCheckpoint().then(async () => {
        return this.notifyOfPendingPropertyEdit("query");
      });
    }, (): Promise<void> => {
      return this.notifyOfPropertyEdit("query");
    }, this._query.filters);
  }

  private initCheckpoint(): Promise<void> {
    if (!this.editCheckpoint) {
      // id is readonly, so by definition it cannot be edited, and so we don't need to manage it on the checkpoint, either
      this.editCheckpoint = new Analysis(this.dataset, this.name, null);
      this.editCheckpoint._description = this._description;
      this.editCheckpoint._query = this.query.clone();
      return this.notifyEditEventListeners(EditEvent.EDIT_BEGIN);
    }
    return Promise.resolve();
  }

  private async notifyOfPendingPropertyEdit(property: string): Promise<void> {
    const promises: Promise<void>[] = [];
    this.editEventListeners.forEach((listener: EditEventListener) => {
      promises.push(listener.notifyPendingPropertyEdit(new PropertyEditEvent(this, property)));
    });
    return Promise.all(promises).then();
  }

  private async notifyOfPropertyEdit(property: string): Promise<void> {
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
      this._description = this.editCheckpoint._description;
      this._name = this.editCheckpoint._name;
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
    this._query.filters.forEach((f: QueryFilter): void => {
      f.cancelEdits();
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
    this._query.filters.forEach((f: QueryFilter): void => {
      f.checkpointEdits();
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
  editCompleteCallback: () => Promise<void>;
  pendingEditCallback: () => Promise<void>;
  notifyEdit(_event: EditEvent): Promise<void> {
    return Promise.resolve();
  }
  notifyPendingPropertyEdit(_event: PropertyEditEvent): Promise<void> {
    return this.pendingEditCallback();
  }
  notifyPropertyEdit(_event: PropertyEditEvent): Promise<void> {
    return this.editCompleteCallback();
  }
}

class QueryDirtyListListener<T extends Editable> implements ListChangeEventListener {
  private pendingEditCallback: () => Promise<void>;
  private editCompleteCallback: () => Promise<void>;
  private targetList: List<T>;
  private queryDirtyEditEventListener: QueryDirtyEditEventListener;
  constructor(pendingEditCallback: () => Promise<void>, editCompleteCallback: () => Promise<void>, targetList: List<T>) {
    this.pendingEditCallback = pendingEditCallback;
    this.editCompleteCallback = editCompleteCallback;
    this.targetList = targetList;
    this.queryDirtyEditEventListener = new QueryDirtyEditEventListener();
    this.queryDirtyEditEventListener.pendingEditCallback = pendingEditCallback;
    this.queryDirtyEditEventListener.editCompleteCallback = editCompleteCallback;
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
