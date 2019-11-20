import { LocalRepository } from "../../../src/js/model/Repository";
import { List } from "../../../src/js/collections/List";
import { Analysis } from "../../../src/js/model/Analysis";
import { AnalysisAdapterFactory } from "../../../src/js/ui/adapters/AnalysisAdapterFactory";
import { TableModel } from "../../../src/js/ui/model/Table";
import { TestTableChangeEventListener } from "../model/TestTableChangeEventListener";

const adapterFactory = AnalysisAdapterFactory.getInstance();

test('table model construction', async () => {

  const repo: LocalRepository = new LocalRepository();
  const tableModel: TableModel = adapterFactory.getTableModel(repo.analyses);

  expect(tableModel.getColumnCount().value).toBe(2);
  expect(tableModel.columnHeaders).toContain("Name");
  expect(tableModel.columnHeaders).toContain("Description");
  expect(tableModel.getRowCount().value).toBe(0);

  await repo.init().then(async () => {
    await repo.browseAnalyses().then((analyses: List<Analysis>) => {
      expect(analyses).toHaveLength(2);
      expect(tableModel.getRowCount().value).toBe(2);
      expect(tableModel.getRowAt(0).getValueAt(0)).toBe(analyses.get(0).name.value);
      expect(tableModel.getRowAt(1).getValueAt(0)).toBe(analyses.get(1).name.value);
      expect(tableModel.getRowAt(0).getValueAt(1)).toBe(analyses.get(0).description);
      expect(tableModel.getRowAt(1).getValueAt(1)).toBe(analyses.get(1).description);
    });
  });

});

test('table model events', async () => {

  const repo: LocalRepository = new LocalRepository();
  const tableModel: TableModel = adapterFactory.getTableModel(repo.analyses);

  expect(tableModel.getRowCount().value).toBe(0);

  const listener = new TestTableChangeEventListener();
  tableModel.addTableChangeEventListener(listener);

  await repo.init().then(async () => {
    await repo.browseAnalyses().then((_analyses: List<Analysis>) => {
      // the table will get change events twice...one for the initial setting of the (empty) analysis list, and one when the two-row list is set
      expect(listener.f).toHaveBeenCalledTimes(2);
    });
  });

});
