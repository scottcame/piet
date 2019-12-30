import { MondrianResult } from "../../../src/js/model/MondrianResult";
import { TestData } from "../../_data/TestData";
import { MondrianResultVegaViz } from "../../../src/js/ui/model/MondrianResultVegaViz";

const mondrianResultVegaViz = new MondrianResultVegaViz();

test('null result', () => {
  mondrianResultVegaViz.result = null;
  expect(mondrianResultVegaViz.vegaLiteSpec).toBeNull();
});

test('empty result', () => {
  mondrianResultVegaViz.result = (MondrianResult.fromJSON(TestData.TEST_RESULT_EMPTY));
  expect(mondrianResultVegaViz.vegaLiteSpec).toBeNull();
});

test('measure only result', () => {
  mondrianResultVegaViz.result = (MondrianResult.fromJSON(TestData.TEST_RESULT_1M0R0C));
  expect(mondrianResultVegaViz.vegaLiteSpec).toBeNull();
});

test('1 measure 1 row no columns', () => {
  mondrianResultVegaViz.result = (MondrianResult.fromJSON(TestData.TEST_RESULT_1M1R0C));
  expect(mondrianResultVegaViz.vegaLiteSpec).toMatchObject({
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "data": {
      "values": [
        {
          "v": 66307,
          "d": "CA"
        },
        {
          "v": 44906,
          "d": "OR"
        },
        {
          "v": 116025,
          "d": "WA"
        }
      ]
    },
    "encoding": {
      "x": {
        "field": "d",
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
  mondrianResultVegaViz.result = (MondrianResult.fromJSON(TestData.TEST_RESULT_2M1R0C));
  expect(mondrianResultVegaViz.vegaLiteSpec).toMatchObject({
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "data": {
      "values": [
        {
          "v": 66307,
          "g": "CA",
          "d": "Units Ordered"
        },
        {
          "v": 60877,
          "g": "CA",
          "d": "Units Shipped"
        },
        {
          "v": 60877,
          "g": "OR",
          "d": "Units Ordered"
        },
        {
          "v": 44906,
          "g": "OR",
          "d": "Units Shipped"
        },
        {
          "v": 44906,
          "g": "WA",
          "d": "Units Ordered"
        },
        {
          "v": 40908,
          "g": "WA",
          "d": "Units Shipped"
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
        "field": "d",
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
    "height": 300,
    "mark": "bar"
  });
});

test('2 measures 0 rows 1 column', () => {
  mondrianResultVegaViz.result = (MondrianResult.fromJSON(TestData.TEST_RESULT_2M0R1C));
  expect(mondrianResultVegaViz.vegaLiteSpec).toMatchObject({
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "data": {
      "values": [
        {
          "v": 146045,
          "g": "Deluxe Supermarket",
          "d": "Store Sqft"
        },
        {
          "v": 99290,
          "g": "Deluxe Supermarket",
          "d": "Grocery Sqft"
        },
        {
          "v": 47447,
          "g": "Gourmet Supermarket",
          "d": "Store Sqft"
        },
        {
          "v": 32181,
          "g": "Gourmet Supermarket",
          "d": "Grocery Sqft"
        },
        {
          "v": 109343,
          "g": "Mid-Size Grocery",
          "d": "Store Sqft"
        },
        {
          "v": 80264,
          "g": "Mid-Size Grocery",
          "d": "Grocery Sqft"
        },
        {
          "v": 75281,
          "g": "Small Grocery",
          "d": "Store Sqft"
        },
        {
          "v": 52604,
          "g": "Small Grocery",
          "d": "Grocery Sqft"
        },
        {
          "v": 193480,
          "g": "Supermarket",
          "d": "Store Sqft"
        },
        {
          "v": 134029,
          "g": "Supermarket",
          "d": "Grocery Sqft"
        }
      ]
    },
    "encoding": {
      "row": {
        "title": "Store Type",
        "field": "g",
        "type": "nominal"
      },
      "y": {
        "field": "d",
        "type": "nominal",
        "axis": {
          "title": "",
          "grid": true
        }
      },
      "x": {
        "field": "v",
        "type": "quantitative",
        "axis": {
          "title": "Store Sqft",
          "grid": true
        }
      }
    },
    "width": 300,
    "height": 90,
    "mark": "bar"
  });
});

test('1 measure 1 row 1 column', () => {
  mondrianResultVegaViz.result = (MondrianResult.fromJSON(TestData.TEST_RESULT_1M1R1C));
  expect(mondrianResultVegaViz.vegaLiteSpec).toMatchObject({
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "data": {
      "values": [
        {"v": 23112, "y": "Canada", "x": "Deluxe Supermarket"},
        {"v": null, "y": "Canada", "x": "Gourmet Supermarket"},
        {"v": 34452, "y": "Canada", "x": "Mid-Size Grocery"},
        {"v": null, "y": "Canada", "x": "Small Grocery"},
        {"v": null, "y": "Canada", "x": "Supermarket"},
        {"v": null, "y": "Mexico", "x": "Deluxe Supermarket"},
        {"v": 34452, "y": "Mexico", "x": "Gourmet Supermarket"},
        {"v": null, "y": "Mexico", "x": "Mid-Size Grocery"},
        {"v": null, "y": "Mexico", "x": "Small Grocery"},
        {"v": 61381, "y": "Mexico", "x": "Supermarket"},
        {"v": 34452, "y": "USA", "x": "Deluxe Supermarket"},
        {"v": null, "y": "USA", "x": "Gourmet Supermarket"},
        {"v": null, "y": "USA", "x": "Mid-Size Grocery"},
        {"v": 61381, "y": "USA", "x": "Small Grocery"},
        {"v": 23759, "y": "USA", "x": "Supermarket"}
      ]
    },
    "encoding": {
      "x": {
        "field": "x",
        "type": "nominal",
        "axis": {"title": "Store Type", "grid": true}
      },
      "y": {
        "field": "y",
        "type": "nominal",
        "axis": {"title": "Store Country", "grid": true}
      },
      "size": {"field": "v", "type": "quantitative", "title": "Store Sqft"}
    },
    "width": "container",
    "height": "container",
    "mark": "circle"
  });
});

test('1 measure 0 rows 1 column', () => {
  mondrianResultVegaViz.result = (MondrianResult.fromJSON(TestData.TEST_RESULT_1M0R1C));
  expect(mondrianResultVegaViz.vegaLiteSpec).toMatchObject({
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "data": {
      "values": [
        {
          "v": 66307,
          "d": "CA"
        },
        {
          "v": 44906,
          "d": "OR"
        },
        {
          "v": 116025,
          "d": "WA"
        }
      ]
    },
    "encoding": {
      "y": {
        "field": "d",
        "type": "nominal",
        "axis": {
          "title": "Store State",
          "grid": true
        }
      },
      "x": {
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