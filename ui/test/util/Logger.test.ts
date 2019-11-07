import { Logger } from '../../src/js/util/Logger';

test('correct source location', () => {
  // obvs this test is sensitive to the location of the next line in this source file...
  const msg = Logger.getInstance().getLogMessage('x');
  expect(msg).toBe("[Logger.test.ts:5:36] x");
});
