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

test('2 measures 1 row no columns', () => {
  const spec = mondrianResultVegaViz.getVegaLiteSpecForResult(MondrianResult.fromJSON(TestData.TEST_RESULT_2M1R0C));
  expect(spec).toMatchObject({
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "data": {
      "values": [
        {
          "v": 66307,
          "g": "CA",
          "x": "Units Ordered"
        },
        {
          "v": 60877,
          "g": "CA",
          "x": "Units Shipped"
        },
        {
          "v": 60877,
          "g": "OR",
          "x": "Units Ordered"
        },
        {
          "v": 44906,
          "g": "OR",
          "x": "Units Shipped"
        },
        {
          "v": 44906,
          "g": "WA",
          "x": "Units Ordered"
        },
        {
          "v": 40908,
          "g": "WA",
          "x": "Units Shipped"
        }
      ]
    },
    "encoding": {
      "column": {
        "title": "Store State",
        "field": "g",
        "type": "nominal"
      },
      "x": {
        "field": "x",
        "type": "nominal",
        "axis": {
          "title": "",
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
    "width": 90,
    "height": 200,
    "mark": "bar"
  });
});