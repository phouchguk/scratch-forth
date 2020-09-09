import { Mem } from "./mem";
import { Vm } from "./vm";

fetch("mem.bin").then(function (response) {
  response.arrayBuffer().then(function (buffer) {
    const mem = new Mem(buffer);

    const vm = new Vm(mem);
    vm.run();
  });
});
