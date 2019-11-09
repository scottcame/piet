import { Dataset } from './Dataset';
import { Analysis } from './Analysis';
import { DropdownModel, DropdownItem } from '../ui/model/Dropdown';

export class Model {

  datasets: Dataset[];
  analyses: Analysis[];

  constructor() {
    this.datasets = [];
    this.analyses = [];
  }

  get analysesSelectModel(): DropdownModel {
    const ret = new DropdownModel();
    ret.items = this.analyses.map((analysis: Analysis, idx: number): DropdownItem => {
      const ret = new DropdownItem();
      ret.label = analysis.name;
      ret.value = idx;
      return ret;
    });
    return ret;
  }

}
