import { LoggerFactory, LogLevel } from "../../src/js/util/LoggerFactory";

/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

test('basic logging', () => {
  const log = new LoggerFactory(LogLevel.INFO);
  const stockConsoleLog = console.log;
  console.log = jest.fn((_message: any): void => {});
  log.error('An error');
  expect(console.log).toHaveBeenCalledTimes(1);
  log.info('An info');
  expect(console.log).toHaveBeenCalledTimes(2);
  log.debug('A debug');
  expect(console.log).toHaveBeenCalledTimes(2);
  console.log = stockConsoleLog;
});