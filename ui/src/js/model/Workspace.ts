import { Analysis } from './Analysis';
import { List, ListChangeEventListener, ListChangeEvent } from '../collections/List';
import { Serializable, EditEventListener, EditEvent, PropertyEditEvent } from './Persistence';
import { Repository } from './Repository';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class Workspace implements Serializable<Workspace> {

  readonly analyses: List<Analysis>;
  readonly name: string;
  private workspaceChangeListener;

  constructor(repository: Repository) {
    this.analyses = new List<Analysis>();
    this.name = "Default";
    this.workspaceChangeListener = new WorkspaceChangeListener(repository);
    this.analyses.addChangeEventListener(this.workspaceChangeListener);
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

  deserialize(o: any, repository: Repository): Workspace {
    const ret = new Workspace(repository);
    ret.workspaceChangeListener.pauseNotifications = true;
    o.analyses.forEach((analysis: any): void => {
      ret.analyses.add(new Analysis().deserialize(analysis, repository));
    });
    ret.workspaceChangeListener.pauseNotifications = false;
    return ret;
  }

}

class WorkspaceChangeListener implements ListChangeEventListener, EditEventListener {
  private readonly repository: Repository;
  pauseNotifications: boolean;
  constructor(repository: Repository) {
    this.repository = repository;
    this.pauseNotifications = false;
  }
  notifyEdit(_event: EditEvent): Promise<void> {
    if (!this.pauseNotifications) {
      return this.repository.saveWorkspace();
    }
  }
  notifyPropertyEdit(_event: PropertyEditEvent): Promise<void> {
    if (!this.pauseNotifications) {
      return this.repository.saveWorkspace();
    }
  }
  listChanged(_event: ListChangeEvent): Promise<void> {
    let ret: Promise<void> = null;
    if (!this.pauseNotifications) {
      ret = this.repository.saveWorkspace();
    } else {
      ret = new Promise<void>(() => {});
    }
    this.repository.workspace.analyses.forEach((analysis: Analysis): void => {
      analysis.removeEditEventListener(this);
      analysis.addEditEventListener(this);
    });
    return ret;
  }
}
