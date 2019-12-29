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
