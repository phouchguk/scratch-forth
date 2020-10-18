import { CELLL, Mem } from "./mem";

export class VmStack {
  private mem: Mem;
  private spi: number;

  constructor(mem: Mem, spi: number) {
    this.mem = mem;
    this.spi = spi;
  }

  pop(): number {
    const p = this.mem.get16(this.spi);
    const value = this.mem.get16(p);
    this.mem.set16(this.spi, p + CELLL);

    return value;
  }

  push(value: number) {
    const p = this.mem.get16(this.spi) - CELLL;
    this.mem.set16(this.spi, p);
    this.mem.set16(p, value);
  }
}