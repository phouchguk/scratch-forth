import { Mem } from "./mem";
import { Vm } from "./vm";
import { Document } from "./document";

fetch("mem.bin").then(function (response) {
  response.arrayBuffer().then(function (buffer) {
    const mem = new Mem(buffer);

    const io = new Document();

    const vm = new Vm(mem, io);
    vm.run();
  });
});
