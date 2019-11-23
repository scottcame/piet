import { Analysis } from './Analysis';
import { List } from '../collections/List';
import { PersistenceFactory, Serializable } from './Persistence';
import { Repository } from './Repository';

/* eslint-disable @typescript-eslint/no-explicit-any */

class WorkspacePersistenceFactory implements PersistenceFactory<Workspace> {

  serialize(workspace: Workspace, repository: Repository): any {
    return new PersistentWorkspace(workspace, repository);
  }

  deserialize(o: any, repository: Repository): Workspace {
    const ret = new Workspace();
    o.analyses.forEach((analysis: any): void => {
      ret.analyses.add(Analysis.PERSISTENCE_FACTORY.deserialize(analysis, repository));
    });
    return ret;
  }

}

class PersistentWorkspace implements Serializable {
  readonly name: string;
  readonly analyses: Serializable[];
  constructor(workspace: Workspace, repository: Repository) {
    this.name = workspace.name;
    this.analyses = [];
    workspace.analyses.forEach((analysis: Analysis): void => {
      this.analyses.push(Analysis.PERSISTENCE_FACTORY.serialize(analysis, repository));
    });
  }
}

export class Workspace {

  readonly analyses: List<Analysis>;
  readonly name: string;

  constructor() {
    this.analyses = new List<Analysis>();
    this.name = "Default";
  }

  static readonly PERSISTENCE_FACTORY = new WorkspacePersistenceFactory();

}
