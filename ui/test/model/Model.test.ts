import { Model } from '../../src/js/model/Model';

test('model initialization', () => {
  let m = new Model();
  expect(m.analyses.length).toBe(1);
})
