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
      ret.columnCaptions = ret.columnAxis.axisHeaders;
      ret.rowCaptions = ret.rowAxis ? ret.rowAxis.axisHeaders : [];
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
  axisHeaders: string[];
  axisLevelUniqueNames: string[];
  static fromJSON(rawObject: any): MondrianResultAxis {
    const ret = new MondrianResultAxis();
    ret.ordinal = rawObject.ordinal;
    ret.name = rawObject.name;
    ret.positions = rawObject.positions.map((rawPosition: any): MondrianResultAxisPosition => {
      return MondrianResultAxisPosition.fromJSON(rawPosition);
    });
    const positionCaptionsWide: string[][] = [];
    const positionLevelNamesWide: string[][] = [];
    const rootPositionLevelNames: string[][] = [];
    ret.positions.forEach((position: MondrianResultAxisPosition): void => {
      position.positionLevels.forEach((pl: MondrianResultAxisPositionMember[], plIdx: number): void => {
        if (!rootPositionLevelNames[plIdx]) {
          rootPositionLevelNames[plIdx] = [];
        }
        if (!positionCaptionsWide[plIdx] || pl.length > positionCaptionsWide[plIdx].length) {
          positionCaptionsWide[plIdx] = [];
          positionLevelNamesWide[plIdx] = [];
          pl.forEach((member: MondrianResultAxisPositionMember): void => {
            positionCaptionsWide[plIdx].push(member.memberLevelCaption);
            positionLevelNamesWide[plIdx].push(member.memberLevelName);
          });
          if (!rootPositionLevelNames[plIdx].includes(pl[0].memberLevelName)) {
            rootPositionLevelNames[plIdx].push(pl[0].memberLevelName);
          }
        }
      });
    });
    ret.axisHeaders = [];
    ret.axisLevelUniqueNames = [];
    const measureHeaders = [];
    const measureLevelNames = [];
    positionCaptionsWide.forEach((positionCaptions: string[], pcIdx: number): void => {
      const positionLevelNames = positionLevelNamesWide[pcIdx].reverse();
      positionCaptions.reverse().forEach((caption: string, cIdx: number) => {
        if (positionLevelNames[cIdx] === "[Measures].[MeasuresLevel]") {
          measureHeaders.push(caption);
          measureLevelNames.push(positionLevelNames[cIdx]);
        } else if (rootPositionLevelNames[pcIdx].includes(positionLevelNames[cIdx])) {
          ret.axisHeaders.push(caption);
          ret.axisLevelUniqueNames.push(positionLevelNames[cIdx]);
        }
      });
    });
    ret.axisHeaders = ret.axisHeaders.concat(measureHeaders.reverse());
    ret.axisLevelUniqueNames = ret.axisLevelUniqueNames.concat(measureLevelNames.reverse());
    return ret;
  }
}

export class MondrianResultAxisPosition {
  memberDimensionNames: string[];
  memberDimensionCaptions: string[];
  positionMembers: MondrianResultAxisPositionMember[];
  // todo: need better name than "positionLevels"
  positionLevels: MondrianResultAxisPositionMember[][] = [];
  static fromJSON(rawObject: any): MondrianResultAxisPosition {
    const ret = new MondrianResultAxisPosition();
    ret.memberDimensionNames = rawObject.memberDimensionNames;
    ret.memberDimensionCaptions = rawObject.memberDimensionCaptions;
    ret.positionMembers = rawObject.positionMembers.map((rawMember: any): MondrianResultAxisPositionMember => {
      return MondrianResultAxisPositionMember.fromJSON(rawMember);
    });
    ret.positionLevels = ret.positionMembers.map((positionMember: MondrianResultAxisPositionMember): MondrianResultAxisPositionMember[] => {
      const ret: MondrianResultAxisPositionMember[] = [];
      do {
        ret.push(positionMember);
        positionMember = positionMember.parentMember;
      } while (positionMember);
      return ret;
    });
    return ret;
  }
  findMemberValue(memberUniqueName: string): string {
    let ret: string = null;
    this.positionMembers.forEach((member: MondrianResultAxisPositionMember): void => {
      if (!ret) {
        const matchingMember = MondrianResultAxisPosition.findMember(memberUniqueName, member);
        if (matchingMember) {
          ret = matchingMember.memberValue;
        }
      }
    });
    return ret;
  }
  private static findMember(memberUniqueName: string, baseMember: MondrianResultAxisPositionMember): MondrianResultAxisPositionMember {
    if (!baseMember) {
      return null;
    } else if (baseMember.memberLevelName === memberUniqueName) {
      return baseMember;
    } else {
      return this.findMember(memberUniqueName, baseMember.parentMember);
    }
  }
}

export class MondrianResultAxisPositionMember {
  memberLevelName: string;
  memberLevelCaption: string;
  memberValue: string;
  parentMember: MondrianResultAxisPositionMember;
  static fromJSON(rawObject: any): MondrianResultAxisPositionMember {
    const ret = new MondrianResultAxisPositionMember();
    ret.memberLevelCaption = rawObject.memberLevelCaption;
    ret.memberLevelName = rawObject.memberLevelName;
    ret.memberValue = rawObject.memberValue;
    const parent = rawObject.parentMember;
    if (parent) {
      ret.parentMember = MondrianResultAxisPositionMember.fromJSON(parent);
    }
    return ret;
  }
}