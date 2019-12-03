import { Analysis } from "./Analysis";
import { Dataset } from "./Dataset";
import { List } from "../collections/List";
import { Workspace } from "./Workspace";
import Dexie from 'dexie';

import * as testDatasetMetadata from '../../../test/_data/test-metadata.json';
import * as testAnalyses from '../../../test/_data/test-analyses.json';

const LOCAL_REPOSITORY_INDEXEDDB_NAME = "PietLocalRepository";
const WORKSPACE_INDEXEDDB_NAME = "PietWorkspace";

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
  saveWorkspace(): Promise<void>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

class RepositoryDatabase extends Dexie {

  analyses: Dexie.Table<any, number>;

  constructor() {
    super(LOCAL_REPOSITORY_INDEXEDDB_NAME);
    this.version(1).stores({
      analyses: '++id',
    });
  }

}

class WorkspaceDatabase extends Dexie {

  workspaces: Dexie.Table<any, string>;

  constructor() {
    super(WORKSPACE_INDEXEDDB_NAME);
    this.version(1).stores({
      workspaces: 'name',
    });
  }

}

export class LocalRepository implements Repository {

  // todo: once we create an actual rest repository, factor out the workspace persistence stuff that is always persisting to indexeddb

  private readonly _workspace: Workspace;
  private readonly datasets: List<Dataset>;
  private readonly _analyses: List<Analysis>;
  private db: RepositoryDatabase;
  private workspaceDb: WorkspaceDatabase;

  constructor() {
    this.db = new RepositoryDatabase();
    this._analyses = new List();
    this.datasets = new List();
    this._workspace = new Workspace(this);
    this.workspaceDb = new WorkspaceDatabase();
  }

  get workspace(): Workspace {
    return this._workspace;
  }

  get analyses(): List<Analysis> {
    return this._analyses;
  }

  async saveWorkspace(): Promise<void> {
    return this.workspaceDb.workspaces.put(this.workspace.serialize(this)).then(() => {
      console.log("Saved workspace");
    });
  }

  async init(): Promise<void> {

    this.datasets.addAll(Dataset.loadFromMetadata(testDatasetMetadata, "http://localhost:58080/mondrian-rest/getMetadata?connectionName=test"));

    await Dexie.exists(WORKSPACE_INDEXEDDB_NAME).then(async exists => {
      // this works for now because the datasets are statically populated. once that's no longer true, you'll have to wait until the repository is
      // initialized with them, so that when the analyses in the workspace are deserialized, the datasets are there.
      if (exists) {
        console.log("Restoring workspace...");
        await this.workspaceDb.workspaces.toArray().then(workspaces => {
          if (workspaces[0]) {
            const savedWorkspace = new Workspace(this, false).deserialize(workspaces[0], this);
            console.log("...restored " + savedWorkspace.analyses.length + " analyses");
            this._workspace.autosaveChanges = false;
            this._workspace.analyses.setFromList(savedWorkspace.analyses);
            this._workspace.autosaveChanges = true;
          }
        });
      }
    });

    return new Promise((resolve, _reject) => {
      Dexie.exists(LOCAL_REPOSITORY_INDEXEDDB_NAME).then(exists => {
        if (!exists) {
          console.log("No Piet database found, creating and populating...");
          this.refreshDatabase().then(() => {
            resolve();
          });
        } else {
          console.log("Piet database exists, skipping population.");
          resolve();
        }
      });
    });

  }

  // these refresh methods would not exist on a real repository; they are just here to support easily restoring the repo
  // to a known good state for unit testing and demos

  async refreshWorkspace(): Promise<void> {
    return this.workspaceDb.workspaces.toCollection().delete().then(() => {
      this.workspace.analyses.clear();
    });
  }

  async refreshDatabase(): Promise<void> {
    return this.workspaceDb.workspaces.toCollection().delete().then(() => {
      return this.db.analyses.toCollection().delete().then((): Promise<void> => {
        const promises: Promise<void>[] = testAnalyses.analyses.map(async (analysis: { datasetRef: {id: string; cube: string}; name: string; description: string }) => {
          let d: Dataset = null;
          this.datasets.forEach((dd: Dataset) => {
            if (dd.id === analysis.datasetRef.id && dd.name === analysis.datasetRef.cube) {
              d = dd;
            }
          });
          const newAnalysis = new Analysis(d, analysis.name).serialize(this);
          return this.db.analyses.add(newAnalysis).then(_number => {});
        });
        return Promise.all(promises).then();
      });
    });
  }

  async getPersistedWorkspace(): Promise<Workspace> {
    return this.workspaceDb.workspaces.toArray().then(workspaces => {
      if (workspaces[0]) {
        return new Workspace(this).deserialize(workspaces[0], this);
      } else {
        return null;
      }
    });
  }

  browseDatasets(): List<Dataset> {
    return this.datasets;
  }

  async browseAnalyses(): Promise<List<Analysis>> {
    this._analyses.clear();
    return this.db.analyses.toArray().then(dbAnalyses => {
      const analyses: Analysis[] = dbAnalyses.map((dbAnalysis) => {
        return new Analysis().deserialize(dbAnalysis, this);
      });
      this._analyses.set(analyses);
      return this._analyses;
    });
  }

  async saveAnalysis(analysis: Analysis): Promise<number> {
    return this.db.analyses.put(analysis.serialize(this));
  }

  async searchAnalyses(_query: RepositoryQuery): Promise<List<Analysis>> {
    return this.browseAnalyses(); // for now, ignore the query string
  }

  async deleteAnalysis(analysis: Analysis): Promise<number> {
    return this.db.analyses.delete(analysis.id).then(() => {
      return analysis.id;
    });
  }

}
