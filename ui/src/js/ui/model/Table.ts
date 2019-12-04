import { List, ListChangeEvent } from "../../collections/List";
import { Observable } from "../../util/Observable";

export class TableModel<T> {

  private rowList: List<TableRow<T>>;
  readonly columnHeaders: string[];
  private tableChangeEventListeners: TableChangeEventListener[];
  private rowCount = new Observable<number>();

  constructor(rowList: List<TableRow<T>>, columnHeaders: string[]) {

    this.rowList = rowList;
    this.rowCount.value = rowList.length;
    this.columnHeaders = columnHeaders;
    this.tableChangeEventListeners = [];

    /* eslint-disable @typescript-eslint/no-this-alias */
    const self = this;

    this.rowList.addChangeEventListener({
      listChanged(_e: ListChangeEvent): Promise<void> {
        self.notifyListeners(new TableChangeEvent());
        self.rowCount.value = rowList.length;
        return;
      },
      listWillChange(_e: ListChangeEvent): Promise<void> {
        return;
      }
    });

  }

  get rows(): Iterable<TableRow<T>> {
    return this.rowList;
  }

  getRowAt(index: number): TableRow<T> {
    return this.rowList.get(index);
  }

  getColumnCount(): Observable<number> {
    const ret: Observable<number> = new Observable();
    ret.value = this.columnHeaders.length;
    return ret;
  }

  getRowCount(): Observable<number> {
    return this.rowCount;
  }

  notifyListeners(event: TableChangeEvent): void {
    this.tableChangeEventListeners.forEach((listener: TableChangeEventListener) => {
      listener.tableChanged(event);
    });
  }

  addTableChangeEventListener(listener: TableChangeEventListener): TableChangeEventListener {
    this.tableChangeEventListeners.push(listener);
    return listener;
  }

  removeTableChangeEventListener(listener: TableChangeEventListener): TableChangeEventListener {
    let ret: TableChangeEventListener = null;
    this.tableChangeEventListeners.forEach((thisListener: TableChangeEventListener, index: number): boolean => {
      if (listener == thisListener) {
        this.tableChangeEventListeners.splice(index, 1);
        ret = thisListener;
        return true;
      }
      return false;
    });
    return ret;
  }

}

export interface TableRow<T> {
  getValueAt(columnIndex: number): string;
  getItem(): T;
}

export class TableChangeEvent {
}

export interface TableChangeEventListener {
  tableChanged(event: TableChangeEvent): void;
}
