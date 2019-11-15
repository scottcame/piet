import { Repository, LocalRepository } from "../../src/js/model/Repository";

test('local repository', () => {
  const repo: Repository = LocalRepository.loadFromTestMetadata();
  expect(repo).not.toBeNull();
  expect(repo.browseDatasets().length).toBe(2);
  expect(repo.browseAnalyses().length).toBe(2);
  expect(repo.searchAnalyses(null).length).toBe(2);
  // no need to test further, errors will be evident in demo UI
});
