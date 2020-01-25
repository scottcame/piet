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

import { MondrianResult } from "../../../src/js/model/MondrianResult";
import { TestData } from "../../_data/TestData";
import { MondrianResultTableModel } from "../../../src/js/ui/model/MondrianResultTable";

test('null result', () => {
  const tableModel = new MondrianResultTableModel();
  tableModel.result = null;
  expect(tableModel.headerRows).toHaveLength(0);
  expect(tableModel.columnCount).toBe(0);
  expect(tableModel.dataColumnCount).toBe(0);
  expect(tableModel.dataRowCount).toBe(0);
  expect(tableModel.getValueAt(0,0)).toBeNull();
  expect(tableModel.rowCount).toBe(0);
});

test('empty result', () => {
  const result = MondrianResult.fromJSON(TestData.TEST_RESULT_EMPTY);
  const tableModel = new MondrianResultTableModel();
  tableModel.result = result;
  expect(tableModel.rowCount).toBe(0);
  expect(tableModel.columnCount).toBe(0);
  expect(tableModel.headerRows).toHaveLength(0);
  expect(tableModel.rowHeaders).toHaveLength(0);
});

test('header rows 2m1r1c', () => {
  const result = MondrianResult.fromJSON(TestData.TEST_RESULT_2M1R1C);
  const tableModel = new MondrianResultTableModel();
  tableModel.result = result;
  expect(tableModel.headerRows).toHaveLength(2);
  expect(tableModel.headerRows[0]).toHaveLength(tableModel.headerRows[1].length);
  expect(tableModel.headerRows[0]).toHaveLength(result.rowCaptions.length + result.columnAxis.positions.length);
  expect(tableModel.columnCount).toBe(result.rowCaptions.length + result.columnAxis.positions.length);
  expect(tableModel.topLeftEmptyColumnCount).toBe(0);
  expect(tableModel.headerRows[0][0]).toBe("Store Type");
  expect(tableModel.headerRows[0][1]).toBe("Deluxe Supermarket");
  expect(tableModel.headerRows[1][1]).toBe("Store Sqft");
  expect(tableModel.headerRows[1][2]).toBe("Grocery Sqft");
  expect(tableModel.headerRows[0][2]).toBe("Deluxe Supermarket");
  expect(tableModel.headerRows[0][3]).toBe("Gourmet Supermarket");
  expect(tableModel.headerRows[0][4]).toBe("Gourmet Supermarket");
  expect(tableModel.headerRows[1][0]).toBe("Store Country");
  expect(tableModel.rowHeaders[0]).toHaveLength(1);
  expect(tableModel.rowHeaders[0][0]).toBe("Canada");
  expect(tableModel.getValueAt(0,0)).toBe(23112);
  expect(tableModel.getValueAt(2,0)).toBe(61552);
  expect(tableModel.getValueAt(0,9)).toBeNull();
  expect(tableModel.getValueAt(2,9)).toBe(90200);
});

test('header rows 2m1r2c', () => {
  const result = MondrianResult.fromJSON(TestData.TEST_RESULT_2M1R2C);
  const tableModel = new MondrianResultTableModel();
  tableModel.result = result;
  expect(tableModel.headerRows).toHaveLength(3);
  expect(tableModel.headerRows[0]).toHaveLength(tableModel.headerRows[1].length);
  expect(tableModel.headerRows[1]).toHaveLength(tableModel.headerRows[2].length);
  expect(tableModel.headerRows[0]).toHaveLength(result.rowCaptions.length + result.columnAxis.positions.length);
  expect(tableModel.topLeftEmptyColumnCount).toBe(0);
  expect(tableModel.rowHeaders[0]).toHaveLength(1);
  expect(tableModel.rowHeaders[0][0]).toBe("Canada");
  expect(tableModel.headerRows[0][0]).toBe("Store Type");
  expect(tableModel.headerRows[0][1]).toBe("Deluxe Supermarket");
  expect(tableModel.headerRows[0][2]).toBe("Deluxe Supermarket");
  expect(tableModel.headerRows[0][3]).toBe("Gourmet Supermarket");
  expect(tableModel.headerRows[1][0]).toBe("Has coffee bar");
  expect(tableModel.headerRows[2][0]).toBe("Store Country");
  expect(tableModel.getValueAt(0,0)).toBe(23112);
  expect(tableModel.getValueAt(0,13)).toBeNull();
  expect(tableModel.getValueAt(2,0)).toBe(61552);
  expect(tableModel.getValueAt(2,13)).toBe(13305);

});

