// Copyright 2020 National Police Foundation
// Copyright 2020 Scott Came Consulting LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
