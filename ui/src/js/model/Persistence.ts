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
