import { List, ListChangeEvent } from "../../collections/List";
import { Analysis } from "../../model/Analysis";
import { TableModel, TableRow } from "../model/Table";

export class AnalysisAdapterFactory {

  private static instance: AnalysisAdapterFactory;

  private constructor() {}

  static getInstance(): AnalysisAdapterFactory {
    if (!AnalysisAdapterFactory.instance) {
      AnalysisAdapterFactory.instance = new AnalysisAdapterFactory();
    }
    return AnalysisAdapterFactory.instance;
  }

  async getTableModel(analyses: List<Analysis>, excludedAnalyses = new List<Analysis>()): Promise<TableModel<Analysis>> {

    const rowList: List<TableRow<Analysis>> = new List();
    const columnHeaders = ["Name", "Description"];

    await AnalysisAdapterFactory.mapAnalysesToRows(analyses, rowList, excludedAnalyses);

    analyses.addChangeEventListener({
      listChanged(_event: ListChangeEvent): Promise<void> {
        return AnalysisAdapterFactory.mapAnalysesToRows(analyses, rowList, excludedAnalyses);
      },
      listWillChange(_event: ListChangeEvent): Promise<void> {
        return Promise.resolve();
      }
    });

    excludedAnalyses.addChangeEventListener({
      listChanged(_event: ListChangeEvent): Promise<void> {
        return AnalysisAdapterFactory.mapAnalysesToRows(analyses, rowList, excludedAnalyses);
      },
      listWillChange(_event: ListChangeEvent): Promise<void> {
        return Promise.resolve();
      }
    });

    return new TableModel(rowList, columnHeaders);

  }

  private static async mapAnalysesToRows(analyses: List<Analysis>, rowList: List<TableRow<Analysis>>, excludedAnalyses: List<Analysis>): Promise<void> {
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
    return rowList.set(newRows).then();
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
