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
