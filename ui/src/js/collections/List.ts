export class ListChangeEvent {
  static readonly ADD = "add";
  static readonly DELETE = "delete";
  readonly index: number;
  readonly type: string;
  constructor(index: number, type: string) {
    this.index = index;
    this.type = type;
  }
}

export class List<T> implements Iterable<T> {

  private a: T[];
  private changeListeners: ListChangeEventListener[];

  constructor() {
    this.changeListeners = [];
    this.a = [];
  }

  async add(item: T): Promise<T> {
    this.a.push(item);
    return this.notifyListeners(new ListChangeEvent(this.a.length-1, ListChangeEvent.ADD)).then(() => {
      return item;
    });
  }

  addAll(items: T[]): number {
    this.a = this.a.concat(items);
    this.notifyListeners(new ListChangeEvent(this.a.length-1, ListChangeEvent.ADD));
    return items.length;
  }

  set(items: T[]): number {
    this.a = [].concat(items);
    this.notifyListeners(new ListChangeEvent(this.a.length-1, ListChangeEvent.ADD));
    return this.length;
  }

  setFromList(list: List<T>): number {
    return this.set(list.a);
  }

  clear(): number {
    const ret = this.a.length;
    this.a = [];
    this.notifyListeners(new ListChangeEvent(0, ListChangeEvent.DELETE));
    return ret;
  }

  removeAt(index: number): T {
    const ret = this.a[index];
    this.a.splice(index, 1);
    this.notifyListeners(new ListChangeEvent(index, ListChangeEvent.DELETE));
    return ret;
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

  map(f: MapFunction<T>): List<T> {
    const ret  = new List<T>();
    this.a.forEach((item: T, index: number): void => {
      ret.add(f(item, index));
    });
    return ret;
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
      promises.push(listener.listChanged(event));
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
  listChanged(event: ListChangeEvent): Promise<void>;
}

interface ListEventChangeCallback {
  (event: ListChangeEvent): void;
}
