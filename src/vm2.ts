import { CELLL, Mem } from "./mem";
import { Io } from "./io";
import { IVm } from "./ivm";

export const enum Reg {
  PC = 0,
  IP = 2,
  SP = 4,
  RP = 6,
  WP = 8,
  FLAGS = 10,
}

export const enum Op {
  ADC,
  ADD,
  AND,
  CALL,
  LD8,
  LDA,
  LDC,
  LDI,
  NOT,
  SBC,
  STI,
}

export class Vm implements IVm {
  private mem: Mem;
  private io: Io;

  constructor(mem: Mem, io: Io) {
    this.mem = mem;
    this.io = io;
  }

  stepbx(op: Op) {
    const b = this.mem.get8(this.mem.PC++);

    const x = this.mem.get16(this.mem.PC);
    this.mem.PC += CELLL;

    switch (op) {
      case Op.ADC: {
        const result = this.mem.get16(b) + x;
        this.mem.set16(b, result);
        this.mem.set16(Reg.FLAGS, result >> 16);
        return;
      }

      case Op.ADD: {
        const result = this.mem.get16(b) + this.mem.get16(x);
        this.mem.set16(b, result);
        this.mem.set16(Reg.FLAGS, result >> 16);
        return;
      }

      case Op.AND: {
        const result = this.mem.get16(b) & this.mem.get16(x);
        this.mem.set16(Reg.FLAGS, result === 0 ? 0 : 1);
        this.mem.set16(b, result);
        return;
      }

      case Op.LD8:
        this.mem.set8(b, this.mem.get16(x));
        return;

      case Op.LDA:
        this.mem.set16(b, this.mem.get16(x));
        return;

      case Op.LDC:
        this.mem.set16(b, x);
        return;

      case Op.LDI:
        this.mem.set16(b, this.mem.get16(this.mem.get16(x)));
        return;

      case Op.SBC: {
        const result = this.mem.get16(b) - x;
        this.mem.set16(b, result);
        this.mem.set16(Reg.FLAGS, result >> 16 === 0 ? 0 : 1);
        return;
      }

      case Op.STI:
        this.mem.set16(this.mem.get16(x), this.mem.get16(b));
        return;
    }
  }

  step() {
    const op = this.mem.get8(this.mem.PC++);

    // primitive
    switch (op) {
      case Op.ADC:
      case Op.ADD:
      case Op.AND:
      case Op.LD8:
      case Op.LDA:
      case Op.LDC:
      case Op.LDI:
      case Op.SBC:
      case Op.STI:
        this.stepbx(op as Op);
        return;

      case Op.CALL: {
        // CALL A
        const a = this.mem.get16(++this.mem.PC);
        this.mem.PC += CELLL;

        const ds = this.mem.get16(Reg.SP) - CELLL;
        this.mem.set16(Reg.SP, ds);
        this.mem.set16(ds, this.mem.PC);

        this.mem.PC = a;

        return;
      }

      case Op.NOT: {
        const b = this.mem.get8(this.mem.PC++);
        this.mem.set16(b, ~this.mem.get16(b));

        return;
      }
    }
  }

  pushd(n: number): void {
    const ds = this.mem.get16(Reg.SP) - CELLL;
    this.mem.set16(Reg.SP, ds);
    this.mem.set16(ds, n);
  }

  run() {
    while (this.mem.get16(Reg.PC)) {
      this.step();
    }
  }
}
