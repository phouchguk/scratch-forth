import { CELLL, REG_TOP, Mem } from "./mem";
import { topRp, topSp } from "./stack";
import { primCount } from "./vm";

export const upp = align(primCount);
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
  private up: number = 0; // _user offset
  private previous: number;

  constructor(mem: Mem) {
    this.mem = mem;

    // start code after user variable area
    this.cp = this.prepareVars();
    this.previous = 0;
  }

  prepareVars(): number {
    // vars are stored at the start of mem (after primitive count), but refered to from code later
    let vp = upp;

    // SP0
    this.mem.set16(vp, topSp);
    vp += CELLL;

    // RP0
    this.mem.set16(vp, topRp);
    vp += CELLL;

    return vp;
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

  user(name: string) {
    console.log("$USER", name);
    this.colon(name, [this.lookup("doUSER"), this.up]);
    this.up += CELLL;
  }
}
