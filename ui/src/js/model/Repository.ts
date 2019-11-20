import { Analysis } from "./Analysis";
import { Dataset } from "./Dataset";
import { List } from "../collections/List";
import Dexie from 'dexie';

import * as testDatasetMetadata from '../../../test/_data/test-metadata.json';
import * as testAnalyses from '../../../test/_data/test-analyses.json';
import { Serializable } from "./Persistence";

export class RepositoryQuery {
  query: string;
}

export interface Repository {
  readonly analyses: List<Analysis>;
  init(): void;
  browseDatasets(): List<Dataset>;
  browseAnalyses(): Promise<List<Analysis>>;
  searchAnalyses(query: RepositoryQuery): Promise<List<Analysis>>;
  saveAnalysis(analysis: Analysis): Promise<number>;
}

class RepositoryDatabase extends Dexie {

    analyses: Dexie.Table<Serializable, number>;

    constructor () {
      super("Piet");
      this.version(1).stores({
        analyses: '++id',
      });
    }

}

export class LocalRepository implements Repository {

  private datasets: List<Dataset>;
  readonly analyses: List<Analysis>;
  private db: RepositoryDatabase;

  constructor() {
    this.db = new RepositoryDatabase();
    this.analyses = new List();
    this.datasets = new List();
  }

  init(): Promise<void> {

    this.datasets.addAll(Dataset.loadFromMetadata(testDatasetMetadata, "http://localhost:58080/mondrian-rest/getMetadata?connectionName=test"));

    return new Promise((resolve, _reject) => {
      Dexie.exists("Piet").then(exists => {
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

}
