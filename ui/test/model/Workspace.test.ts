import { Workspace } from '../../src/js/model/Workspace';

const workspace = new Workspace();

// we will eventually evolve this test as the workspace functionality becomes more involved

test('model initialization', () => {
  expect(workspace.analyses.length).toBe(0);
});
