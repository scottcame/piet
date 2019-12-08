import { MondrianResult } from "../../src/js/model/MondrianResult";
import { TestData } from "../_data/TestData";

test('2 measures 1 row 1 column', () => {
  const result = MondrianResult.fromJSON(TestData.TEST_RESULT_2M1R1C);
  expect(result).not.toBeNull();
  expect(result.cells).toHaveLength(30);
  expect(result.cells[0]).toMatchObject(TestData.TEST_RESULT_2M1R1C.cells[0]);
  expect(result.axes).toHaveLength(2);
  expect(result.axes[0].name).toBe("COLUMNS");
  expect(result.axes[0]).toEqual(result.columnAxis);
  expect(result.axes[0].ordinal).toBe(0);
  expect(result.axes[0].positions).toHaveLength(10);
  expect(result.axes[0].positions[0]).toMatchObject(TestData.TEST_RESULT_2M1R1C.axes[0].positions[0]);
  expect(result.axes[1].name).toBe("ROWS");
  expect(result.axes[1].ordinal).toBe(1);
  expect(result.axes[1]).toEqual(result.rowAxis);
  expect(result.columnCaptions).toMatchObject(['Store Type', 'MeasuresLevel']);
  expect(result.rowCaptions).toMatchObject(['Store Country']);
});

test('1 measure no rows or columns', () => {
  const result = MondrianResult.fromJSON(TestData.TEST_RESULT_1M0R0C);
  expect(result).not.toBeNull();
  expect(result.axes).toHaveLength(1);
  expect(result.rowAxis).toBeNull();
  expect(result.rowCaptions).toHaveLength(0);
  expect(result.columnCaptions).toMatchObject(["MeasuresLevel"]);
});