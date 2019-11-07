import { Model } from '../../src/js/model/Model';

test('model initialization', () => {
  const m = new Model();
  expect(m.analyses.length).toBe(0);
});
