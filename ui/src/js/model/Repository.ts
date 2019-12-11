import { Analysis } from "./Analysis";
import { Dataset } from "./Dataset";
import { Workspace } from "./Workspace";
import Dexie from 'dexie';

import * as testDatasetMetadata from '../../../test/_data/test-metadata.json';
import * as testAnalyses from '../../../test/_data/test-analyses.json';
import { MondrianResult } from "./MondrianResult";

import * as testResult2m1r1c from '../../../test/_data/mondrian-results-2m1r1c.json';
import * as testResult2m1r2c from '../../../test/_data/mondrian-results-2m1r2c.json';
import * as testResult2m2r1c from '../../../test/_data/mondrian-results-2m2r1c.json';
import * as testResult2m2r2c from '../../../test/_data/mondrian-results-2m2r2c.json';
import * as testResult1m0r0c from '../../../test/_data/mondrian-results-1m0r0c.json';


const LOCAL_REPOSITORY_INDEXEDDB_NAME = "PietLocalRepository";
const WORKSPACE_INDEXEDDB_NAME = "PietWorkspace";

export class RepositoryQuery {
  query: string;
}

export interface Repository {
  readonly workspace: Workspace;
  init(): Promise<void>;
  browseDatasets(): Promise<Dataset[]>;
  browseAnalyses(): Promise<Analysis[]>;
  searchAnalyses(query: RepositoryQuery): Promise<Analysis[]>;
  saveAnalysis(analysis: Analysis): Promise<number>;
  deleteAnalysis(analysis: Analysis): Promise<number>;
  saveWorkspace(): Promise<void>;
  executeQuery(mdx: string, dataset: Dataset): Promise<MondrianResult>;
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

  abstract browseDatasets(): Promise<Dataset[]>;
  abstract browseAnalyses(): Promise<Analysis[]>;
  abstract searchAnalyses(query: RepositoryQuery): Promise<Analysis[]>;
  abstract saveAnalysis(analysis: Analysis): Promise<number>;
  abstract deleteAnalysis(analysis: Analysis): Promise<number>;
  abstract executeQuery(mdx: string, dataset: Dataset): Promise<MondrianResult>;

}

export class LocalRepository extends AbstractBaseRepository implements Repository {

  // todo: once we create an actual rest repository, factor out the workspace persistence stuff that is always persisting to indexeddb

  private datasets: Dataset[];
  private db: RepositoryDatabase;

  constructor() {
    super();
    this.db = new RepositoryDatabase();
  }

