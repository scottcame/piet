import { MondrianResult, MondrianResultAxisPosition } from '../../model/MondrianResult';

export class MondrianResultVegaViz {

  fitToContainer = true;

  getVegaLiteSpecForResult(result: MondrianResult): VegaLiteSpec {
    let ret: VegaLiteSpec = null;
    if (result) {
      if (result.columnAxis.axisLevelUniqueNames.length === 1 && result.rowAxis.axisLevelUniqueNames.length === 1) {
        // 1 row level, 0 column levels (beyond the measures)
        if (result.columnAxis.positions.length === 1) {
          // only one measure
          ret = this.createSpec1m1r0c(result);
        }
      }
    }
    return ret;
  }

  private createSpec1m1r0c(result: MondrianResult): VegaLiteSpec {
    const ret = new VegaLiteSpec(this.fitToContainer);
    ret.data.values = result.rowAxis.positions.map((position: MondrianResultAxisPosition, idx: number): Record<string, string|number> => {
      const ret = {
        v: result.cells[idx].value,
        x: position.positionMembers[0].memberValue
      };
      return ret;
    });
    ret.mark = "bar";
    ret.encoding.x = new PositionChannel();
    ret.encoding.x.field = "x";
    ret.encoding.x.type = "nominal";
    ret.encoding.x.axis = new Axis();
    ret.encoding.x.axis.title = result.rowAxis.axisHeaders[0];
    ret.encoding.y = new PositionChannel();
    ret.encoding.y.field = "v";
    ret.encoding.y.type = "quantitative";
    ret.encoding.y.axis = new Axis();
    ret.encoding.y.axis.title = result.columnAxis.positions[0].positionMembers[0].memberValue;
    return ret;
  }

}

export class VegaLiteSpec {
  readonly $schema = "https://vega.github.io/schema/vega-lite/v4.json";
  description: string = undefined;
  data: Data = new Data();
  mark: 'bar' | 'circle' | 'rect';
  encoding: Encoding = new Encoding();
  width: number | "container" = undefined;
  height: number | "container" = undefined;
  constructor(fitToContainer: boolean) {
    if (fitToContainer) {
      this.width = "container";
      this.height = "container";
    }
  }
}

export class Data {
  values: Record<string, string|number>[] = [];
}

export class Encoding {
  x?: PositionChannel;
  y?: PositionChannel;
  column?: FacetChannel;
  color?: EncodingChannel;
  size?: EncodingChannel;
}

export class EncodingChannel {
  field: string;
  type: "quantitative" | "temporal" | "ordinal" | "nominal";
}

export class PositionChannel extends EncodingChannel {
  axis?: Axis;
}

export class Axis {
  title = "";
  grid = true;
}

export class FacetChannel extends EncodingChannel {
  spacing?: number;
}
