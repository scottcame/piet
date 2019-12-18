import { LocalRepository } from "../../../src/js/model/Repository";
import { List } from "../../../src/js/collections/List";
import { Dataset } from "../../../src/js/model/Dataset";
import { Analysis } from "../../../src/js/model/Analysis";
import { QueryFilterTableModel, QueryFilterTableModelListener, QueryFilterTableModelEvent } from "../../../src/js/ui/model/QueryFilterTableModel";
import { QueryFilter } from "../../../src/js/model/Query";

let repository: LocalRepository;
const datasets: List<Dataset> = new List();
const model = new QueryFilterTableModel();

beforeEach(async () => {
  repository = new LocalRepository();
  return repository.init().then(async () => {
    return repository.browseDatasets().then(async (d: Dataset[]) => {
      return datasets.set(d);
    });
  });
});

test('basic', async () => {
  const analysis = new Analysis(datasets.get(0), "test-name", null);
  model.init(analysis, "[D1].[D1].[D1_DESCRIPTION]");
  expect(model.columnHeader).toBe("D1_DESCRIPTION");
  expect(model.rowCount).toBe(2);
  expect(model.getValueAt(0)).toBe("D1 One");
  expect(model.getValueAt(1)).toBe("D1 Two");
  expect(model.getRowSelectedAt(0)).toBe(false);
  expect(model.getRowSelectedAt(1)).toBe(false);
  expect(analysis.query.filters).toHaveLength(0);
  expect(model.selectedMemberNames).toHaveLength(0);
  const queryFilter = new QueryFilter("[D1].[D1].[D1_DESCRIPTION]", analysis.query);
  await analysis.query.filters.add(queryFilter).then(async () => {
    await queryFilter.levelMemberNames.add("D1 One").then(async () => {
      expect(model.rowCount).toBe(2);
      expect(model.getRowSelectedAt(0)).toBe(true);
      expect(model.getRowSelectedAt(1)).toBe(false);
      expect(model.selectedMemberNames).toMatchObject(["D1 One"]);
      await queryFilter.levelMemberNames.remove("D1 One").then(async () => {
        expect(model.rowCount).toBe(2);
        expect(model.getRowSelectedAt(0)).toBe(false);
        expect(model.selectedMemberNames).toHaveLength(0);
        // simulate ui editing post-initialization
        model.toggleRowAt(1);
        expect(model.getRowSelectedAt(0)).toBe(false);
        expect(model.getRowSelectedAt(1)).toBe(true);
        expect(model.selectedMemberNames).toMatchObject(["D1 Two"]);
      });
    });
  });
});

class TestListener implements QueryFilterTableModelListener {
  event: QueryFilterTableModelEvent;
  f = jest.fn();
  tableModelUpdated(event: QueryFilterTableModelEvent): void {
    this.event = event;
    this.f();
  }
}

test('events', async () => {
  const listener = new TestListener();
  model.addQueryFilterTableModelListener(listener);
  expect(listener.f).toHaveBeenCalledTimes(0);
  const analysis = new Analysis(datasets.get(0), "test-name", null);
  model.init(analysis, "[D1].[D1].[D1_DESCRIPTION]");
  expect(listener.f).toHaveBeenCalledTimes(1);
  listener.f.mockClear();
  const queryFilter = new QueryFilter("[D1].[D1].[D1_DESCRIPTION]", analysis.query);
  await analysis.query.filters.add(queryFilter).then(async () => {
    expect(listener.f).toHaveBeenCalledTimes(1);
    listener.f.mockClear();
    await queryFilter.levelMemberNames.add("D1 One").then(async () => {
      expect(listener.f).toHaveBeenCalledTimes(1);
    });
  });
});