import { Analysis } from "./Analysis";
import { Dataset } from "./Dataset";
import { Workspace } from "./Workspace";
import Dexie from 'dexie';

import * as testDatasetMetadata from '../../../test/_data/test-metadata.json';
import * as testAnalyses from '../../../test/_data/test-analyses.json';
import { MondrianResult } from "./MondrianResult";

import * as testResult1m1r0c from '../../../test/_data/mondrian-results-1m1r0c.json';
import * as testResult2m1r2c from '../../../test/_data/mondrian-results-2m1r2c.json';
import * as testResult2m2r1c from '../../../test/_data/mondrian-results-2m2r1c.json';
import * as testResult2m2r2c from '../../../test/_data/mondrian-results-2m2r2c.json';
import * as testResult1m0r1c from '../../../test/_data/mondrian-results-1m0r1c.json';
import { ConfigurationProperties } from "../../ConfigurationProperties";


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
  saveAnalysis(analysis: Analysis): Promise<string>;
  deleteAnalysis(analysis: Analysis): Promise<string>;
  saveWorkspace(): Promise<void>;
  clearWorkspace(): Promise<void>;
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

  async clearWorkspace(): Promise<void> {
    return this.workspaceDb.workspaces.toCollection().delete().then(() => {
      this.workspace.analyses.clear();
    });
  }

  abstract browseDatasets(): Promise<Dataset[]>;
  abstract browseAnalyses(): Promise<Analysis[]>;
  abstract searchAnalyses(query: RepositoryQuery): Promise<Analysis[]>;
  abstract saveAnalysis(analysis: Analysis): Promise<string>;
  abstract deleteAnalysis(analysis: Analysis): Promise<string>;
  abstract executeQuery(mdx: string, dataset: Dataset): Promise<MondrianResult>;

}

export class LocalRepository extends AbstractBaseRepository implements Repository {

  private datasets: Dataset[];
  private db: RepositoryDatabase;

  simulateBrowseDatasetsError = false;
  simulateQueryExecutionError = false;

  constructor() {
    super();
    this.db = new RepositoryDatabase();
  }

  async init(): Promise<void> {

    return super.init().then(async () => {
      return this.browseDatasets().then(async () => {
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
    }).catch((reason) => {
      return Promise.reject(reason);
    });

  }

  // this refresh method would not exist on a real repository; it is just here to support easily restoring the repo
  // to a known good state for unit testing and demos

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

  wipeDatasetsForTesting(): void {
    this.datasets = [];
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
    if (this.simulateBrowseDatasetsError) {
      console.log("Simulating browseDatasets error");
      return Promise.reject("Local Repository simulated browseDatasets error");
    }
    const fakeDelay = ConfigurationProperties.LOCAL_REPOSITORY_DATASETS_DELAY; // use this to simulate mondrian-rest taking awhile to return dataset metadata
    let ret = Promise.resolve(this.datasets);
    if (!this.datasets) {
      ret = new Promise((resolve) => {
        console.log("Populating datasets (simulated delay of " + fakeDelay + " ms)...");
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
        dbAnalysis.id = "" + dbAnalysis.id;
        promises.push(new Analysis().deserialize(dbAnalysis, this));
      });
      return Promise.all(promises);
    });
  }

  async saveAnalysis(analysis: Analysis): Promise<string> {
    const dbAnalysis = analysis.serialize(this);
    if (dbAnalysis.id) {
      dbAnalysis.id = Number.parseInt(dbAnalysis.id);
    }
    return this.db.analyses.put(dbAnalysis).then((id: number) => {
      return Promise.resolve("" + id);
    });
  }

  async searchAnalyses(_query: RepositoryQuery): Promise<Analysis[]> {
    return this.browseAnalyses(); // for now, ignore the query string
  }

  async deleteAnalysis(analysis: Analysis): Promise<string> {
    const id: number = Number.parseInt(analysis.id);
    return this.db.analyses.delete(id).then(() => {
      return analysis.id;
    });
  }

  async executeQuery(mdx: string, _dataset: Dataset): Promise<MondrianResult> {
    if (this.simulateQueryExecutionError) {
      console.log("Simulating executeQuery error");
      return Promise.reject("Local Repository simulated executeQuery error");
    }
    console.log(mdx ? mdx : "[Query.asMDX() returned null, indicating unexecutable query]");
    let ret: MondrianResult = null;
    if (/F1_M1/.test(mdx)) {
      ret = MondrianResult.fromJSON(testResult1m1r0c);
    } else if (/F2_M1/.test(mdx)) {
      ret = MondrianResult.fromJSON(testResult2m1r2c);
    } else if (/F3_M1/.test(mdx)) {
      ret = MondrianResult.fromJSON(testResult2m2r1c);
    } else if (/F3_M2/.test(mdx)) {
      ret = MondrianResult.fromJSON(testResult2m2r2c);
    } else if (/F3_M3/.test(mdx)) {
      ret = MondrianResult.fromJSON(testResult1m0r1c);
    }
    return Promise.resolve(ret);
  }

}

export class RemoteRepository extends AbstractBaseRepository {

