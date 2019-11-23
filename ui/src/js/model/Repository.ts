import { Analysis } from "./Analysis";
import { Dataset } from "./Dataset";
import { List } from "../collections/List";
import Dexie from 'dexie';

import * as testDatasetMetadata from '../../../test/_data/test-metadata.json';
import * as testAnalyses from '../../../test/_data/test-analyses.json';
import { Serializable } from "./Persistence";
import { Workspace } from "./Workspace";

export class RepositoryQuery {
  query: string;
}

export interface Repository {
  readonly analyses: List<Analysis>;
  readonly workspace: Workspace;
  init(): void;
  browseDatasets(): List<Dataset>;
  browseAnalyses(): Promise<List<Analysis>>;
  searchAnalyses(query: RepositoryQuery): Promise<List<Analysis>>;
  saveAnalysis(analysis: Analysis): Promise<number>;
  deleteAnalysis(analysis: Analysis): Promise<number>;
}

class RepositoryDatabase extends Dexie {

  analyses: Dexie.Table<Serializable, number>;

  constructor() {
    super("PietLocalRepository");
    this.version(1).stores({
      analyses: '++id',
    });
  }

}

class WorkspaceDatabase extends Dexie {

  workspaces: Dexie.Table<Serializable, string>;
  private repository: Repository;

  constructor(repository: Repository) {
    super("PietWorkspace");
    this.repository = repository;
    this.version(1).stores({
      workspaces: 'name',
    });
  }

  start(sleep: number): void {
    setInterval(() => {
      //console.log("Auto-saving workspace");
      this.workspaces.put(Workspace.PERSISTENCE_FACTORY.serialize(this.repository.workspace, this.repository));
    }, sleep);
  }

}

export class LocalRepository implements Repository {

  private _workspace: Workspace;
  private datasets: List<Dataset>;
  readonly analyses: List<Analysis>;
  private db: RepositoryDatabase;
  private workspaceDb: WorkspaceDatabase;

  constructor() {
    this.db = new RepositoryDatabase();
    this.analyses = new List();
    this.datasets = new List();
    this._workspace = new Workspace();
    this.workspaceDb = new WorkspaceDatabase(this);
  }

  get workspace(): Workspace {
    return this._workspace;
  }

  async init(): Promise<void> {

    this.datasets.addAll(Dataset.loadFromMetadata(testDatasetMetadata, "http://localhost:58080/mondrian-rest/getMetadata?connectionName=test"));

    await Dexie.exists("PietWorkspace").then(async exists => {
      // this works for now because the datasets are statically populated. once that's no longer true, you'll have to wait until the repository is
      // initialized with them, so that when the analyses in the workspace are deserialized, the datasets are there.
      if (exists) {
        console.log("Restoring workspace from existing db");
        await this.workspaceDb.workspaces.toArray().then(workspaces => {
          const savedWorkspace = Workspace.PERSISTENCE_FACTORY.deserialize(workspaces[0], this);
          this._workspace.analyses.setFromList(savedWorkspace.analyses);
        });
      }
    });

    this.workspaceDb.start(10000);

    return new Promise((resolve, _reject) => {
      Dexie.exists("PietLocalRepository").then(exists => {
        if (!exists) {
          console.log("No Piet database found, creating and populating...");
          const promises: Promise<void>[] = testAnalyses.analyses.map((analysis: { datasetRef: {id: string; cube: string}; name: string; description: string }) => {
            let d: Dataset = null;
            this.datasets.forEach((dd: Dataset) => {
              if (dd.id === analysis.datasetRef.id && dd.name === analysis.datasetRef.cube) {
                d = dd;
              }
            });
            return new Promise((resolve, _reject) => {
              this.db.analyses.add(Analysis.PERSISTENCE_FACTORY.serialize(new Analysis(d, analysis.name), this));
              resolve();
            });
          });
          Promise.all(promises).then(_values => {
            resolve();
          });
        } else {
          console.log("Piet database exists, skipping population.");
          resolve();
        }
      });
    });

  }

  browseDatasets(): List<Dataset> {
    return this.datasets;
  }

  browseAnalyses(): Promise<List<Analysis>> {
    this.analyses.clear();
    const persistenceFactory = Analysis.PERSISTENCE_FACTORY;
    return new Promise((resolve, _reject) => {
      this.db.analyses.toArray().then(dbAnalyses => {
        const analyses: Analysis[] = dbAnalyses.map((dbAnalysis) => {
          return persistenceFactory.deserialize(dbAnalysis, this);
        });
        this.analyses.set(analyses);
        resolve(this.analyses);
      });
    });
  }

  saveAnalysis(analysis: Analysis): Promise<number> {
    return this.db.analyses.put(Analysis.PERSISTENCE_FACTORY.serialize(analysis, this));
  }

  searchAnalyses(_query: RepositoryQuery): Promise<List<Analysis>> {
    return this.browseAnalyses(); // for now, ignore the query string
  }

  deleteAnalysis(analysis: Analysis): Promise<number> {
    return new Promise((resolve, _reject) => {
      this.db.analyses.delete(analysis.id).then(() => {
        resolve(analysis.id);
      });
    });
  }

}
