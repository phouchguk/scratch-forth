import { Io } from "./io";
import { Vm } from "./vm";

export class TextArea implements Io {
  private el: HTMLTextAreaElement;
  private waiting: boolean = false;
  private buffer: number[] = [];
  private vm: Vm | null = null;

  constructor() {
    const self = this;
    this.el = document.getElementById("output") as HTMLTextAreaElement;

    this.el.addEventListener("keydown", function (e) {
      if (e.keyCode === 8) {
        e.preventDefault();
      }
    });

    this.el.addEventListener("keypress", function (e) {
      e.preventDefault();
    });

    this.el.addEventListener("keyup", function (e) {
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

    this.el.value = "";
    this.el.focus();
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
    console.log(c);

    if (c === 8) {
      // backspace
      this.el.value = this.el.value.substring(0, this.el.value.length - 1);
      return;
    }

    this.el.value += String.fromCharCode(c);
  }

  private send() {
    if (this.vm === null) {
      return;
    }

    this.vm.pushd(this.buffer.shift() as number);
    this.vm.run();
  }
}
