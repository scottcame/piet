import { Analysis } from './Analysis';
import { List } from '../collections/List';

export class Workspace {

  readonly analyses: List<Analysis>;

  constructor() {
    this.analyses = new List<Analysis>();
  }

}
