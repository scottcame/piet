import { Dataset } from './Dataset';
import { Analysis } from './Analysis';
import { List } from '../collections/List';

export class Model {

  datasets: Dataset[];
  readonly analyses: List<Analysis>;

  constructor() {
    this.datasets = [];
    this.analyses = new List<Analysis>();
  }

}
