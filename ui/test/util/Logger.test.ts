import { Logger } from '../../src/js/util/Logger';

test('correct source location', () => {
  // obvs this test is sensitive to the location of the next line in this source file...
  let msg = Logger.getInstance().getLogMessage('x');
  expect(msg).toBe("[Logger.test.ts:5:34] x");
});
