import { CELLL, Mem } from "./mem";
import { Op } from "./vm2";

export class Assembler {
  private mem: Mem;

  ap = 0x100;

  constructor(mem: Mem) {
    this.mem = mem;
  }

  lda(b: number, a: number) {
    this.mem.set8(this.ap++, Op.LDA);
    this.mem.set8(this.ap++, b);

    this.mem.set16(this.ap, a);
    this.ap += CELLL;
  }
}
