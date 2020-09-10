import { Mem } from "./mem";
import { Vm } from "./vm";
import { TextArea } from "./textarea";

fetch("mem.bin").then(function (response) {
  response.arrayBuffer().then(function (buffer) {
    const mem = new Mem(buffer);

    const io = new TextArea();

    const vm = new Vm(mem, io);
    vm.run();
  });
});
