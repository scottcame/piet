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

import { MondrianResult, MondrianResultAxis } from "../../src/js/model/MondrianResult";
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
  expect(result.axes[1]).toEqual(result.rowAxis);
  expect(result.axes[1].name).toBe("ROWS");
  expect(result.axes[1].ordinal).toBe(1);
  expect(result.axes[0].positions).toHaveLength(10);
  expect(result.axes[1].positions).toHaveLength(3);
  expect(result.columnCaptions).toMatchObject(['Store Type', 'MeasuresLevel']);
  expect(result.rowCaptions).toMatchObject(['Store Country']);
  expect(result.measureCaptions).toMatchObject([ 'Store Sqft', 'Grocery Sqft' ]);
});

test('1 measure no rows or columns', () => {
  const result = MondrianResult.fromJSON(TestData.TEST_RESULT_1M0R0C);
  expect(result).not.toBeNull();
  expect(result.axes).toHaveLength(1);
  expect(result.rowAxis).toBeNull();
  expect(result.rowCaptions).toHaveLength(0);
  expect(result.columnCaptions).toMatchObject(["MeasuresLevel"]);
  expect(result.measureCaptions).toMatchObject(["Units Ordered"]);
});

test('Empty results', () => {
  const result = MondrianResult.fromJSON(TestData.TEST_RESULT_EMPTY);
  expect(result).not.toBeNull();
  expect(result.cells).toHaveLength(0);
  expect(result.columnCaptions).toHaveLength(0);
  expect(result.rowCaptions).toHaveLength(0);
  result.axes.forEach((axis: MondrianResultAxis): void => {
    expect(axis.positions).toHaveLength(0);
    expect(axis.axisHeaders).toHaveLength(0);
    expect(axis.axisLevelUniqueNames).toHaveLength(0);
  });
  expect(result.columnAxis).not.toBeNull();
  expect(result.rowAxis).not.toBeNull();
  expect(result.measureCaptions).toHaveLength(0);
});
