import { CELLL, Mem } from "./mem";
import { Io } from "./io";
import { Stack } from "./stack";

const minus1 = Math.pow(2, CELLL * 8) - 1;
const signFlag = 1 << (CELLL * 8 - 1);

export const prims = [
  "BYE",
  "KEY",
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
  "doLIST",
];

export class Vm {
  private mem: Mem;
  private io: Io;
  private stack: Stack;
  private running: boolean = false;

  constructor(mem: Mem, io: Io) {
    this.mem = mem;
    this.io = io;

    this.stack = new Stack(this.mem);
  }

  $next() {
    // set PC to address IP holds
    this.mem.PC = this.mem.get16(this.mem.IP);
    //console.log(this.mem.PC);

    // adds CELLL to IP
    this.mem.IP += CELLL;
  }

  step() {
    const op = this.mem.get16(this.mem.PC);

    this.mem.PC += CELLL; // point to next instruction

    //console.log(prims[op] ? prims[op] : op);

    // primitive
    switch (op) {
      case 0: // BYE
        this.running = false;
        return;

      case 1: // KEY
        console.log("KEY");
        this.running = false;
        this.$next();

        this.io.key(this);

        return;

      case 2: // TX!
        const c = this.stack.popd();
        this.io.txsto(c);
        this.$next();
        return;

      case 3: // doLIT
        this.stack.pushd(this.mem.get16(this.mem.IP));
        this.mem.IP += CELLL;
        this.$next();
        return;

      case 4: // EXIT
        // pop RS to IP
        this.mem.IP = this.stack.popr();
        this.$next();
        return;

      case 5: // EXECUTE
        this.stack.pushr(this.mem.PC);
        this.mem.PC = this.stack.popd();
        return;

      case 6: // next
        // count is on the return stack
        const count = this.mem.get16(this.mem.RP) - 1;

        if (count < 0) {
          // when count goes below 0, pop the count, skip over address after 'next' instruction
          this.stack.popr();

          this.mem.IP += CELLL;
        } else {
          // otherwise set the dec'd count, jump to address after 'next' instruction
          this.mem.set16(this.mem.RP, count);
          this.mem.IP = this.mem.get16(this.mem.IP);
        }

        this.$next();
        return;

      case 7: // ?branch
        const flag = this.stack.popd();

        if (flag === 0) {
          // branch
          this.mem.IP = this.mem.get16(this.mem.IP);
        } else {
          // don't branch, skip branch address
          this.mem.IP += CELLL;
        }

        this.$next();
        return;

      case 8: // branch
        this.mem.IP = this.mem.get16(this.mem.IP);
        this.$next();
        return;

      case 9: {
        // !
        const addr = this.stack.popd();
        this.mem.set16(addr, this.stack.popd());
        this.$next();
        return;
      }

      case 10: // @
        this.stack.pushd(this.mem.get16(this.stack.popd()));
        this.$next();
        return;

      case 11: {
        // C!
        const addr = this.stack.popd();
        this.mem.set8(addr, this.stack.popd());
        this.$next();
        return;
      }

      case 12: // C@
        this.stack.pushd(this.mem.get8(this.stack.popd()));
        this.$next();
        return;

      case 13: // RP@
        this.stack.pushd(this.mem.RP);
        this.$next();
        return;

      case 14: // RP!
        this.mem.RP = this.stack.popd();
        this.$next();
        return;

      case 15: // R>
        this.stack.pushd(this.stack.popr());
        this.$next();
        return;

      case 16: // R@
        this.stack.pushd(this.mem.get16(this.mem.RP));
        this.$next();
        return;

      case 17: // >R
        this.stack.pushr(this.stack.popd());
        this.$next();
        return;

      case 18: // SP@
        this.stack.pushd(this.mem.SP);
        this.$next();
        return;

      case 19: // SP!
        this.mem.SP = this.stack.popd();
        this.$next();
        return;

      case 20: // DROP
        this.stack.popd();
        this.$next();
        return;

      case 21: // DUP
        this.stack.pushd(this.mem.get16(this.mem.SP));
        this.$next();
        return;

      case 22: // SWAP
        const temp1 = this.stack.popd();
        const temp2 = this.stack.popd();
        this.stack.pushd(temp1);
        this.stack.pushd(temp2);
        this.$next();

        return;

      case 23: // OVER
        // stack grows down, the previous cell is up
        this.stack.pushd(this.mem.get16(this.mem.SP + CELLL));
        this.$next();
        return;

      case 24: // 0<
        const test = this.stack.popd();
        this.stack.pushd(test & signFlag ? minus1 : 0);
        this.$next();
        return;

      case 25: // AND
        this.stack.pushd(this.stack.popd() & this.stack.popd());
        this.$next();
        return;

      case 26: // OR
        this.stack.pushd(this.stack.popd() | this.stack.popd());
        this.$next();
        return;

      case 27: // XOR
        this.stack.pushd(this.stack.popd() ^ this.stack.popd());
        this.$next();
        return;

      case 28: // UM+
        let bx = this.stack.popd();
        let ax = this.stack.popd() + bx;

        this.stack.pushd(ax & minus1);
        this.stack.pushd(ax >> 16);

        this.$next();
        return;

      case 29: // doLIST
        // start of compound list is doLIST
        // pc points at cell after doLIST

        // push IP to RS
        this.stack.pushr(this.mem.IP);

        // set IP to pc (cell after doLIST)
        this.mem.IP = this.mem.PC;

        this.$next();
        return;

      default:
        throw new Error("bad op: " + op);
    }
  }

  run() {
    this.running = true;

    while (this.running) {
      this.step();
    }
  }

  pushd(c: number) {
    this.stack.pushd(c);
  }
}
