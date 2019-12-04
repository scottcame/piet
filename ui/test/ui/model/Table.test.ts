import { TableRow, TableModel } from "../../../src/js/ui/model/Table";
import { List } from "../../../src/js/collections/List";
import { TestTableChangeEventListener } from "./TestTableChangeEventListener";
import { TestObservableChangeEventListener } from "../../util/TestObservableChangeEventListener";

class TestTableRow implements TableRow<string[]> {
  values: string[];
  constructor(values: string[]=[]) {
    this.values = values;
  }
  getValueAt(columnIndex: number): string {
    return this.values[columnIndex];
  }
  getItem(): string[] {
    return this.values;
  }
}

const tableRows = new List<TestTableRow>();
tableRows.add(new TestTableRow(["r0c0","r0c1"]));
tableRows.add(new TestTableRow(["r1c0","r1c1"]));
const tableModel = new TableModel(tableRows, ["c0","c1"]);

test('columns', () => {
  expect(tableModel.columnHeaders).toContain("c0");
  expect(tableModel.columnHeaders).toContain("c1");
  expect(tableModel.columnHeaders).toHaveLength(2);
  expect(tableModel.getColumnCount().value).toBe(2);
});

test('rows', () => {
  expect(tableModel.getRowCount().value).toBe(2);
  expect(tableModel.getRowAt(0).getValueAt(0)).toBe("r0c0");
  expect(tableModel.getRowAt(0).getValueAt(1)).toBe("r0c1");
  expect(tableModel.getRowAt(1).getValueAt(0)).toBe("r1c0");
  expect(tableModel.getRowAt(1).getValueAt(1)).toBe("r1c1");
});

test('events', async () => {
  const tableListener = new TestTableChangeEventListener();
  tableModel.addTableChangeEventListener(tableListener);
  const rowCountListener = new TestObservableChangeEventListener();
  tableModel.getRowCount().addChangeEventListener(rowCountListener);
  await tableRows.add(new TestTableRow(["r2c0","r2c1"]));
  expect(rowCountListener.f).toHaveBeenCalledTimes(1);
  expect(rowCountListener.event.oldValue).toBe(2);
  expect(rowCountListener.event.newValue).toBe(3);
  expect(tableListener.f).toHaveBeenCalledTimes(1);
  tableListener.f.mockClear();
  rowCountListener.f.mockClear();
  await tableRows.removeAt(0);
  expect(rowCountListener.f).toHaveBeenCalledTimes(1);
  expect(rowCountListener.event.oldValue).toBe(3);
  expect(rowCountListener.event.newValue).toBe(2);
  expect(tableListener.f).toHaveBeenCalledTimes(1);
  expect(tableModel.getRowAt(0).getValueAt(0)).toBe("r1c0");
});

test('iterable rows', () => {
  expect([...tableModel.rows]).toHaveLength(2);
});
