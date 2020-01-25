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

import { Analysis } from './Analysis';
import { List, ListChangeEventListener, ListChangeEvent } from '../collections/List';
import { Serializable, EditEventListener, EditEvent, PropertyEditEvent } from './Persistence';
import { Repository } from './Repository';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class Workspace implements Serializable<Workspace> {

  readonly analyses: List<Analysis>;
  readonly name: string;
  private workspaceChangeListener: WorkspaceChangeListener;
  _autosaveChanges: boolean;

  constructor(repository: Repository, autosaveChanges = true) {
    this.analyses = new List<Analysis>();
    this.name = "Default";
    this.workspaceChangeListener = new WorkspaceChangeListener(repository);
    this.analyses.addChangeEventListener(this.workspaceChangeListener);
    this.autosaveChanges = autosaveChanges;
  }

  get autosaveChanges(): boolean {
    return this._autosaveChanges;
  }

  set autosaveChanges(value: boolean) {
    this._autosaveChanges = value;
    this.workspaceChangeListener.emitNotifications = value;
  }

  serialize(repository: Repository): any {
    const analyses = [];
    this.analyses.forEach((analysis: Analysis): void => {
      analyses.push(analysis.serialize(repository));
    });
    return {
      name: this.name,
      analyses: analyses
    };
  }

  async deserialize(o: any, repository: Repository): Promise<Workspace> {
    const ret = new Workspace(repository);
    ret.workspaceChangeListener.emitNotifications = false;
    const promises: Promise<Analysis>[] = [];
    o.analyses.forEach((analysis: any): void => {
      promises.push(new Analysis().deserialize(analysis, repository).then(analysis => {
        return ret.analyses.add(analysis);
      }));
    });
    return Promise.all(promises).then(() => {
      ret.workspaceChangeListener.emitNotifications = true;
      return Promise.resolve(ret);
    });
  }

}

class WorkspaceChangeListener implements ListChangeEventListener, EditEventListener {
  private readonly repository: Repository;
  emitNotifications: boolean;
  constructor(repository: Repository) {
    this.repository = repository;
    this.emitNotifications = true;
  }
  notifyEdit(_event: EditEvent): Promise<void> {
    if (this.emitNotifications) {
      return this.repository.saveWorkspace();
    }
    return Promise.resolve();
  }
  notifyPropertyEdit(_event: PropertyEditEvent): Promise<void> {
    if (this.emitNotifications) {
      return this.repository.saveWorkspace();
    }
    return Promise.resolve();
  }
  notifyPendingPropertyEdit(_event: PropertyEditEvent): Promise<void> {
    return Promise.resolve();
  }
  listChanged(_event: ListChangeEvent): Promise<void> {
    let ret = Promise.resolve();
    if (this.emitNotifications) {
      ret = this.repository.saveWorkspace();
    }
    this.repository.workspace.analyses.forEach((analysis: Analysis): void => {
      analysis.removeEditEventListener(this);
      analysis.addEditEventListener(this);
    });
    return ret;
  }
  listWillChange(_event: ListChangeEvent): Promise<void> {
    return Promise.resolve();
  }
}
