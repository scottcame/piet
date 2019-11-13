import { Dataset } from "./Dataset";
import { DropdownItem } from "../ui/model/Dropdown";
import { Observable } from "../util/Observable";

export class Analysis implements DropdownItem {

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

}
