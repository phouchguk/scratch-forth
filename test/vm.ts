import { strict as assert } from 'assert';
import { Reg, Vm } from "../src/vm2";
import { Console } from "../src/console";
import { EM, Mem } from "../src/mem";
import { Assembler } from "../src/assembler";

describe('Vm', function () {
  let mem: Mem;
  let asm: Assembler;
  let io: Console;
  let vm: Vm;

  beforeEach(function() {
    mem = new Mem(new ArrayBuffer(EM));
    asm = new Assembler(mem);

    io = new Console();
    vm = new Vm(mem, io);
  });

  describe('#lda', function () {
    it('should set its byte address to the value at its address', function () {
      mem.SP = 100;
      mem.WP = 42;
      mem.PC = asm.ap;

      asm.lda(Reg.SP, Reg.WP);
      vm.run();

      assert.equal(mem.SP, 42);
      assert.equal(mem.WP, 42);
    });
  });

  describe('#ldi', function () {
    it('should set its byte address to the value its address points to', function () {
      const addr = 42;
      const value = 99;

      mem.SP = 100;
      mem.WP = addr;
      mem.set16(addr, value);

      mem.PC = asm.ap;

      asm.ldi(Reg.SP, Reg.WP);
      vm.run();

      assert.equal(mem.SP, value);
      assert.equal(mem.WP, addr);
      assert.equal(mem.get16(addr), value);
    });
  });
});
