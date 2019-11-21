import { Repository } from "./Repository";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Identifiable {
  readonly id: number;
}

export interface Serializable {}

export interface PersistenceFactory<S extends Serializable> {
  serialize(o: S, repository: Repository): any;
  deserialize(o: any, repository: Repository): S;
}

export interface Editable {
  cancelEdits(): void;
  checkpointEdits(): void;
  readonly dirty: boolean;
  addEditEventListener(listener: EditEventListener): EditEventListener;
  removeEditEventListener(listener: EditEventListener): EditEventListener;
}

export class EditEvent {
  static EDIT_BEGIN = "edit-begin";
  static EDIT_CHECKPOINT = "edit-checkpoint";
  static EDIT_CANCEL = "edit-cancel";
  readonly type: string;
  constructor(type: string) {
    this.type = type;
  }
}

export class PropertyEditEvent {
  readonly propertyName: string;
  readonly target: Editable;
  constructor(target: Editable, propertyName: string) {
    this.propertyName = propertyName;
    this.target = target;
  }
}

export interface EditEventListener {
  notifyEdit(event: EditEvent): void;
  notifyPropertyEdit(event: PropertyEditEvent): void;
}