  private mondrianRestUrl: string;
  private remoteRepositoryUrl: string;
  private datasets: Dataset[];
  private inflightBrowseDatasetsPromise: Promise<Dataset[]> = null;

  constructor(mondrianRestUrl: string, remoteRepositoryUrl: string) {
    super();
    this.mondrianRestUrl = mondrianRestUrl;
    this.remoteRepositoryUrl = remoteRepositoryUrl;
  }

  async init(): Promise<void> {
    return super.init().then(async () => {
      return this.browseDatasets().then(async (_ds) => {
        return Promise.resolve();
      });
    }).catch((reason) => {
      return Promise.reject(reason);
    });
  }

  async browseDatasets(): Promise<Dataset[]> {
    let ret = Promise.resolve(this.datasets);
    if (!this.datasets) {
      if (this.inflightBrowseDatasetsPromise) {
        ret = this.inflightBrowseDatasetsPromise;
      } else {
        ret = fetch(this.mondrianRestUrl + "/getConnections").then(async (response: Response) => {
          if (!response.ok) {
            return Promise.reject("Analytics server appears to be unavailable; please contact an administrator.");
          }
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
              this.datasets = [];
              value.forEach((connectionDatasets: Dataset[]): void => {
                this.datasets = this.datasets.concat(connectionDatasets);
              });
              return Promise.resolve(this.datasets);
            });
          });
        });
        this.inflightBrowseDatasetsPromise = ret;
      }
    }
    return ret;
  }

  async browseAnalyses(): Promise<Analysis[]> {
    return fetch(this.remoteRepositoryUrl + "/analyses", {
      method: "GET"
    }).then(async (response: Response) => {
      return response.json().then(async (json: any): Promise<any> => {
        const promises: Promise<Analysis>[] = [];
        json.forEach((dbAnalysis: any): void => {
          promises.push(new Analysis().deserialize(dbAnalysis, this));
        });
        return Promise.all(promises);
      });
    });
  }

  searchAnalyses(_query: RepositoryQuery): Promise<Analysis[]> {
    return this.browseAnalyses();
  }

  async saveAnalysis(analysis: Analysis): Promise<string> {
    const dbAnalysis = analysis.serialize(this);
    return fetch(this.remoteRepositoryUrl + "/analysis", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dbAnalysis)
    }).then(async (response: Response) => {
      return response.json().then(async (json: any): Promise<string> => {
        return Promise.resolve(json.id);
      });
    });
  }

  async deleteAnalysis(analysis: Analysis): Promise<string> {
    return fetch(this.remoteRepositoryUrl + "/analysis/" + analysis.id, {
      method: "DELETE"
    }).then(async (_response: Response) => {
      return Promise.resolve(analysis.id);
    });
  }
  
  async executeQuery(mdx: string, dataset: Dataset): Promise<MondrianResult> {
    let ret = Promise.resolve(null);
    if (mdx) {
      ret = fetch(this.mondrianRestUrl + "/query", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          connectionName: dataset.connectionName,
          query: mdx
        })
      }).then(async (response: Response) => {
        if (!response.ok) {
          return Promise.reject("Analytics server appears to be unavailable; please contact an administrator.");
        }
        return response.json().then(async (json: any): Promise<any> => {
          return Promise.resolve(MondrianResult.fromJSON(json));
        });
      });
    }
    return ret;
  }

}