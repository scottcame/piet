export class ObservableChangeEvent {
}

export class Observable<T> {

  private _value: T;
  private changeListeners: ObservableChangeEventListener[];

  constructor() {
    this._value = null;
    this.changeListeners = [];
  }

  get value(): T {
    return this._value;
  }

  set value(value: T) {
    this._value = value;
    this.notifyListeners();
  }

  addChangeEventListener(listener: ObservableChangeEventListener): ObservableChangeEventListener {
    this.changeListeners.push(listener);
    return listener;
  }

  removeChangeEventListener(listener: ObservableChangeEventListener): ObservableChangeEventListener {
    let ret: ObservableChangeEventListener = null;
    this.changeListeners.forEach((thisListener: ObservableChangeEventListener, index: number): boolean => {
      if (listener == thisListener) {
        this.changeListeners.splice(index, 1);
        ret = thisListener;
        return true;
      }
      return false;
    });
    return ret;
  }

  private notifyListeners(): void {
    this.changeListeners.forEach((listener: ObservableChangeEventListener) => {
      listener.observableChanged(new ObservableChangeEvent());
    });
  }

}

export interface ObservableChangeEventListener {
  observableChanged(event: ObservableChangeEvent): void;
}

interface ObservableEventChangeCallback {
  (event: ObservableChangeEvent): void;
}

export class DefaultObservableChangeEventListener implements ObservableChangeEventListener {
  callback: ObservableEventChangeCallback;
  constructor(callback: ObservableEventChangeCallback) {
    this.callback = callback;
  }
  observableChanged(event: ObservableChangeEvent): void {
    this.callback(event);
  }
}
