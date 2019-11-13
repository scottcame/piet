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
