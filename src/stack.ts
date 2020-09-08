import { CELLL, EM, Mem } from "./mem";

const rts = 64 * CELLL;
export const rpp = EM - 8 * CELLL;
export const tibb = rpp - rts;
export const spp = tibb - 8 * CELLL;

export class Stack {
  private mem: Mem;

  constructor(mem: Mem) {
    this.mem = mem;
    this.mem.RP = rpp;
    this.mem.SP = spp;
  }

  popd(): number {
    if (this.mem.SP === spp) {
      throw new Error("data stack underflow");
    }

    const value = this.mem.get16(this.mem.SP);
    this.mem.SP += CELLL;

    return value;
  }

  popr(): number {
    if (this.mem.RP === rpp) {
      throw new Error("return stack underflow");
    }

    const value = this.mem.get16(this.mem.RP);
    this.mem.RP += CELLL;

    return value;
  }

  pushd(value: number) {
    this.mem.SP -= CELLL;
    const i = this.mem.SP;

    if (i - spp === rts) {
      // data stack prob shouldn't actually be limited
      throw new Error("data stack overflow");
    }

    this.mem.set16(i, value);
  }

  pushr(value: number) {
    this.mem.RP -= CELLL;
    const i = this.mem.RP;

    if (i - rpp === rts) {
      throw new Error("return stack overflow");
    }

    this.mem.set16(i, value);
  }
}
