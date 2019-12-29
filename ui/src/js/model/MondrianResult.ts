  /* eslint-disable @typescript-eslint/no-explicit-any */

  export class MondrianResult {
    cells: MondrianResultCell[];
    axes: MondrianResultAxis[];
    columnAxis: MondrianResultAxis = null;
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
    get measureCaptions(): string[] {
      const ret = [];
      this.columnAxis.positions.forEach((position: MondrianResultAxisPosition): void => {
        position.positionMembers.forEach((positionMember: MondrianResultAxisPositionMember): void => {
          if (positionMember.memberLevelName === "[Measures].[MeasuresLevel]" && !ret.includes(positionMember.memberValue)) {
            ret.push(positionMember.memberValue);
          }
        });
      });
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
    // walk all the positions on this axis and assemble, for each dimension, the "deepest" tree of members. we want to capture
    //  the captions, the level (unique) names, and a list (again for each dimension) of levels that occupy a root. this last
    //  is important because we don't want to add headers for levels that are in the hierarchy but not used in this particular analysis
    const positionCaptionsWide: string[][] = [];
    const positionLevelNamesWide: string[][] = [];
    const rootPositionLevelNames: string[][] = [];
    ret.positions.forEach((position: MondrianResultAxisPosition): void => {
      position.positionMembersFlattened.forEach((pl: MondrianResultAxisPositionMember[], plIdx: number): void => {
        // one time through this loop for each dimension on this axis
        if (!rootPositionLevelNames[plIdx]) {
          // if we don't yet have a list of root levels for this dimension, then add an empty list
          rootPositionLevelNames[plIdx] = [];
        }
        if (!positionCaptionsWide[plIdx] || pl.length > positionCaptionsWide[plIdx].length) {
          // if it's either the first time through, or if the list of members is longer than any we've seen before, then make it the longest
          positionCaptionsWide[plIdx] = [];
          positionLevelNamesWide[plIdx] = [];
          pl.forEach((member: MondrianResultAxisPositionMember): void => {
            positionCaptionsWide[plIdx].push(member.memberLevelCaption);
            positionLevelNamesWide[plIdx].push(member.memberLevelName);
          });
          if (!rootPositionLevelNames[plIdx].includes(pl[0].memberLevelName)) {
            // add the root level to the list of roots for this dimension, if we haven't already added it on a prior loop
            rootPositionLevelNames[plIdx].push(pl[0].memberLevelName);
          }
        }
      });
    });
    ret.axisHeaders = [];
    ret.axisLevelUniqueNames = [];
    const measureHeaders = [];
    const measureLevelNames = [];
    // now we "really" flatten the headers, by taking the resulting stacks and spreading them out into what will be the columns in the table
    // note that we handle measures specially. also we reverse the stacks, because we want the highest level rollups to be towards the top of the table
    // (for column headers) and to the left of the rows (for row headers). However, we don't want to reverse the measures, and we also want the measures
    // to appear at the end of the column axis headers (so they appear in the last header row).
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
    ret.axisHeaders = ret.axisHeaders.concat(measureHeaders.reverse()); // note that we re-reverse the measures :)
    ret.axisLevelUniqueNames = ret.axisLevelUniqueNames.concat(measureLevelNames.reverse());
    return ret;
  }
}

export class MondrianResultAxisPosition {
  memberDimensionNames: string[];
  memberDimensionCaptions: string[];
  positionMembers: MondrianResultAxisPositionMember[];
  positionMembersFlattened: MondrianResultAxisPositionMember[][] = [];
  static fromJSON(rawObject: any): MondrianResultAxisPosition {
    const ret = new MondrianResultAxisPosition();
    ret.memberDimensionNames = rawObject.memberDimensionNames;
    ret.memberDimensionCaptions = rawObject.memberDimensionCaptions;
    ret.positionMembers = rawObject.positionMembers.map((rawMember: any): MondrianResultAxisPositionMember => {
      return MondrianResultAxisPositionMember.fromJSON(rawMember);
    });
    // transform the parent-child relationships for each dimension in this position into a set of stacks; there will be one stack for each dimension involved in the position
    // the first Member in the stack is the "leaf", and subsequent members in the stack are the subsequent parents
    // part of the idea of putting the in a stack is so that we can easily tell which position has the deepest tree
    ret.positionMembersFlattened = ret.positionMembers.map((positionMember: MondrianResultAxisPositionMember): MondrianResultAxisPositionMember[] => {
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