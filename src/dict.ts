import { CELLL, REG_TOP, Mem } from "./mem";

const upp = REG_TOP;
const codeStart = 256;

function align(n: number): number {
  const offset = n % CELLL;

  if (offset === 0) {
    return n;
  }

  return n + (CELLL - offset);
}

export const labelOffset = 65536;

export class Dict {
  private mem: Mem;
  private cp: number;
  private previous: number;

  constructor(start: number, mem: Mem) {
    this.mem = mem;

    if (start < REG_TOP) {
      start = REG_TOP;
    }

    this.cp = align(start);
    this.previous = 0;
  }

  lookup(name: string): number {
    const len = name.length;
    let ptr = this.previous;

    while (ptr !== 0) {
      const prev = this.mem.get16(ptr);
      ptr += CELLL;

      const dictLen = this.mem.get8(ptr++);

      if (dictLen !== len) {
        ptr = prev;
        continue;
      }

      let match = true;

      for (let i = 0; i < len && match; i++, ptr++) {
        match = name.charCodeAt(i) === this.mem.get8(ptr);
      }

      if (!match) {
        ptr = prev;
        continue;
      }

      return align(ptr); // return code start
    }

    throw new Error(`${name}?`);
  }

  code(name: string) {
    const len = name.length;

    // addr of previous entry
    this.mem.set16(this.cp, this.previous);
    this.previous = this.cp;
    this.cp += CELLL;

    // name len
    this.mem.set8(this.cp++, len);

    // name chars
    for (let i = 0; i < len; i++) {
      this.mem.set8(this.cp++, name.charCodeAt(i));
    }

    // align
    this.cp = align(this.cp);
  }

  colon(name: string, ops: number[]) {
    this.code(name);

    const codeStart = this.cp;

    // ops
    for (let i = 0; i < ops.length; i++) {
      this.mem.set16(
        this.cp,
        ops[i] > labelOffset ? codeStart + ops[i] - labelOffset : ops[i]
      );

      this.cp += CELLL;
    }
  }
}
