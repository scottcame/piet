import { MondrianResult, MondrianResultAxisPosition, MondrianResultCell } from "../../model/MondrianResult";

export class MondrianResultTableModel {

  // note: we don't make this observable (i.e., with a List) because the data is static once the results are set. So we can simplify.

  private _mondrianResult: MondrianResult;
  private _headerRows: string[][];
  private  _topLeftEmptyColumnCount = 0;

  set result(mondrianResult: MondrianResult) {
    this._mondrianResult = mondrianResult;
    this.populateHeaderRows();
    this.changeListeners.forEach((listener: MondrianTableModelChangeListener): void => {
      listener.mondrianTableModelChanged(new MondrianTableModelChangeEvent(this));
    });
  }

  get headerRows(): string[][] {
    return this._headerRows;
  }

  get rowHeaders(): string[][] {
    let ret = []; // default case: no rows or columns
    if (this._mondrianResult.rowAxis) {
      ret = this._mondrianResult.rowAxis.positions.map((position: MondrianResultAxisPosition): string[] => {
        return this._mondrianResult.rowAxis.axisHeaders.map((_axisHeader: string, axisHeaderIndex: number): string => {
          const levelName = this._mondrianResult.rowAxis.axisLevelUniqueNames[axisHeaderIndex];
          return position.findMemberValue(levelName);
        });
      });
    } else if (this._mondrianResult.columnAxis.positions[0].memberDimensionNames.length > 1) {
      // if we are in here, we have no rows, but some columns (beyond just the measures)
      ret = [[""]]; // padding for the column to balance the column captions column
    }
    return ret;
  }

  get columnCount(): number {
    return this._mondrianResult ? this._headerRows[0].length : 0;
  }

  get topLeftEmptyColumnCount(): number {
    return this._topLeftEmptyColumnCount;
  }

  get rowCount(): number {
    return this._headerRows.length + this.dataRowCount;
  }

  get dataColumnCount(): number {
    return this._mondrianResult ? this._mondrianResult.columnAxis.positions.length : 0;
  }

  get dataRowCount(): number {
    return this._mondrianResult ? (this._mondrianResult.rowAxis ? this._mondrianResult.rowAxis.positions.length : 1) : 0;
  }

  private getCellAt(rowIndex: number, columnIndex: number): MondrianResultCell {
    // note that mondrian result cells have coordinates as (column, row) because that's the order of the axes
    return this._mondrianResult ? this._mondrianResult.cells[rowIndex*this.dataColumnCount + columnIndex] : null;
  }

  getValueAt(rowIndex: number, columnIndex: number): string | number {
    const cell = this.getCellAt(rowIndex, columnIndex);
    return cell ? cell.value : null;
  }

  getFormattedValueAt(rowIndex: number, columnIndex: number): string {
    const cell = this.getCellAt(rowIndex, columnIndex);
    return cell ? cell.formattedValue : null;
  }

  private populateHeaderRows(): void {

    // note: this assumes we always put the measures on the columns axis, which is conventional

    this._headerRows = [];

    if (this._mondrianResult) {

      this._headerRows = this._mondrianResult.columnAxis.axisHeaders.map((axisHeader: string, axisHeaderIndex: number): string[] => {
        const levelName = this._mondrianResult.columnAxis.axisLevelUniqueNames[axisHeaderIndex];
        const columnHeaders = this._mondrianResult.columnAxis.positions.map((position: MondrianResultAxisPosition): string => {
          return position.findMemberValue(levelName);
        });
        const base = axisHeader === "MeasuresLevel" ? [] : [axisHeader];
        return base.concat(columnHeaders);
      });

      const emptyRowHeaders = this._mondrianResult.rowCaptions.map((_rowCaption: string): string => {
        return null;
      });

      emptyRowHeaders.splice(0, 1);
      this._topLeftEmptyColumnCount = emptyRowHeaders.length;

      this._headerRows = this._headerRows.map((row: string[], rowIndex: number): string[] => {
        let rowHeaderColumns = emptyRowHeaders;
        if (rowIndex === this._headerRows.length - 1) {
          rowHeaderColumns = this._mondrianResult.rowCaptions;
          if (!this._mondrianResult.rowAxis && this._mondrianResult.columnAxis.positions[0].memberDimensionNames.length > 1) {
            // if we are in here, we have no rows, but some columns (beyond just the measures)
            // so add the padding to balance the column captions column
            rowHeaderColumns = [null];
          }
        }
        return rowHeaderColumns.concat(row);
      });

    }

  }

  private changeListeners: MondrianTableModelChangeListener[] = [];

  addMondrianTableModelChangeListener(listener: MondrianTableModelChangeListener): void {
    this.changeListeners.push(listener);
  }

  removeMondrianTableModelChangeListener(listener: MondrianTableModelChangeListener): void {
    const currentIndex = this.changeListeners.indexOf(listener);
    if (currentIndex !== -1) {
      this.changeListeners.splice(currentIndex, 1);
    }
  }

}

export class MondrianTableModelChangeEvent {
  readonly target: MondrianResultTableModel;
  constructor(target: MondrianResultTableModel) {
    this.target = target;
  }
}

export interface MondrianTableModelChangeListener {
  mondrianTableModelChanged(event: MondrianTableModelChangeEvent): void;
}