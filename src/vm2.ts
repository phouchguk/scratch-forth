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
  CALL,
  LD8,
  LDA,
  LDC,
  LDI,
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
    }
  }

  step() {
    const op = this.mem.get8(this.mem.PC++);

    // primitive
    switch (op) {
      case Op.ADC:
      case Op.ADD:
      case Op.LD8:
      case Op.LDA:
      case Op.LDC:
      case Op.LDI:
        this.stepbx(op as Op);
        return;

      case Op.CALL: {
        // CALL A
        const a = this.mem.get16(++this.mem.PC);
        this.mem.PC += CELLL;

        const ds = this.mem.get16(Reg.SP) - CELLL;
        this.mem.set16(Reg.SP, ds);
        this.mem.set16(ds, a);

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
