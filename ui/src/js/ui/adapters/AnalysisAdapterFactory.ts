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

  getTableModel(analyses: List<Analysis>): TableModel {

    const rowList: List<TableRow> = new List();
    const columnHeaders = ["Name", "Description"];

    AnalysisAdapterFactory.mapAnalysesToRows(analyses, rowList);

    analyses.addChangeEventListener(new DefaultListChangeEventListener((_event: ListChangeEvent): void => {
      AnalysisAdapterFactory.mapAnalysesToRows(analyses, rowList);
    }));

    return new TableModel(rowList, columnHeaders);

  }

  private static mapAnalysesToRows(analyses: List<Analysis>, rowList: List<TableRow>): void {
    const newRows: TableRow[] = [];
    analyses.forEach((analysis: Analysis) => {
      newRows.push({
        getValueAt(index: number): string {
          return [analysis.name.value, analysis.description][index];
        }
      });
    });
    rowList.set(newRows);
  }

}
