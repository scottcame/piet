export class ObservableChangeEvent<T> {
  oldValue: T;
  newValue: T;
}

export class Observable<T> {

  private _value: T;
  private changeListeners: ObservableChangeEventListener<T>[];

  constructor() {
    this._value = null;
    this.changeListeners = [];
  }

  get value(): T {
    return this._value;
  }

  set value(value: T) {
    const oldValue = this._value;
    this._value = value;
    this.notifyListeners(oldValue);
  }

  addChangeEventListener(listener: ObservableChangeEventListener<T>): ObservableChangeEventListener<T> {
    this.changeListeners.push(listener);
    return listener;
  }

  removeChangeEventListener(listener: ObservableChangeEventListener<T>): ObservableChangeEventListener<T> {
    let ret: ObservableChangeEventListener<T> = null;
    this.changeListeners.forEach((thisListener: ObservableChangeEventListener<T>, index: number): boolean => {
      if (listener == thisListener) {
        this.changeListeners.splice(index, 1);
        ret = thisListener;
        return true;
      }
      return false;
    });
    return ret;
  }

  clearChangeEventListeners(): number {
    const ret = this.changeListeners.length;
    this.changeListeners = [];
    return ret;
  }

  private notifyListeners(oldValue: T): void {
    this.changeListeners.forEach((listener: ObservableChangeEventListener<T>) => {
      const event = new ObservableChangeEvent<T>();
      event.oldValue = oldValue;
      event.newValue = this._value;
      listener.observableChanged(event);
    });
  }

}

export interface ObservableChangeEventListener<T> {
  observableChanged(event: ObservableChangeEvent<T>): void;
}

interface ObservableEventChangeCallback<T> {
  (event: ObservableChangeEvent<T>): void;
}

export class DefaultObservableChangeEventListener<T> implements ObservableChangeEventListener<T> {
  callback: ObservableEventChangeCallback<T>;
  constructor(callback: ObservableEventChangeCallback<T>) {
    this.callback = callback;
  }
  observableChanged(event: ObservableChangeEvent<T>): void {
    this.callback(event);
  }
}
