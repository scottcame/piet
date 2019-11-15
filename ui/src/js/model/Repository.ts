import { Analysis } from "./Analysis";
import { Dataset } from "./Dataset";
import { List } from "../collections/List";

import * as testDatasetMetadata from '../../../test/_data/test-metadata.json';
import * as testAnalyses from '../../../test/_data/test-analyses.json';

export class RepositoryQuery {
  query: string;
}

export interface Repository {
  browseDatasets(): List<Dataset>;
  browseAnalyses(): List<Analysis>;
  searchAnalyses(query: RepositoryQuery): List<Analysis>;
}

export class LocalRepository implements Repository {

  private datasets: List<Dataset>;
  private analyses: List<Analysis>;

  /* eslint-disable @typescript-eslint/no-empty-function */
  private constructor() {
  }

  static loadFromTestMetadata(): LocalRepository {

    const ret: LocalRepository = new LocalRepository();

    ret.datasets = new List<Dataset>();
    ret.datasets.addAll(Dataset.loadFromMetadata(testDatasetMetadata, "http://localhost:58080/mondrian-rest/getMetadata?connectionName=test"));

    ret.analyses = new List<Analysis>();

    /* eslint-disable @typescript-eslint/no-explicit-any */
    testAnalyses.analyses.forEach((analysis: any) => {
      let d: Dataset = null;
      ret.datasets.forEach((dd: Dataset) => {
        if (dd.id === analysis.datasetRef.id && dd.name === analysis.datasetRef.cube) {
          d = dd;
        }
      });
      if (!d) {
        throw Error("No dataset found in test metadata for id " + analysis.datasetRef.id + " and cube " + analysis.datasetRef.cube);
      }
      ret.analyses.add(new Analysis(d, analysis.name));
    });

    return ret;

  }

  browseDatasets(): List<Dataset> {
    return this.datasets;
  }

  browseAnalyses(): List<Analysis> {
    return this.analyses;
  }

  searchAnalyses(_query: RepositoryQuery): List<Analysis> {
    return this.browseAnalyses(); // for now, ignore the query string
  }

}
