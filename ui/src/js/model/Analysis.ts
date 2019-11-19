import { Dataset } from "./Dataset";
import { DropdownItem } from "../ui/model/Dropdown";
import { Observable } from "../util/Observable";
import { Identifiable, PersistenceFactory, Ravelable } from "./Persistence";
import { Repository } from "./Repository";

class PersistentAnalysis implements Identifiable, Ravelable<Analysis> {
  id: number;
  datasetRef: {id: string; cube: string};
  name: string;
  description: string;
  constructor(analysis: Analysis) {
    if (analysis.id) {
      this.id = analysis.id;
    }
    this.datasetRef = {
      id: analysis.dataset.id,
      cube: analysis.dataset.name
    };
    this.name = analysis.name.value;
    this.description = analysis.description;
  }
  unravel(repository: Repository): Analysis {
    let d: Dataset = null;
    repository.browseDatasets().forEach((dd: Dataset) => {
      if (dd.id === this.datasetRef.id && dd.name === this.datasetRef.cube) {
        d = dd;
      }
    });
    /* eslint-disable @typescript-eslint/no-use-before-define */
    const ret = new Analysis(d, this.name);
    ret.description = this.description;
    return ret;
  }
}

class AnalysisPersistenceFactory implements PersistenceFactory<Analysis> {

  ravel(analysis: Analysis): Ravelable<Analysis> {
    return new PersistentAnalysis(analysis);
  }

  unravel(o: any, repository: Repository): Analysis {
    let d: Dataset = null;
    repository.browseDatasets().forEach((dd: Dataset) => {
      if (dd.id === o.datasetRef.id && dd.name === o.datasetRef.cube) {
        d = dd;
      }
    });
    /* eslint-disable @typescript-eslint/no-use-before-define */
    const ret = new Analysis(d, o.name);
    ret.description = o.description;
    return ret;
  }

}

export class Analysis implements DropdownItem, Identifiable {

  readonly id: number;
  dataset: Dataset;
  name: Observable<string>;
  description: string = null;

  constructor(dataset: Dataset, name: string = null) {
    this.dataset = dataset;
    this.name = new Observable();
    this.name.value = name;
  }

  /*
    Unresolved philosophical issue: should we create an adapter for Analysis objects? Would be cleaner,
    but would also be a pain to keep in sync with the underlying pietModel. To be determined...
  */

  getLabel(): Observable<string> {
    return this.name;
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  getValue(): any {
    return this;
  }

  static readonly PERSISTENCE_FACTORY = new AnalysisPersistenceFactory();

}
