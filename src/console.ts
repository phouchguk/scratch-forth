import { Io } from "./io";
import { Vm } from "./vm";

export class Console implements Io {
  key(vm: Vm): void {
    vm.pushd("?".charCodeAt(0));
    vm.run();
  }

  txsto(c: number): void {
    console.log(String.fromCharCode(c));
  }
}
