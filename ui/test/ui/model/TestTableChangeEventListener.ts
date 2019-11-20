import { TableChangeEventListener, TableChangeEvent } from "../../../src/js/ui/model/Table";

export class TestTableChangeEventListener implements TableChangeEventListener {
  event: TableChangeEvent;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  f: any;
  constructor() {
    this.f = jest.fn();
  }
  tableChanged(event: TableChangeEvent): void {
    this.event = event;
    this.f();
  }
}
