import { open, read } from "fs";
import { EM, Mem } from "./mem";
import { Vm } from "./vm";

open("dist/mem.bin", "r", function (err, fd) {
  if (err) {
    console.log(err.message);
    return;
  }

  const buffer = new ArrayBuffer(EM);
  const m8 = new Uint8Array(buffer);

  read(fd, m8, 0, EM, 0, function (err) {
    if (err) {
      console.log(err.message);
      return;
    }

    const mem = new Mem(buffer);

    const vm = new Vm(mem);
    vm.run();
  });
});
