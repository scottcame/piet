import { Cloneable } from "../model/Persistence";

export class ListChangeEvent {
  readonly index: number;
  readonly type: ListChangeEventType;
  readonly timing: ListChangeEventTiming;
  constructor(index: number, type: ListChangeEventType, timing: ListChangeEventTiming) {
    this.index = index;
    this.type = type;
    this.timing = timing;
  }
}

export enum ListChangeEventType {
  ADD = "add",
  DELETE = "delete"
}

export enum ListChangeEventTiming {
  PRE = "pre",
  POST = "post"
}

export class List<T> implements Iterable<T> {

  protected a: T[];
  private changeListeners: ListChangeEventListener[];

  constructor() {
    this.changeListeners = [];
    this.a = [];
  }

  async add(item: T): Promise<T> {
    return this.notifyListeners(new ListChangeEvent(this.a.length-1, ListChangeEventType.ADD, ListChangeEventTiming.PRE)).then(async () => {
      this.a.push(item);
      return this.notifyListeners(new ListChangeEvent(this.a.length-1, ListChangeEventType.ADD, ListChangeEventTiming.POST)).then(() => {
        return item;
      });
    });
  }

  async addAll(items: T[]): Promise<number> {
    return this.notifyListeners(new ListChangeEvent(this.a.length-1, ListChangeEventType.ADD, ListChangeEventTiming.PRE)).then(async () => {
      this.a = this.a.concat(items);
      return this.notifyListeners(new ListChangeEvent(this.a.length-1, ListChangeEventType.ADD, ListChangeEventTiming.POST)).then(() => {
        return items.length;
      });
    });
  }

  async set(items: T[]): Promise<number> {
    return this.notifyListeners(new ListChangeEvent(this.a.length-1, ListChangeEventType.ADD, ListChangeEventTiming.PRE)).then(async () => {
      this.a = [].concat(items);
      return this.notifyListeners(new ListChangeEvent(this.a.length-1, ListChangeEventType.ADD, ListChangeEventTiming.POST)).then(() => {
        return this.length;
      });
    });
  }

  async setFromList(list: List<T>): Promise<number> {
    return this.set(list.a);
  }

  async clear(): Promise<number> {
    const ret = this.a.length;
    return this.notifyListeners(new ListChangeEvent(0, ListChangeEventType.DELETE, ListChangeEventTiming.PRE)).then(async () => {
      this.a = [];
      return this.notifyListeners(new ListChangeEvent(0, ListChangeEventType.DELETE, ListChangeEventTiming.POST)).then(() => {
        return ret;
      });
    });
  }

  async removeAt(index: number): Promise<T> {
    const ret = this.a[index];
    return this.notifyListeners(new ListChangeEvent(index, ListChangeEventType.DELETE, ListChangeEventTiming.PRE)).then(async () => {
      this.a.splice(index, 1);
      return this.notifyListeners(new ListChangeEvent(index, ListChangeEventType.DELETE, ListChangeEventTiming.POST)).then(() => {
        return ret;
      });
    });
  }

  async remove(item: T): Promise<T> {
    const idx: number = this.a.indexOf(item);
    if (idx !== -1) {
      return this.removeAt(idx);
    }
    return new Promise<T>(null);
  }

  async addAt(item: T, index: number): Promise<T> {
    if (index >= this.a.length) {
      index = this.a.length;
    }
    return this.notifyListeners(new ListChangeEvent(index, ListChangeEventType.ADD, ListChangeEventTiming.PRE)).then(async () => {
      this.a.splice(index, 0, item);
      return this.notifyListeners(new ListChangeEvent(index, ListChangeEventType.ADD, ListChangeEventTiming.POST)).then(() => {
        return Promise.resolve(item);
      });
    });
  }

  get(index: number): T {
    return this.a[index];
  }

  get length(): number {
    return this.a.length;
  }

  forEach(f: IndexFunction<T>): void {
    this.a.forEach((item: T, index: number): boolean | void => {
      return f(item, index);
    });
  }

  async map(f: MapFunction<T>): Promise<List<T>> {
    const ret  = new List<T>();
    const promises: Promise<void>[] = [];
    this.a.forEach(async (item: T, index: number): Promise<void> => {
      promises.push(ret.add(f(item, index)).then());
    });
    return Promise.all(promises).then(() => {
      return Promise.resolve(this);
    });
  }

  filter(f: FilterFunction<T>): List<T> {
    const ret  = new List<T>();
    ret.a = this.a.filter((item: T): boolean => {
      return f(item);
    });
    return ret;
  }

  includes(item: T): boolean {
    return this.a.includes(item);
  }

  asArray(): T[] {
    return this.a.map((item: T): T => {
      return item;
    });
  }

  addChangeEventListener(listener: ListChangeEventListener): ListChangeEventListener {
    this.changeListeners.push(listener);
    return listener;
  }

  removeChangeEventListener(listener: ListChangeEventListener): ListChangeEventListener {
    let ret: ListChangeEventListener = null;
    this.changeListeners.forEach((thisListener: ListChangeEventListener, index: number): boolean => {
      if (listener == thisListener) {
        this.changeListeners.splice(index, 1);
        ret = thisListener;
        return true;
      }
      return false;
    });
    return ret;
  }

  [Symbol.iterator](): Iterator<T> {

    let pointer = 0;
    const components = this.a;

    return {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      next(_value?: any): IteratorResult<T> {
        if (pointer < components.length) {
          return {
            done: false,
            value: components[pointer++]
          };
        } else {
          return {
            done: true,
            value: null
          };
        }
      }
    };

  }

  private async notifyListeners(event: ListChangeEvent): Promise<void> {
    const promises: Promise<void>[] = [];
    this.changeListeners.forEach((listener: ListChangeEventListener) => {
      promises.push(event.timing === ListChangeEventTiming.POST ? listener.listChanged(event) : listener.listWillChange(event));
    });
    return Promise.all(promises).then();
  }

}

export interface IndexFunction<T> {
  (item: T, index: number): boolean | void;
}

export interface MapFunction<T> {
  (item: T, index: number): T;
}

export interface FilterFunction<T> {
  (item: T): boolean;
}

export interface ListChangeEventListener {
  listWillChange(event: ListChangeEvent): Promise<void>;
  listChanged(event: ListChangeEvent): Promise<void>;
}

export class CloneableList<T extends Cloneable<T>> extends List<T> implements Cloneable<List<T>> {
  clone(): CloneableList<T> {
    const ret = new CloneableList<T>();
    ret.a = this.a.map((item: T): T => {
      return item.clone();
    });
    return ret;
  }
}