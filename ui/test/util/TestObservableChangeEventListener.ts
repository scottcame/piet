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

import { ObservableChangeEventListener, ObservableChangeEvent } from "../../src/js/util/Observable";

export class TestObservableChangeEventListener<T> implements ObservableChangeEventListener<T> {
  event: ObservableChangeEvent<T>;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  f: any;
  constructor() {
    this.f = jest.fn();
  }
  observableChanged(event: ObservableChangeEvent<T>): void {
    this.event = event;
    this.f();
  }
}
