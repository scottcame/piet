import { MondrianResult } from "../../../src/js/model/MondrianResult";
import { TestData } from "../../_data/TestData";
import { MondrianResultVegaViz } from "../../../src/js/ui/model/MondrianResultVegaViz";

const mondrianResultVegaViz = new MondrianResultVegaViz();

test('null result', () => {
  const spec = mondrianResultVegaViz.getVegaLiteSpecForResult(null);
  expect(spec).toBeNull();
});

test('empty result', () => {
  const spec = mondrianResultVegaViz.getVegaLiteSpecForResult(MondrianResult.fromJSON(TestData.TEST_RESULT_EMPTY));
  expect(spec).toBeNull();
});

test('1 measure 1 row no columns', () => {
  const spec = mondrianResultVegaViz.getVegaLiteSpecForResult(MondrianResult.fromJSON(TestData.TEST_RESULT_1M1R0C));
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