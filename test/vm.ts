import { strict as assert } from "assert";
import { Reg, Vm } from "../src/vm2";
import { Console } from "../src/console";
import { CELLL, EM, Mem } from "../src/mem";
import { Assembler } from "../src/assembler";

describe("Vm", function () {
  let mem: Mem;
  let asm: Assembler;
  let io: Console;
  let vm: Vm;

  beforeEach(function () {
    mem = new Mem(new ArrayBuffer(EM));
    asm = new Assembler(mem);
    mem.PC = asm.ap;

    io = new Console();
    vm = new Vm(mem, io);
  });

  describe("#adc", function () {
    it("should add its argument to its byte address and set the overflow flag", function () {
      mem.WP = 42;

      asm.adc(Reg.WP, 1);
      vm.step();

      assert.equal(mem.WP, 43);
      assert.equal(mem.FLAGS, 0);

      mem.WP = 65535;

      asm.adc(Reg.WP, 1);
      vm.step();

      assert.equal(mem.WP, 0);
      assert.equal(mem.FLAGS, 1);

      mem.WP = 65535;

      asm.adc(Reg.WP, 2);
      vm.step();

      assert.equal(mem.WP, 1);
      assert.equal(mem.FLAGS, 1);

      mem.WP = 42;

      asm.adc(Reg.WP, 1);
      vm.step();

      assert.equal(mem.WP, 43);
      assert.equal(mem.FLAGS, 0);
    });
  });

  describe("#add", function () {
    it("should add the value at its address arg to its byte address and set the overflow flag", function () {
      mem.WP = 42;
      mem.IP = 1;

      asm.add(Reg.WP, Reg.IP);
      vm.step();

      assert.equal(mem.WP, 43);
      assert.equal(mem.FLAGS, 0);

      mem.WP = 65535;
      mem.IP = 1;

      asm.add(Reg.WP, Reg.IP);
      vm.step();

      assert.equal(mem.WP, 0);
      assert.equal(mem.FLAGS, 1);
    });
  });

  describe("#call", function () {
    it("should push the address after this instruction to the data stack and jump to its address", function () {
      const sTop = 50;
      mem.SP = sTop;

      const addr = asm.ap;
      asm.call(1000);
      vm.step();

      assert.equal(mem.PC, 1000);
      assert.equal(mem.SP, sTop - CELLL);
      assert.equal(mem.get16(mem.SP), addr + CELLL + CELLL);
    });
  });

  describe("#ld8", function () {
    it("should set its byte address to the byte value at its address", function () {
      mem.SP = 0;
      mem.WP = 42;
      mem.IP = 0;

      // least significant first
      asm.ld8(Reg.SP, Reg.WP);
      asm.ld8(Reg.SP + 1, Reg.IP);

      vm.step();
      vm.step();

      assert.equal(mem.SP, 42);
    });
  });

  describe("#lda", function () {
    it("should set its byte address to the value at its address", function () {
      mem.SP = 100;
      mem.WP = 42;

      asm.lda(Reg.SP, Reg.WP);
      vm.step();

      assert.equal(mem.SP, 42);
      assert.equal(mem.WP, 42);
    });
  });

  describe("#ldc", function () {
    it("should set its byte address to the value at its address", function () {
      const value = 42;
      mem.SP = 100;

      asm.ldc(Reg.SP, value);
      vm.step();

      assert.equal(mem.SP, value);
    });
  });

  describe("#ldi", function () {
    it("should set its byte address to the value its address points to", function () {
      const addr = 42;
      const value = 99;

      mem.SP = 100;
      mem.WP = addr;
      mem.set16(addr, value);

      asm.ldi(Reg.SP, Reg.WP);
      vm.step();

      assert.equal(mem.SP, value);
      assert.equal(mem.WP, addr);
      assert.equal(mem.get16(addr), value);
    });
  });

  describe("#sbc", function () {
    it("should sub its argument from its byte address, ignores overflow flag", function () {
      mem.WP = 42;

      asm.sbc(Reg.WP, 1);
      vm.step();

      assert.equal(mem.WP, 41);
      assert.equal(mem.FLAGS, 0);

      mem.WP = 0;

      asm.sbc(Reg.WP, 1);
      vm.step();

      assert.equal(mem.WP, 65535);
      assert.equal(mem.FLAGS, 0);

      mem.WP = 0;

      asm.sbc(Reg.WP, 2);
      vm.step();

      assert.equal(mem.WP, 65534);
      assert.equal(mem.FLAGS, 0);

      mem.WP = 42;

      asm.sbc(Reg.WP, 1);
      vm.step();

      assert.equal(mem.WP, 41);
      assert.equal(mem.FLAGS, 0);
    });
  });
});
