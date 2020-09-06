import { CELLL, EM, Mem } from "./mem";

const stackCells = 64;
const stackDepth = stackCells * CELLL;
export const topRp = EM;
export const topSp = EM - stackDepth;

export class Stack {
  private mem: Mem;

  constructor(mem: Mem) {
    this.mem = mem;
    this.mem.RP = topRp;
    this.mem.SP = topSp;
  }

  popd(): number {
    if (this.mem.SP === topSp) {
      throw new Error("data stack underflow");
    }

    const value = this.mem.get16(this.mem.SP);
    this.mem.SP += CELLL;

    return value;
  }

  popr(): number {
    if (this.mem.RP === topRp) {
      throw new Error("return stack underflow");
    }

    const value = this.mem.get16(this.mem.RP);
    this.mem.RP += CELLL;

    return value;
  }

  pushd(value: number) {
    this.mem.SP -= CELLL;
    const i = this.mem.SP;

    if (i - topSp === stackDepth) {
      throw new Error("data stack overflow");
    }

    this.mem.set16(i, value);
  }

  pushr(value: number) {
    this.mem.RP -= CELLL;
    const i = this.mem.RP;

    if (i - topRp === stackDepth) {
      throw new Error("return stack overflow");
    }

    this.mem.set16(i, value);
  }
}