test('header rows 2m2r1c', () => {
  const result = MondrianResult.fromJSON(TestData.TEST_RESULT_2M2R1C);
  const tableModel = new MondrianResultTableModel();
  tableModel.result = result;
  expect(tableModel.headerRows).toHaveLength(2);
  expect(tableModel.headerRows[0]).toHaveLength(tableModel.headerRows[1].length);
  expect(tableModel.headerRows[0]).toHaveLength(result.rowCaptions.length + result.columnAxis.positions.length);
  expect(tableModel.headerRows[0][0]).toBeNull();
  expect(tableModel.topLeftEmptyColumnCount).toBe(1);
  expect(tableModel.headerRows[0][1]).toBe("Store Type");
  expect(tableModel.headerRows[0][2]).toBe("Deluxe Supermarket");
  expect(tableModel.headerRows[0][3]).toBe("Deluxe Supermarket");
  expect(tableModel.headerRows[0][4]).toBe("Gourmet Supermarket");
  expect(tableModel.headerRows[1][0]).toBe("Store Country");
  expect(tableModel.headerRows[1][1]).toBe("Has coffee bar");
  expect(tableModel.rowHeaders[0][0]).toBe("Canada");
  expect(tableModel.rowHeaders[0][1]).toBe("1");
  expect(tableModel.dataRowCount).toBe(5);
  expect(tableModel.getValueAt(0,0)).toBe(23112);
  expect(tableModel.getValueAt(0,9)).toBeNull();
  expect(tableModel.getValueAt(4,0)).toBe(61552);
  expect(tableModel.getValueAt(4,9)).toBe(13305);
});

test('shape', () => {
  const result = MondrianResult.fromJSON(TestData.TEST_RESULT_2M2R2C);
  const tableModel = new MondrianResultTableModel();
  tableModel.result = result;
  expect(tableModel.rowCount).toBe(tableModel.headerRows.length + result.rowAxis.positions.length);
  expect(tableModel.columnCount).toBe(tableModel.headerRows[0].length);
  expect(tableModel.dataColumnCount).toBe(result.columnAxis.positions.length);
  expect(tableModel.dataRowCount).toBe(result.rowAxis.positions.length);
});

test('values', () => {
  const result = MondrianResult.fromJSON(TestData.TEST_RESULT_2M2R2C);
  const tableModel = new MondrianResultTableModel();
  tableModel.result = result;
  // cherry-picking a few to check
  expect(tableModel.getValueAt(0,0)).toBe(1420);
  expect(tableModel.getFormattedValueAt(0,0)).toBe("1420.0");
  expect(tableModel.getValueAt(0,2)).toBeNull();
  expect(tableModel.getValueAt(4,2)).toBe(767);
  expect(tableModel.getValueAt(tableModel.dataRowCount - 1, tableModel.dataColumnCount - 1)).toBe(2182);
  // out of bounds
  expect(tableModel.getValueAt(tableModel.dataRowCount, tableModel.dataColumnCount)).toBeNull();
});

