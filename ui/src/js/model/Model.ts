import { Dataset } from './Dataset';
import { Analysis } from './Analysis';

export class Model {

  datasets: Dataset[];
  analyses: Analysis[];

  constructor() {
    this.datasets = [];
    this.analyses = [];
  }

}
