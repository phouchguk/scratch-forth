import { CELLL, Mem } from "./mem";
import { Stack } from "./stack";

export const prims = ["BYE", "EXIT", "doLIT", "!", "@", "+", "."];
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

      case 1: // EXIT
        this.mem.PC = this.stack.popr();
        return;

      case 2: // doLIT
        this.stack.pushd(this.mem.get16(this.mem.PC));
        this.mem.PC += CELLL;
        return;

      case 3: // !
        const addr = this.stack.popd();
        this.mem.set16(addr, this.stack.popd());
        return;

      case 4: // @
        this.stack.pushd(this.mem.get16(this.stack.popd()));
        return;

      case 5: // +
        this.stack.pushd(this.stack.popd() + this.stack.popd());
        return;

      case 6: // .
        console.log(this.stack.popd());
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
