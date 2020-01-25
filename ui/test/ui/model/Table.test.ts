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

import { TableRow, TableModel } from "../../../src/js/ui/model/Table";
import { TestTableChangeEventListener } from "./TestTableChangeEventListener";

class TestTableRow implements TableRow<string[]> {
  values: string[];
  constructor(values: string[]=[]) {
    this.values = values;
  }
  getValueAt(columnIndex: number): string {
    return this.values[columnIndex];
  }
  getItem(): string[] {
    return this.values;
  }
}

const tableRows = [
  new TestTableRow(["r0c0","r0c1"]),
  new TestTableRow(["r1c0","r1c1"])
];
const tableModel = new TableModel(["c0","c1"]);

test('columns', () => {
  expect(tableModel.columnHeaders).toContain("c0");
  expect(tableModel.columnHeaders).toContain("c1");
  expect(tableModel.columnHeaders).toHaveLength(2);
  expect(tableModel.getColumnCount().value).toBe(2);
});

test('rows', () => {
  expect(tableModel.rowCount).toBe(0);
  tableModel.setRowList(tableRows);
  expect(tableModel.rowCount).toBe(2);
  expect(tableModel.getRowAt(0).getValueAt(0)).toBe("r0c0");
  expect(tableModel.getRowAt(0).getValueAt(1)).toBe("r0c1");
  expect(tableModel.getRowAt(1).getValueAt(0)).toBe("r1c0");
  expect(tableModel.getRowAt(1).getValueAt(1)).toBe("r1c1");
});

test('events', async () => {
  const tableListener = new TestTableChangeEventListener();
  tableModel.addTableChangeEventListener(tableListener);
  tableModel.setRowList(tableRows);
  expect(tableListener.f).toHaveBeenCalledTimes(1);
});

test('iterable rows', () => {
  expect([...tableModel.rows]).toHaveLength(2);
});
