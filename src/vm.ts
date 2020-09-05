import { CELLL, Mem } from "./mem";
import { Stack } from "./stack";

const minus1 = Math.pow(2, CELLL * 8) - 1;
const signFlag = 1 << (CELLL * 8 - 1);

export const prims = [
  "BYE",
  "RX",
  "TX!",
  "doLIT",
  "EXIT",
  "EXECUTE",
  "next",
  "?branch",
  "branch",
  "!",
  "@",
  "C!",
  "C@",
  "RP@",
  "RP!",
  "R>",
  "R@",
  ">R",
  "SP@",
  "SP!",
  "DROP",
  "DUP",
  "SWAP",
  "OVER",
  "0<",
  "AND",
  "OR",
  "XOR",
  "UM+",
];

export const primCount = prims.length;

export class Vm {
  private mem: Mem;
  private stack: Stack;
  private running: boolean = false;

  constructor(mem: Mem) {
    this.mem = mem;
    this.stack = new Stack(this.mem);
  }

  step() {
    const op = this.mem.get16(this.mem.PC);
    this.mem.PC += CELLL; // point to next instruction

    // primitive
    switch (op) {
      case 0: // BYE
        this.running = false;
        return;

      case 1: // RX
        this.stack.pushd("?".charCodeAt(0)); // should stop vm and wait for input
        return;

      case 2: // TX!
        const c = this.stack.popd();
        console.log(c); // needs to presume char
        return;

      case 3: // doLIT
        this.stack.pushd(this.mem.get16(this.mem.PC));
        this.mem.PC += CELLL;
        return;

      case 4: // EXIT
        this.mem.PC = this.stack.popr();
        return;

      case 5: // EXECUTE
        this.mem.PC = this.stack.popd();
        return;

      case 6: // next
        // count is on the return stack
        const count = this.mem.get16(this.mem.RP) - 1;

        if (count < 0) {
          // when count goes below 0, pop the count, skip over address after 'next' instruction
          this.stack.popr();
          this.mem.PC += CELLL;
        } else {
          // otherwise set the dec'd count, jump to address after next instruction
          this.mem.set16(this.mem.RP, count);
          this.mem.PC = this.mem.get16(this.mem.PC);
        }

        return;

      case 7: // ?branch
        const flag = this.stack.popd();

        if (flag === 0) {
          // branch
          this.mem.PC = this.mem.get16(this.mem.PC);
        } else {
          // don't branch, skip branch address
          this.mem.PC += CELLL;
        }

        return;

      case 8: // branch
        this.mem.PC = this.mem.get16(this.mem.PC);
        this.mem.PC += CELLL;
        return;

      case 9: {
        // !
        const addr = this.stack.popd();
        this.mem.set16(addr, this.stack.popd());
        return;
      }

      case 10: // @
        this.stack.pushd(this.mem.get16(this.stack.popd()));
        return;

      case 11: {
        // C!
        const addr = this.stack.popd();
        this.mem.set8(addr, this.stack.popd());
        return;
      }

      case 12: // C@
        this.stack.pushd(this.mem.get8(this.stack.popd()));
        return;

      case 13: // RP@
        this.stack.pushd(this.mem.RP);
        return;

      case 14: // RP!
        this.mem.RP = this.stack.popd();
        return;

      case 15: // R>
        this.stack.pushd(this.stack.popr());
        return;

      case 16: // R@
        this.stack.pushd(this.mem.get16(this.mem.RP));
        return;

      case 17: // >R
        this.stack.pushr(this.stack.popd());
        return;

      case 18: // SP@
        this.stack.pushd(this.mem.SP);
        return;

      case 19: // SP!
        this.mem.SP = this.stack.popd();
        return;

      case 20: // DROP
        this.stack.popd();
        return;

      case 21: // DUP
        this.stack.pushd(this.mem.get16(this.mem.SP));
        return;

      case 22: // SWAP
        const temp1 = this.stack.popd();
        const temp2 = this.stack.popd();
        this.stack.pushd(temp1);
        this.stack.pushd(temp2);

        return;

      case 23: // OVER
        this.stack.pushd(this.mem.get16(this.mem.SP - CELLL));
        return;

      case 24: // 0<
        const test = this.stack.popd();
        this.stack.pushd(test & signFlag ? minus1 : 0);
        return;

      case 25: // AND
        this.stack.pushd(this.stack.popd() & this.stack.popd());
        return;

      case 26: // OR
        this.stack.pushd(this.stack.popd() | this.stack.popd());
        return;

      case 27: // XOR
        this.stack.pushd(this.stack.popd() ^ this.stack.popd());
        return;

      case 28: // UM+
        const result = this.stack.popd() + this.stack.popd();
        this.stack.pushd(result);
        this.stack.pushd(result > minus1 ? minus1 : 0);
        return;

      default:
        // run compound proc
        this.stack.pushr(this.mem.PC);
        this.mem.PC = op;
    }
  }

  run() {
    this.running = true;

    while (this.running) {
      this.step();
    }
  }
}
