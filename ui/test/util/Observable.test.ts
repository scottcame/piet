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

import { Observable } from "../../src/js/util/Observable";
import { TestObservableChangeEventListener } from "./TestObservableChangeEventListener";

let o: Observable<number>;

beforeEach(() => {
  o = new Observable<number>();
  o.value = 1;
});

test('observation', () => {
  const testListener = new TestObservableChangeEventListener();
  o.addChangeEventListener(testListener);
  o.value = 10;
  expect(testListener.f).toHaveBeenCalledTimes(1);
  expect(testListener.event.newValue).toBe(10);
  expect(testListener.event.oldValue).toBe(1);
  o.removeChangeEventListener(testListener);
  testListener.f.mockClear();
  o.value = 11;
  expect(testListener.f).not.toHaveBeenCalled();
});

test('editing', () => {
  expect(o.dirty).toBe(false);
  o.value = 2;
  expect(o.dirty).toBe(true);
  const testListener = new TestObservableChangeEventListener();
  o.addChangeEventListener(testListener);
  o.cancelEdits();
  expect(testListener.f).toHaveBeenCalledTimes(1);
  expect(o.dirty).toBe(false);
  expect(o.value).toBe(1);
  o.value = 2;
  o.checkpointEdits();
  expect(o.dirty).toBe(false);
  expect(o.value).toBe(2);
});
