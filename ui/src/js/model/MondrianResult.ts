  /* eslint-disable @typescript-eslint/no-explicit-any */

  export class MondrianResult {
    cells: MondrianResultCell[];
    axes: MondrianResultAxis[];
    columnAxis: MondrianResultAxis = null;;
    rowAxis: MondrianResultAxis = null;
    columnCaptions: string[] = [];
    rowCaptions: string[] = [];
    static fromJSON(rawResult: any): MondrianResult {
      const ret = new MondrianResult();
      ret.cells = rawResult.cells.map((rawCell: any): MondrianResultCell => {
        return MondrianResultCell.fromJSON(rawCell);
      });
      ret.axes = rawResult.axes.map((rawAxis: any): MondrianResultAxis => {
        const axis = MondrianResultAxis.fromJSON(rawAxis);
        if (axis.name === "COLUMNS") {
          ret.columnAxis = axis;
        } else if (axis.name === "ROWS") {
          ret.rowAxis = axis;
        }
        return axis;
      });
      ret.columnCaptions = ret.columnAxis.positions[0].memberLevelCaptions;
      ret.rowCaptions = ret.rowAxis ? ret.rowAxis.positions[0].memberLevelCaptions : [];
      return ret;
    }
}

export class MondrianResultCell {
  formattedValue: string;
  value: number;
  ordinal: number;
  coordinates: number[];
  error: string;
  static fromJSON(rawObject: any): MondrianResultCell {
    const ret = new MondrianResultCell();
    ret.formattedValue = rawObject.formattedValue;
    ret.value = rawObject.value;
    ret.ordinal = rawObject.ordinal;
    ret.coordinates = rawObject.coordinates;
    ret.error = rawObject.error;
    return ret;
  }
}

export class MondrianResultAxis {
  ordinal: number;
  name: string;
  positions: MondrianResultAxisPosition[];
  static fromJSON(rawObject: any): MondrianResultAxis {
    const ret = new MondrianResultAxis();
    ret.ordinal = rawObject.ordinal;
    ret.name = rawObject.name;
    ret.positions = rawObject.positions.map((rawPosition: any): MondrianResultAxisPosition => {
      return MondrianResultAxisPosition.fromJSON(rawPosition);
    });
    return ret;
  }
}

export class MondrianResultAxisPosition {
  memberDimensionNames: string[];
  memberDimensionCaptions: string[];
  memberDimensionValues: string[];
  memberLevelNames: string[];
  memberLevelCaptions: string[];
  static fromJSON(rawObject: any): MondrianResultAxisPosition {
    const ret = new MondrianResultAxisPosition();
    ret.memberDimensionNames = rawObject.memberDimensionNames;
    ret.memberDimensionCaptions = rawObject.memberDimensionCaptions;
    ret.memberDimensionValues = rawObject.memberDimensionValues;
    ret.memberLevelNames = rawObject.memberLevelNames;
    ret.memberLevelCaptions = rawObject.memberLevelCaptions;
    return ret;
  }
}