import { Dataset } from "./Dataset";
import { DropdownItem } from "../ui/model/Dropdown";
import { Observable } from "../util/Observable";
import { Identifiable, Serializable, PersistenceFactory } from "./Persistence";
import { Repository } from "./Repository";

/* eslint-disable @typescript-eslint/no-explicit-any */

class PersistentAnalysis implements Identifiable, Serializable {
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
}

class AnalysisPersistenceFactory implements PersistenceFactory<Analysis> {

  serialize(analysis: Analysis, _repository: Repository): any {
    return new PersistentAnalysis(analysis);
  }

  deserialize(o: any, repository: Repository): Analysis {
    let d: Dataset = null;
    repository.browseDatasets().forEach((dd: Dataset) => {
      if (dd.id === o.datasetRef.id && dd.name === o.datasetRef.cube) {
        d = dd;
      }
    });
    const ret = new Analysis(d, o.name);
    ret.description = o.description;
    return ret;
  }

}

export class Analysis implements DropdownItem, Identifiable, Serializable {

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

  getValue(): any {
    return this;
  }

  static readonly PERSISTENCE_FACTORY = new AnalysisPersistenceFactory();

}
