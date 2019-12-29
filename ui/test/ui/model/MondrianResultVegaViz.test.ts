import { MondrianResult } from "../../../src/js/model/MondrianResult";
import { TestData } from "../../_data/TestData";
import { MondrianResultVegaViz } from "../../../src/js/ui/model/MondrianResultVegaViz";

test('1 measure 1 row no columns', () => {
  const result = MondrianResult.fromJSON(TestData.TEST_RESULT_1M1R0C);
  expect(1).toBe(1);
  const mondrianResultVegaViz = new MondrianResultVegaViz();
  const spec = mondrianResultVegaViz.getVegaLiteSpecForResult(result);
  expect(spec).toMatchObject({
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "data": {
      "values": [
        {
          "v": 66307,
          "x": "CA"
        },
        {
          "v": 44906,
          "x": "OR"
        },
        {
          "v": 116025,
          "x": "WA"
        }
      ]
    },
    "encoding": {
      "x": {
        "field": "x",
        "type": "nominal",
        "axis": {
          "title": "Store State",
          "grid": true
        }
      },
      "y": {
        "field": "v",
        "type": "quantitative",
        "axis": {
          "title": "Units Ordered",
          "grid": true
        }
      }
    },
    "width": "container",
    "height": "container",
    "mark": "bar"
  });
});