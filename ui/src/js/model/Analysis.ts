import { Dataset } from "./Dataset";
import { DropdownItem } from "../ui/model/Dropdown";

export class Analysis implements DropdownItem {

  dataset: Dataset;
  name: string;

  constructor(dataset: Dataset, name: string = null) {
    this.dataset = dataset;
    this.name = name;
  }

  /*
    Unresolved philosophical issue: should we create an adapter for Analysis objects? Would be cleaner,
    but would also be a pain to keep in sync with the underlying pietModel. To be determined...
  */

  getLabel(): string {
    return this.name;
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  getValue(): any {
    return this;
  }

}
