// Copyright 2020 National Police Foundation
// Copyright 2020 Scott Came Consulting LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
