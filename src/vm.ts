import { CELLL, Mem } from "./mem";
import { Io } from "./io";
import { VmStack } from "./vmstack";

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
  private ds: VmStack;
  private rs: VmStack;
  private running: boolean = false;

  constructor(mem: Mem, io: Io) {
    this.mem = mem;
    this.io = io;

    this.ds = new VmStack(this.mem, 4);
    this.rs = new VmStack(this.mem, 6);
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
        this.running = false;
        this.$next();

        this.io.key(this);

        return;

      case 2: // TX!
        const c = this.ds.pop();
        this.$next();

        this.io.txsto(c);

        return;

      case 3: // doLIT
        this.ds.push(this.mem.get16(this.mem.IP));
        this.mem.IP += CELLL;
        this.$next();
        return;

      case 4: // EXIT
        // pop RS to IP
        this.mem.IP = this.rs.pop();
        this.$next();
        return;

      case 5: // EXECUTE
        this.mem.PC = this.ds.pop();
        return;

      case 6: // next
        // count is on the return stack
        const count = this.mem.get16(this.mem.RP) - 1;

        if (count < 0) {
          // when count goes below 0, pop the count, skip over address after 'next' instruction
          this.rs.pop();

          this.mem.IP += CELLL;
        } else {
          // otherwise set the dec'd count, jump to address after 'next' instruction
          this.mem.set16(this.mem.RP, count);
          this.mem.IP = this.mem.get16(this.mem.IP);
        }

        this.$next();
        return;

      case 7: // ?branch
        const flag = this.ds.pop();

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
        const addr = this.ds.pop();
        this.mem.set16(addr, this.ds.pop());
        this.$next();
        return;
      }

      case 10: // @
        this.ds.push(this.mem.get16(this.ds.pop()));
        this.$next();
        return;

      case 11: {
        // C!
        const addr = this.ds.pop();
        this.mem.set8(addr, this.ds.pop());
        this.$next();
        return;
      }

      case 12: // C@
        this.ds.push(this.mem.get8(this.ds.pop()));
        this.$next();
        return;

      case 13: // RP@
        this.ds.push(this.mem.RP);
        this.$next();
        return;

      case 14: // RP!
        this.mem.RP = this.ds.pop();
        this.$next();
        return;

      case 15: // R>
        this.ds.push(this.rs.pop());
        this.$next();
        return;

      case 16: // R@
        this.ds.push(this.mem.get16(this.mem.RP));
        this.$next();
        return;

      case 17: // >R
        this.rs.push(this.ds.pop());
        this.$next();
        return;

      case 18: // SP@
        this.ds.push(this.mem.SP);
        this.$next();
        return;

      case 19: // SP!
        this.mem.SP = this.ds.pop();
        this.$next();
        return;

      case 20: // DROP
        this.ds.pop();
        this.$next();
        return;

      case 21: // DUP
        this.ds.push(this.mem.get16(this.mem.SP));
        this.$next();
        return;

      case 22: // SWAP
        const temp1 = this.ds.pop();
        const temp2 = this.ds.pop();
        this.ds.push(temp1);
        this.ds.push(temp2);
        this.$next();

        return;

      case 23: // OVER
        // stack grows down, the previous cell is up
        this.ds.push(this.mem.get16(this.mem.SP + CELLL));
        this.$next();
        return;

      case 24: // 0<
        const test = this.ds.pop();
        this.ds.push(test & signFlag ? minus1 : 0);
        this.$next();
        return;

      case 25: // AND
        this.ds.push(this.ds.pop() & this.ds.pop());
        this.$next();
        return;

      case 26: // OR
        this.ds.push(this.ds.pop() | this.ds.pop());
        this.$next();
        return;

      case 27: // XOR
        this.ds.push(this.ds.pop() ^ this.ds.pop());
        this.$next();
        return;

      case 28: // UM+
        let bx = this.ds.pop();
        let ax = this.ds.pop() + bx;

        this.ds.push(ax & minus1);
        this.ds.push(ax >> 16);

        this.$next();
        return;

      case 29: // doLIST
        // start of compound list is doLIST
        // pc points at cell after doLIST

        // push IP to RS
        this.rs.push(this.mem.IP);

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
    this.ds.push(c);
  }
}