test('header rows 2m2r2c', () => {
  const result = MondrianResult.fromJSON(TestData.TEST_RESULT_2M2R2C);
  const tableModel = new MondrianResultTableModel();
  tableModel.result = result;
  expect(tableModel.headerRows).toHaveLength(3);
  expect(tableModel.headerRows[0]).toHaveLength(tableModel.headerRows[1].length);
  expect(tableModel.headerRows[1]).toHaveLength(tableModel.headerRows[2].length);
  expect(tableModel.headerRows[0]).toHaveLength(result.rowCaptions.length + result.columnAxis.positions.length);
  expect(tableModel.headerRows[0][0]).toBeNull();
  expect(tableModel.headerRows[1][0]).toBeNull();
  expect(tableModel.topLeftEmptyColumnCount).toBe(1);
  expect(tableModel.headerRows[0][1]).toBe("Store State");
  expect(tableModel.headerRows[0][2]).toBe("CA");
  expect(tableModel.headerRows[0][3]).toBe("CA");
  expect(tableModel.headerRows[0][4]).toBe("OR");
  expect(tableModel.headerRows[1][1]).toBe("Year");
  expect(tableModel.headerRows[1][2]).toBe("1997");
  expect(tableModel.headerRows[2][0]).toBe("Product Family");
  expect(tableModel.headerRows[2][1]).toBe("City");
  expect(tableModel.headerRows[2][2]).toBe("Units Shipped");
  expect(tableModel.headerRows[2][3]).toBe("Units Ordered");
  expect(tableModel.rowHeaders[0][0]).toBe("Drink");
  expect(tableModel.rowHeaders[0][1]).toBe("Beverly Hills");
  expect(tableModel.dataRowCount).toBe(39);
  expect(tableModel.rowHeaders[38][0]).toBe("Non-Consumable");
  expect(tableModel.rowHeaders[38][1]).toBe("Yakima");
  expect(tableModel.getValueAt(38, 0)).toBeNull();
  expect(tableModel.getValueAt(38, 5)).toBe(2182);
});

test('1 measure no rows or columns', () => {
  const result = MondrianResult.fromJSON(TestData.TEST_RESULT_1M0R0C);
  const tableModel = new MondrianResultTableModel();
  tableModel.result = result;
  expect(tableModel.headerRows).toHaveLength(1);
  expect(tableModel.columnCount).toBe(1);
  expect(tableModel.headerRows[0][0]).toBe("Units Ordered");
  expect(tableModel.rowHeaders).toHaveLength(0);
  expect(tableModel.topLeftEmptyColumnCount).toBe(0);
  expect(tableModel.rowCount).toBe(2);
  expect(tableModel.dataColumnCount).toBe(1);
  expect(tableModel.dataRowCount).toBe(1);
  expect(tableModel.getValueAt(0,0)).toBe(227238);
});

test('1 measure no rows 1 column', () => {
  const result = MondrianResult.fromJSON(TestData.TEST_RESULT_1M0R1C);
  const tableModel = new MondrianResultTableModel();
  tableModel.result = result;
  expect(tableModel.headerRows).toHaveLength(2);
  expect(tableModel.columnCount).toBe(4);
  expect(tableModel.headerRows[0][0]).toBe("Store State");
  expect(tableModel.headerRows[0][1]).toBe("CA");
  expect(tableModel.headerRows[1][0]).toBeNull();
  expect(tableModel.headerRows[1][1]).toBe("Units Ordered");
  expect(tableModel.rowHeaders[0][0]).toBe("");
  expect(tableModel.dataRowCount).toBe(1);
  expect(tableModel.dataColumnCount).toBe(3);
  expect(tableModel.getValueAt(0,0)).toBe(66307);
  expect(tableModel.getValueAt(0,2)).toBe(116025);
});

