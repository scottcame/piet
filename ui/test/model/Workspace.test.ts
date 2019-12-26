import { Workspace } from '../../src/js/model/Workspace';
import { LocalRepository, Repository, RepositoryQuery } from '../../src/js/model/Repository';
import { List } from '../../src/js/collections/List';
import { Analysis } from '../../src/js/model/Analysis';
import { Dataset } from '../../src/js/model/Dataset';

const repo: LocalRepository = new LocalRepository();
const workspace = new Workspace(repo);

// we will eventually evolve this test as the workspace functionality becomes more involved

test('model initialization', () => {
  expect(workspace.analyses.length).toBe(0);
});

/* eslint-disable jest/no-focused-tests */

test('minimizing workspace saves', async () => {
  const mock = new MockRepository();
  mock.init();
  expect(mock.init).toHaveBeenCalledTimes(1);
  await mock.workspace.analyses.add(new Analysis(null, "Analysis 1"));
  expect(mock.saveWorkspace).toHaveBeenCalledTimes(1);
  mock.saveWorkspace.mockClear();
  mock.workspace.autosaveChanges = false;
  await mock.workspace.analyses.add(new Analysis(null, "Analysis 2"));
  expect(mock.saveWorkspace).toHaveBeenCalledTimes(0);
  const a: Analysis = mock.workspace.analyses.get(1);
  expect(a.name).toBe("Analysis 2");
  a.setDescription("Foo");
  expect(mock.saveWorkspace).toHaveBeenCalledTimes(0);
  mock.workspace.autosaveChanges = true;
  a.setDescription("Foo");
  expect(mock.saveWorkspace).toHaveBeenCalledTimes(1);
});

class MockRepository implements Repository {
  
  analyses: List<Analysis>;
  workspace: Workspace;

  constructor() {
    this.analyses = new List();
    this.workspace = new Workspace(this);
  }

  init = jest.fn((): Promise<void> => {
    return Promise.resolve();
  });
  
  saveWorkspace = jest.fn((): Promise<void> => { return; });

  browseDatasets(): Promise<Dataset[]> {
    throw new Error("Method not implemented.");
  }
  browseAnalyses(): Promise<Analysis[]> {
    throw new Error("Method not implemented.");
  }
  searchAnalyses(_query: RepositoryQuery): Promise<Analysis[]> {
    throw new Error("Method not implemented.");
  }
  saveAnalysis(_analysis: Analysis): Promise<string> {
    throw new Error("Method not implemented.");
  }
  deleteAnalysis(_analysis: Analysis): Promise<string> {
    throw new Error("Method not implemented.");
  }
  executeQuery(_mdx: string): Promise<import("../../src/js/model/MondrianResult").MondrianResult> {
    throw new Error("Method not implemented.");
  }
  
}