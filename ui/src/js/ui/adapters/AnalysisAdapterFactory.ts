import { List, ListChangeEvent, DefaultListChangeEventListener } from "../../collections/List";
import { Analysis } from "../../model/Analysis";
import { TableModel, TableRow } from "../model/Table";

export class AnalysisAdapterFactory {

  private static instance: AnalysisAdapterFactory;

  /* eslint-disable @typescript-eslint/no-empty-function */
  private constructor() {}

  static getInstance(): AnalysisAdapterFactory {
    if (!AnalysisAdapterFactory.instance) {
      AnalysisAdapterFactory.instance = new AnalysisAdapterFactory();
    }
    return AnalysisAdapterFactory.instance;
  }

  getTableModel(analyses: List<Analysis>, excludedAnalyses = new List<Analysis>()): TableModel<Analysis> {

    const rowList: List<TableRow<Analysis>> = new List();
    const columnHeaders = ["Name", "Description"];

    AnalysisAdapterFactory.mapAnalysesToRows(analyses, rowList, excludedAnalyses);

    analyses.addChangeEventListener(new DefaultListChangeEventListener((_event: ListChangeEvent): void => {
      AnalysisAdapterFactory.mapAnalysesToRows(analyses, rowList, excludedAnalyses);
    }));

    excludedAnalyses.addChangeEventListener(new DefaultListChangeEventListener((_event: ListChangeEvent): void => {
      AnalysisAdapterFactory.mapAnalysesToRows(analyses, rowList, excludedAnalyses);
    }));

    return new TableModel(rowList, columnHeaders);

  }

  private static mapAnalysesToRows(analyses: List<Analysis>, rowList: List<TableRow<Analysis>>, excludedAnalyses: List<Analysis>): void {
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
    rowList.set(newRows);
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
