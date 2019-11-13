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
