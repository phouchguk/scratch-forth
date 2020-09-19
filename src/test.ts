import { Reg, Vm } from "./vm2";
import { Console } from "./console";
import { EM, Mem } from "./mem";
import { Assembler } from "./assembler";

const mem = new Mem(new ArrayBuffer(EM));
const asm = new Assembler(mem);

const io = new Console();
const vm = new Vm(mem, io);

// TEST LDA

mem.SP = 100;
mem.WP = 42;

console.log("LDA");
console.log("SP", mem.SP);
console.log("WP", mem.WP);

mem.PC = asm.ap;

asm.lda(Reg.SP, Reg.WP);

vm.run();

console.log("result:");
console.log("SP", mem.SP);
console.log("WP", mem.WP);

// TEST LDI

mem.SP = 100;
mem.WP = 42;
mem.set16(42, 99);

console.log();
console.log("LDI");
console.log("SP", mem.SP);
console.log("WP", mem.WP);
console.log("42", mem.get16(42));

mem.PC = asm.ap;

asm.ldi(Reg.SP, Reg.WP);

vm.run();

console.log("result:");
console.log("SP", mem.SP);
console.log("WP", mem.WP);
console.log("42", mem.get16(42));
