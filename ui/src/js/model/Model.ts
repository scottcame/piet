import { Dataset } from './Dataset';
import { Analysis } from './Analysis';
import { List } from '../collections/List';
import { Observable } from '../util/Observable';

export class Model {

  datasets: Dataset[];
  readonly analyses: List<Analysis>;
  readonly analysisSelectedIndex: Observable<number>;

  constructor() {
    this.datasets = [];
    this.analyses = new List<Analysis>();
    this.analysisSelectedIndex = new Observable<number>();
  }

}
