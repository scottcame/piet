import { Editable, EditEventListener, EditEvent } from "../model/Persistence";

export class ObservableChangeEvent<T> {
  oldValue: T;
  newValue: T;
}

export class Observable<T> implements Editable {

  private _value: T;
  private checkpointValue: T;
  private changeListeners: ObservableChangeEventListener<T>[];
  private editEventListeners: EditEventListener[];

  constructor() {
    this._value = null;
    this.changeListeners = [];
    this.editEventListeners = [];
    this.checkpointValue = null;
  }

  get value(): T {
    return this._value;
  }

  set value(value: T) {
    this.edit();
    const oldValue = this._value;
    this._value = value;
    this.notifyChangeListeners(oldValue);
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

  addEditEventListener(listener: EditEventListener): EditEventListener {
    this.editEventListeners.push(listener);
    return listener;
  }

  removeEditEventListener(listener: EditEventListener): EditEventListener {
    let ret: EditEventListener = null;
    this.editEventListeners.forEach((thisListener: EditEventListener, index: number): boolean => {
      if (listener == thisListener) {
        this.editEventListeners.splice(index, 1);
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

  private notifyChangeListeners(oldValue: T): void {
    this.changeListeners.forEach((listener: ObservableChangeEventListener<T>) => {
      const event = new ObservableChangeEvent<T>();
      event.oldValue = oldValue;
      event.newValue = this._value;
      listener.observableChanged(event);
    });
  }

  private notifyEditEventListeners(type: string): void {
    this.editEventListeners.forEach((listener: EditEventListener) => {
      listener.notify(new EditEvent(type));
    });
  }

  private edit(): void {
    if (!this.checkpointValue) {
      this.checkpointValue = this._value;
      this.notifyEditEventListeners(EditEvent.EDIT_BEGIN);
    }
  }

  checkpointEdits(): void {
    this.checkpointValue = null;
    this.notifyEditEventListeners(EditEvent.EDIT_CHECKPOINT);
  }

  cancelEdits(): void {
    this._value = this.checkpointValue;
    this.checkpointValue = null;
    this.notifyEditEventListeners(EditEvent.EDIT_CANCEL);
  }

  get dirty(): boolean {
    return this.checkpointValue !== null;
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
