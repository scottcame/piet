import { LocalRepository } from "../../src/js/model/Repository";
import { List } from "../../src/js/collections/List";
import { Analysis } from "../../src/js/model/Analysis";

test('local repository', async () => {
  const repo: LocalRepository = new LocalRepository();
  await repo.init().then(async () => {
    expect(repo).not.toBeNull();
    expect(repo.browseDatasets().length).toBe(2);
    await repo.browseAnalyses().then((aa: List<Analysis>) => {
      expect(aa).toHaveLength(2);
    });
  });
});
