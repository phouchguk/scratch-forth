import { Io } from "./io";
import { Vm } from "./vm";

export class Document implements Io {
  private waiting: boolean = false;
  private buffer: number[] = [];
  private vm: Vm | null = null;

  constructor() {
    const self = this;

    window.addEventListener("keydown", function (e) {
      if (e.keyCode === 8) {
        e.preventDefault();
      }
    });

    window.addEventListener("keypress", function (e) {
      e.preventDefault();
    });

    window.addEventListener("keyup", function (e) {
      e.preventDefault();

      if (e.keyCode === 8 || e.keyCode === 13) {
        self.buffer.push(e.keyCode);
      } else if (e.key.length === 1) {
        self.buffer.push(e.key.charCodeAt(0));
      } else {
        return;
      }

      if (self.waiting) {
        self.waiting = false;
        self.send();
      }
    });
  }

  key(vm: Vm): void {
    this.vm = vm;

    if (this.buffer.length > 0) {
      this.send();
    } else {
      this.waiting = true;
    }
  }

  txsto(c: number): void {
    const pre = document.getElementsByTagName("pre")[0];

    if (c === 8) {
      // backspace
      pre.innerText = pre.innerText.substring(0, pre.innerText.length - 1);
      return;
    }

    pre.innerText += String.fromCharCode(c);
  }

  private send() {
    if (this.vm === null) {
      return;
    }

    this.vm.pushd(this.buffer.shift() as number);
    this.vm.run();
  }
}
