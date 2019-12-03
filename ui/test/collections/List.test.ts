import { List, ListChangeEventListener, ListChangeEvent } from '../../src/js/collections/List';

let list: List<number>;

beforeEach(() => {
  list = new List<number>();
});

test('init', () => {
  expect(list.length).toBe(0);
  expect(list).toHaveLength(0); // works
});

test('add', () => {
  list.add(10);
  expect(list).toHaveLength(1);
  expect(list.get(0)).toBe(10);
});

test('add all', () => {
  list.addAll([10,20,30]);
  expect(list).toHaveLength(3);
  expect(list.get(0)).toBe(10);
  expect(list.get(1)).toBe(20);
});

test('clear', async () => {
  list.add(10);
  const removed = await list.clear();
  expect(list).toHaveLength(0);
  expect(removed).toBe(1);
});

test('set', async () => {
  list.add(10);
  const added = await list.set([100]);
  expect(list).toHaveLength(1);
  expect(added).toBe(1);
  expect(list.get(0)).toBe(100);
});

test('remove at', async () => {
  list.addAll([10,20,30]);
  const removed = await list.removeAt(1);
  expect(removed).toBe(20);
  expect(list).toHaveLength(2);
  await list.removeAt(0);
  await list.removeAt(0);
  expect(list).toHaveLength(0);
  expect(async () => {
    // just like array, it's ok if we try to remove stuff at nonexistent indices
    await list.removeAt(0);
    await list.removeAt(1);
  }).not.toThrow();
});

test('get at nonexistent index', () => {
  expect(() => {
    list.get(0);
    list.get(1);
  }).not.toThrow();
});

test('for each', () => {
  const vals = [10,20,30];
  list.addAll(vals);
  const f = jest.fn();
  list.forEach(f);
  expect(f).toHaveBeenCalledTimes(3);
  vals.forEach((val, idx) => {
    expect(f).toHaveBeenNthCalledWith(idx+1, val, idx);
  });
});

test('map', () => {
  const vals = [10,20,30];
  list.addAll(vals);
  const f = jest.fn((val, _idx) => {
    return val;
  });
  const ret = list.map(f);
  expect(f).toHaveBeenCalledTimes(3);
  vals.forEach((val, idx) => {
    expect(f).toHaveBeenNthCalledWith(idx+1, val, idx);
    expect(ret.get(idx)).toBe(vals[idx]);
  });
});

class TestListChangeEventListener implements ListChangeEventListener {
  event: ListChangeEvent;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  f: any;
  constructor() {
    this.f = jest.fn();
  }
  listChanged(event: ListChangeEvent): Promise<void> {
    this.event = event;
    this.f();
    return;
  }
}

test('observation', () => {
  const testListener = new TestListChangeEventListener();
  list.addChangeEventListener(testListener);
  list.add(1);
  expect(testListener.f).toHaveBeenCalledTimes(1);
  expect(testListener.event.type).toBe(ListChangeEvent.ADD);
  expect(testListener.event.index).toBe(0);
  list.removeChangeEventListener(testListener);
  testListener.f.mockClear();
  list.add(1);
  expect(testListener.f).not.toHaveBeenCalled();
  list.addChangeEventListener(testListener);
  list.removeAt(0);
  expect(testListener.f).toHaveBeenCalledTimes(1);
  expect(testListener.event.type).toBe(ListChangeEvent.DELETE);
  expect(testListener.event.index).toBe(0);
});

test('iteration', () => {
  const vals = [10,20,30];
  list.addAll(vals);
  const ret = [];
  for(const item of list) {
    ret.push(item);
  }
  ret.forEach((val, idx) => {
    expect(val).toBe(vals[idx]);
  });

});

test('filter', () => {
  let filteredList = list.filter((item: number): boolean => {
    return item > 1;
  });
  expect(filteredList).toHaveLength(0);
  list.add(1);
  list.add(2);
  list.add(3);
  filteredList = list.filter((item: number): boolean => {
    return item > 1;
  });
  expect(filteredList).toHaveLength(2);
  expect(filteredList.includes(1)).toBe(false);
  expect(filteredList.includes(2)).toBe(true);
  expect(filteredList.includes(3)).toBe(true);
});
