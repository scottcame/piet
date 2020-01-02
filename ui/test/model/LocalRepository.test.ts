import { LocalRepository } from "../../src/js/model/Repository";
import { Analysis } from "../../src/js/model/Analysis";
import { List } from "../../src/js/collections/List";
import { Dataset } from "../../src/js/model/Dataset";
import { LoggerFactory } from "../../src/js/util/LoggerFactory";

const repo = new LocalRepository(LoggerFactory.getLevelForString(process.env.PIET_REPO_LOG_LEVEL));
const datasets: List<Dataset> = new List();

beforeEach(async () => {
  return repo.init().then(async () => {
    return repo.browseDatasets().then(async (d: Dataset[]) => {
      return datasets.set(d).then();
    });
  });
});
test('local repository browse', async () => {
  await repo.init().then(async () => {
    expect(repo).not.toBeNull();
    expect(datasets.length).toBe(6);
    return repo.browseAnalyses().then((aa: Analysis[]) => {
      expect(aa).toHaveLength(2);
    });
  });
});

test('local repository save', async () => {
  await repo.init().then(async () => {
    await repo.browseAnalyses().then(async (aa: Analysis[]) => {
      const originalLength = aa.length;
      const analysis = new Analysis(datasets.get(0), "test-name");
      analysis.setDescription("test-description");
      await expect(repo.saveAnalysis(analysis)).resolves.toEqual("" + (originalLength + 1)).then(async () => {
        return repo.browseAnalyses().then((aa: Analysis[]) => {
          expect(aa[originalLength].name).toBe("test-name");
        });
      });
    });
  });
});

test('local repository delete', async () => {
  await repo.init().then(async () => {
    await repo.browseAnalyses().then(async (aa: Analysis[]) => {
      return expect(repo.deleteAnalysis(aa[0])).resolves.toBe(aa[0].id);
    });
  });
});

test("Local repository browseDatasets error", async () => {
  repo.simulateBrowseDatasetsError = true;
  return expect(repo.init()).rejects.toMatch(/simulated.+error/);
});