import { CELLL, Mem } from "./mem";
import { Io } from "./io";
import { IVm } from "./ivm";

export const enum Reg {
  PC = 0,
  IP = 2,
  SP = 4,
  RP = 6,
  WP = 8,
  FLAGS = 10, // xxxxxxZC
}

export const enum Op {
  ADC,
  ADD,
  AND,
  CALL,
  INT,
  JC,
  JZ,
  LD8,
  LDA,
  LDC,
  LDI,
  NOT,
  OR,
  SBC,
  STI,
  XOR,
}

export class Vm implements IVm {
  private mem: Mem;
  private io: Io;

  constructor(mem: Mem, io: Io) {
    this.mem = mem;
    this.io = io;
  }

  flags(result: number) {
    let f = 0;

    f += result >> 16 === 0 ? 0 : 1; // carry

    if (result === 0) {
      f += 2; // zero
    }

    this.mem.set16(Reg.FLAGS, f);
  }

  push(x: number) {
    const ds = this.mem.get16(Reg.SP) - CELLL;
    this.mem.set16(Reg.SP, ds);
    this.mem.set16(ds, x);
  }

  stepbx(op: Op) {
    const b = this.mem.get8(this.mem.PC++);

    const x = this.mem.get16(this.mem.PC);
    this.mem.PC += CELLL;

    switch (op) {
      case Op.ADC: {
        const result = this.mem.get16(b) + x;
        this.mem.set16(b, result);
        this.flags(result);

        return;
      }

      case Op.ADD: {
        const result = this.mem.get16(b) + this.mem.get16(x);
        this.mem.set16(b, result);
        this.flags(result);

        return;
      }

      case Op.AND: {
        const result = this.mem.get16(b) & this.mem.get16(x);
        this.mem.set16(b, result);
        this.flags(result);

        return;
      }

      case Op.CALL: {
        this.push(this.mem.PC);
        this.mem.PC = x;

        return;
      }

      case Op.JC: {
        if (this.mem.FLAGS & 1) {
          this.mem.PC = x;
        }

        return;
      }

      case Op.JZ: {
        if (this.mem.FLAGS & 2) {
          this.mem.PC = x;
        }

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

      case Op.OR: {
        const result = this.mem.get16(b) | this.mem.get16(x);
        this.mem.set16(b, result);
        this.flags(result);

        return;
      }

      case Op.SBC: {
        const result = this.mem.get16(b) - x;
        this.mem.set16(b, result);
        this.flags(result);

        return;
      }

      case Op.STI:
        this.mem.set16(this.mem.get16(x), this.mem.get16(b));
        return;

      case Op.XOR: {
        const result = this.mem.get16(b) ^ this.mem.get16(x);
        this.mem.set16(b, result);
        this.flags(result);

        return;
      }
    }
  }

  step() {
    const op = this.mem.get8(this.mem.PC++);

    // primitive
    switch (op) {
      case Op.ADC:
      case Op.ADD:
      case Op.AND:
      case Op.CALL:
      case Op.JC:
      case Op.JZ:
      case Op.LD8:
      case Op.LDA:
      case Op.LDC:
      case Op.LDI:
      case Op.OR:
      case Op.SBC:
      case Op.STI:
      case Op.XOR:
        this.stepbx(op as Op);
        return;

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
