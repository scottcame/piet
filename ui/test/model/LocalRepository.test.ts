import { LocalRepository } from "../../src/js/model/Repository";
import { List } from "../../src/js/collections/List";
import { Analysis } from "../../src/js/model/Analysis";

const repo: LocalRepository = new LocalRepository();

test('local repository browse', async () => {
  await repo.init().then(async () => {
    expect(repo).not.toBeNull();
    expect(repo.browseDatasets().length).toBe(2);
    return repo.browseAnalyses().then((aa: List<Analysis>) => {
      expect(aa).toHaveLength(2);
    });
  });
});

test('local repository save', async () => {
  await repo.init().then(async () => {
    await repo.browseAnalyses().then(async (aa: List<Analysis>) => {
      const originalLength = aa.length;
      const analysis = new Analysis(repo.browseDatasets().get(0), "test-name");
      analysis.setDescription("test-description");
      await expect(repo.saveAnalysis(analysis)).resolves.toEqual(originalLength + 1);
      return repo.browseAnalyses().then((aa: List<Analysis>) => {
        expect(aa.get(originalLength).name).toBe("test-name");
      });
    });
  });
});

test('local repository delete', async () => {
  await repo.init().then(async () => {
    await repo.browseAnalyses().then(async (aa: List<Analysis>) => {
      return expect(repo.deleteAnalysis(aa.get(0))).resolves.toBe(aa.get(0).id);
    });
  });
});