test('1 measure 2 hierarchical rows 0 columns', () => {
  const result = MondrianResult.fromJSON(TestData.TEST_RESULT_1M2HR0C);
  const tableModel = new MondrianResultTableModel();
  tableModel.result = result;
  expect(tableModel.headerRows).toHaveLength(1);
  expect(tableModel.columnCount).toBe(3);
  expect(tableModel.headerRows[0][0]).toBe("Store Country");
  expect(tableModel.headerRows[0][1]).toBe("Store City");
  expect(tableModel.headerRows[0][2]).toBe("Store Sqft");
  expect(tableModel.dataRowCount).toBe(22);
  expect(tableModel.dataColumnCount).toBe(1);
  expect(tableModel.rowHeaders[0][0]).toBe("Canada");
  expect(tableModel.rowHeaders[0][1]).toBeNull();
  expect(tableModel.rowHeaders[1][0]).toBe("Canada");
  expect(tableModel.rowHeaders[1][1]).toBe("Vancouver");
  expect(tableModel.getValueAt(0,0)).toBe(57564);
  expect(tableModel.getValueAt(1,0)).toBe(23112);
});

test('1 measure 2 hierarchical rows 1 column', () => {
  const result = MondrianResult.fromJSON(TestData.TEST_RESULT_1M2HR1C);
  const tableModel = new MondrianResultTableModel();
  tableModel.result = result;
  expect(tableModel.headerRows).toHaveLength(2);
  expect(tableModel.columnCount).toBe(7);
  expect(tableModel.headerRows[0][0]).toBeNull();
  expect(tableModel.headerRows[1][0]).toBe("Store Country");
  expect(tableModel.headerRows[0][1]).toBe("Store Type");
  expect(tableModel.headerRows[1][1]).toBe("Store City");
  expect(tableModel.headerRows[0][2]).toBe("Deluxe Supermarket");
  expect(tableModel.headerRows[1][2]).toBe("Store Sqft");
  expect(tableModel.dataRowCount).toBe(22);
  expect(tableModel.dataColumnCount).toBe(5);
  expect(tableModel.rowHeaders[0][0]).toBe("Canada");
  expect(tableModel.rowHeaders[0][1]).toBeNull();
  expect(tableModel.rowHeaders[1][0]).toBe("Canada");
  expect(tableModel.rowHeaders[1][1]).toBe("Vancouver");
  expect(tableModel.getValueAt(0,0)).toBe(23112);
  expect(tableModel.getValueAt(1,0)).toBe(23112);
  expect(tableModel.getValueAt(2,0)).toBeNull();
  expect(tableModel.getValueAt(0,2)).toBe(34452);
  expect(tableModel.getValueAt(1,2)).toBeNull();
  expect(tableModel.getValueAt(2,2)).toBe(34452);
});

test('1 measure 2 separate sets of 2 hierarchical rows, 0 columns', () => {
  const result = MondrianResult.fromJSON(TestData.TEST_RESULT_1M2X2HR1C);
  const tableModel = new MondrianResultTableModel();
  tableModel.result = result;
  expect(tableModel.headerRows).toHaveLength(1);
  expect(tableModel.columnCount).toBe(5);
  expect(tableModel.headerRows[0][0]).toBe("Product Family");
  expect(tableModel.headerRows[0][1]).toBe("Product Department");
  expect(tableModel.headerRows[0][2]).toBe("Store Country");
  expect(tableModel.headerRows[0][3]).toBe("Store State");
  expect(tableModel.headerRows[0][4]).toBe("Units Ordered");
  expect(tableModel.dataRowCount).toBe(104);
  expect(tableModel.dataColumnCount).toBe(1);
  expect(tableModel.rowHeaders[0][0]).toBe("Drink");
  expect(tableModel.rowHeaders[0][1]).toBeNull();
  expect(tableModel.rowHeaders[0][2]).toBe("USA");
  expect(tableModel.rowHeaders[0][3]).toBeNull();
  expect(tableModel.rowHeaders[1][0]).toBe("Drink");
  expect(tableModel.rowHeaders[1][1]).toBeNull();
  expect(tableModel.rowHeaders[1][2]).toBe("USA");
  expect(tableModel.rowHeaders[1][3]).toBe("CA");
  expect(tableModel.getValueAt(0,0)).toBe(23114);
  expect(tableModel.getValueAt(1,0)).toBe(5624);
  expect(tableModel.getValueAt(2,0)).toBe(5182);
  expect(tableModel.getValueAt(3,0)).toBe(12308);
});
