import { Dataset } from "./Dataset";

export class Analysis {

  dataset: Dataset;
  name: string;

  constructor(dataset: Dataset, name: string = null) {
    this.dataset = dataset;
    this.name = name;
  }

}
