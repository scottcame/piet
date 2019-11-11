import { ObservableChangeEventListener, ObservableChangeEvent, Observable } from "../../src/js/util/Observable";

class TestObservableChangeEventListener implements ObservableChangeEventListener {
  event: ObservableChangeEvent;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  f: any;
  constructor() {
    this.f = jest.fn();
  }
  observableChanged(event: ObservableChangeEvent): void {
    this.event = event;
    this.f();
  }
}

let o: Observable<number>;

beforeEach(() => {
  o = new Observable<number>();
});

test('observation', () => {
  const testListener = new TestObservableChangeEventListener();
  o.addChangeEventListener(testListener);
  o.value = 10;
  expect(testListener.f).toHaveBeenCalledTimes(1);
  o.removeChangeEventListener(testListener);
  testListener.f.mockClear();
  o.value = 11;
  expect(testListener.f).not.toHaveBeenCalled();
});
