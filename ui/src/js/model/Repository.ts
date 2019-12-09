import { Analysis } from "./Analysis";
import { Dataset } from "./Dataset";
import { List } from "../collections/List";
import { Workspace } from "./Workspace";
import Dexie from 'dexie';

import * as testDatasetMetadata from '../../../test/_data/test-metadata.json';
import * as testAnalyses from '../../../test/_data/test-analyses.json';
import { MondrianResult } from "./MondrianResult";

const LOCAL_REPOSITORY_INDEXEDDB_NAME = "PietLocalRepository";
const WORKSPACE_INDEXEDDB_NAME = "PietWorkspace";

export class RepositoryQuery {
  query: string;
}

export interface Repository {
  readonly analyses: List<Analysis>;
  readonly workspace: Workspace;
  init(): Promise<void>;
  browseDatasets(): List<Dataset>;
  browseAnalyses(): Promise<List<Analysis>>;
  searchAnalyses(query: RepositoryQuery): Promise<List<Analysis>>;
  saveAnalysis(analysis: Analysis): Promise<number>;
  deleteAnalysis(analysis: Analysis): Promise<number>;
  saveWorkspace(): Promise<void>;
  executeQuery(mdx: string): Promise<MondrianResult>;
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

export abstract class AbstractBaseRepository implements Repository {

  protected workspaceDb: WorkspaceDatabase;
  private readonly _workspace: Workspace;

  constructor() {
    this.workspaceDb = new WorkspaceDatabase();
    this._workspace = new Workspace(this);
  }

  get workspace(): Workspace {
    return this._workspace;
  }

  async init(): Promise<void> {
    return Dexie.exists(WORKSPACE_INDEXEDDB_NAME).then(async exists => {
      let ret = Promise.resolve();
      if (exists) {
        console.log("Restoring workspace...");
        ret = this.workspaceDb.workspaces.toArray().then(async workspaces => {
          if (workspaces[0]) {
            const savedWorkspace = await new Workspace(this, false).deserialize(workspaces[0], this);
            console.log("...restored " + savedWorkspace.analyses.length + " analyses");
            this._workspace.autosaveChanges = false;
            this._workspace.analyses.setFromList(savedWorkspace.analyses);
            this._workspace.autosaveChanges = true;
          }
        });
      }
      return ret;
    });
  }

  async saveWorkspace(): Promise<void> {
    return this.workspaceDb.workspaces.put(this.workspace.serialize(this)).then(() => {
      console.log("Saved workspace");
    });
  }

  abstract get analyses(): List<Analysis>;
  abstract browseDatasets(): List<Dataset> ;
  abstract browseAnalyses(): Promise<List<Analysis>>;
  abstract searchAnalyses(query: RepositoryQuery): Promise<List<Analysis>>;
  abstract saveAnalysis(analysis: Analysis): Promise<number>;
  abstract deleteAnalysis(analysis: Analysis): Promise<number>;
  abstract executeQuery(mdx: string): Promise<MondrianResult>;

}

export class LocalRepository extends AbstractBaseRepository implements Repository {

  // todo: once we create an actual rest repository, factor out the workspace persistence stuff that is always persisting to indexeddb

  private readonly datasets: List<Dataset>;
  private readonly _analyses: List<Analysis>;
  private db: RepositoryDatabase;

  constructor() {
    super();
    this.db = new RepositoryDatabase();
    this._analyses = new List();
    this.datasets = new List();
  }

  get analyses(): List<Analysis> {
    return this._analyses;
  }

  async init(): Promise<void> {

    // this works for now because the datasets are statically populated. once that's no longer true, you'll have to wait until the repository is
    // initialized with them, so that when the analyses in the workspace are deserialized, the datasets are there.

    this.datasets.addAll(Dataset.loadFromMetadata(testDatasetMetadata, "http://localhost:58080/mondrian-rest/getMetadata?connectionName=test"));

    return super.init().then(() => {
      return Dexie.exists(LOCAL_REPOSITORY_INDEXEDDB_NAME).then(exists => {
        if (!exists) {
          console.log("No Piet database found, creating and populating...");
          return this.refreshDatabase();
        } else {
          console.log("Piet database exists, skipping population.");
          return Promise.resolve();
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
    await this._analyses.clear();
    return this.db.analyses.toArray().then(async dbAnalyses => {
      const promises: Promise<Analysis>[] = [];
      dbAnalyses.forEach(dbAnalysis => {
        promises.push(new Analysis().deserialize(dbAnalysis, this));
      });
      return Promise.all(promises).then(analyses => {
        return this._analyses.set(analyses).then(() => {
          return this._analyses;
        });
      });
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

  async executeQuery(mdx: string): Promise<MondrianResult> {
    console.log(mdx ? mdx : "[Query.asMDX() returned null, indicating unexecutable query]");
    return Promise.resolve(null);
  }

}
