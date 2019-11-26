import { Analysis } from './Analysis';
import { List, ListChangeEventListener, ListChangeEvent } from '../collections/List';
import { Serializable, EditEventListener, EditEvent, PropertyEditEvent } from './Persistence';
import { Repository } from './Repository';

/* eslint-disable @typescript-eslint/no-explicit-any */

export class Workspace implements Serializable<Workspace> {

  readonly analyses: List<Analysis>;
  readonly name: string;

  constructor(repository: Repository) {
    this.analyses = new List<Analysis>();
    this.name = "Default";
    this.analyses.addChangeEventListener(new WorkspaceChangeListener(repository));
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
    o.analyses.forEach((analysis: any): void => {
      ret.analyses.add(new Analysis().deserialize(analysis, repository));
    });
    return ret;
  }

}

class WorkspaceChangeListener implements ListChangeEventListener, EditEventListener {
  private readonly repository: Repository;
  constructor(repository: Repository) {
    this.repository = repository;
  }
  notifyEdit(_event: EditEvent): void {
    this.repository.saveWorkspace();
  }
  notifyPropertyEdit(_event: PropertyEditEvent): void {
    this.repository.saveWorkspace();
  }
  listChanged(_event: ListChangeEvent): void {
    this.repository.saveWorkspace();
    this.repository.workspace.analyses.forEach((analysis: Analysis): void => {
      analysis.removeEditEventListener(this);
      analysis.addEditEventListener(this);
    });
  }
}
