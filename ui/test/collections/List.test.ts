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

import { List, ListChangeEventListener, ListChangeEvent, CloneableList, ListChangeEventType } from '../../src/js/collections/List';
import { Cloneable } from '../../src/js/model/Persistence';

let list: List<number>;

beforeEach(() => {
  list = new List<number>();
});

test('init', () => {
  expect(list.length).toBe(0);
  expect(list).toHaveLength(0); // works
});

test('add', () => {
  return list.add(10).then(() => {
    expect(list).toHaveLength(1);
    expect(list.get(0)).toBe(10);
  });
});

test('add all', () => {
  return list.addAll([10,20,30]).then(() => {
    expect(list).toHaveLength(3);
    expect(list.get(0)).toBe(10);
    expect(list.get(1)).toBe(20);
  });
});

test('clear', async () => {
  await list.add(10); // different style of async/await...
  const removed = await list.clear();
  expect(list).toHaveLength(0);
  expect(removed).toBe(1);
});

test('set', async () => {
  await list.add(10);
  const added = await list.set([100]);
  expect(list).toHaveLength(1);
  expect(added).toBe(1);
  expect(list.get(0)).toBe(100);
});

test('remove at', async () => {
  await list.addAll([10,20,30]);
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

test('insert at', async () => {
  await list.addAll([1,2,3]).then(async () => {
    await list.addAt(1.5, 1).then(async () => {
      expect(list.asArray()).toMatchObject([1,1.5,2,3]);
      await list.addAt(0.5, 0).then(async () => {
        expect(list.asArray()).toMatchObject([0.5,1,1.5,2,3]);
        await list.addAt(99, 100).then(async () => {
          expect(list.asArray()).toMatchObject([0.5,1,1.5,2,3,99]);
        });
      });
    });
  });
});

test('get at nonexistent index', () => {
  expect(() => {
    list.get(0);
    list.get(1);
  }).not.toThrow();
});

test('for each', async () => {
  const vals = [10,20,30];
  await list.addAll(vals);
  const f = jest.fn();
  list.forEach(f);
  expect(f).toHaveBeenCalledTimes(3);
  vals.forEach((val, idx) => {
    expect(f).toHaveBeenNthCalledWith(idx+1, val, idx);
  });
});

test('map', async () => {
  const vals = [10,20,30];
  await list.addAll(vals);
  const f = jest.fn((val, _idx) => {
    return val;
  });
  return list.map(f).then((newList: List<number>) => {
    expect(f).toHaveBeenCalledTimes(3);
    vals.forEach((val, idx) => {
      expect(f).toHaveBeenNthCalledWith(idx+1, val, idx);
      expect(newList.get(idx)).toBe(vals[idx]);
    });
  });
});

test('asArray', async () => {
  let vals = [10, 20, 30];
  return list.set(vals).then(async () => {
    expect(list.asArray()).toMatchObject(vals);
    vals = [];
    return list.set(vals).then(() => {
      expect(list.asArray()).toMatchObject(vals);
    });
  });
});

class TestListChangeEventListener implements ListChangeEventListener {
  event: ListChangeEvent;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  fpost: any;
  fpre: any;
  constructor() {
    this.fpost = jest.fn();
    this.fpre = jest.fn();
  }
  listChanged(event: ListChangeEvent): Promise<void> {
    this.event = event;
    this.fpost();
    return;
  }
  listWillChange(event: ListChangeEvent): Promise<void> {
    this.event = event;
    this.fpre();
    return;
  }
}

test('observation', async () => {
  const testListener = new TestListChangeEventListener();
  list.addChangeEventListener(testListener);
  await list.add(1);
  expect(testListener.fpost).toHaveBeenCalledTimes(1);
  expect(testListener.event.type).toBe(ListChangeEventType.ADD);
  expect(testListener.event.index).toBe(0);
  list.removeChangeEventListener(testListener);
  testListener.fpost.mockClear();
  await list.add(1);
  expect(testListener.fpost).not.toHaveBeenCalled();
  list.addChangeEventListener(testListener);
  await list.removeAt(0);
  expect(testListener.fpost).toHaveBeenCalledTimes(1);
  expect(testListener.event.type).toBe(ListChangeEventType.DELETE);
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

test('filter', async () => {
  let filteredList = list.filter((item: number): boolean => {
    return item > 1;
  });
  expect(filteredList).toHaveLength(0);
  await Promise.all([
    list.add(1),
    list.add(2),
    list.add(3)
  ]);
  filteredList = list.filter((item: number): boolean => {
    return item > 1;
  });
  expect(filteredList).toHaveLength(2);
  expect(filteredList.includes(1)).toBe(false);
  expect(filteredList.includes(2)).toBe(true);
  expect(filteredList.includes(3)).toBe(true);
});

test('cloneable', async () => {
  const list: CloneableList<CloneableString> = new CloneableList();
  await list.add(new CloneableString("foo"));
  const list2 = list.clone();
  expect(Object.is(list, list2)).toBe(false);
  expect(Object.is(list.get(0), list2.get(0))).toBe(false);
  expect(list.get(0).s).toEqual(list2.get(0).s);
});

class CloneableString implements Cloneable<CloneableString> {
  s: string;
  constructor(s: string = null) {
    this.s = s;
  }
  clone(): CloneableString {
    const ret = new CloneableString();
    ret.s = this.s;
    return ret;
  }
}
