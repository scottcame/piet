import { Dataset } from './Dataset';
import { Analysis } from './Analysis';
import { List } from '../collections/List';

export class Model {

  datasets: List<Dataset>;
  readonly analyses: List<Analysis>;

  constructor() {
    this.datasets = new List<Dataset>();
    this.analyses = new List<Analysis>();
  }

}
