import { MondrianResult, MondrianResultAxisPosition, MondrianResultCell } from "../../model/MondrianResult";

export class MondrianResultTableModel {

  // note: we don't make this observable (i.e., with a List) because the data is static once the results are set. So we can simplify.

  private _mondrianResult: MondrianResult;
  private _headerRows: string[][];
  private  _topLeftEmptyColumnCount = 0;

  set result(mondrianResult: MondrianResult) {
    this._mondrianResult = mondrianResult;
    this.setHeaderRows(mondrianResult);
    this.changeListeners.forEach((listener: MondrianTableModelChangeListener): void => {
      listener.mondrianTableModelChanged(new MondrianTableModelChangeEvent(this));
    });
  }

  get headerRows(): string[][] {
    return this._headerRows;
  }

  get rowHeaders(): string[][] {
    let ret = [];
    if (this._mondrianResult.rowAxis) {
      ret = this._mondrianResult.rowAxis.positions.map((rowPosition: MondrianResultAxisPosition): string[] => {
        return rowPosition.memberDimensionValues;
      });
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

  private setHeaderRows(mondrianResult: MondrianResult): void {

    // note: this assumes we always put the columns on the columns axis, which is conventional

    this._headerRows = [];

    if (this._mondrianResult) {

      this._headerRows = mondrianResult.columnCaptions.map((columnCaption: string, captionIndex: number): string[] => {
        const columnHeaders = mondrianResult.columnAxis.positions
          .map((position: MondrianResultAxisPosition): string => {
            return position.memberDimensionValues[captionIndex];
          });
        const base = columnCaption === "MeasuresLevel" ? [] : [columnCaption];
        return base.concat(columnHeaders);
      });

      const emptyRowHeaders = mondrianResult.rowCaptions.map((_rowCaption: string): string => {
        return null;
      });

      emptyRowHeaders.splice(0, 1);
      this._topLeftEmptyColumnCount = emptyRowHeaders.length;

      this._headerRows = this._headerRows.map((row: string[], rowIndex: number): string[] => {
        let rowHeaderColumns = emptyRowHeaders;
        if (rowIndex === this._headerRows.length - 1) {
          rowHeaderColumns = mondrianResult.rowCaptions;
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