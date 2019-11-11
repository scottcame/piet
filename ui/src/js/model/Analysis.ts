import { Dataset } from "./Dataset";
import { DropdownItem } from "../ui/model/Dropdown";

export class Analysis implements DropdownItem {

  dataset: Dataset;
  name: string;

  constructor(dataset: Dataset, name: string = null) {
    this.dataset = dataset;
    this.name = name;
  }

  getLabel(): string {
    return this.name;
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  getValue(): any {
    return this;
  }

}
