import { CELLL, Mem } from "./mem";
import { Io } from "./io";
import { IVm } from "./ivm";

export enum Reg {
  PC = 0,
  IP = 2,
  SP = 4,
  RP = 6,
  WP = 8,
  FLAGS = 10,
}

export enum Op {
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

  step() {
    const op = this.mem.get8(this.mem.PC++);

    // primitive
    switch (op) {
      case Op.ADC: {
        // ADC B C
        const b = this.mem.get8(this.mem.PC++);

        const c = this.mem.get16(this.mem.PC);
        this.mem.PC += CELLL;

        this.mem.set16(b, this.mem.get16(b) + c);

        return;
      }

      case 1: {
        // ADD B A
        const b = this.mem.get8(this.mem.PC++);

        const a = this.mem.get16(this.mem.PC);
        this.mem.PC += CELLL;

        this.mem.set16(b, this.mem.get16(b) + this.mem.get16(a));

        return;
      }

      case 2: {
        // CALL A
        const a = this.mem.get16(++this.mem.PC);
        this.mem.PC += CELLL;

        const ds = this.mem.get16(Reg.SP) - CELLL;
        this.mem.set16(Reg.SP, ds);
        this.mem.set16(ds, a);

        return;
      }

      case 3: {
        // LD8
        const b = this.mem.get8(this.mem.PC++);

        const a = this.mem.get16(this.mem.PC);
        this.mem.PC += CELLL;

        this.mem.set8(b, this.mem.get16(a));

        return;
      }

      case 4: {
        // LDA
        const b = this.mem.get8(this.mem.PC++);

        const a = this.mem.get16(this.mem.PC);
        this.mem.PC += CELLL;

        this.mem.set16(b, this.mem.get16(a));

        return;
      }

      case 5: {
        // LDC
        const b = this.mem.get8(this.mem.PC++);

        const a = this.mem.get16(this.mem.PC);
        this.mem.PC += CELLL;

        this.mem.set16(b, a);

        return;
      }

      case 6: {
        // LDI
        const b = this.mem.get8(this.mem.PC++);

        const a = this.mem.get16(this.mem.PC);
        this.mem.PC += CELLL;

        this.mem.set16(b, this.mem.get16(this.mem.get16(a)));

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
    while (this.mem.get16(0)) {
      this.step();
    }
  }
}
