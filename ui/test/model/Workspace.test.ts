import { Workspace } from '../../src/js/model/Workspace';
import { LocalRepository } from '../../src/js/model/Repository';

const repo: LocalRepository = new LocalRepository();
const workspace = new Workspace(repo);

// we will eventually evolve this test as the workspace functionality becomes more involved

test('model initialization', () => {
  expect(workspace.analyses.length).toBe(0);
});
