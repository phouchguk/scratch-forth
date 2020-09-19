import { Reg, Vm } from "./vm2";
import { Console } from "./console";
import { EM, Mem } from "./mem";
import { Assembler } from "./assembler";

const mem = new Mem(new ArrayBuffer(EM));

const asm = new Assembler(mem);

mem.SP = 100;
mem.WP = 42;

console.log("SP", mem.SP);
console.log("WP", mem.WP);

mem.PC = asm.ap;

asm.lda(Reg.SP, Reg.WP);

const io = new Console();
const vm = new Vm(mem, io);
vm.run();

console.log("SP", mem.SP);
console.log("WP", mem.WP);
