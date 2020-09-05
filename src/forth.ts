import { Mem } from "./mem";
import { Vm } from "./vm";
import { build } from "./compile";

function go(mem: Mem) {
  const vm = new Vm(mem);
  vm.run();
}

build(go);

// facility to forget last dict item (for repl)
