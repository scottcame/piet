import { MondrianResult, MondrianResultAxisPosition } from '../../model/MondrianResult';

export class MondrianResultVegaViz {

  fitToContainer = true;

  getVegaLiteSpecForResult(result: MondrianResult): VegaLiteSpec {
    let ret: VegaLiteSpec = null;
    if (result) {
      if (result.columnAxis.axisLevelUniqueNames.length === 2 && !result.rowAxis) {
        // one col and one measure (no rows)
        ret = this.createSpec1m0r1c(result);
      } else if (result.columnAxis.axisLevelUniqueNames.length === 1 && result.rowAxis.axisLevelUniqueNames.length === 1) {
        // 1 row level, 0 column levels (beyond the measures)
        if (result.columnAxis.positions.length === 1) {
          // only one measure
          ret = this.createSpec1m1r0c(result);
        } else {
          ret = this.createSpecNm1r0c(result);
        }
      } else if (result.columnAxis.axisLevelUniqueNames.length === 2 && result.rowAxis.axisLevelUniqueNames.length === 1) {
        ret = this.createSpec1m1r1c(result);
      }
    }
    return ret;
  }

  private createSpec1m1r1c(result: MondrianResult): VegaLiteSpec {
    const ret = new VegaLiteSpec(this.fitToContainer);
    result.rowAxis.positions.forEach((rowPosition: MondrianResultAxisPosition, rowIndex: number): void => {
      result.columnAxis.positions.forEach((columnPosition: MondrianResultAxisPosition, columnIndex: number): void => {
        const value = {
          v: result.cells[rowIndex + columnIndex].value,
          y: rowPosition.positionMembers[0].memberValue,
          x: columnPosition.positionMembers[0].memberValue
        };
        ret.data.values.push(value);
      });
    });
    ret.mark = "circle";
    ret.encoding.x = new PositionChannel();
    ret.encoding.x.field = "x";
    ret.encoding.x.type = "nominal";
    ret.encoding.x.axis = new Axis();
    ret.encoding.x.axis.title = result.columnAxis.axisHeaders[0];
    ret.encoding.y = new PositionChannel();
    ret.encoding.y.field = "y";
    ret.encoding.y.type = "nominal";
    ret.encoding.y.axis = new Axis();
    ret.encoding.y.axis.title = result.rowAxis.axisHeaders[0];
    ret.encoding.size = new EncodingChannel();
    ret.encoding.size.field = "v";
    ret.encoding.size.type = "quantitative";
    ret.encoding.size.title = result.columnAxis.positions[0].positionMembers[1].memberValue;
    return ret;
  }

  private createSpecNm1r0c(result: MondrianResult): VegaLiteSpec {
    const ret = new VegaLiteSpec(this.fitToContainer);
    result.rowAxis.positions.forEach((rowPosition: MondrianResultAxisPosition, rowIndex: number): void => {
      result.columnAxis.positions.forEach((columnPosition: MondrianResultAxisPosition, columnIndex: number): void => {
        const value = {
          v: result.cells[rowIndex + columnIndex].value,
          g: rowPosition.positionMembers[0].memberValue,
          x: columnPosition.positionMembers[0].memberValue
        };
        ret.data.values.push(value);
      });
    });
    ret.mark = "bar";
    ret.encoding.column = new FacetChannel();
    ret.encoding.column.field = "g";
    ret.encoding.column.type = "nominal";
    ret.encoding.column.title = result.rowAxis.axisHeaders[0];
    ret.encoding.x = new PositionChannel();
    ret.encoding.x.field = "x";
    ret.encoding.x.type = "nominal";
    ret.encoding.x.axis = new Axis();
    ret.encoding.y = new PositionChannel();
    ret.encoding.y.field = "v";
    ret.encoding.y.type = "quantitative";
    ret.encoding.y.axis = new Axis();
    ret.encoding.y.axis.title = result.columnAxis.positions[0].positionMembers[0].memberValue;
    // todo: align to size of container
    ret.height = 200;
    ret.width = 90; // this is the width of each column facet, so need to do the math based upon how many columns...
    return ret;
  }

  private createSpec1m1r0c(result: MondrianResult): VegaLiteSpec {
    return this.createSpec1x1(result, "y");
  }

  private createSpec1m0r1c(result: MondrianResult): VegaLiteSpec {
    return this.createSpec1x1(result, "x");
  }

  private createSpec1x1(result: MondrianResult, measureOn: "x"|"y"): VegaLiteSpec {
    const ret = new VegaLiteSpec(this.fitToContainer);
    const axis = measureOn === "y" ? result.rowAxis : result.columnAxis;
    ret.data.values = axis.positions.map((position: MondrianResultAxisPosition, idx: number): Record<string, string|number> => {
      const ret = {
        v: result.cells[idx].value,
        d: position.positionMembers[0].memberValue
      };
      return ret;
    });
    ret.mark = "bar";
    const d = new PositionChannel();
    d.field = "d";
    d.type = "nominal";
    d.axis = new Axis();
    d.axis.title = axis.axisHeaders[0];
    const m = new PositionChannel();
    m.field = "v";
    m.type = "quantitative";
    m.axis = new Axis();
    m.axis.title = result.columnAxis.positions[0].positionMembers[measureOn === "y" ? 0 : 1].memberValue;
    if (measureOn === "y") {
      ret.encoding.x = d;
      ret.encoding.y = m;
    } else {
      ret.encoding.y = d;
      ret.encoding.x = m;
    }
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
  row?: FacetChannel;
  column?: FacetChannel;
  color?: EncodingChannel;
  size?: EncodingChannel;
}

export class EncodingChannel {
  field: string;
  type: "quantitative" | "temporal" | "ordinal" | "nominal";
  title?: string;
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
  title = "";
}
