import { List, DefaultListChangeEventListener, ListChangeEvent } from "../../collections/List";
import { Observable } from "../../util/Observable";

export class TableModel {

  private rowList: List<TableRow>;
  readonly columnHeaders: string[];
  private tableChangeEventListeners: TableChangeEventListener[];
  private rowCount = new Observable<number>();

  constructor(rowList: List<TableRow>, columnHeaders: string[]) {
    this.rowList = rowList;
    this.rowCount.value = rowList.length;
    this.columnHeaders = columnHeaders;
    this.tableChangeEventListeners = [];
    this.rowList.addChangeEventListener(new DefaultListChangeEventListener((_event: ListChangeEvent) => {
      this.notifyListeners(new TableChangeEvent());
      this.rowCount.value = rowList.length;
    }));
  }

  get rows(): Iterable<TableRow> {
    return this.rowList;
  }

  getRowAt(index: number): TableRow {
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

export interface TableRow {
  getValueAt(columnIndex: number): string;
}

export class TableChangeEvent {
}

export interface TableChangeEventListener {
  tableChanged(event: TableChangeEvent): void;
}

interface TableChangeEventCallback {
  (event: TableChangeEvent): void;
}

export class DefaultTableChangeEventListener implements TableChangeEventListener {
  private callback: TableChangeEventCallback;
  constructor(callback: TableChangeEventCallback) {
    this.callback = callback;
  }
  tableChanged(event: TableChangeEvent): void {
    this.callback(event);
  }
}
