import { CELLL, Mem } from "./mem";
import { Op } from "./vm2";

export class Assembler {
  private mem: Mem;

  ap = 0x100;

  constructor(mem: Mem) {
    this.mem = mem;
  }

  private ba(b: number, a: number, op: Op) {
    this.mem.set8(this.ap++, op);
    this.mem.set8(this.ap++, b);

    this.mem.set16(this.ap, a);
    this.ap += CELLL;
  }

  lda(b: number, a: number) {
    this.ba(b, a, Op.LDA);
  }

  ldi(b: number, a: number) {
    this.ba(b, a, Op.LDI);
  }
}
