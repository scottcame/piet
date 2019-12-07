import { MondrianResult } from "../../../src/js/model/MondrianResult";
import { TestData } from "../../_data/TestData";
import { MondrianResultTableModel } from "../../../src/js/ui/model/MondrianResultTable";

test('header rows 2m1r1c', () => {
  const result = MondrianResult.fromJSON(TestData.TEST_RESULT_2M1R1C);
  const tableModel = new MondrianResultTableModel();
  tableModel.result = result;
  expect(tableModel.headerRows).toHaveLength(2);
  expect(tableModel.headerRows[0]).toHaveLength(tableModel.headerRows[1].length);
  expect(tableModel.headerRows[0]).toHaveLength(result.rowCaptions.length + result.columnAxis.positions.length);
  expect(tableModel.columnCount).toBe(result.rowCaptions.length + result.columnAxis.positions.length);
  expect(tableModel.headerRows[0][0]).toBe(result.columnAxis.positions[0].memberLevelCaptions[0]); 
  expect(tableModel.headerRows[1][0]).toBe(result.rowAxis.positions[0].memberLevelCaptions[0]);
  expect(tableModel.topLeftEmptyColumnCount).toBe(0);
});

test('header rows 2m1r2c', () => {
  const result = MondrianResult.fromJSON(TestData.TEST_RESULT_2M1R2C);
  const tableModel = new MondrianResultTableModel();
  tableModel.result = result;
  expect(tableModel.headerRows).toHaveLength(3);
  expect(tableModel.headerRows[0]).toHaveLength(tableModel.headerRows[1].length);
  expect(tableModel.headerRows[1]).toHaveLength(tableModel.headerRows[2].length);
  expect(tableModel.headerRows[0]).toHaveLength(result.rowCaptions.length + result.columnAxis.positions.length);
  expect(tableModel.headerRows[0][0]).toBe(result.columnAxis.positions[0].memberLevelCaptions[0]); 
  expect(tableModel.headerRows[1][0]).toBe(result.columnAxis.positions[0].memberLevelCaptions[1]); 
  expect(tableModel.headerRows[2][0]).toBe(result.rowAxis.positions[0].memberLevelCaptions[0]); 
  expect(tableModel.topLeftEmptyColumnCount).toBe(0);
});

test('header rows 2m2r1c', () => {
  const result = MondrianResult.fromJSON(TestData.TEST_RESULT_2M2R1C);
  const tableModel = new MondrianResultTableModel();
  tableModel.result = result;
  expect(tableModel.headerRows).toHaveLength(2);
  expect(tableModel.headerRows[0]).toHaveLength(tableModel.headerRows[1].length);
  expect(tableModel.headerRows[0]).toHaveLength(result.rowCaptions.length + result.columnAxis.positions.length);
  expect(tableModel.headerRows[0][0]).toBeNull(); 
  expect(tableModel.headerRows[0][1]).toBe(result.columnAxis.positions[0].memberLevelCaptions[0]); 
  expect(tableModel.headerRows[1][0]).toBe(result.rowAxis.positions[0].memberLevelCaptions[0]); 
  expect(tableModel.headerRows[1][1]).toBe(result.rowAxis.positions[0].memberLevelCaptions[1]); 
  expect(tableModel.topLeftEmptyColumnCount).toBe(1);
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
