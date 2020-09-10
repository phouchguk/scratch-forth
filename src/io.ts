import { Vm } from "./vm";

export interface Io {
  key(vm: Vm): void;
  txsto(c: number): void;
}
