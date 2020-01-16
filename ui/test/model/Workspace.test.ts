import { Workspace } from '../../src/js/model/Workspace';
import { LocalRepository, Repository, RepositoryQuery, PietConfiguration } from '../../src/js/model/Repository';
import { List } from '../../src/js/collections/List';
import { Analysis } from '../../src/js/model/Analysis';
import { Dataset } from '../../src/js/model/Dataset';
import { MondrianResult } from '../../src/js/model/MondrianResult';
import { LoggerFactory } from '../../src/js/util/LoggerFactory';

test('model initialization', () => {
  const repo = new LocalRepository(LoggerFactory.getLevelForString(process.env.PIET_REPO_LOG_LEVEL));
  const workspace = repo.workspace;
  expect(workspace.analyses.length).toBe(0);
});

test('analysis deserialization fail', async () => {
  const repo = new LocalRepository(LoggerFactory.getLevelForString(process.env.PIET_REPO_LOG_LEVEL));
  return repo.init().then(async () => {
    return repo.browseDatasets().then(async (repoDatasets: Dataset[]) => {
      const analysis = new Analysis(null, "Analysis 1");
      analysis.dataset = repoDatasets[0];
      return repo.workspace.analyses.add(analysis).then(async () => {
        expect(repo.workspace.analyses).toHaveLength(1);
        return repo.init().then(async () => {
          expect(repo.workspace.analyses).toHaveLength(1);
          repo.wipeDatasetsForTesting();
          return expect(repo.init()).rejects.toMatch(/dataset.+not found/);
        });
      });
    });
  });
});

test('minimizing workspace saves', async () => {
  const mock = new MockRepository();
  mock.init();
  expect(mock.init).toHaveBeenCalledTimes(1);
  return mock.workspace.analyses.add(new Analysis(null, "Analysis 1")).then(async () => {
    expect(mock.saveWorkspace).toHaveBeenCalledTimes(1);
    mock.saveWorkspace.mockClear();
    mock.workspace.autosaveChanges = false;
    return mock.workspace.analyses.add(new Analysis(null, "Analysis 2")).then(async () => {
      expect(mock.saveWorkspace).toHaveBeenCalledTimes(0);
      const a: Analysis = mock.workspace.analyses.get(1);
      expect(a.name).toBe("Analysis 2");
      return a.setDescription("Foo").then(async () => {
        expect(mock.saveWorkspace).toHaveBeenCalledTimes(0);
        mock.workspace.autosaveChanges = true;
        return a.setDescription("Foo").then(async () => {
          expect(mock.saveWorkspace).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
});

class MockRepository implements Repository {
  
  analyses: List<Analysis>;
  workspace: Workspace;
  readonly pietConfiguration = new PietConfiguration();
  log: LoggerFactory;

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
  executeQuery(_mdx: string): Promise<MondrianResult> {
    throw new Error("Method not implemented.");
  }
  clearWorkspace(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  
}