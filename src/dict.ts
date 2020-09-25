import { CELLL, EM, Mem } from "./mem";
import { rpp, spp, tibb } from "./stack";
import { prims } from "./vm";

const coldd = 0x100;
const us = 64 * CELLL;
export const upp = EM - 256 * CELLL;
const namee = upp - 8 * CELLL;
const codee = coldd + us; // think us is a waste of space
const vocss = 8;

export function align(n: number): number {
  const offset = n % CELLL;

  if (offset === 0) {
    return n;
  }

  return n + (CELLL - offset);
}

export const labelOffset = 65536;
export const byteModeSwitch = 70000;

const compos: string[] = 'doLIT doLIST next ?branch branch RP! >R doVAR doUSER tmp doVOC do$ $"| ."| abort" xio COMPILE ;'.split(
  " "
);
const imedds: string[] = '.( ( \\ [ [COMPILE] LITERAL RECURSE FOR BEGIN NEXT UNTIL AGAIN IF AHEAD REPEAT THEN AFT ELSE WHILE ABORT" $" ." ;'.split(
  " "
);

export class Dict {
  _link: number;
  _name: number;
  _code: number;
  _user: number;

  private mem: Mem;
  private byteMode: boolean = false;
  private lastAddr: number = 0;
  private npAddr: number = 0;
  private cpAddr: number = 0;

  constructor(mem: Mem) {
    this.mem = mem;

    this._link = 0;
    this._name = namee;
    this._code = codee;
    this._user = 0;

    this.prepareVars();
    this.primitives();
  }

  prepareVars() {
    let up = upp;

    // CP
    this.cpAddr = up;
    this.mem.set16(up, 0);
    up += CELLL;

    // NP
    this.npAddr = up;
    this.mem.set16(up, 0);
    up += CELLL;

    // SP0
    this.mem.set16(up, spp);
    up += CELLL;

    // RP0
    this.mem.set16(up, rpp);
    up += CELLL;

    // #TIB
    // The terminal input buffer starts at the same point as the data stack,
    // but TIB goes up, growing into the same space as the return stack.
    // SP goes down. It is two words, the buffer count, and the address of the buffer.
    up += CELLL; // the buffer count

    // TIB
    this.mem.set16(up, tibb); // the buffer address
    up += CELLL;

    // CSP
    this.mem.set16(up, 0);
    up += CELLL;

    // HLD
    this.mem.set16(up, 0);
    up += CELLL;

    // BASE
    this.mem.set16(up, 10);
    up += CELLL;

    // tmp
    this.mem.set16(up, 0);
    up += CELLL;

    // >IN
    this.mem.set16(up, 0);
    up += CELLL;

    // CONTEXT
    this.mem.set16(up, 0);
    up += CELLL;
    up += CELLL * vocss;

    // CURRENT
    this.mem.set16(up, 0);
    up += CELLL;
    up += CELLL;

    // SPAN
    this.mem.set16(up, 0);
    up += CELLL;

    // HANDLER
    this.mem.set16(up, 0);
    up += CELLL;

    // 'EVAL
    this.mem.set16(up, 0);
    up += CELLL;

    // 'NUMBER
    this.mem.set16(up, 0);
    up += CELLL;

    // 'EMIT
    this.mem.set16(up, 0);
    up += CELLL;

    // 'EXPECT
    this.mem.set16(up, 0);
    up += CELLL;

    // 'TAP
    this.mem.set16(up, 0);
    up += CELLL;

    // 'ECHO
    this.mem.set16(up, 0);
    up += CELLL;

    // 'PROMPT
    this.mem.set16(up, 0);
    up += CELLL;

    // LAST
    this.lastAddr = up;
    this.mem.set16(up, 0);
    up += CELLL;
  }

  primitives() {
    for (let i = 0; i < prims.length; i++) {
      this.code(prims[i]);

      this.mem.set16(this._code, i);
      this._code += CELLL;
    }
  }

  lookup(name: string): number {
    const len = name.length;
    let ptr = this._link;

    while (ptr !== 0) {
      const start = ptr; // start of name (len + chars)
      const prev = this.mem.get16(start - CELLL); // previous word is one cell behind
      const dictLen = this.mem.get8(ptr++) & 0x7f1f;

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

      return this.mem.get16(start - CELLL * 2); // code ptr is two cells behind start
    }

    throw new Error(`${name}?`);
  }

  code(name: string) {
    const lex = name.length;
    const len = Math.floor(lex / CELLL);
    this._name = this._name - (len + 3) * CELLL;

    let ptr = this._name;

    // addr of previous entry
    this.mem.set16(ptr, this._code); // pointer to code
    ptr += CELLL;

    this.mem.set16(ptr, this._link); // link to previous
    ptr += CELLL;

    this._link = ptr; // link points to name string
    this.mem.set16(this.lastAddr, this._link);

    // name len (lex)
    let tagged = lex;

    if (compos.indexOf(name) > -1) {
      tagged += 0x40;
    }

    if (imedds.indexOf(name) > -1) {
      tagged += 0x80;
    }

    this.mem.set8(ptr++, tagged);

    // name chars
    for (let i = 0; i < lex; i++) {
      this.mem.set8(ptr++, name.charCodeAt(i));
    }

    this.mem.set16(this.npAddr, this._name);
    console.log(name, this._link, this._code);
  }

  colon(name: string, ops: number[]) {
    this.code(name);

    const codeStart = this._code;

    // ops
    for (let i = 0; i < ops.length; i++) {
      if (ops[i] === byteModeSwitch) {
        this._code = align(this._code);
        this.byteMode = !this.byteMode;
        continue;
      }

      if (this.byteMode) {
        this.mem.set8(this._code, ops[i]);
        this._code++;
      } else {
        this.mem.set16(
          this._code,
          ops[i] >= labelOffset ? codeStart + ops[i] - labelOffset : ops[i]
        );

        this._code += CELLL;
      }
    }

    this.mem.set16(this.cpAddr, this._code);
  }

  user(name: string) {
    // can add a blank CELL size space by passing blank name
    if (name) {
      this.colon(name, [
        prims.indexOf("doLIST"),
        this.lookup("doUSER"),
        this._user,
      ]);
    }

    this._user += CELLL;
  }
}
