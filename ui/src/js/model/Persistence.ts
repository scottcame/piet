import { Repository } from "./Repository";

export interface Identifiable {
  readonly id: number;
}

export interface Ravelable<T extends Identifiable> {
  unravel(repository: Repository): T;
}

export interface PersistenceFactory<T extends Identifiable> {
  ravel(o: T): Ravelable<T>;
  unravel(o: Ravelable<T>, repository: Repository): T;
}
