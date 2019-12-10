import { List } from "../../collections/List";
import { Analysis } from "../../model/Analysis";
import { TableRow } from "../model/Table";

export class AnalysisAdapterFactory {

  static COLUMN_LABELS = ["Name", "Description"];

  private static instance: AnalysisAdapterFactory;

  private constructor() {}

  static getInstance(): AnalysisAdapterFactory {
    if (!AnalysisAdapterFactory.instance) {
      AnalysisAdapterFactory.instance = new AnalysisAdapterFactory();
    }
    return AnalysisAdapterFactory.instance;
  }

  getAnalysesRowList(analyses: Analysis[], excludedAnalyses = new List<Analysis>()): TableRow<Analysis>[] {
    const newRows: TableRow<Analysis>[] = [];
    analyses.filter((item: Analysis): boolean => {
      let ret = true;
      excludedAnalyses.forEach((excludedItem: Analysis): void => {
        ret = ret && item.id !== excludedItem.id;
      });
      return ret;
    }).forEach((analysis: Analysis) => {
      newRows.push(new AnalysisTableRow(analysis));
    });
    return newRows;
  }

}

class AnalysisTableRow implements TableRow<Analysis> {
  private analysis: Analysis;
  constructor(analysis: Analysis) {
    this.analysis = analysis;
  }
  getValueAt(columnIndex: number): string {
    return [this.analysis.name, this.analysis.description][columnIndex];
  }
  getItem(): Analysis {
    return this.analysis;
  }
}