  async init(): Promise<void> {

    // this works for now because the datasets are statically populated. once that's no longer true, you'll have to wait until the repository is
    // initialized with them, so that when the analyses in the workspace are deserialized, the datasets are there.

    return super.init().then(async () => {

      return Dexie.exists(LOCAL_REPOSITORY_INDEXEDDB_NAME).then(async exists => {
        let ret = Promise.resolve();
        if (!exists) {
          console.log("No Piet database found, creating and populating...");
          ret = this.refreshDatabase();
        } else {
          console.log("Piet database exists, skipping population.");
        }
        return ret;
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

  async browseDatasets(): Promise<Dataset[]> {
    const fakeDelay = 0; // use this to simulate mondrian-rest taking awhile to return dataset metadata
    let ret = Promise.resolve(this.datasets);
    if (!this.datasets) {
      ret = new Promise((resolve) => {
        console.log("Populating datasets...");
        setTimeout(() => {
          this.datasets = Dataset.loadFromMetadata(testDatasetMetadata, "http://localhost:58080/mondrian-rest/getMetadata?connectionName=test");
          console.log("Datasets populated");
          resolve(this.datasets);
        }, fakeDelay);
      });
    } else {
      console.log("Returning cached datasets");
    }
    return ret;
  }

  async browseAnalyses(): Promise<Analysis[]> {
    return this.db.analyses.toArray().then(async dbAnalyses => {
      const promises: Promise<Analysis>[] = [];
      dbAnalyses.forEach(dbAnalysis => {
        promises.push(new Analysis().deserialize(dbAnalysis, this));
      });
      return Promise.all(promises);
    });
  }

  async saveAnalysis(analysis: Analysis): Promise<number> {
    return this.db.analyses.put(analysis.serialize(this));
  }

  async searchAnalyses(_query: RepositoryQuery): Promise<Analysis[]> {
    return this.browseAnalyses(); // for now, ignore the query string
  }

  async deleteAnalysis(analysis: Analysis): Promise<number> {
    return this.db.analyses.delete(analysis.id).then(() => {
      return analysis.id;
    });
  }

  async executeQuery(mdx: string, _dataset: Dataset): Promise<MondrianResult> {
    console.log(mdx ? mdx : "[Query.asMDX() returned null, indicating unexecutable query]");
    let ret: MondrianResult = null;
    if (/F1_M1/.test(mdx)) {
      ret = MondrianResult.fromJSON(testResult2m1r1c);
    } else if (/F2_M1/.test(mdx)) {
      ret = MondrianResult.fromJSON(testResult2m1r2c);
    } else if (/F3_M1/.test(mdx)) {
      ret = MondrianResult.fromJSON(testResult2m2r1c);
    } else if (/F3_M2/.test(mdx)) {
      ret = MondrianResult.fromJSON(testResult2m2r2c);
    } else if (/F3_M3/.test(mdx)) {
      ret = MondrianResult.fromJSON(testResult1m0r0c);
    }
    return Promise.resolve(ret);
  }

}

export class RemoteRepository extends AbstractBaseRepository {

  private mondrianRestUrl: string;
  private remoteRepositoryUrl: string;

  constructor(mondrianRestUrl: string, remoteRepositoryUrl: string) {
    super();
    this.mondrianRestUrl = mondrianRestUrl;
    this.remoteRepositoryUrl = remoteRepositoryUrl;
  }

  async init(): Promise<void> {
    return super.init();
  }

  async browseDatasets(): Promise<Dataset[]> {
    return fetch(this.mondrianRestUrl + "/getConnections").then(async (response: Response) => {
      return response.json().then(async (json: any): Promise<any> => {
        const promises: Promise<Dataset[]>[] = Object.getOwnPropertyNames(json).map(async (connectionName): Promise<Dataset[]> => {
          const metadataUrl = this.mondrianRestUrl + "/getMetadata?connectionName=" + connectionName;
          return fetch(metadataUrl).then(async (response: Response): Promise<any> => {
            return response.json().then(async (mdJson: any): Promise<any> => {
              return Promise.resolve(Dataset.loadFromMetadata(mdJson, metadataUrl));
            });
          });
        });
        return Promise.all(promises).then((value: Dataset[][]): Promise<Dataset[]> => {
          let ret: Dataset[] = [];
          value.forEach((connectionDatasets: Dataset[]): void => {
            ret = ret.concat(connectionDatasets);
          });
          return Promise.resolve(ret);
        });
      });
    });
  }

  browseAnalyses(): Promise<Analysis[]> {
    console.log("We don't yet retrieve analyses from the remote repo");
    return Promise.resolve([]);
  }

  searchAnalyses(_query: RepositoryQuery): Promise<Analysis[]> {
    return this.browseAnalyses();
  }

  saveAnalysis(_analysis: Analysis): Promise<number> {
    console.log("We don't yet save analyses to the remote repo");
    return Promise.resolve(0);
  }

  deleteAnalysis(_analysis: Analysis): Promise<number> {
    console.log("We don't yet delete analyses from the remote repo");
    return Promise.resolve(0);
  }
  
  async executeQuery(mdx: string, dataset: Dataset): Promise<MondrianResult> {
    return fetch(this.mondrianRestUrl + "/query", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        connectionName: dataset.connectionName,
        query: mdx
      })
    }).then(async (response: Response) => {
      return response.json().then(async (json: any): Promise<any> => {
        return Promise.resolve(MondrianResult.fromJSON(json));
      });
    });
  }

}